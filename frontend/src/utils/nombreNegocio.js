const NOMBRES_NEGOCIO_DEMO = {
  BARBERIA: 'Barbería Matías',
  SPA: 'Aura Estudio de Belleza',
  GIMNASIO: 'Punto Fit',
  FOTOGRAFIA: 'Luz de Autor Fotografía',
  RESTAURANTE: 'Sabor de Casa',
  EDUCACION: 'Aprende Más',
  MASCOTAS: 'Huellitas',
  SALUD: 'Bienestar Vital',
  AUTOMOTRIZ: 'Motor Expert',
  OTRO: 'Negocio Independiente'
};

export function obtenerNombreNegocio({ nombreEmpresa, nombreNegocio, tipoNegocio }) {
  const nombre = String(nombreEmpresa || nombreNegocio || '').trim();
  if (nombre && !/(?:\bpruebas?\b|servigo)/i.test(nombre)) return nombre;

  const tipo = String(tipoNegocio || '').toUpperCase();
  return NOMBRES_NEGOCIO_DEMO[tipo] || nombre || 'Negocio Independiente';
}
