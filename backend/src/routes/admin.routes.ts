import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";

const router = Router();
router.get(
  "/admin/estadisticas/",
  authenticateToken,
  authorizeRoles(ROLES.ADMIN),
  AdminController.resumen
);
export default router;
