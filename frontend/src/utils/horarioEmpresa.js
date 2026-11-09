export const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

export const crearHorarioEmpresaEjemplo = () => ({
  abierto24Horas: false,
  dias: DIAS_SEMANA.map((_, dia) => ({
    dia,
    abierto: true,
    horaInicio: '08:00',
    horaFin: dia === 0 || dia === 6 ? '13:00' : '22:00'
  }))
});

const formatoHora = (hora) => {
  const [horas, minutos] = hora.split(':').map(Number);
  const sufijo = horas < 12 ? 'a. m.' : 'p. m.';
  const hora12 = horas % 12 || 12;
  return `${hora12}:${String(minutos).padStart(2, '0')} ${sufijo}`;
};

const mismoHorario = (dias) =>
  dias.length > 0 &&
  dias.every((dia) =>
    dia.abierto === dias[0].abierto &&
    dia.horaInicio === dias[0].horaInicio &&
    dia.horaFin === dias[0].horaFin
  );

export function resumirHorarioEmpresa(horario) {
  if (!horario) return 'Horario no configurado';
  if (horario.abierto24Horas) return 'Abierto 24 horas';

  const dias = [...(horario.dias || [])].sort((a, b) => a.dia - b.dia);
  const semana = dias.filter((dia) => dia.dia >= 1 && dia.dia <= 5);
  const finDeSemana = dias.filter((dia) => dia.dia === 0 || dia.dia === 6);
  const resumen = [];

  if (mismoHorario(semana)) {
    if (semana[0].abierto) {
      resumen.push(
        `Lunes a viernes: ${formatoHora(semana[0].horaInicio)} a ${formatoHora(semana[0].horaFin)}`
      );
    }
  } else {
    semana.filter((dia) => dia.abierto).forEach((dia) => {
      resumen.push(
        `${DIAS_SEMANA[dia.dia]}: ${formatoHora(dia.horaInicio)} a ${formatoHora(dia.horaFin)}`
      );
    });
  }

  if (mismoHorario(finDeSemana)) {
    if (finDeSemana[0].abierto) {
      resumen.push(
        `Sábado y domingo: ${formatoHora(finDeSemana[0].horaInicio)} a ${formatoHora(finDeSemana[0].horaFin)}`
      );
    }
  } else {
    finDeSemana.filter((dia) => dia.abierto).forEach((dia) => {
      resumen.push(
        `${DIAS_SEMANA[dia.dia]}: ${formatoHora(dia.horaInicio)} a ${formatoHora(dia.horaFin)}`
      );
    });
  }

  return resumen.length ? resumen.join(' · ') : 'Cerrado todos los días';
}
