import "dotenv/config";
import app from "./app";
import { connectDatabase } from "./config/database";

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`ServiGo API ejecutándose en http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("No se pudo iniciar ServiGo:", error);
  process.exit(1);
});
