export function fechaHoraLocal(fecha: string, hora: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) {
    return null;
  }
  const valor = new Date(`${fecha}T${hora}:00`);
  if (
    Number.isNaN(valor.getTime()) ||
    valor.getFullYear() !== Number(fecha.slice(0, 4)) ||
    valor.getMonth() + 1 !== Number(fecha.slice(5, 7)) ||
    valor.getDate() !== Number(fecha.slice(8, 10))
  ) {
    return null;
  }
  return valor;
}

export function requiereRecordatorio(
  fecha: string,
  hora: string,
  ahora: Date
) {
  const inicio = fechaHoraLocal(fecha, hora);
  if (!inicio) return false;
  const diferencia = inicio.getTime() - ahora.getTime();
  return diferencia > 0 && diferencia <= 60 * 60 * 1000;
}
