import mongoose from "mongoose";
import dns from "dns";
import { Reserva } from "../models/Reserva";
import { Notificacion } from "../models/Notificacion";

interface DnsJsonResponse {
  Status: number;
  Answer?: Array<{ type: number; data: string }>;
}

async function queryCloudflareDns(name: string, type: "SRV" | "TXT"): Promise<DnsJsonResponse> {
  const url = new URL("https://cloudflare-dns.com/dns-query");
  url.searchParams.set("name", name);
  url.searchParams.set("type", type);

  const response = await fetch(url, {
    headers: { accept: "application/dns-json" },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`La consulta DNS sobre HTTPS falló con estado ${response.status}`);
  }

  const result = (await response.json()) as DnsJsonResponse;
  if (result.Status !== 0) {
    throw new Error(`La consulta DNS sobre HTTPS devolvió estado ${result.Status}`);
  }

  return result;
}

async function resolveSrvUri(uri: string): Promise<string> {
  const parsedUri = new URL(uri);
  const [srvResult, txtResult] = await Promise.all([
    queryCloudflareDns(`_mongodb._tcp.${parsedUri.hostname}`, "SRV"),
    queryCloudflareDns(parsedUri.hostname, "TXT"),
  ]);

  const hosts = (srvResult.Answer ?? [])
    .filter((answer) => answer.type === 33)
    .map(({ data }) => {
      const [, , port, target] = data.split(/\s+/);
      if (!port || !target || !Number.isInteger(Number(port))) {
        throw new Error("Atlas devolvió un registro SRV inválido");
      }
      return `${target.replace(/\.$/, "")}:${port}`;
    });

  if (hosts.length === 0) {
    throw new Error("Atlas no devolvió nodos SRV");
  }

  const options = new URLSearchParams(
    (txtResult.Answer ?? [])
      .filter((answer) => answer.type === 16)
      .map(({ data }) => data.replace(/^\"|\"$/g, ""))
      .join("&"),
  );
  new URLSearchParams(parsedUri.search).forEach((value, key) => options.set(key, value));
  if (!options.has("tls") && !options.has("ssl")) {
    options.set("tls", "true");
  }

  const credentials = parsedUri.username
    ? `${parsedUri.username}:${parsedUri.password}@`
    : "";
  const query = options.toString();
  return `mongodb://${credentials}${hosts.join(",")}${parsedUri.pathname}${query ? `?${query}` : ""}`;
}

export async function connectDatabase(): Promise<void> {
  const dnsServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);

  if (dnsServers?.length) {
    dns.setServers(dnsServers);
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("Falta MONGO_URI en el archivo .env");
  }

  try {
    await mongoose.connect(uri);
  } catch (error) {
    const dnsError = error as NodeJS.ErrnoException;
    if (!uri.startsWith("mongodb+srv://") || dnsError.syscall !== "querySrv") {
      throw error;
    }

    console.warn("Falló el DNS SRV local; reintentando la conexión de Atlas mediante DNS sobre HTTPS.");
    await mongoose.connect(await resolveSrvUri(uri));
  }

  await Reserva.createIndexes();
  await Notificacion.createIndexes();

  console.log("MongoDB conectado correctamente.");
}