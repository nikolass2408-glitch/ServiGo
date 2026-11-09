import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { Horario } from "../models/Horario";
import { Profesional } from "../models/Profesional";
import { Servicio } from "../models/Servicio";
import { Usuario } from "../models/Usuario";

const testPassword = process.env.SERVIGO_TEST_ACCOUNT_PASSWORD;
const PROFESSIONALS_PER_BUSINESS = 5;
const MIN_TEST_SERVICES = PROFESSIONALS_PER_BUSINESS * 4;
const DIAS_SEMANA = [0, 1, 2, 3, 4, 5, 6];

const catalogos = [
  {
    equipo: [
      { email: "barberia.pruebas@servigo.test", nombre: "Tomás Herrera", especialidad: "Barbero clásico", calificacionDemo: 4.9, totalCalificacionesDemo: 38 },
      { email: "barberia.pro.2@servigo.test", nombre: "Emilio Vargas", especialidad: "Especialista en degradados", calificacionDemo: 4.8, totalCalificacionesDemo: 31 },
      { email: "barberia.pro.3@servigo.test", nombre: "Julián Pardo", especialidad: "Barbero y cuidado de barba", calificacionDemo: 4.7, totalCalificacionesDemo: 24 },
      { email: "barberia.pro.4@servigo.test", nombre: "Esteban Ríos", especialidad: "Diseño y perfilado de barba", calificacionDemo: 4.9, totalCalificacionesDemo: 42 },
      { email: "barberia.pro.5@servigo.test", nombre: "Gabriel Muñoz", especialidad: "Afeitado clásico", calificacionDemo: 4.6, totalCalificacionesDemo: 19 },
    ],
    perfil: {
      tipoNegocio: "BARBERIA",
      nombreNegocio: "Barbería Matías",
      descripcion: "Cortes clásicos, barba y cuidado personal.",
      telefono: "3005550101",
      direccion: "Bogota, Colombia",
      enlacePersonalizado: "barberia-matias",
    },
    servicios: [
      ["Corte clásico", "Corte tradicional personalizado.", 30000, 30],
      ["Corte degradado", "Degradado a tijera o maquina.", 35000, 40],
      ["Corte y barba", "Corte de cabello y perfilado de barba.", 50000, 60],
      ["Perfilado de barba", "Diseno y arreglo de barba.", 22000, 25],
      ["Afeitado tradicional", "Afeitado con toalla caliente.", 25000, 30],
    ],
  },
  {
    equipo: [
      { email: "belleza.pruebas@servigo.test", nombre: "Valentina Gómez", especialidad: "Manicurista", calificacionDemo: 4.9, totalCalificacionesDemo: 44 },
      { email: "belleza.pro.2@servigo.test", nombre: "Mariana López", especialidad: "Esteticista facial", calificacionDemo: 4.8, totalCalificacionesDemo: 36 },
      { email: "belleza.pro.3@servigo.test", nombre: "Isabella Rojas", especialidad: "Especialista en masajes", calificacionDemo: 4.7, totalCalificacionesDemo: 28 },
      { email: "belleza.pro.4@servigo.test", nombre: "Camila Herrera", especialidad: "Pedicurista", calificacionDemo: 4.9, totalCalificacionesDemo: 40 },
      { email: "belleza.pro.5@servigo.test", nombre: "Sofía Martínez", especialidad: "Diseñadora de cejas", calificacionDemo: 4.6, totalCalificacionesDemo: 21 },
    ],
    perfil: {
      tipoNegocio: "SPA",
      nombreNegocio: "Aura Estudio de Belleza",
      descripcion: "Cuidado personal, belleza y bienestar.",
      telefono: "3005550102",
      direccion: "Medellin, Colombia",
      enlacePersonalizado: "aura-estudio-belleza",
    },
    servicios: [
      ["Manicura semipermanente", "Manicura con esmalte semipermanente.", 45000, 60],
      ["Pedicura spa", "Cuidado de pies con exfoliacion e hidratacion.", 50000, 60],
      ["Limpieza facial", "Limpieza facial profunda y mascarilla.", 65000, 75],
      ["Masaje relajante", "Masaje corporal para liberar tension.", 90000, 60],
      ["Diseño de cejas", "Perfilado de cejas segun el rostro.", 25000, 30],
    ],
  },
  {
    equipo: [
      { email: "gimnasio.pruebas@servigo.test", nombre: "Juan David Pérez", especialidad: "Entrenador personal", calificacionDemo: 4.9, totalCalificacionesDemo: 35 },
      { email: "gimnasio.pro.2@servigo.test", nombre: "Daniel Ramírez", especialidad: "Instructor de entrenamiento funcional", calificacionDemo: 4.8, totalCalificacionesDemo: 29 },
      { email: "gimnasio.pro.3@servigo.test", nombre: "Sebastián Ortiz", especialidad: "Instructor de yoga", calificacionDemo: 4.7, totalCalificacionesDemo: 23 },
      { email: "gimnasio.pro.4@servigo.test", nombre: "Samuel Cárdenas", especialidad: "Preparador físico", calificacionDemo: 4.9, totalCalificacionesDemo: 41 },
      { email: "gimnasio.pro.5@servigo.test", nombre: "David Moreno", especialidad: "Asesor de acondicionamiento físico", calificacionDemo: 4.6, totalCalificacionesDemo: 18 },
    ],
    perfil: {
      tipoNegocio: "GIMNASIO",
      nombreNegocio: "Punto Fit",
      descripcion: "Entrenamiento personalizado y bienestar físico.",
      telefono: "3005550103",
      direccion: "Cali, Colombia",
      enlacePersonalizado: "punto-fit",
    },
    servicios: [
      ["Entrenamiento personal", "Sesion individual con plan personalizado.", 60000, 60],
      ["Evaluacion fisica", "Medicion inicial y objetivos de entrenamiento.", 40000, 45],
      ["Clase funcional", "Entrenamiento funcional de cuerpo completo.", 35000, 50],
      ["Clase de yoga", "Practica guiada para movilidad y respiracion.", 30000, 60],
      ["Asesoria de rutina", "Diseno de rutina segun nivel y objetivos.", 45000, 45],
    ],
  },
  {
    equipo: [
      { email: "fotografia.pruebas@servigo.test", nombre: "Lucía Fernández", especialidad: "Fotógrafa de retratos", calificacionDemo: 4.9, totalCalificacionesDemo: 32 },
      { email: "fotografia.pro.2@servigo.test", nombre: "Gabriela Silva", especialidad: "Fotógrafa familiar", calificacionDemo: 4.8, totalCalificacionesDemo: 27 },
      { email: "fotografia.pro.3@servigo.test", nombre: "Paula Navarro", especialidad: "Fotógrafa de producto", calificacionDemo: 4.7, totalCalificacionesDemo: 22 },
      { email: "fotografia.pro.4@servigo.test", nombre: "Daniela Cruz", especialidad: "Fotógrafa de eventos", calificacionDemo: 4.9, totalCalificacionesDemo: 39 },
      { email: "fotografia.pro.5@servigo.test", nombre: "Elena Ramírez", especialidad: "Fotógrafa de pareja y familia", calificacionDemo: 4.6, totalCalificacionesDemo: 17 },
    ],
    perfil: {
      tipoNegocio: "FOTOGRAFIA",
      nombreNegocio: "Luz de Autor Fotografía",
      descripcion: "Sesiones fotográficas para personas y negocios.",
      telefono: "3005550104",
      direccion: "Bogota, Colombia",
      enlacePersonalizado: "luz-de-autor-fotografia",
    },
    servicios: [
      ["Retrato profesional", "Sesion de retrato para perfil profesional.", 120000, 60],
      ["Sesion familiar", "Fotografias familiares en estudio o exterior.", 180000, 90],
      ["Fotografia de producto", "Fotografias para catalogo y redes sociales.", 150000, 75],
      ["Fotografia de eventos", "Cobertura fotografica de evento social.", 320000, 120],
      ["Sesion de pareja", "Sesion fotografica para parejas.", 160000, 90],
    ],
  },
];

async function upsertHorarios(profesionalId: mongoose.Types.ObjectId) {
  for (const dia of DIAS_SEMANA) {
    await Horario.findOneAndUpdate(
      { profesional: profesionalId, dia },
      { $set: { profesional: profesionalId, dia, horaInicio: "09:00:00", horaFin: "17:00:00", activo: true } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }
}

async function upsertUsuario(email: string, nombre: string, rol: "CLI" | "PRO", passwordHash: string) {
  const [firstName, ...lastName] = nombre.split(" ");
  return Usuario.findOneAndUpdate(
    { email },
    {
      $set: {
        username: email,
        email,
        password: passwordHash,
        firstName,
        lastName: lastName.join(" "),
        telefono: "3005550100",
        rol,
        activo: true,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  const soloHorarios = process.argv.includes("--schedules-only");
  if (process.env.NODE_ENV === "production") {
    throw new Error("El catalogo de pruebas no se puede insertar en produccion.");
  }
  if (process.env.ALLOW_SERVIGO_TEST_SEED !== "true") {
    throw new Error("Define ALLOW_SERVIGO_TEST_SEED=true para autorizar esta carga.");
  }
  if (!soloHorarios && (!testPassword || testPassword.length < 12)) {
    throw new Error("Define SERVIGO_TEST_ACCOUNT_PASSWORD con al menos 12 caracteres.");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("Falta MONGO_URI en el entorno o en backend/.env.");
  }
  await connectDatabase();
  if (soloHorarios) {
    const emails = catalogos.flatMap(({ equipo }) => equipo.map(({ email }) => email));
    const users = await Usuario.find({ email: { $in: emails } })
      .select("_id email")
      .lean();
    if (users.length !== emails.length) {
      throw new Error("Faltan cuentas del catalogo de pruebas; no se modificaron horarios.");
    }

    const profiles = await Profesional.find({
      usuario: { $in: users.map(({ _id }) => _id) },
      activo: true,
    }).select("_id").lean();
    if (profiles.length !== emails.length) {
      throw new Error("Faltan perfiles profesionales activos; no se modificaron horarios.");
    }

    for (const profile of profiles) {
      await upsertHorarios(profile._id);
    }
    console.log(JSON.stringify({ professionals: profiles.length, schedules: profiles.length * DIAS_SEMANA.length }));
    return;
  }

  const passwordHash = await bcrypt.hash(testPassword!, 12);
  await upsertUsuario("cliente.pruebas@servigo.test", "Matías Rojas", "CLI", passwordHash);

  const professionalIds = [];
  const professionalAccounts = [];
  for (const catalog of catalogos) {
    if (catalog.equipo.length < PROFESSIONALS_PER_BUSINESS) {
      throw new Error(`El negocio ${catalog.perfil.nombreNegocio} requiere al menos ${PROFESSIONALS_PER_BUSINESS} profesionales.`);
    }

    for (const [index, integrante] of catalog.equipo.entries()) {
      const user = await upsertUsuario(integrante.email, integrante.nombre, "PRO", passwordHash);
      const enlacePersonalizado = index === 0
        ? catalog.perfil.enlacePersonalizado
        : `${catalog.perfil.enlacePersonalizado}-${index + 1}`;
      const profile = await Profesional.findOneAndUpdate(
        { usuario: user._id },
        {
          $set: {
            ...catalog.perfil,
            especialidad: integrante.especialidad,
            calificacionDemo: integrante.calificacionDemo,
            totalCalificacionesDemo: integrante.totalCalificacionesDemo,
            enlacePersonalizado,
            usuario: user._id,
            activo: true,
          },
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
      professionalIds.push(profile._id);
      professionalAccounts.push({ email: integrante.email, nombre: integrante.nombre, negocio: catalog.perfil.nombreNegocio });
      await upsertHorarios(profile._id);

      const [nombre, descripcion, precio, duracion] = catalog.servicios[index];
      await Servicio.updateMany(
        { profesional: profile._id },
        { $set: { activo: false } }
      );
      await Servicio.findOneAndUpdate(
        { profesional: profile._id, nombre },
        { $set: { profesional: profile._id, nombre, descripcion, precio, duracion, activo: true } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
    }
  }

  const [serviceCount, professionalCount, scheduleCount] = await Promise.all([
    Servicio.countDocuments({ profesional: { $in: professionalIds }, activo: true }),
    Profesional.countDocuments({ _id: { $in: professionalIds }, activo: true }),
    Horario.countDocuments({
      profesional: { $in: professionalIds },
      activo: true,
      horaInicio: "09:00:00",
      horaFin: "17:00:00",
      dia: { $in: DIAS_SEMANA },
    }),
  ]);
  if (serviceCount < MIN_TEST_SERVICES) {
    throw new Error(
      `El catalogo quedo incompleto: se esperaban al menos ${MIN_TEST_SERVICES} servicios activos y se encontraron ${serviceCount}.`
    );
  }
  if (scheduleCount < professionalIds.length * DIAS_SEMANA.length) {
    throw new Error(
      `El catalogo quedo incompleto: se esperaban ${professionalIds.length * DIAS_SEMANA.length} horarios activos y se encontraron ${scheduleCount}.`
    );
  }

  console.log(JSON.stringify({
    testClient: "cliente.pruebas@servigo.test",
    testProfessionals: professionalAccounts,
    services: serviceCount,
    professionals: professionalCount,
    schedules: scheduleCount,
  }, null, 2));
}

seed()
  .catch((error: unknown) => {
    console.error("No se pudo cargar el catalogo de pruebas:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });