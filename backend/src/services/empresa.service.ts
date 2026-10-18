import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { Empresa } from "../models/Empresa";
import { EmpresaProfesional } from "../models/EmpresaProfesional";
import { Profesional } from "../models/Profesional";
import { Servicio } from "../models/Servicio";
import { Usuario } from "../models/Usuario";
import { ROLES } from "../data/roles";
import { MailService } from "./mail.service";
import { validarPassword } from "./password.rules";

const errorConEstado = (mensaje: string, statusCode: number) =>
  Object.assign(new Error(mensaje), { statusCode });

const crearSlug = (valor: string) =>
  valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export class EmpresaService {
  static async crearParaDueno(duenoId: string, datos: any) {
    const nombre = String(datos?.nombre || "").trim();
    if (!nombre) throw errorConEstado("El nombre de la empresa es obligatorio.", 400);

    return Empresa.create({
      dueno: duenoId,
      nombre,
      tipoNegocio: datos.tipoNegocio || "OTRO",
      descripcion: String(datos.descripcion || "").trim(),
      telefono: String(datos.telefono || "").trim(),
      direccion: String(datos.direccion || "").trim(),
    });
  }

  static async crearEmpresa(duenoId: string, datos: any) {
    return this.crearParaDueno(duenoId, datos);
  }

  static async obtenerPanel(duenoId: string) {
    const empresas = await Empresa.find({ dueno: duenoId, activo: true }).lean();
    const paneles = await Promise.all(empresas.map(async (empresa) => {
      const membresias = await EmpresaProfesional.find({ empresa: empresa._id })
        .populate({
          path: "profesional",
          select: "nombreNegocio usuario activo enlacePersonalizado",
          populate: { path: "usuario", select: "firstName lastName email telefono activo" },
        })
        .lean();
      const servicios = await Servicio.find({ empresa: empresa._id })
        .populate({
          path: "profesional",
          select: "nombreNegocio usuario",
          populate: { path: "usuario", select: "firstName lastName email activo" },
        })
        .lean();
      return {
        empresa,
        profesionales: membresias.map((membresia) => ({
          ...membresia.profesional,
          membresia: membresia._id,
          estado: membresia.estado,
        })),
        servicios,
      };
    }));
    return { empresas: paneles };
  }

  static async invitarProfesional(duenoId: string, empresaId: string, datos: any) {
    const empresa = await Empresa.findOne({ _id: empresaId, dueno: duenoId, activo: true });
    if (!empresa) throw errorConEstado("No se encontró esta empresa en tu cuenta.", 404);
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      throw errorConEstado("Configura MAIL_USER y MAIL_PASS para enviar invitaciones.", 503);
    }

    const nombre = String(datos?.nombre || "").trim();
    const email = String(datos?.email || "").trim().toLowerCase();
    const telefono = String(datos?.telefono || "").trim();
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw errorConEstado("Nombre y correo electrónico válido son obligatorios.", 400);
    }

    let usuario = await Usuario.findOne({ $or: [{ email }, { username: email }] });
    let profesional: any = null;
    let usuarioNuevo = false;
    let profesionalNuevo = false;
    if (usuario) {
      if (usuario.rol !== ROLES.PRO || !usuario.activo) {
        throw errorConEstado("Ese correo ya tiene una cuenta que no puede unirse como profesional.", 409);
      }
      profesional = await Profesional.findOne({ usuario: usuario._id });
      if (!profesional) {
        throw errorConEstado("La cuenta profesional no tiene un perfil configurado.", 409);
      }
    } else {
      const [firstName, ...lastName] = nombre.split(/\s+/);
      usuario = await Usuario.create({
        username: email,
        email,
        password: await bcrypt.hash(randomBytes(32).toString("hex"), 12),
        firstName,
        lastName: lastName.join(" "),
        telefono,
        rol: ROLES.PRO,
        activo: false,
      });
      usuarioNuevo = true;
      try {
        profesional = await Profesional.create({
          usuario: usuario._id,
          tipoNegocio: empresa.tipoNegocio,
          nombreNegocio: `${firstName} ${lastName.join(" ")}`.trim(),
          descripcion: "",
          telefono,
          direccion: empresa.direccion,
          enlacePersonalizado: `${crearSlug(`${firstName}-${lastName.join("-")}`) || "profesional"}-${randomBytes(4).toString("hex")}`,
          activo: false,
        });
        profesionalNuevo = true;
      } catch (error) {
        await Usuario.deleteOne({ _id: usuario._id });
        throw error;
      }
    }

    const existente = await EmpresaProfesional.findOne({
      empresa: empresa._id,
      profesional: profesional._id,
    });
    if (existente) {
      if (existente.estado === "ACTIVA") {
        throw errorConEstado("Este profesional ya pertenece a la empresa.", 409);
      }
      throw errorConEstado("Ya hay una invitación pendiente para este profesional.", 409);
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const invitacionExpira = new Date(Date.now() + 24 * 60 * 60 * 1000);
    let membresia: InstanceType<typeof EmpresaProfesional> | null = null;
    try {
      membresia = await EmpresaProfesional.create({
        empresa: empresa._id,
        profesional: profesional._id,
        estado: "PENDIENTE",
        invitacionTokenHash: tokenHash,
        invitacionExpira,
      });
      const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
      await MailService.enviarInvitacionProfesional(
        email,
        nombre,
        empresa.nombre,
        `${frontendUrl}/activar-invitacion?token=${encodeURIComponent(token)}`
      );
    } catch (error) {
      if (membresia) await membresia.deleteOne();
      if (profesionalNuevo) await Profesional.deleteOne({ _id: profesional._id });
      if (usuarioNuevo) await Usuario.deleteOne({ _id: usuario._id });
      throw error;
    }

    return { id: profesional._id, nombre, email, estado: "PENDIENTE", invitacionExpira };
  }

  static async aceptarInvitacion(token: unknown, password: unknown) {
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      throw errorConEstado("La invitación no es válida o ya venció.", 400);
    }
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const membresia = await EmpresaProfesional.findOne({
      invitacionTokenHash: tokenHash,
      invitacionExpira: { $gt: new Date() },
      estado: "PENDIENTE",
    }).select("+invitacionTokenHash +invitacionExpira").populate({
      path: "profesional",
      populate: { path: "usuario" },
    });
    if (!membresia || !membresia.profesional || typeof membresia.profesional === "string") {
      throw errorConEstado("La invitación no es válida o ya venció.", 400);
    }
    const profesional = membresia.profesional as any;
    const usuario = profesional.usuario as InstanceType<typeof Usuario>;
    if (!usuario || typeof usuario === "string" || usuario.rol !== ROLES.PRO) {
      throw errorConEstado("La cuenta profesional asociada a esta invitación no está disponible.", 409);
    }

    let passwordHash: string | undefined;
    if (!usuario.activo) {
      if (typeof password !== "string") {
        throw errorConEstado("Crea una contraseña para activar tu cuenta.", 400);
      }
      validarPassword(password);
      passwordHash = await bcrypt.hash(password, 12);
    }

    const aceptada = await EmpresaProfesional.findOneAndUpdate(
      {
        _id: membresia._id,
        estado: "PENDIENTE",
        invitacionTokenHash: tokenHash,
        invitacionExpira: { $gt: new Date() },
      },
      {
        $set: { estado: "ACTIVA" },
        $unset: { invitacionTokenHash: 1, invitacionExpira: 1 },
      },
      { new: true }
    );
    if (!aceptada) throw errorConEstado("La invitación ya fue aceptada o venció.", 409);

    if (!usuario.activo) {
      const activacion = await Usuario.updateOne(
        { _id: usuario._id, activo: false, rol: ROLES.PRO },
        { $set: { password: passwordHash, activo: true } }
      );
      if (activacion.modifiedCount === 1) {
        await Profesional.updateOne({ _id: profesional._id }, { $set: { activo: true } });
      } else if (!(await Usuario.exists({ _id: usuario._id, activo: true, rol: ROLES.PRO }))) {
        throw errorConEstado("No se pudo activar la cuenta profesional.", 409);
      }
    }
  }

  static async detalleInvitacion(token: unknown) {
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      throw errorConEstado("La invitación no es válida o ya venció.", 400);
    }
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const membresia = await EmpresaProfesional.findOne({
      invitacionTokenHash: tokenHash,
      invitacionExpira: { $gt: new Date() },
      estado: "PENDIENTE",
    }).select("+invitacionTokenHash +invitacionExpira")
      .populate("empresa", "nombre")
      .populate({ path: "profesional", populate: { path: "usuario", select: "firstName lastName email activo" } });
    const profesional = membresia?.profesional as any;
    const usuario = profesional?.usuario;
    const empresa = membresia?.empresa as any;
    if (!membresia || !usuario || !empresa) {
      throw errorConEstado("La invitación no es válida o ya venció.", 400);
    }
    return {
      empresa: empresa.nombre,
      email: usuario.email,
      nombre: `${usuario.firstName || ""} ${usuario.lastName || ""}`.trim(),
      requierePassword: !usuario.activo,
    };
  }

  static async empresaDelDueno(duenoId: string, empresaId: string) {
    const empresa = await Empresa.findOne({ _id: empresaId, dueno: duenoId, activo: true });
    if (!empresa) throw errorConEstado("No se encontró esta empresa en tu cuenta.", 404);
    return empresa;
  }

  static async esMiembroActivo(duenoId: string, empresaId: string, profesionalId: string) {
    const empresa = await this.empresaDelDueno(duenoId, empresaId);
    return Boolean(await EmpresaProfesional.exists({
      empresa: empresa._id,
      profesional: profesionalId,
      estado: "ACTIVA",
    }));
  }
}
