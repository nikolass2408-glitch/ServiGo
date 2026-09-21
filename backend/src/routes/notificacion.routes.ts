import { Router } from "express";
import { NotificacionController } from "../controllers/notificacion.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticateToken);
router.get("/clientes/:id/", NotificacionController.informacionCliente);
router.get("/notificaciones/:usuarioId/", NotificacionController.listar);
router.post("/reservas/:id/recordatorio/", NotificacionController.recordatorio);
export default router;
