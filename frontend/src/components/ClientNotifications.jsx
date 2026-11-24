import { useEffect, useState } from 'react';
import { Bell, Clock3 } from 'lucide-react';
import API from '../services/api';

export default function ClientNotifications({ userId, bookings = [] }) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    let active = true;
    const loadNotifications = () => {
      API.get(`/notificaciones/${userId}/`)
        .then(({ data }) => { if (active) setNotifications(data); })
        .catch((requestError) => {
          if (active) setError(requestError.response?.data?.error || 'No se pudieron cargar las notificaciones.');
        });
    };
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [userId, bookings.length]);

  const requestReminder = async (booking) => {
    const id = booking.id || booking._id;
    setBusyId(id);
    setError('');
    setMessage('');
    try {
      await API.post(`/reservas/${id}/recordatorio/`);
      const { data } = await API.get(`/notificaciones/${userId}/`);
      setNotifications(data);
      setMessage('Recordatorio agregado a tus notificaciones.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo crear el recordatorio.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <section style={styles.panel}>
      <div style={styles.heading}>
        <div>
          <h2 style={styles.title}><Bell size={19} color="#6b21a8" /> Notificaciones</h2>
          <p style={styles.subtitle}>Actualizaciones de tus reservas y recordatorios.</p>
        </div>
      </div>

      {error && <p role="alert" style={styles.error}>{error}</p>}
      {message && <p role="status" style={styles.success}>{message}</p>}
      {notifications.length === 0 && !error ? <p style={styles.empty}>Aún no tienes notificaciones.</p> : (
        <div style={styles.list}>
          {notifications.map((notification) => (
            <article key={notification.id || notification._id} style={styles.item}>
              <span style={styles.bullet} />
              <div><p style={styles.text}>{notification.mensaje}</p><small style={styles.date}>{new Date(notification.creadaEn).toLocaleString()}</small></div>
            </article>
          ))}
        </div>
      )}

      {bookings.some((booking) => ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(booking.estadoCode)) && (
        <div style={styles.reminders}>
          <strong style={styles.reminderTitle}><Clock3 size={15} /> Recordatorio de cita</strong>
          {bookings.filter((booking) => ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(booking.estadoCode)).map((booking) => (
            <button key={booking.id} type="button" disabled={busyId === booking.id} onClick={() => requestReminder(booking)} style={styles.reminderButton}>
              {busyId === booking.id ? 'Agregando...' : `Recordarme: ${booking.servicio} · ${booking.fecha} ${booking.hora}`}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column', gap: '13px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '14px', background: '#fff' },
  heading: { display: 'flex', justifyContent: 'space-between' },
  title: { display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#1f2937', fontSize: '18px' },
  subtitle: { margin: '5px 0 0', color: '#6b7280', fontSize: '13px' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  item: { display: 'flex', gap: '10px', padding: '11px', borderRadius: '9px', background: '#faf5ff' },
  bullet: { width: '8px', height: '8px', flexShrink: 0, marginTop: '5px', borderRadius: '50%', background: '#7c3aed' },
  text: { margin: 0, color: '#374151', fontSize: '13px' },
  date: { display: 'block', marginTop: '4px', color: '#6b7280', fontSize: '11px' },
  empty: { margin: 0, color: '#6b7280', fontSize: '13px' },
  reminders: { display: 'flex', flexDirection: 'column', gap: '7px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' },
  reminderTitle: { display: 'flex', alignItems: 'center', gap: '6px', color: '#374151', fontSize: '13px' },
  reminderButton: { padding: '8px 10px', border: '1px solid #e9d5ff', borderRadius: '7px', background: '#fff', color: '#6b21a8', textAlign: 'left', cursor: 'pointer', fontSize: '12px' },
  error: { margin: 0, color: '#b91c1c', fontSize: '13px' },
  success: { margin: 0, color: '#15803d', fontSize: '13px' }
};
