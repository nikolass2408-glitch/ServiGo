import { useState } from 'react';
import { BriefcaseBusiness, CalendarDays, Clock3, MapPin, X } from 'lucide-react';
import API from '../services/api';

const normalizarNombre = (nombre) => String(nombre || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

export default function PanelProfesionalesReserva({ servicio, servicios, onClose, onSelect }) {
  const opciones = servicios.filter((opcion) =>
    opcion.id && normalizarNombre(opcion.nombre) === normalizarNombre(servicio.nombre)
  );
  const serviciosDisponibles = opciones.length ? opciones : [servicio];
  const [servicioElegidoId, setServicioElegidoId] = useState(servicio.id);
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
          <div>
            <span style={styles.eyebrow}>RESERVA TU SERVICIO</span>
            <h2 id="reserva-panel-titulo" style={styles.title}>{servicio.nombre}</h2>
          </div>
          <button type="button" onClick={onClose} style={styles.close} aria-label="Cerrar selección de profesional">
            <X size={20} />
          </button>
        </header>

        <div style={styles.body}>
          <p style={styles.prompt}>Elige un profesional disponible para este servicio.</p>
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
                      <img src={imageUrl} alt="" style={styles.avatar} />
                    ) : (
                      <span style={styles.avatarFallback}><BriefcaseBusiness size={23} /></span>
                    )}
                    <span style={styles.professionalInfo}>
                      <strong style={styles.professionalName}>{opcion.profesional}</strong>
                      <span style={styles.professionalType}>{opcion.profesionalTipo || opcion.categoria}</span>
                      <span style={styles.address}><MapPin size={14} />{opcion.ubicacion || 'Dirección por confirmar'}</span>
                      <span style={styles.description}>{opcion.profesionalDescripcion || 'Perfil profesional en ServiGo.'}</span>
                      <span style={styles.meta}><Clock3 size={14} />{opcion.duracion} <span>·</span> ${Number(opcion.precio).toLocaleString('es-CO')} COP</span>
                    </span>
                    <span style={{ ...styles.radio, ...(selected ? styles.radioSelected : {}) }} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          ) : (
            <p role="alert" style={styles.error}>No hay profesionales disponibles para este servicio.</p>
          )}
        </div>

        <footer style={styles.footer}>
          <button type="button" style={styles.submit} disabled={!servicioElegido} onClick={() => onSelect(servicioElegido)}>
            <CalendarDays size={17} />
            Continuar a fecha y hora
          </button>
        </footer>
      </section>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(18, 14, 27, .62)' },
  sheet: { width: 'min(760px, 100%)', maxHeight: '88dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e5e0ee', borderBottom: 0, borderRadius: '20px 20px 0 0', background: '#fff', color: '#252132', boxShadow: '0 -18px 55px rgba(17, 12, 30, .2)', fontFamily: 'sans-serif' },
  grabber: { width: '42px', height: '4px', flex: '0 0 4px', alignSelf: 'center', margin: '10px 0 2px', borderRadius: '999px', background: '#d5cfdf' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 24px', borderBottom: '1px solid #eeeaf3' },
  eyebrow: { color: '#6b21a8', fontSize: '10px', fontWeight: 800 },
  title: { margin: '4px 0 0', color: '#252132', fontSize: '21px', lineHeight: 1.2 },
  close: { display: 'grid', width: '40px', height: '40px', flex: '0 0 40px', placeItems: 'center', border: '1px solid #e4dfeb', borderRadius: '10px', background: '#fff', color: '#514b5d', cursor: 'pointer' },
  body: { flex: '1 1 auto', overflowY: 'auto', padding: '18px 24px 24px' },
  prompt: { margin: '0 0 14px', color: '#6b6574', fontSize: '13px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '12px' },
  professional: { position: 'relative', display: 'flex', minWidth: 0, alignItems: 'flex-start', gap: '12px', padding: '14px', border: '1px solid #e5e0eb', borderRadius: '10px', background: '#fff', color: '#292536', textAlign: 'left', cursor: 'pointer' },
  professionalSelected: { borderColor: '#6b21a8', background: '#faf7ff', boxShadow: '0 0 0 2px rgba(107, 33, 168, .1)' },
  avatar: { width: '48px', height: '48px', flex: '0 0 48px', borderRadius: '50%', border: '2px solid #d9c6f1', objectFit: 'cover', background: '#f5f0fb' },
  avatarFallback: { display: 'grid', width: '48px', height: '48px', flex: '0 0 48px', placeItems: 'center', borderRadius: '50%', background: '#f1e8fc', color: '#6b21a8' },
  professionalInfo: { display: 'flex', minWidth: 0, flex: '1 1 auto', flexDirection: 'column', gap: '5px', paddingRight: '12px' },
  professionalName: { overflowWrap: 'anywhere', color: '#252132', fontSize: '14px' },
  professionalType: { color: '#6b21a8', fontSize: '11px', fontWeight: 700 },
  address: { display: 'flex', alignItems: 'flex-start', gap: '4px', color: '#6b6574', fontSize: '11px' },
  description: { display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, color: '#6b6574', fontSize: '11px', lineHeight: 1.4 },
  meta: { display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', color: '#4d4657', fontSize: '11px', fontWeight: 700 },
  radio: { position: 'absolute', top: '15px', right: '14px', width: '17px', height: '17px', border: '1px solid #c9c2d2', borderRadius: '50%' },
  radioSelected: { border: '5px solid #6b21a8' },
  footer: { padding: '12px 24px max(16px, env(safe-area-inset-bottom))', borderTop: '1px solid #eeeaf3', background: '#fff' },
  submit: { display: 'inline-flex', width: '100%', minHeight: '48px', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 0, borderRadius: '8px', background: '#6b21a8', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' },
  error: { color: '#b91c1c', fontSize: '13px' }
};