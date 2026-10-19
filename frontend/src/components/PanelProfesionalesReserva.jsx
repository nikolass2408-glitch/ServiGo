import { useState } from 'react';
import { BriefcaseBusiness, CalendarDays, Clock3, X } from 'lucide-react';
import API from '../services/api';
import { RatingDisplay } from './RatingStars';

const normalizarNombre = (nombre) => String(nombre || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

export default function PanelProfesionalesReserva({ servicio, servicios, onClose, onSelect }) {
  const coincidenciasExactas = servicios.filter((opcion) =>
    opcion.id && normalizarNombre(opcion.nombre) === normalizarNombre(servicio.nombre)
  );
  const serviciosDisponibles = [...new Map(
    coincidenciasExactas.map((opcion) => [String(opcion.profesionalId || opcion.id), opcion])
  ).values()].slice(0, 5);
  if (!serviciosDisponibles.length) serviciosDisponibles.push(servicio);
  const [servicioElegidoId, setServicioElegidoId] = useState(null);
  const servicioElegido = serviciosDisponibles.find((opcion) =>
    String(opcion.id) === String(servicioElegidoId)
  );

  const obtenerImagen = (ruta) => {
    if (!ruta) return '';
    return ruta.startsWith('/uploads/')
      ? new URL(ruta, API.defaults.baseURL).toString()
      : ruta;
  };

  return (
    <div style={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section style={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="reserva-panel-titulo">
        <div style={styles.grabber} />
        <header style={styles.header}>
          <h2 id="reserva-panel-titulo" style={styles.title}>{servicioElegido?.nombre || servicio.nombre}</h2>
          <button type="button" onClick={onClose} style={styles.close} aria-label="Cerrar selección de profesional">
            <X size={20} />
          </button>
        </header>

        <div style={styles.body}>
          {serviciosDisponibles.length ? (
            <div style={styles.grid}>
              {serviciosDisponibles.map((opcion) => {
                const selected = String(opcion.id) === String(servicioElegidoId);
                const imageUrl = obtenerImagen(opcion.profesionalImagen);
                return (
                  <button
                    key={opcion.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setServicioElegidoId(opcion.id)}
                    style={{ ...styles.professional, ...(selected ? styles.professionalSelected : {}) }}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="" style={{ ...styles.avatar, ...(selected ? styles.avatarSelected : {}) }} />
                    ) : (
                      <span style={{ ...styles.avatarFallback, ...(selected ? styles.avatarSelected : {}) }}><BriefcaseBusiness size={23} /></span>
                    )}
                    <span style={styles.professionalInfo}>
                      <strong style={styles.professionalName}>{opcion.profesionalNombre || opcion.profesional}</strong>
                      <span style={styles.professionalType}>{opcion.profesionalTipo || opcion.categoria}</span>
                      <RatingDisplay value={opcion.calificacionPromedio} count={opcion.totalCalificaciones} />
                      <span style={styles.meta}><Clock3 size={14} />{opcion.duracion} <span>·</span> ${Number(opcion.precio).toLocaleString('es-CO')} COP</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p role="alert" style={styles.error}>No hay profesionales disponibles para este servicio.</p>
          )}
        </div>

        <footer style={styles.footer}>
          <button
            type="button"
            style={{ ...styles.submit, ...(!servicioElegido ? styles.submitDisabled : {}) }}
            disabled={!servicioElegido}
            onClick={() => onSelect(servicioElegido)}
          >
            <CalendarDays size={17} />
            Agregar a la reserva
          </button>
        </footer>
      </section>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(18, 14, 27, .62)' },
  sheet: { width: 'min(760px, 100%)', maxHeight: '82dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #333538', borderBottom: 0, borderRadius: '20px 20px 0 0', background: '#202123', color: '#f5f5f6', boxShadow: '0 -18px 55px rgba(0, 0, 0, .35)', fontFamily: 'sans-serif' },
  grabber: { width: '42px', height: '4px', flex: '0 0 4px', alignSelf: 'center', margin: '10px 0 2px', borderRadius: '999px', background: '#55565a' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 24px', borderBottom: '1px solid #36373a' },
  title: { margin: '4px 0 0', color: '#f5f5f6', fontSize: '21px', lineHeight: 1.2 },
  close: { display: 'grid', width: '40px', height: '40px', flex: '0 0 40px', placeItems: 'center', border: '1px solid #45464a', borderRadius: '10px', background: '#202123', color: '#d5d5d8', cursor: 'pointer' },
  body: { flex: '1 1 auto', overflowY: 'auto', padding: '12px 16px 20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' },
  professional: { position: 'relative', display: 'flex', minWidth: 0, minHeight: '178px', flexDirection: 'column', alignItems: 'center', gap: '7px', padding: '14px 8px 12px', border: '1px solid #e5e0eb', borderRadius: '12px', background: '#fff', color: '#292536', textAlign: 'center', cursor: 'pointer' },
  professionalSelected: { borderColor: '#3977ef', background: '#26282c', boxShadow: '0 0 0 1px #3977ef' },
  avatar: { width: '62px', height: '62px', flex: '0 0 62px', borderRadius: '50%', border: '2px solid #484a4f', objectFit: 'cover', background: '#303135' },
  avatarFallback: { display: 'grid', width: '62px', height: '62px', flex: '0 0 62px', placeItems: 'center', borderRadius: '50%', border: '2px solid #484a4f', background: '#303135', color: '#aeb0b6' },
  avatarSelected: { border: '3px solid #3977ef' },
  professionalInfo: { display: 'flex', width: '100%', minWidth: 0, flex: '1 1 auto', alignItems: 'center', flexDirection: 'column', gap: '5px' },
  professionalName: { overflowWrap: 'anywhere', color: '#f5f5f6', fontSize: '14px' },
  serviceOffer: { color: '#4d4657', fontSize: '12px', fontWeight: 700 },
  professionalType: { color: '#c4c5c8', fontSize: '12px' },
  meta: { display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '5px', marginTop: '3px', color: '#e1e1e3', fontSize: '10px', fontWeight: 700 },
  footer: { padding: '12px 16px max(16px, env(safe-area-inset-bottom))', borderTop: '1px solid #36373a', background: '#202123' },
  submit: { display: 'inline-flex', width: '100%', minHeight: '48px', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 0, borderRadius: '8px', background: '#2864d8', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' },
  submitDisabled: { background: '#393a3d', color: '#8d8e92', cursor: 'not-allowed' },
  error: { color: '#b91c1c', fontSize: '13px' }
};