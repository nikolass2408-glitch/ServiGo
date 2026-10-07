import { Router } from "express";
import { ReservaController } from "../controllers/reserva.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";

const router = Router();

router.use(authenticateToken);

router.post(
  "/reservas/",
  authorizeRoles(ROLES.CLI, ROLES.ADMIN),
  ReservaController.crear
);

router.get(
  "/reservas/lista/",
  ReservaController.listar
);

router.get(
  "/reservas/historial/",
  ReservaController.historial
);

router.get(
  "/reservas/disponibilidad/",
  ReservaController.disponibilidad
);

router.get(
  "/reservas/:id/",
  ReservaController.detalle
);

router.patch(
  "/reservas/:id/confirmar/",
  authorizeRoles(ROLES.PRO, ROLES.ADMIN),
  ReservaController.confirmar
);

router.patch(
  "/reservas/:id/completar/",
  authorizeRoles(ROLES.PRO, ROLES.ADMIN),
  ReservaController.completar
);

router.patch(
  "/reservas/:id/cancelar/",
  authorizeRoles(ROLES.CLI, ROLES.PRO, ROLES.ADMIN),
  ReservaController.cancelar
);

router.patch(
  "/reservas/:id/reprogramar/",
  authorizeRoles(ROLES.CLI, ROLES.PRO, ROLES.ADMIN),
  ReservaController.reprogramar
);

router.patch(
  "/reservas/:id/rechazar/",
  authorizeRoles(ROLES.PRO, ROLES.ADMIN),
  ReservaController.rechazar
);

router.get(
  "/profesional/:profesionalId/clientes/:clienteId/historial/",
  authorizeRoles(ROLES.PRO, ROLES.ADMIN),
  ReservaController.historialCliente
);

export default router;