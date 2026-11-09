import { useState } from 'react';
import { BriefcaseBusiness, CalendarDays, Clock3, Star, X } from 'lucide-react';
import API from '../services/api';

const normalizarNombre = (nombre) => String(nombre || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

export default function PanelProfesionalesReserva({ servicio, servicios, onClose, onSelect }) {
  const coincidenciasExactas = servicios.filter((opcion) =>
    opcion.id && normalizarNombre(opcion.nombre) === normalizarNombre(servicio.nombre)
  );
  const serviciosDelNegocio = servicio.empresa
    ? servicios.filter((opcion) =>
      normalizarNombre(opcion.empresa) === normalizarNombre(servicio.empresa)
    )
    : [];
  const opcionesDelNegocio = servicio.esProfesionalDemo
    ? serviciosDelNegocio.filter((opcion) => opcion.esProfesionalDemo)
    : serviciosDelNegocio;
  const opciones = opcionesDelNegocio.length
    ? opcionesDelNegocio
    : servicio.esProfesionalDemo
      ? coincidenciasExactas.filter((opcion) => opcion.esProfesionalDemo)
      : coincidenciasExactas;
  const serviciosDisponibles = [...new Map(
    opciones.map((opcion) => [
      String(opcion.profesionalId || opcion.id),
      opcion
    ])
  ).values()];
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
                      <span style={styles.professionalType}>{opcion.especialidad || opcion.profesionalTipo || opcion.categoria}</span>
                      {serviciosDisponibles.length > 1 && (
                        <span style={styles.serviceOffer}>{opcion.nombre}</span>
                      )}
                      <span
                        style={styles.rating}
                        aria-label={
                          opcion.totalCalificaciones
                            ? `${Number(opcion.calificacionPromedio).toFixed(1)} de 5, ${opcion.totalCalificaciones} calificaciones`
                            : 'Sin calificaciones'
                        }
                      >
                        {opcion.totalCalificaciones ? (
                          <>
                            <span style={styles.ratingStars} aria-hidden="true">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const fill = Math.max(0, Math.min(100, (Number(opcion.calificacionPromedio) - star + 1) * 100));
                                return (
                                  <span key={star} style={styles.ratingStar}>
                                    <Star size={14} color="#f4b740" />
                                    <span style={{ ...styles.ratingStarFill, width: `${fill}%` }}>
                                      <Star size={14} fill="#f4b740" color="#f4b740" />
                                    </span>
                                  </span>
                                );
                              })}
                            </span>
                            <strong>{Number(opcion.calificacionPromedio).toFixed(1)}</strong>
                            <span>({opcion.totalCalificaciones})</span>
                          </>
                        ) : <span>Sin calificaciones</span>}
                      </span>
                      <span style={styles.meta}><Clock3 size={14} />{opcion.duracion}</span>
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
  overlay: { position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(5, 7, 12, .72)' },
  sheet: { width: 'min(760px, 100%)', height: 'min(52dvh, 760px)', minHeight: '360px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #333538', borderBottom: 0, borderRadius: '22px 22px 0 0', background: '#202123', color: '#f5f5f6', boxShadow: '0 -18px 55px rgba(0, 0, 0, .4)', fontFamily: 'sans-serif' },
  grabber: { width: '42px', height: '4px', flex: '0 0 4px', alignSelf: 'center', margin: '10px 0 2px', borderRadius: '999px', background: '#55565a' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '18px 24px', borderBottom: '1px solid #36373a' },
  title: { margin: '4px 0 0', color: '#f5f5f6', fontSize: '21px', lineHeight: 1.2 },
  close: { display: 'grid', width: '40px', height: '40px', flex: '0 0 40px', placeItems: 'center', border: '1px solid #45464a', borderRadius: '10px', background: '#202123', color: '#d5d5d8', cursor: 'pointer' },
  body: { flex: '1 1 auto', overflowY: 'auto', padding: '20px 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' },
  professional: { position: 'relative', display: 'flex', minWidth: 0, minHeight: '210px', flexDirection: 'column', alignItems: 'center', gap: '9px', padding: '18px 12px 16px', border: '1px solid #3b3d42', borderRadius: '16px', background: '#252629', color: '#f5f5f6', textAlign: 'center', cursor: 'pointer', transition: 'border-color 150ms ease, background 150ms ease, box-shadow 150ms ease' },
  professionalSelected: { borderColor: '#3977ef', background: '#1d2635', boxShadow: '0 0 0 1px #3977ef, 0 8px 24px rgba(37, 99, 235, .16)' },
  avatar: { width: '72px', height: '72px', flex: '0 0 72px', borderRadius: '50%', border: '2px solid #45474d', objectFit: 'cover', background: '#303135' },
  avatarFallback: { display: 'grid', width: '72px', height: '72px', flex: '0 0 72px', placeItems: 'center', borderRadius: '50%', border: '2px solid #45474d', background: '#303135', color: '#c4c5ca' },
  avatarSelected: { border: '3px solid #3977ef' },
  professionalInfo: { display: 'flex', width: '100%', minWidth: 0, flex: '1 1 auto', alignItems: 'center', flexDirection: 'column', gap: '5px' },
  professionalName: { overflowWrap: 'anywhere', color: '#f5f5f6', fontSize: '16px', fontWeight: 750 },
  serviceOffer: { color: '#4d4657', fontSize: '12px', fontWeight: 700 },
  professionalType: { color: '#c4c5c8', fontSize: '13px' },
  rating: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '5px', color: '#d1d2d5', fontSize: '11px' },
  ratingStars: { display: 'inline-flex', alignItems: 'center', gap: '1px' },
  ratingStar: { position: 'relative', display: 'inline-flex', width: '14px', height: '14px' },
  ratingStarFill: { position: 'absolute', top: 0, left: 0, height: '14px', overflow: 'hidden', whiteSpace: 'nowrap' },
  meta: { display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '5px', marginTop: '3px', color: '#e1e1e3', fontSize: '11px', fontWeight: 700 },
  footer: { padding: '14px 20px max(20px, env(safe-area-inset-bottom))', borderTop: '1px solid #36373a', background: '#202123' },
  submit: { display: 'inline-flex', width: '100%', minHeight: '54px', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 0, borderRadius: '12px', background: '#2864d8', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' },
  submitDisabled: { background: '#393a3d', color: '#8d8e92', cursor: 'not-allowed' },
  error: { color: '#b91c1c', fontSize: '13px' }
};