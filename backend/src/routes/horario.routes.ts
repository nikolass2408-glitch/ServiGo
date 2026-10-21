import { Router } from "express";
import { HorarioController } from "../controllers/horario.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";

const router = Router();

// GET /horarios/ - Requiere estar autenticado
router.get("/horarios/", authenticateToken, HorarioController.listar);

// POST /horarios/ - Permite profesionales y administradores
router.post(
  "/horarios/",
  authenticateToken,
  authorizeRoles(ROLES.PRO, ROLES.ADMIN),
  HorarioController.crear
);

// PATCH /horarios/:id/modificar/ - Permite a administradores
router.patch(
  "/horarios/:id/modificar/",
  authenticateToken,
  authorizeRoles(ROLES.ADMIN),
  HorarioController.modificar
);

export default router;