import { Router } from "express";
import { ServicioController } from "../controllers/servicio.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";

const router = Router();
router.get("/servicios/", ServicioController.listar);
router.get("/servicios/gestion/:profesionalId/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), ServicioController.gestionar);
router.post("/servicios/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), ServicioController.crear);
router.patch("/servicios/:id/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), ServicioController.modificar);
router.delete("/servicios/:id/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), ServicioController.eliminar);
export default router;
