import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function ModalAgendar({ servicio, onClose, onConfirmar }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('09:00');
  const [exito, setExito] = useState(false);

  if (!servicio) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
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
        <button style={styles.btnClose} onClick={onClose}>
          <X size={20} />
        </button>

        {!exito ? (
          <>
            <h3 style={styles.title}>Agendar Cita</h3>
            <p style={styles.subtitle}>
              Servicio: <strong>{servicio.nombre}</strong> con <em>{servicio.profesional}</em>
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              
              {/* SELECCIÓN DE FECHA */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Calendar size={16} /> Fecha de la cita
                </label>
                <input 
                  type="date" 
                  value={fecha} 
                  onChange={(e) => setFecha(e.target.value)} 
                  required 
                  style={styles.input}
                />
              </div>

              {/* SELECCIÓN DE HORA */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Clock size={16} /> Hora disponible
                </label>
                <select 
                  value={hora} 
                  onChange={(e) => setHora(e.target.value)} 
                  style={styles.select}
                >
                  <option value="08:00 a.m.">08:00 a.m.</option>
                  <option value="10:00 a.m.">10:00 a.m.</option>
                  <option value="02:00 p.m.">02:00 p.m.</option>
                  <option value="04:00 p.m.">04:00 p.m.</option>
                </select>
              </div>

              {/* RESUMEN DE PRECIO */}
              <div style={styles.priceRow}>
                <span>Total a pagar:</span>
                <span style={styles.price}>${servicio.precio.toLocaleString()} COP</span>
              </div>

              <button type="submit" style={styles.btnSubmit}>
                Confirmar Reserva
              </button>
            </form>
          </>
        ) : (
          <div style={styles.successState}>
            <CheckCircle size={48} color="#15803d" />
            <h4 style={styles.successTitle}>¡Reserva Agendada!</h4>
            <p style={styles.successText}>Tu solicitud ha sido enviada al profesional.</p>
          </div>
        )}

      </div>
    </div>
  );
}

// ESTILOS EN CSS-IN-JS
const styles = {
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
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '400px',
    position: 'relative',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    fontFamily: 'sans-serif'
  },
  btnClose: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '13px',
    color: '#4b5563',
    margin: '0 0 20px 0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none'
  },
  select: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff'
  },
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
    margin: 0
  }
};