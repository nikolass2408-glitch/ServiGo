import { Router } from "express";
import { ProfesionalController } from "../controllers/profesional.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../data/roles";
import { ProfileImageController } from "../controllers/profileImage.controller";
import { uploadProfileImage } from "../middlewares/profileImageUpload.middleware";

const router = Router();
router.get("/profesionales/", ProfesionalController.listar);
router.post("/profesionales/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), ProfesionalController.crear);
router.post("/profesionales/imagen/", authenticateToken, authorizeRoles(ROLES.PRO), uploadProfileImage.single("imagen"), ProfileImageController.upload);
router.patch("/profesionales/:id/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), ProfesionalController.modificar);
router.get("/profesional/:profesionalId/clientes/", authenticateToken, authorizeRoles(ROLES.PRO, ROLES.ADMIN), ProfesionalController.clientes);
export default router;
