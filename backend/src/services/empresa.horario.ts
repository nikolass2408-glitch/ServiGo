export interface DiaHorarioEmpresa {
  dia: number;
  abierto: boolean;
  horaInicio: string;
  horaFin: string;
}

export interface HorarioEmpresa {
  abierto24Horas: boolean;
  dias: DiaHorarioEmpresa[];
}

export const HORARIO_EMPRESA_EJEMPLO: HorarioEmpresa = {
  abierto24Horas: false,
  dias: Array.from({ length: 7 }, (_, dia) => ({
    dia,
    abierto: true,
    horaInicio: "08:00",
    horaFin: dia === 0 || dia === 6 ? "13:00" : "22:00",
  })),
};

const esHoraValida = (hora: unknown): hora is string =>
  typeof hora === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);

const minutos = (hora: string) => {
  const [horas, minutosHora] = hora.split(":").map(Number);
  return horas * 60 + minutosHora;
};

export function validarHorarioEmpresa(datos: unknown): HorarioEmpresa {
  if (!datos || typeof datos !== "object") {
    throw Object.assign(new Error("El horario de empresa no es válido."), {
      statusCode: 400,
    });
  }

  const horario = datos as Partial<HorarioEmpresa>;
  if (typeof horario.abierto24Horas !== "boolean" || !Array.isArray(horario.dias)) {
    throw Object.assign(new Error("Configura si la empresa abre 24 horas y sus días de atención."), {
      statusCode: 400,
    });
  }

  if (horario.dias.length !== 7) {
    throw Object.assign(new Error("El horario debe incluir los siete días de la semana."), {
      statusCode: 400,
    });
  }

  const dias = horario.dias.map((item) => {
    if (
      !item ||
      !Number.isInteger(item.dia) ||
      item.dia < 0 ||
      item.dia > 6 ||
      typeof item.abierto !== "boolean" ||
      !esHoraValida(item.horaInicio) ||
      !esHoraValida(item.horaFin) ||
      (item.abierto && minutos(item.horaInicio) >= minutos(item.horaFin))
    ) {
      throw Object.assign(new Error("Uno o más días tienen un horario inválido."), {
        statusCode: 400,
      });
    }
    return {
      dia: item.dia,
      abierto: item.abierto,
      horaInicio: item.horaInicio,
      horaFin: item.horaFin,
    };
  });

  if (new Set(dias.map(({ dia }) => dia)).size !== 7) {
    throw Object.assign(new Error("El horario debe incluir una sola configuración por día."), {
      statusCode: 400,
    });
  }

  return { abierto24Horas: horario.abierto24Horas, dias };
}

export function empresaPermiteReserva(
  horario: HorarioEmpresa | undefined,
  fecha: string,
  hora: string,
  duracion: number
): boolean {
  if (!horario || horario.abierto24Horas) return true;

  const dia = new Date(`${fecha}T12:00:00`).getDay();
  const atencion = horario.dias.find((item) => item.dia === dia);
  if (!atencion?.abierto) return false;

  const inicio = minutos(hora);
  return (
    inicio >= minutos(atencion.horaInicio) &&
    inicio + duracion <= minutos(atencion.horaFin)
  );
}

export function validarReservaHorarioEmpresa(
  horario: HorarioEmpresa | undefined,
  fecha: string,
  hora: string,
  duracion: number
): void {
  if (!empresaPermiteReserva(horario, fecha, hora, duracion)) {
    throw Object.assign(
      new Error("La reserva debe estar dentro del horario de atención de la empresa."),
      { statusCode: 409 }
    );
  }
}
