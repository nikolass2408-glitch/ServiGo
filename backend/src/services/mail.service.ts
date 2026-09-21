import nodemailer from "nodemailer";

export interface DatosReservaCorreo {
  to: string;
  nombreCliente: string;
  servicio: string;
  profesional?: string;
  fecha: string;
  hora?: string;
  codigo?: string;
}

// Evita que un nombre con caracteres raros rompa el HTML del correo
const esc = (valor: unknown) =>
  String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export class MailService {
  private static crearTransporter() {
    const port = Number(process.env.MAIL_PORT || 587);

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  static async enviarConfirmacionReserva(datos: DatosReservaCorreo) {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn("[MAIL] MAIL_USER o MAIL_PASS no configurados. No se envió el correo.");
      return;
    }

    if (!datos.to) {
      console.warn("[MAIL] La reserva no tiene correo de destino.");
      return;
    }

    const filas = [
      ["Servicio", datos.servicio],
      datos.profesional ? ["Profesional", datos.profesional] : null,
      ["Fecha", datos.fecha],
      datos.hora ? ["Hora", datos.hora] : null,
      datos.codigo ? ["Código de reserva", datos.codigo] : null,
    ].filter(Boolean) as string[][];

    const detalle = filas
      .map(
        ([etiqueta, valor]) => `
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;">${esc(etiqueta)}</td>
          <td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:600;text-align:right;">${esc(valor)}</td>
        </tr>`
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;background:#f9fafb;padding:24px;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;">
          <div style="width:40px;height:40px;background:#6b21a8;color:#ffffff;border-radius:10px;text-align:center;line-height:40px;font-weight:bold;font-size:20px;margin:0 auto 16px;">S</div>
          <h2 style="text-align:center;color:#1f2937;margin:0 0 8px;">¡Reserva confirmada!</h2>
          <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 24px;">
            Hola ${esc(datos.nombreCliente)}, tu reserva quedó registrada correctamente.
          </p>
          <table style="width:100%;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;border-collapse:collapse;">
            ${detalle}
          </table>
          <p style="text-align:center;color:#9ca3af;font-size:12px;margin:24px 0 0;">
            Gracias por usar ServiGo.
          </p>
        </div>
      </div>`;

    const transporter = this.crearTransporter();

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: datos.to,
      subject: "Reserva confirmada - ServiGo",
      html,
    });

    console.log(`[MAIL] Confirmación enviada a ${datos.to}`);
  }
}