import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import API from '../services/api';

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;

    const loadNotifications = async () => {
      try {
        const { data } = await API.get(`/notificaciones/${userId}/`);
        if (active) {
          setNotifications(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.error || 'No se pudieron cargar las notificaciones.');
        }
      }
    };

    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [userId]);

  return (
    <div style={styles.container}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        style={styles.button}
        aria-label={`Notificaciones: ${notifications.length}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={19} />
        {notifications.length > 0 && (
          <span style={styles.badge} aria-hidden="true">
            {notifications.length > 99 ? '99+' : notifications.length}
          </span>
        )}
      </button>
      {open && (
        <section style={styles.popover} aria-label="Notificaciones">
          <h2 style={styles.title}>Notificaciones</h2>
          {error ? (
            <p role="alert" style={styles.error}>{error}</p>
          ) : notifications.length === 0 ? (
            <p style={styles.empty}>No tienes notificaciones.</p>
          ) : (
            <ul style={styles.list}>
              {notifications.slice(0, 8).map((notification) => (
                <li key={notification.id || notification._id} style={styles.item}>
                  <span style={styles.dot} />
                  <div>
                    <p style={styles.message}>{notification.mensaje}</p>
                    {notification.creadaEn && (
                      <time style={styles.date} dateTime={notification.creadaEn}>
                        {new Date(notification.creadaEn).toLocaleString()}
                      </time>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

const styles = {
  container: { position: 'relative', display: 'inline-flex', alignItems: 'center' },
  button: { position: 'relative', display: 'inline-grid', placeItems: 'center', width: '38px', height: '38px', border: '1px solid #e5e7eb', borderRadius: '10px', background: '#fff', color: '#6b21a8', cursor: 'pointer' },
  badge: { position: 'absolute', top: '-6px', right: '-7px', minWidth: '18px', height: '18px', display: 'grid', placeItems: 'center', padding: '0 4px', borderRadius: '999px', background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 800, lineHeight: 1 },
  popover: { position: 'absolute', zIndex: 20, top: 'calc(100% + 10px)', right: 0, width: 'min(340px, calc(100vw - 32px))', maxHeight: 'min(420px, calc(100vh - 100px))', overflowY: 'auto', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', boxShadow: '0 12px 30px rgba(31, 41, 55, 0.16)', color: '#1f2937' },
  title: { margin: '0 0 12px', fontSize: '15px' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0, listStyle: 'none' },
  item: { display: 'flex', gap: '9px', padding: '10px', borderRadius: '8px', background: '#faf5ff' },
  dot: { flex: '0 0 8px', width: '8px', height: '8px', marginTop: '5px', borderRadius: '50%', background: '#7c3aed' },
  message: { margin: 0, fontSize: '13px', lineHeight: 1.4 },
  date: { display: 'block', marginTop: '5px', color: '#6b7280', fontSize: '11px' },
  empty: { margin: 0, color: '#6b7280', fontSize: '13px' },
  error: { margin: 0, color: '#b91c1c', fontSize: '13px' }
};
