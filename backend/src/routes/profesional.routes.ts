import { Router } from "express";
import { ProfesionalController } from "../controllers/profesional.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";

const router = Router();
router.get("/profesionales/", ProfesionalController.listar);
router.post("/profesionales/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), ProfesionalController.crear);
router.get("/profesional/:profesionalId/clientes/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), ProfesionalController.clientes);
export default router;
