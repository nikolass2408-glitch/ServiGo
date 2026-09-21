import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("Falta MONGO_URI en el archivo .env");
  }

  await mongoose.connect(uri);

  console.log("MongoDB conectado correctamente.");
}