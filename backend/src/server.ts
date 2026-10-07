import dotenv from "dotenv";

dotenv.config();
process.env.TZ = process.env.TZ || "America/Bogota";

import { connectDatabase } from "./config/database";
import { iniciarProgramadorRecordatorios } from "./services/recordatorio.scheduler";

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  await connectDatabase();
  iniciarProgramadorRecordatorios();

  const app = (await import("./app")).default;

  app.listen(PORT, () => {
    console.log(`ServiGo API ejecutándose en http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("No se pudo iniciar ServiGo:", error);
  process.exit(1);
});