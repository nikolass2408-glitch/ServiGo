import { Router } from "express";
import { HorarioController } from "../controllers/horario.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";

const router = Router();

// Listar horarios
router.get(
  "/horarios/",
  authenticateToken,
  HorarioController.listar
);

// Crear horarios
router.post(
  "/horarios/",
  authenticateToken,
  authorizeRoles(ROLES.PRO, ROLES.ADMIN),
  HorarioController.crear
);

// Modificar horarios
router.patch(
  "/horarios/:id/modificar/",
  authenticateToken,
  authorizeRoles(ROLES.PRO, ROLES.ADMIN),
  HorarioController.modificar
);

export default router;