import { Router } from "express";
import { ReporteController } from "../controllers/reporte.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticateToken);
router.get("/profesional/:profesionalId/estadisticas/resumen/", ReporteController.resumen);
router.get("/profesional/:profesionalId/estadisticas/servicios/", ReporteController.servicios);
router.get("/profesional/:profesionalId/estadisticas/completadas/", ReporteController.completadas);
router.get("/profesional/:profesionalId/estadisticas/ingresos/", ReporteController.ingresos);
export default router;
