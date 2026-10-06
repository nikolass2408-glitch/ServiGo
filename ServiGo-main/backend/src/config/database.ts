import mongoose from "mongoose";
import dns from "dns";

export async function connectDatabase(): Promise<void> {
  const dnsServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);

  if (dnsServers?.length) {
    dns.setServers(dnsServers);
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("Falta MONGO_URI en el archivo .env");
  }

  await mongoose.connect(uri);

  console.log("MongoDB conectado correctamente.");
}