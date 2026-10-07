import { AxiosError } from 'axios';

const STORAGE_KEY = 'servigo_demo_data_v1';
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const makeSeed = () => {
  const users = [
    {
      id: 'demo-client',
      username: 'cliente@servigo.demo',
      email: 'cliente@servigo.demo',
      firstName: 'Camila',
      lastName: 'Cliente',
      telefono: '3000000001',
      rol: 'CLI',
      activo: true,
      passwordHash: '34e422278ea745b5d87ba6592f0ea3fe32a2eb7593f5960ac72d7094fb121f3d'
    },
    {
      id: 'demo-professional',
      username: 'profesional@servigo.demo',
      email: 'profesional@servigo.demo',
      firstName: 'Andrés',
      lastName: 'Profesional',
      telefono: '3000000002',
      rol: 'PRO',
      activo: true,
      passwordHash: 'ea107da1ef9542e945d6df36b056d7ed3fbfc103dd149ae42d7fbfc637eec027'
    },
    {
      id: 'demo-admin',
      username: 'admin@servigo.demo',
      email: 'admin@servigo.demo',
      firstName: 'Administración',
      lastName: 'ServiGo',
      telefono: '',
      rol: 'ADMIN',
      activo: true,
      passwordHash: '60fe74406e7f353ed979f350f2fbb6a2e8690a5fa7d1b0c32983d1d8b3f95f67'
    }
  ];

  return {
    users,
    professionals: [{
      id: 'demo-professional-profile',
      usuario: 'demo-professional',
      tipoNegocio: 'BARBERIA',
      nombreNegocio: 'Barbería ServiGo Demo',
      descripcion: 'Atención profesional con reserva sencilla y horarios flexibles.',
      telefono: '3000000002',
      correo: 'profesional@servigo.demo',
      direccion: 'Centro, Bogotá',
      imagen: '',
      enlacePersonalizado: 'barberia-servigo-demo',
      activo: true
    }],
    services: [
      { id: 'demo-service-1', profesional: 'demo-professional-profile', nombre: 'Corte clásico', descripcion: 'Corte de cabello personalizado.', precio: 35000, duracion: 45, activo: true, categoria: 'Barbería' },
      { id: 'demo-service-2', profesional: 'demo-professional-profile', nombre: 'Corte y barba', descripcion: 'Corte de cabello y arreglo de barba.', precio: 50000, duracion: 60, activo: true, categoria: 'Barbería' },
      { id: 'demo-service-3', profesional: 'demo-professional-profile', nombre: 'Manicura', descripcion: 'Cuidado y diseño de uñas.', precio: 45000, duracion: 60, activo: true, categoria: 'Belleza' }
    ],
    schedules: [1, 2, 3, 4, 5, 6].map((dia) => ({
      id: `demo-hours-${dia}`,
      profesional: 'demo-professional-profile',
      dia,
      horaInicio: '09:00',
      horaFin: '17:00',
      activo: true,
      bloqueado: false
    })),
    blocks: [],
    bookings: [],
    notifications: [],
    resetTokens: {}
  };
};

function readData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    const initial = makeSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    throw new Error('Los datos locales de ServiGo están dañados. Borra servigo_demo_data_v1 del almacenamiento del navegador para reiniciar la demo.', { cause: error });
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function asPublicUser(user) {
  const publicUser = { ...user };
  delete publicUser.passwordHash;
  return publicUser;
}

function currentUser(data, config) {
  const headers = config.headers || {};
  const authorization = headers.Authorization || headers.authorization;
  const token = authorization?.replace(/^Bearer\s+/i, '');
  const userId = token?.startsWith('demo-token:') ? token.slice('demo-token:'.length) : null;
  return data.users.find((user) => user.id === userId) || null;
}

function requireUser(data, config, roles) {
  const user = currentUser(data, config);
  if (!user) throw Object.assign(new Error('Inicia sesión para continuar.'), { status: 401 });
  if (!user.activo) throw Object.assign(new Error('Esta cuenta está desactivada.'), { status: 403 });
  if (roles && !roles.includes(user.rol)) {
    throw Object.assign(new Error('No tienes permisos para realizar esta acción.'), { status: 403 });
  }
  return user;
}

function getProfessional(data, user) {
  return data.professionals.find((professional) => professional.usuario === user.id);
}

function professionalForActor(data, id, user) {
  const professional = data.professionals.find((item) => item.id === id);
  if (!professional) throw Object.assign(new Error('No se encontró el perfil profesional.'), { status: 404 });
  if (user.rol !== 'ADMIN' && professional.usuario !== user.id) {
    throw Object.assign(new Error('No tienes permisos sobre este perfil.'), { status: 403 });
  }
  return professional;
}

function populatedBooking(data, booking) {
  const service = data.services.find((item) => item.id === booking.servicio);
  const professional = data.professionals.find((item) => item.id === booking.profesional);
  const client = data.users.find((item) => item.id === booking.cliente);
  return {
    ...booking,
    _id: booking.id,
    servicio: service ? { ...service, _id: service.id } : null,
    profesional: professional ? { ...professional, _id: professional.id } : null,
    cliente: client ? asPublicUser(client) : null,
    precio: service?.precio || 0,
    duracion: service?.duracion || 0
  };
}

function createNotification(data, usuario, reserva, tipo, mensaje) {
  data.notifications.unshift({
    id: crypto.randomUUID(),
    usuario,
    reserva,
    tipo,
    mensaje,
    creadaEn: new Date().toISOString(),
    leida: false
  });
}

function validFutureDate(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw Object.assign(new Error('Selecciona una fecha y hora válidas.'), { status: 400 });
  }
  const [hour, minute] = time.split(':').map(Number);
  if (hour > 23 || minute > 59) throw Object.assign(new Error('Selecciona una hora válida.'), { status: 400 });
  const candidate = new Date(`${date}T${time}:00`);
  if (Number.isNaN(candidate.getTime()) || candidate.toISOString().slice(0, 10) !== date || candidate <= new Date()) {
    throw Object.assign(new Error('La fecha y hora deben ser válidas y futuras.'), { status: 400 });
  }
}

function checkAvailability(data, professionalId, serviceId, date, time, ignoreId) {
  const professional = data.professionals.find((item) => item.id === professionalId);
  const service = data.services.find((item) => item.id === serviceId);
  if (!professional?.activo) throw Object.assign(new Error('El perfil profesional no está disponible.'), { status: 400 });
  if (!service?.activo || service.profesional !== professionalId) throw Object.assign(new Error('El servicio no está disponible.'), { status: 400 });
  validFutureDate(date, time);

  const requestedDay = new Date(`${date}T00:00:00`).getDay();
  const schedule = data.schedules.find((item) => item.profesional === professionalId && item.dia === requestedDay && item.activo && !item.bloqueado);
  const startMinutes = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
  const endMinutes = startMinutes + Number(service.duracion);
  const scheduleStart = schedule ? Number(schedule.horaInicio.slice(0, 2)) * 60 + Number(schedule.horaInicio.slice(3, 5)) : -1;
  const scheduleEnd = schedule ? Number(schedule.horaFin.slice(0, 2)) * 60 + Number(schedule.horaFin.slice(3, 5)) : -1;

  if (!schedule || startMinutes < scheduleStart || endMinutes > scheduleEnd) {
    throw Object.assign(new Error('El horario elegido no está dentro de la disponibilidad del profesional.'), { status: 409 });
  }

  const conflict = data.bookings.some((booking) => {
    if (booking.id === ignoreId || booking.profesional !== professionalId || booking.fecha !== date ||
      ['CANCELADA', 'RECHAZADA'].includes(booking.estado)) return false;
    const existingService = data.services.find((item) => item.id === booking.servicio);
    const existingStart = Number(booking.hora.slice(0, 2)) * 60 + Number(booking.hora.slice(3, 5));
    const existingEnd = existingStart + Number(existingService?.duracion || 30);
    return startMinutes < existingEnd && endMinutes > existingStart;
  });

  if (conflict) throw Object.assign(new Error('Ese horario ya está reservado. Elige otro horario.'), { status: 409 });

  const blocked = data.blocks.some((block) => {
    if (block.profesional !== professionalId || block.fecha !== date) return false;
    const blockedStart = Number(block.horaInicio.slice(0, 2)) * 60 + Number(block.horaInicio.slice(3, 5));
    const blockedEnd = Number(block.horaFin.slice(0, 2)) * 60 + Number(block.horaFin.slice(3, 5));
    return startMinutes < blockedEnd && endMinutes > blockedStart;
  });
  if (blocked) throw Object.assign(new Error('Ese horario fue bloqueado por el profesional.'), { status: 409 });
}

function getAvailableTimes(data, professionalId, date, serviceId) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw Object.assign(new Error('La fecha es obligatoria y debe tener formato YYYY-MM-DD.'), { status: 400 });
  }
  const requestedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(requestedDate.getTime()) || requestedDate.toISOString().slice(0, 10) !== date) {
    throw Object.assign(new Error('La fecha seleccionada no es válida.'), { status: 400 });
  }
  const service = data.services.find((item) => item.id === serviceId && item.profesional === professionalId && item.activo);
  const day = requestedDate.getDay();
  const schedule = data.schedules.find((item) => item.profesional === professionalId && item.dia === day && item.activo && !item.bloqueado);
  if (!service || !schedule) return [];
  const start = Number(schedule.horaInicio.slice(0, 2)) * 60 + Number(schedule.horaInicio.slice(3, 5));
  const end = Number(schedule.horaFin.slice(0, 2)) * 60 + Number(schedule.horaFin.slice(3, 5));
  const times = [];
  for (let minute = start; minute + Number(service.duracion) <= end; minute += 30) {
    const time = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
    const requestedEnd = minute + Number(service.duracion);
    const occupied = data.bookings.some((booking) => {
      if (booking.profesional !== professionalId || booking.fecha !== date ||
        ['CANCELADA', 'RECHAZADA'].includes(booking.estado)) return false;
      const existingService = data.services.find((item) => item.id === booking.servicio);
      const existingStart = Number(booking.hora.slice(0, 2)) * 60 + Number(booking.hora.slice(3, 5));
      const existingEnd = existingStart + Number(existingService?.duracion || 30);
      return minute < existingEnd && requestedEnd > existingStart;
    });
    const blocked = data.blocks.some((block) => {
      if (block.profesional !== professionalId || block.fecha !== date) return false;
      const blockStart = Number(block.horaInicio.slice(0, 2)) * 60 + Number(block.horaInicio.slice(3, 5));
      const blockEnd = Number(block.horaFin.slice(0, 2)) * 60 + Number(block.horaFin.slice(3, 5));
      return minute < blockEnd && requestedEnd > blockStart;
    });
    if (new Date(`${date}T${time}:00`) > new Date() && !occupied && !blocked) times.push(time);
  }
  return times;
}

function errorResponse(error, config) {
  const status = error.status || 500;
  return new AxiosError(
    error.message || 'No fue posible completar la solicitud.',
    AxiosError.ERR_BAD_REQUEST,
    config,
    null,
    { data: { error: error.message || 'Error inesperado.' }, status, statusText: 'Error', headers: {} }
  );
}

function procesarRecordatoriosAutomaticos(data, ahora = new Date()) {
  const fin = ahora.getTime() + 60 * 60 * 1000;
  let cambios = false;
  for (const booking of data.bookings) {
    if (!['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(booking.estado)) continue;
    const cita = new Date(`${booking.fecha}T${booking.hora}:00`);
    if (Number.isNaN(cita.getTime()) || cita <= ahora || cita.getTime() > fin) continue;
    const clave = `${booking.id}:${booking.fecha}:${booking.hora}`;
    if (data.notifications.some((item) => item.claveAutomatica === clave)) continue;
    const service = data.services.find((item) => item.id === booking.servicio);
    data.notifications.push({
      id: crypto.randomUUID(),
      usuario: booking.cliente,
      reserva: booking.id,
      tipo: 'RECORDATORIO_AUTOMATICO',
      claveAutomatica: clave,
      mensaje: `Recordatorio: tienes una reserva para ${service?.nombre || 'tu cita'} el ${booking.fecha} a las ${booking.hora}.`,
      creadaEn: ahora.toISOString(),
      leida: false
    });
    cambios = true;
  }
  return cambios;
}

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function demoAdapter(config) {
  try {
    const url = new URL(config.url || '', config.baseURL || window.location.origin);
    Object.entries(config.params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
    const path = url.pathname.replace(/^\/api/, '').replace(/\/+$/, '') || '/';
    const method = (config.method || 'get').toUpperCase();
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const data = readData();
    const user = currentUser(data, config);
    let result;
    let status = 200;

    if (method === 'GET' && path === '/') {
      result = { mensaje: 'API ServiGo en modo demo local.', version: '1.0.0', modo: 'demo' };
    } else if (method === 'POST' && path === '/registro') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('Ingresa un correo válido.'), { status: 400 });
      if (!String(body.nombre || '').trim()) throw Object.assign(new Error('El nombre es obligatorio.'), { status: 400 });
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        throw Object.assign(new Error('La contraseña debe tener 8 caracteres como mínimo e incluir mayúscula, minúscula y número.'), { status: 400 });
      }
      if (data.users.some((item) => item.email === email)) throw Object.assign(new Error('El correo ya está registrado.'), { status: 409 });
      const name = String(body.nombre).trim().split(/\s+/);
      const created = {
        id: crypto.randomUUID(),
        username: email,
        email,
        firstName: name[0],
        lastName: name.slice(1).join(' '),
        telefono: String(body.telefono || ''),
        rol: String(body.rol).toUpperCase() === 'PROFESIONAL' ? 'PRO' : 'CLI',
        activo: true,
        passwordHash: await hashPassword(password)
      };
      data.users.push(created);
      if (created.rol === 'PRO') {
        data.professionals.push({
          id: crypto.randomUUID(),
          usuario: created.id,
          tipoNegocio: 'OTRO',
          nombreNegocio: `${created.firstName} ${created.lastName}`.trim(),
          descripcion: '',
          telefono: created.telefono,
          correo: email,
          direccion: '',
          imagen: '',
          enlacePersonalizado: `${created.firstName}-${created.id.slice(0, 6)}`.toLowerCase(),
          activo: true
        });
      }
      result = asPublicUser(created);
      status = 201;
    } else if (method === 'POST' && path === '/login') {
      const username = String(body.username || '').trim().toLowerCase();
      const found = data.users.find((item) => item.email === username || item.username === username);
      if (!found || found.passwordHash !== await hashPassword(String(body.password || ''))) {
        throw Object.assign(new Error('Correo o contraseña incorrectos.'), { status: 401 });
      }
      if (!found.activo) throw Object.assign(new Error('Tu cuenta está desactivada. Contacta con soporte.'), { status: 403 });
      result = { token: `demo-token:${found.id}`, usuario: asPublicUser(found) };
    } else if (method === 'POST' && path === '/recuperar-password') {
      const email = String(body.email || '').trim().toLowerCase();
      const found = data.users.find((item) => item.email === email);
      if (found) {
        const token = crypto.randomUUID();
        data.resetTokens[token] = { usuario: found.id, expires: Date.now() + 60 * 60 * 1000 };
        result = { message: 'Enlace demo creado. Úsalo para definir una nueva contraseña.', resetUrl: `${window.location.origin}/recuperar-password?token=${token}` };
      } else {
        result = { message: 'Si el correo pertenece a una cuenta, recibirás un enlace para restablecer la contraseña.' };
      }
    } else if (method === 'POST' && path === '/restablecer-password') {
      const token = data.resetTokens[String(body.token || '')];
      if (!token || token.expires < Date.now()) throw Object.assign(new Error('El enlace es inválido o venció.'), { status: 400 });
      const password = String(body.password || '');
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        throw Object.assign(new Error('La contraseña debe tener 8 caracteres como mínimo e incluir mayúscula, minúscula y número.'), { status: 400 });
      }
      const found = data.users.find((item) => item.id === token.usuario);
      if (!found) throw Object.assign(new Error('La cuenta ya no existe.'), { status: 404 });
      found.passwordHash = await hashPassword(password);
      delete data.resetTokens[String(body.token)];
      result = { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' };
    } else if (method === 'GET' && path === '/usuarios') {
      requireUser(data, config, ['ADMIN']);
      result = data.users.map(asPublicUser);
    } else if (method === 'PATCH' && path === '/perfil') {
      const actor = requireUser(data, config);
      Object.assign(actor, {
        firstName: body.firstName ?? actor.firstName,
        lastName: body.lastName ?? actor.lastName,
        telefono: body.telefono ?? actor.telefono
      });
      if (body.email && String(body.email).trim().toLowerCase() !== actor.email &&
        data.users.some((item) => item.email === String(body.email).trim().toLowerCase())) {
        throw Object.assign(new Error('El correo ya está registrado.'), { status: 409 });
      }
      if (body.email) {
        actor.email = String(body.email).trim().toLowerCase();
        actor.username = actor.email;
      }
      const professional = getProfessional(data, actor);
      if (body.profesional && actor.rol === 'PRO') {
        const profileData = body.profesional;
        const slug = String(profileData.enlacePersonalizado || '').trim();
        if (!String(profileData.nombreNegocio || '').trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
          throw Object.assign(new Error('El nombre del negocio y un enlace válido son obligatorios.'), { status: 400 });
        }
        if (data.professionals.some((item) => item.enlacePersonalizado === slug && item.id !== professional?.id)) {
          throw Object.assign(new Error('El enlace personalizado ya está en uso.'), { status: 409 });
        }
        if (professional) {
          Object.assign(professional, profileData);
        } else {
          data.professionals.push({
            id: crypto.randomUUID(),
            usuario: actor.id,
            tipoNegocio: profileData.tipoNegocio || 'OTRO',
            nombreNegocio: String(profileData.nombreNegocio).trim(),
            descripcion: String(profileData.descripcion || ''),
            telefono: String(profileData.telefono || ''),
            correo: String(profileData.correo || actor.email),
            direccion: String(profileData.direccion || ''),
            imagen: String(profileData.imagen || ''),
            enlacePersonalizado: slug,
            activo: true
          });
        }
      }
      const updatedProfessional = getProfessional(data, actor);
      result = {
        usuario: asPublicUser(actor),
        profesional: updatedProfessional ? { ...updatedProfessional, _id: updatedProfessional.id } : null
      };
    } else if (method === 'GET' && path === '/perfil') {
      const actor = requireUser(data, config);
      const professional = getProfessional(data, actor);
      result = {
        usuario: asPublicUser(actor),
        profesional: professional ? { ...professional, _id: professional.id } : null
      };
    } else if (method === 'PATCH' && /^\/usuarios\/[^/]+$/.test(path)) {
      requireUser(data, config, ['ADMIN']);
      const target = data.users.find((item) => item.id === path.split('/')[2]);
      if (!target) throw Object.assign(new Error('Usuario no encontrado.'), { status: 404 });
      if (typeof body.activo === 'boolean') target.activo = body.activo;
      result = asPublicUser(target);
    } else if (path === '/profesionales' && method === 'GET') {
      result = data.professionals
        .filter((item) => item.activo || user?.rol === 'ADMIN')
        .map((item) => ({ ...item, _id: item.id }));
    } else if (path === '/profesionales' && method === 'POST') {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const current = actor.rol === 'ADMIN' && body.usuario
        ? data.professionals.find((item) => item.usuario === body.usuario)
        : getProfessional(data, actor);
      if (!current) throw Object.assign(new Error('No se encontró el perfil profesional.'), { status: 404 });
      Object.assign(current, body);
      result = current;
    } else if (path.startsWith('/profesionales/') && method === 'PATCH') {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const target = professionalForActor(data, path.split('/')[2], actor);
      Object.assign(target, body);
      result = target;
    } else if (path.startsWith('/profesional/') && path.endsWith('/clientes') && method === 'GET') {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const professionalId = path.split('/')[2];
      professionalForActor(data, professionalId, actor);
      const ids = new Set(data.bookings.filter((item) => item.profesional === professionalId).map((item) => item.cliente));
      result = data.users.filter((item) => ids.has(item.id)).map(asPublicUser);
    } else if (path === '/servicios' && method === 'GET') {
      const professionalId = url.searchParams.get('profesional');
      const includeInactiveRequested = url.searchParams.get('incluirInactivos') === 'true';
      const ownsProfessional = data.professionals.some((item) => item.id === professionalId && item.usuario === user?.id);
      const includeInactive = includeInactiveRequested && (user?.rol === 'ADMIN' || ownsProfessional);
      result = data.services
        .filter((item) => (item.activo || includeInactive) && (!professionalId || item.profesional === professionalId))
        .map((item) => ({ ...item, _id: item.id }));
    } else if (path.startsWith('/servicios/gestion/') && method === 'GET') {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const professionalId = path.split('/')[3];
      professionalForActor(data, professionalId, actor);
      result = data.services.filter((item) => item.profesional === professionalId).map((item) => ({ ...item, _id: item.id }));
    } else if (path === '/servicios' && method === 'POST') {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const professional = professionalForActor(data, String(body.profesional || getProfessional(data, actor)?.id || ''), actor);
      const price = Number(body.precio);
      const duration = Number(body.duracion);
      if (!String(body.nombre || '').trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(duration) || duration < 1) {
        throw Object.assign(new Error('Nombre, precio y duración válida son obligatorios.'), { status: 400 });
      }
      const created = { id: crypto.randomUUID(), profesional: professional.id, nombre: String(body.nombre).trim(), descripcion: String(body.descripcion || ''), precio: price, duracion: duration, activo: body.activo !== false, categoria: body.categoria || 'Otros' };
      data.services.push(created);
      result = created;
      status = 201;
    } else if (path.startsWith('/servicios/') && ['PATCH', 'DELETE'].includes(method)) {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const target = data.services.find((item) => item.id === path.split('/')[2]);
      if (!target) throw Object.assign(new Error('Servicio no encontrado.'), { status: 404 });
      professionalForActor(data, target.profesional, actor);
      if (method === 'DELETE') target.activo = false;
      else Object.assign(target, body, {
        precio: body.precio === undefined ? target.precio : Number(body.precio),
        duracion: body.duracion === undefined ? target.duracion : Number(body.duracion)
      });
      result = target;
    } else if (path === '/horarios' && method === 'GET') {
      const professionalId = url.searchParams.get('profesional');
      result = data.schedules
        .filter((item) => !professionalId || item.profesional === professionalId)
        .map((item) => ({ ...item, _id: item.id, diaNombre: DAY_NAMES[item.dia] }));
    } else if (path === '/horarios' && method === 'POST') {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const professional = professionalForActor(data, String(body.profesional || getProfessional(data, actor)?.id || ''), actor);
      const day = Number(body.dia);
      if (!Number.isInteger(day) || day < 0 || day > 6 || !/^\d{2}:\d{2}$/.test(body.horaInicio || '') ||
        !/^\d{2}:\d{2}$/.test(body.horaFin || '') || body.horaInicio >= body.horaFin) {
        throw Object.assign(new Error('Día u horario no válido.'), { status: 400 });
      }
      const created = { id: crypto.randomUUID(), profesional: professional.id, dia: day, horaInicio: body.horaInicio, horaFin: body.horaFin, activo: body.activo !== false, bloqueado: body.bloqueado === true };
      data.schedules.push(created);
      result = created;
      status = 201;
    } else if (path.startsWith('/horarios/') && (method === 'PATCH' || method === 'DELETE')) {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const target = data.schedules.find((item) => item.id === path.split('/')[2]);
      if (!target) throw Object.assign(new Error('Horario no encontrado.'), { status: 404 });
      professionalForActor(data, target.profesional, actor);
      if (method === 'DELETE') target.activo = false;
      else Object.assign(target, body);
      result = target;
    } else if (path === '/disponibilidad/bloqueos' && method === 'GET') {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const professionalId = url.searchParams.get('profesional') || getProfessional(data, actor)?.id;
      professionalForActor(data, professionalId, actor);
      result = data.blocks.filter((item) => item.profesional === professionalId);
    } else if (path === '/disponibilidad/bloqueos' && method === 'POST') {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const professional = professionalForActor(data, String(body.profesional || getProfessional(data, actor)?.id || ''), actor);
      validFutureDate(String(body.fecha || ''), String(body.horaInicio || ''));
      if (!/^\d{2}:\d{2}$/.test(body.horaFin || '') || body.horaInicio >= body.horaFin) {
        throw Object.assign(new Error('Indica un rango de horas válido para el bloqueo.'), { status: 400 });
      }
      const start = Number(body.horaInicio.slice(0, 2)) * 60 + Number(body.horaInicio.slice(3, 5));
      const end = Number(body.horaFin.slice(0, 2)) * 60 + Number(body.horaFin.slice(3, 5));
      if (data.blocks.some((item) => {
        if (item.profesional !== professional.id || item.fecha !== body.fecha) return false;
        const itemStart = Number(item.horaInicio.slice(0, 2)) * 60 + Number(item.horaInicio.slice(3, 5));
        const itemEnd = Number(item.horaFin.slice(0, 2)) * 60 + Number(item.horaFin.slice(3, 5));
        return start < itemEnd && end > itemStart;
      })) {
        throw Object.assign(new Error('El horario se cruza con otro bloqueo existente.'), { status: 409 });
      }
      const created = {
        id: crypto.randomUUID(),
        profesional: professional.id,
        fecha: body.fecha,
        horaInicio: body.horaInicio,
        horaFin: body.horaFin,
        motivo: String(body.motivo || '')
      };
      data.blocks.push(created);
      result = created;
      status = 201;
    } else if (path.startsWith('/disponibilidad/bloqueos/') && method === 'DELETE') {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const blockId = path.split('/')[3];
      const block = data.blocks.find((item) => item.id === blockId);
      if (!block) throw Object.assign(new Error('No se encontró el bloqueo.'), { status: 404 });
      professionalForActor(data, block.profesional, actor);
      data.blocks = data.blocks.filter((item) => item.id !== blockId);
      result = { eliminado: true };
    } else if (path === '/reservas' && method === 'POST') {
      const actor = requireUser(data, config, ['CLI', 'ADMIN']);
      checkAvailability(data, String(body.profesional || ''), String(body.servicio || ''), String(body.fecha || ''), String(body.hora || ''), null);
      const booking = {
        id: crypto.randomUUID(),
        profesional: String(body.profesional),
        servicio: String(body.servicio),
        cliente: body.cliente || actor.id,
        fecha: String(body.fecha),
        hora: String(body.hora),
        estado: 'PENDIENTE',
        notas: String(body.notas || ''),
        creadaEn: new Date().toISOString()
      };
      data.bookings.unshift(booking);
      const professional = data.professionals.find((item) => item.id === booking.profesional);
      createNotification(data, professional?.usuario, booking.id, 'RESERVA', 'Tienes una nueva solicitud de reserva.');
      createNotification(data, booking.cliente, booking.id, 'RESERVA', 'Tu solicitud de reserva fue enviada.');
      result = populatedBooking(data, booking);
      status = 201;
    } else if (path === '/reservas/lista' && method === 'GET') {
      const actor = requireUser(data, config);
      const professional = getProfessional(data, actor);
      result = data.bookings
        .filter((item) => actor.rol === 'ADMIN' || (actor.rol === 'PRO' ? item.profesional === professional?.id : item.cliente === actor.id))
        .map((item) => populatedBooking(data, item));
    } else if (path === '/reservas/historial' && method === 'GET') {
      const actor = requireUser(data, config);
      const professional = getProfessional(data, actor);
      result = data.bookings
        .filter((item) => (actor.rol === 'PRO' ? item.profesional === professional?.id : item.cliente === actor.id) &&
          ['CANCELADA', 'COMPLETADA', 'RECHAZADA', 'REPROGRAMADA'].includes(item.estado))
        .map((item) => populatedBooking(data, item));
    } else if (path === '/reservas/disponibilidad' && method === 'GET') {
      requireUser(data, config);
      const professionalId = url.searchParams.get('profesional') || '';
      const date = url.searchParams.get('fecha') || '';
      const serviceId = url.searchParams.get('servicio') || data.services.find((item) => item.profesional === professionalId && item.activo)?.id;
      const services = data.services.filter((item) =>
        item.profesional === professionalId &&
        item.activo &&
        (!serviceId || item.id === serviceId)
      );
      result = {
        profesional: professionalId,
        fecha: date,
        servicios: services.map((service) => ({
          servicio: { id: service.id, nombre: service.nombre, duracion: service.duracion, precio: service.precio },
          horariosDisponibles: getAvailableTimes(data, professionalId, date, service.id)
        }))
      };
    } else if (path.startsWith('/reservas/') && method === 'GET') {
      const actor = requireUser(data, config);
      const booking = data.bookings.find((item) => item.id === path.split('/')[2]);
      if (!booking) throw Object.assign(new Error('Reserva no encontrada.'), { status: 404 });
      const professional = getProfessional(data, actor);
      if (actor.rol !== 'ADMIN' && booking.cliente !== actor.id && booking.profesional !== professional?.id) {
        throw Object.assign(new Error('No tienes permisos sobre esta reserva.'), { status: 403 });
      }
      result = populatedBooking(data, booking);
    } else if (path.startsWith('/reservas/') && method === 'PATCH') {
      const [, , bookingId, action] = path.split('/');
      const actor = requireUser(data, config, ['CLI', 'PRO', 'ADMIN']);
      const booking = data.bookings.find((item) => item.id === bookingId);
      if (!booking) throw Object.assign(new Error('Reserva no encontrada.'), { status: 404 });
      const professional = getProfessional(data, actor);
      const isClient = booking.cliente === actor.id;
      const isProfessional = booking.profesional === professional?.id;
      if (actor.rol !== 'ADMIN' && !isClient && !isProfessional) throw Object.assign(new Error('No tienes permisos sobre esta reserva.'), { status: 403 });

      if (action === 'confirmar') {
        if (!isProfessional && actor.rol !== 'ADMIN') throw Object.assign(new Error('Solo el profesional puede confirmar.'), { status: 403 });
        if (!['PENDIENTE', 'REPROGRAMADA'].includes(booking.estado)) throw Object.assign(new Error('Solo se pueden confirmar solicitudes pendientes o reprogramadas.'), { status: 409 });
        booking.estado = 'CONFIRMADA';
        createNotification(data, booking.cliente, booking.id, 'CONFIRMACION', 'El profesional confirmó tu reserva.');
      } else if (action === 'rechazar') {
        if (!isProfessional && actor.rol !== 'ADMIN') throw Object.assign(new Error('Solo el profesional puede rechazar.'), { status: 403 });
        if (booking.estado !== 'PENDIENTE') throw Object.assign(new Error('Solo se pueden rechazar reservas pendientes.'), { status: 409 });
        booking.estado = 'RECHAZADA';
        createNotification(data, booking.cliente, booking.id, 'RECHAZO', 'El profesional rechazó tu reserva.');
      } else if (action === 'completar') {
        if (!isProfessional && actor.rol !== 'ADMIN') throw Object.assign(new Error('Solo el profesional puede completar.'), { status: 403 });
        if (booking.estado !== 'CONFIRMADA') throw Object.assign(new Error('Solo se pueden completar reservas confirmadas.'), { status: 409 });
        booking.estado = 'COMPLETADA';
      } else if (action === 'cancelar') {
        if (!['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(booking.estado)) throw Object.assign(new Error('Esta reserva ya no se puede cancelar.'), { status: 409 });
        booking.estado = 'CANCELADA';
        createNotification(data, isClient ? data.professionals.find((item) => item.id === booking.profesional)?.usuario : booking.cliente, booking.id, 'CANCELACION', 'La reserva fue cancelada.');
      } else if (action === 'reprogramar') {
        if (!['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(booking.estado)) throw Object.assign(new Error('Esta reserva ya no se puede reprogramar.'), { status: 409 });
        checkAvailability(data, booking.profesional, booking.servicio, String(body.fecha || ''), String(body.hora || ''), booking.id);
        booking.fecha = String(body.fecha);
        booking.hora = String(body.hora);
        booking.estado = 'REPROGRAMADA';
        const notifyId = isClient ? data.professionals.find((item) => item.id === booking.profesional)?.usuario : booking.cliente;
        createNotification(data, notifyId, booking.id, 'REPROGRAMACION', `La reserva fue reprogramada para ${booking.fecha} a las ${booking.hora}.`);
      } else {
        throw Object.assign(new Error('Acción de reserva no válida.'), { status: 404 });
      }
      result = populatedBooking(data, booking);
    } else if (path.startsWith('/profesional/') && path.includes('/clientes/') && path.endsWith('/historial') && method === 'GET') {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const [, , professionalId, , clientId] = path.split('/');
      professionalForActor(data, professionalId, actor);
      result = data.bookings.filter((item) => item.profesional === professionalId && item.cliente === clientId).map((item) => populatedBooking(data, item));
    } else if (path.startsWith('/clientes/') && method === 'GET') {
      const actor = requireUser(data, config);
      if (actor.rol !== 'ADMIN' && actor.id !== path.split('/')[2]) throw Object.assign(new Error('No puedes consultar estos datos.'), { status: 403 });
      const target = data.users.find((item) => item.id === path.split('/')[2]);
      if (!target) throw Object.assign(new Error('Cliente no encontrado.'), { status: 404 });
      result = asPublicUser(target);
    } else if (path.startsWith('/notificaciones/') && method === 'GET') {
      const actor = requireUser(data, config);
      const userId = path.split('/')[2];
      if (actor.rol !== 'ADMIN' && actor.id !== userId) throw Object.assign(new Error('No puedes consultar notificaciones de otro usuario.'), { status: 403 });
      if (procesarRecordatoriosAutomaticos(data)) saveData(data);
      result = data.notifications.filter((item) => item.usuario === userId);
    } else if (path.startsWith('/reservas/') && path.endsWith('/recordatorio') && method === 'POST') {
      const actor = requireUser(data, config);
      const booking = data.bookings.find((item) => item.id === path.split('/')[2]);
      if (!booking) throw Object.assign(new Error('Reserva no encontrada.'), { status: 404 });
      if (actor.rol !== 'ADMIN' && actor.id !== booking.cliente) throw Object.assign(new Error('Solo el cliente puede solicitar el recordatorio.'), { status: 403 });
      createNotification(data, booking.cliente, booking.id, 'RECORDATORIO', `Recordatorio: ${booking.fecha} a las ${booking.hora}.`);
      result = populatedBooking(data, booking);
    } else if (path.includes('/estadisticas/') && method === 'GET') {
      const actor = requireUser(data, config, ['PRO', 'ADMIN']);
      const professionalId = path.split('/')[2];
      professionalForActor(data, professionalId, actor);
      const bookings = data.bookings.filter((item) => item.profesional === professionalId);
      const section = path.split('/').at(-1);
      if (section === 'resumen') {
        result = Object.fromEntries(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'REPROGRAMADA', 'COMPLETADA', 'RECHAZADA'].map((state) => [state.toLowerCase(), bookings.filter((item) => item.estado === state).length]));
        result.total = bookings.length;
      } else if (section === 'servicios') {
        result = data.services.filter((item) => item.profesional === professionalId).map((service) => ({
          servicio: service.id,
          nombre: service.nombre,
          reservas: bookings.filter((item) => item.servicio === service.id && !['CANCELADA', 'RECHAZADA'].includes(item.estado)).length
        })).sort((a, b) => b.reservas - a.reservas);
      } else if (section === 'completadas') {
        const completed = bookings.filter((item) => item.estado === 'COMPLETADA').map((item) => populatedBooking(data, item));
        result = { profesional: professionalId, total_completadas: completed.length, citas: completed };
      } else {
        const completed = bookings.filter((item) => item.estado === 'COMPLETADA');
        result = {
          profesional: professionalId,
          citas_completadas: completed.length,
          ingresos_estimados: completed.reduce((sum, item) => sum + Number(data.services.find((service) => service.id === item.servicio)?.precio || 0), 0)
        };
      }
    } else if (path === '/admin/estadisticas' && method === 'GET') {
      requireUser(data, config, ['ADMIN']);
      result = {
        usuarios: data.users.length,
        profesionales: data.professionals.filter((item) => item.activo).length,
        clientes: data.users.filter((item) => item.rol === 'CLI').length,
        reservas: data.bookings.length,
        citasCompletadas: data.bookings.filter((item) => item.estado === 'COMPLETADA').length
      };
    } else {
      throw Object.assign(new Error(`No existe el endpoint demo ${method} ${path}.`), { status: 404 });
    }

    if (method !== 'GET') saveData(data);
    return { data: result, status, statusText: status === 201 ? 'Created' : 'OK', headers: {}, config, request: null };
  } catch (error) {
    throw errorResponse(error, config);
  }
}

export const demoCredentials = {
  cliente: { email: 'cliente@servigo.demo', password: 'Cliente123' },
  profesional: { email: 'profesional@servigo.demo', password: 'ProServiGo123' },
  admin: { email: 'admin@servigo.demo', password: 'Admin1234' }
};

export { DAY_NAMES };
