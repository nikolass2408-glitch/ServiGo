// Archivo de datos simulados (Mock Data) para ServiGo
// Permite renderizar listas reales de servicios y profesionales mientras se integra el backend.

export const serviciosMock = [
  {
    id: 1,
    nombre: 'Corte de Cabello + Barba',
    categoria: 'Barbería',
    profesional: 'Barbería El Elegante',
    precio: 35000,
    duracion: '45 min',
    calificacion: 4.8,
    ubicacion: 'Centro, Calle 15'
  },
  {
    id: 2,
    nombre: 'Manicura Semi-permanente',
    categoria: 'Uñas',
    profesional: 'Nails & Beauty Express',
    precio: 45000,
    duracion: '60 min',
    calificacion: 4.9,
    ubicacion: 'Norte, Av. Principal'
  },
  {
    id: 3,
    nombre: 'Masaje Relajante Completo',
    categoria: 'Belleza',
    profesional: 'Spa & Armonía',
    precio: 80000,
    duracion: '90 min',
    calificacion: 4.7,
    ubicacion: 'Zona Sur'
  }
];

export const reservasMock = [
  {
    id: 101,
    servicio: 'Corte de Cabello + Barba',
    profesional: 'Barbería El Elegante',
    fecha: '2026-09-20',
    hora: '10:00 a.m.',
    estado: 'Confirmada',
    precio: 35000
  },
  {
    id: 102,
    servicio: 'Manicura Semi-permanente',
    profesional: 'Nails & Beauty Express',
    fecha: '2026-09-25',
    hora: '03:00 p.m.',
    estado: 'Pendiente',
    precio: 45000
  }
];