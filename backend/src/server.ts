import dotenv from "dotenv";

dotenv.config();

import { connectDatabase } from "./config/database";

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  await connectDatabase();
  
  const app = (await import("./app")).default;

  app.listen(PORT, () => {
    console.log(`ServiGo API ejecutándose en http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("No se pudo iniciar ServiGo:", error);
  process.exit(1);
});