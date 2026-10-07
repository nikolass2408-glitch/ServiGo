import { NotificacionService } from "./notificacion.service";

const INTERVALO_RECORDATORIOS_MS = 60_000;
let programadorIniciado = false;
let procesando = false;

export function iniciarProgramadorRecordatorios() {
  if (programadorIniciado) return;
  programadorIniciado = true;

  const procesar = async () => {
    if (procesando) return;
    procesando = true;
    try {
      const enviadas = await NotificacionService.procesarRecordatoriosAutomaticos();
      if (enviadas > 0) {
        console.info(`[RECORDATORIOS] ${enviadas} recordatorio(s) automático(s) generado(s).`);
      }
    } catch (error) {
      console.error("[RECORDATORIOS ERROR] No se pudieron procesar los recordatorios:", error);
    } finally {
      procesando = false;
    }
  };

  const timer = setInterval(() => void procesar(), INTERVALO_RECORDATORIOS_MS);
  timer.unref();
  void procesar();
}
