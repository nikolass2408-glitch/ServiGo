import "dotenv/config";
import bcrypt from "bcryptjs";
import dns from "node:dns";
import mongoose from "mongoose";
import { Profesional } from "../models/Profesional";
import { Servicio } from "../models/Servicio";
import { Usuario } from "../models/Usuario";

const testPassword = process.env.SERVIGO_TEST_ACCOUNT_PASSWORD;
const MIN_TEST_SERVICES = 20;

const catalogos = [
  {
    email: "barberia.pruebas@servigo.test",
    nombre: "Prestador Pruebas Barberia",
    perfil: {
      tipoNegocio: "BARBERIA",
      nombreNegocio: "Barberia Pruebas ServiGo",
      descripcion: "Servicios de barberia para pruebas de agenda.",
      telefono: "3005550101",
      direccion: "Bogota, Colombia",
      enlacePersonalizado: "barberia-pruebas-servigo",
    },
    servicios: [
      ["Corte clasico", "Corte tradicional personalizado.", 30000, 30],
      ["Corte degradado", "Degradado a tijera o maquina.", 35000, 40],
      ["Corte y barba", "Corte de cabello y perfilado de barba.", 50000, 60],
      ["Perfilado de barba", "Diseno y arreglo de barba.", 22000, 25],
      ["Afeitado tradicional", "Afeitado con toalla caliente.", 25000, 30],
    ],
  },
  {
    email: "belleza.pruebas@servigo.test",
    nombre: "Prestadora Pruebas Belleza",
    perfil: {
      tipoNegocio: "SPA",
      nombreNegocio: "Belleza y Bienestar Pruebas",
      descripcion: "Servicios de cuidado personal para pruebas de reserva.",
      telefono: "3005550102",
      direccion: "Medellin, Colombia",
      enlacePersonalizado: "belleza-pruebas-servigo",
    },
    servicios: [
      ["Manicura semipermanente", "Manicura con esmalte semipermanente.", 45000, 60],
      ["Pedicura spa", "Cuidado de pies con exfoliacion e hidratacion.", 50000, 60],
      ["Limpieza facial", "Limpieza facial profunda y mascarilla.", 65000, 75],
      ["Masaje relajante", "Masaje corporal para liberar tension.", 90000, 60],
      ["Diseno de cejas", "Perfilado de cejas segun el rostro.", 25000, 30],
    ],
  },
  {
    email: "gimnasio.pruebas@servigo.test",
    nombre: "Prestador Pruebas Entrenamiento",
    perfil: {
      tipoNegocio: "GIMNASIO",
      nombreNegocio: "Entrenamiento Pruebas ServiGo",
      descripcion: "Entrenamiento personalizado y bienestar fisico.",
      telefono: "3005550103",
      direccion: "Cali, Colombia",
      enlacePersonalizado: "entrenamiento-pruebas-servigo",
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
    email: "fotografia.pruebas@servigo.test",
    nombre: "Prestadora Pruebas Fotografia",
    perfil: {
      tipoNegocio: "FOTOGRAFIA",
      nombreNegocio: "Fotografia Pruebas ServiGo",
      descripcion: "Sesiones fotograficas para personas y negocios.",
      telefono: "3005550104",
      direccion: "Bogota, Colombia",
      enlacePersonalizado: "fotografia-pruebas-servigo",
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
  if (process.env.NODE_ENV === "production") {
    throw new Error("El catalogo de pruebas no se puede insertar en produccion.");
  }
  if (process.env.ALLOW_SERVIGO_TEST_SEED !== "true") {
    throw new Error("Define ALLOW_SERVIGO_TEST_SEED=true para autorizar esta carga.");
  }
  if (!testPassword || testPassword.length < 12) {
    throw new Error("Define SERVIGO_TEST_ACCOUNT_PASSWORD con al menos 12 caracteres.");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("Falta MONGO_URI en el entorno o en backend/.env.");
  }
  const dnsServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);
  if (dnsServers?.length) dns.setServers(dnsServers);

  await mongoose.connect(process.env.MONGO_URI);
  const passwordHash = await bcrypt.hash(testPassword, 12);
  await upsertUsuario("cliente.pruebas@servigo.test", "Cliente Pruebas ServiGo", "CLI", passwordHash);

  const professionalIds = [];
  for (const catalog of catalogos) {
    const user = await upsertUsuario(catalog.email, catalog.nombre, "PRO", passwordHash);
    const profile = await Profesional.findOneAndUpdate(
      { usuario: user._id },
      { $set: { ...catalog.perfil, usuario: user._id, activo: true } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    professionalIds.push(profile._id);

    for (const [nombre, descripcion, precio, duracion] of catalog.servicios) {
      await Servicio.findOneAndUpdate(
        { profesional: profile._id, nombre },
        { $set: { profesional: profile._id, nombre, descripcion, precio, duracion, activo: true } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
    }
  }

  const [serviceCount, professionalCount] = await Promise.all([
    Servicio.countDocuments({ profesional: { $in: professionalIds }, activo: true }),
    Profesional.countDocuments({ _id: { $in: professionalIds }, activo: true }),
  ]);
  if (serviceCount < MIN_TEST_SERVICES) {
    throw new Error(
      `El catalogo quedo incompleto: se esperaban al menos ${MIN_TEST_SERVICES} servicios activos y se encontraron ${serviceCount}.`
    );
  }

  console.log(JSON.stringify({
    testClient: "cliente.pruebas@servigo.test",
    testProfessionals: catalogos.map(({ email, perfil }) => ({ email, business: perfil.nombreNegocio })),
    services: serviceCount,
    professionals: professionalCount,
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