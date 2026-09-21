import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function ModalAgendar({ servicio, onClose, onConfirmar }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [exito, setExito] = useState(false);

  if (!servicio) return null;

  // Obtener la fecha actual en formato YYYY-MM-DD
  const obtenerFechaHoy = () => {
    const hoy = new Date();

    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar fecha
    if (!fecha) {
      alert('Por favor selecciona una fecha.');
      return;
    }

    // Validar hora
    if (!hora) {
      alert('Por favor selecciona una hora.');
      return;
    }

    setExito(true);

    // Notificamos al componente padre después de 1.5 segundos
    setTimeout(() => {
      onConfirmar({
        id: Date.now(),
        servicio: servicio.nombre,
        profesional: servicio.profesional,
        fecha,
        hora,
        estado: 'Pendiente',
        precio: servicio.precio
      });

      onClose();
    }, 1500);
  };

  return (
    <div style={styles.overlay}>

      <div style={styles.modal}>

        {/* BOTÓN CERRAR */}
        <button
          style={styles.btnClose}
          onClick={onClose}
          type="button"
        >
          <X size={20} />
        </button>


        {!exito ? (

          <>
            {/* TÍTULO */}
            <h3 style={styles.title}>
              Agendar Cita
            </h3>

            <p style={styles.subtitle}>
              Servicio:{' '}
              <strong>{servicio.nombre}</strong>
              {' '}con{' '}
              <em>{servicio.profesional}</em>
            </p>


            <form
              onSubmit={handleSubmit}
              style={styles.form}
            >

              {/* =========================
                  FECHA
              ========================== */}
              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  <Calendar size={16} />
                  Fecha de la cita
                </label>

                <input
                  type="date"
                  value={fecha}
                  min={obtenerFechaHoy()}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  style={styles.input}
                />

              </div>


              {/* =========================
                  HORA
              ========================== */}
              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  <Clock size={16} />
                  Hora de la cita
                </label>

                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                  style={styles.input}
                />

                <span style={styles.helperText}>
                  Selecciona la hora que prefieras.
                </span>

              </div>


              {/* =========================
                  RESUMEN
              ========================== */}
              <div style={styles.summary}>

                <div style={styles.summaryRow}>
                  <span>Servicio</span>

                  <strong>
                    {servicio.nombre}
                  </strong>
                </div>

                <div style={styles.summaryRow}>
                  <span>Fecha</span>

                  <strong>
                    {fecha || 'Sin seleccionar'}
                  </strong>
                </div>

                <div style={styles.summaryRow}>
                  <span>Hora</span>

                  <strong>
                    {hora || 'Sin seleccionar'}
                  </strong>
                </div>

              </div>


              {/* =========================
                  PRECIO
              ========================== */}
              <div style={styles.priceRow}>

                <span>
                  Total a pagar:
                </span>

                <span style={styles.price}>
                  ${servicio.precio.toLocaleString()} COP
                </span>

              </div>


              {/* =========================
                  CONFIRMAR
              ========================== */}
              <button
                type="submit"
                style={styles.btnSubmit}
              >
                Confirmar Reserva
              </button>

            </form>
          </>

        ) : (

          /* =========================
             MENSAJE DE ÉXITO
          ========================== */
          <div style={styles.successState}>

            <CheckCircle
              size={48}
              color="#15803d"
            />

            <h4 style={styles.successTitle}>
              ¡Reserva Agendada!
            </h4>

            <p style={styles.successText}>
              Tu solicitud ha sido enviada al profesional.
            </p>

            <div style={styles.successDetails}>

              <span>
                <Calendar size={14} />
                {fecha}
              </span>

              <span>
                <Clock size={14} />
                {hora}
              </span>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


/* ======================================================
   ESTILOS
====================================================== */

const styles = {

  /* OVERLAY */
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },


  /* MODAL */
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '400px',
    position: 'relative',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    fontFamily: 'sans-serif',
    maxHeight: '90vh',
    overflowY: 'auto'
  },


  /* CERRAR */
  btnClose: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },


  /* TÍTULO */
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 4px 0',
    paddingRight: '30px'
  },


  /* SUBTÍTULO */
  subtitle: {
    fontSize: '13px',
    color: '#4b5563',
    margin: '0 0 20px 0',
    lineHeight: '1.5'
  },


  /* FORMULARIO */
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },


  /* GRUPO INPUT */
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },


  /* LABEL */
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },


  /* INPUT */
  input: {
    padding: '11px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    width: '100%',
    boxSizing: 'border-box'
  },


  /* TEXTO AYUDA */
  helperText: {
    fontSize: '11px',
    color: '#6b7280'
  },


  /* RESUMEN */
  summary: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '9px'
  },


  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    fontSize: '12px',
    color: '#6b7280'
  },


  /* PRECIO */
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #f3f4f6',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },


  price: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#6b21a8'
  },


  /* BOTÓN CONFIRMAR */
  btnSubmit: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },


  /* ESTADO EXITOSO */
  successState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
    textAlign: 'center'
  },


  successTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#198754',
    margin: '12px 0 4px 0'
  },


  successText: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0'
  },


  successDetails: {
    marginTop: '18px',
    padding: '10px 14px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    display: 'flex',
    gap: '16px',
    color: '#374151',
    fontSize: '12px'
  }

};
