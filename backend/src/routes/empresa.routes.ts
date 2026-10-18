import { Router } from "express";
import { EmpresaController } from "../controllers/empresa.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";

const router = Router();
router.post("/invitaciones/aceptar/", EmpresaController.aceptarInvitacion);
router.get("/invitaciones/:token/", EmpresaController.detalleInvitacion);
router.get("/empresa/panel/", authenticateToken, authorizeRoles(ROLES.DUENO), EmpresaController.panel);
router.post("/empresa/", authenticateToken, authorizeRoles(ROLES.DUENO), EmpresaController.crear);
router.post("/empresa/:empresaId/profesionales/", authenticateToken, authorizeRoles(ROLES.DUENO), EmpresaController.invitarProfesional);

export default router;
