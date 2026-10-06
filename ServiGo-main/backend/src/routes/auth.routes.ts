import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";

const router = Router();
router.get("/usuarios/", authenticateToken, authorizeRoles(ROLES.ADMIN), AuthController.listarUsuarios);
router.post("/registro/", AuthController.registrar);
router.post("/login/", AuthController.login);
router.post("/recuperar-password/", AuthController.solicitarRecuperacion);
router.post("/restablecer-password/", AuthController.restablecerPassword);
export default router;
