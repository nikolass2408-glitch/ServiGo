import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes";
import profesionalRoutes from "./routes/profesional.routes";
import servicioRoutes from "./routes/servicio.routes";
import horarioRoutes from "./routes/horario.routes";
import reservaRoutes from "./routes/reserva.routes";
import notificacionRoutes from "./routes/notificacion.routes";
import reporteRoutes from "./routes/reporte.routes";

import { errorHandler, notFound } from "./middlewares/error.middleware";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/", (_req, res) => {
  res.json({
    mensaje: "API de ServiGo funcionando.",
    version: "1.0.0",
    arquitectura: "Express + TypeScript + MongoDB",
  });
});

app.use("/api", authRoutes);
app.use("/api", profesionalRoutes);
app.use("/api", servicioRoutes);
app.use("/api", horarioRoutes);
app.use("/api", reservaRoutes);
app.use("/api", notificacionRoutes);
app.use("/api", reporteRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;