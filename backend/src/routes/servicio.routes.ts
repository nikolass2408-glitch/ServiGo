import { Router } from "express";
import { ServicioController } from "../controllers/servicio.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";

const router = Router();
router.get("/servicios/", ServicioController.listar);
router.post("/servicios/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), ServicioController.crear);
export default router;
