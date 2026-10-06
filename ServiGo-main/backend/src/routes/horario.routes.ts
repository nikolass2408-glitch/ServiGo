import { Router } from "express";
import { HorarioController } from "../controllers/horario.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";

const router = Router();
router.get("/horarios/", HorarioController.listar);
router.post("/horarios/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), HorarioController.crear);
router.patch("/horarios/:id/modificar/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), HorarioController.modificar);
export default router;
