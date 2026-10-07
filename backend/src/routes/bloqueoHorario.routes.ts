import { Router } from "express";
import { BloqueoHorarioController } from "../controllers/bloqueoHorario.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";

const router = Router();
router.use(authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN));
router.get("/disponibilidad/bloqueos/", BloqueoHorarioController.listar);
router.post("/disponibilidad/bloqueos/", BloqueoHorarioController.crear);
router.delete("/disponibilidad/bloqueos/:id/", BloqueoHorarioController.eliminar);
export default router;
