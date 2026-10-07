import { useCallback, useEffect, useState } from 'react';
import { Briefcase, CalendarDays, LogOut, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import BrandMark from '../../components/BrandMark';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import NotificationBell from '../../components/NotificationBell';

const roleName = (role) => ({ CLI: 'Cliente', PRO: 'Profesional', ADMIN: 'Administrador' }[role] || role);
const statusName = (active) => active ? 'Activa' : 'Desactivada';

export default function DashboardAdmin() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      const [usersResponse, professionalsResponse, bookingsResponse, statsResponse] = await Promise.all([
        API.get('/usuarios/'),
        API.get('/profesionales/'),
        API.get('/reservas/lista/'),
        API.get('/admin/estadisticas/')
      ]);
      setUsers(usersResponse.data);
      setProfessionals(professionalsResponse.data);
      setBookings(bookingsResponse.data);
      setStats(statsResponse.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo cargar el panel administrativo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      API.get('/usuarios/'),
      API.get('/profesionales/'),
      API.get('/reservas/lista/'),
      API.get('/admin/estadisticas/')
    ]).then(([usersResponse, professionalsResponse, bookingsResponse, statsResponse]) => {
      if (!active) return;
      setUsers(usersResponse.data);
      setProfessionals(professionalsResponse.data);
      setBookings(bookingsResponse.data);
      setStats(statsResponse.data);
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.error || requestError.message || 'No se pudo cargar el panel administrativo.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const refreshDashboard = () => {
    setLoading(true);
    setError('');
    loadDashboard();
  };

  const toggleUser = async (target) => {
    if ((target.id || target._id) === user?.id) {
      setError('No puedes desactivar tu propia cuenta de administrador.');
      return;
    }
    const id = target.id || target._id;
    setBusyId(id);
    setError('');
    setMessage('');
    try {
      await API.patch(`/usuarios/${id}/`, { activo: !target.activo });
      setMessage(`Cuenta ${target.activo ? 'desactivada' : 'activada'}.`);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo cambiar el estado de la cuenta.');
    } finally {
      setBusyId('');
    }
  };

  const toggleProfessional = async (professional) => {
    const id = professional.id || professional._id;
    setBusyId(id);
    setError('');
    setMessage('');
    try {
      await API.patch(`/profesionales/${id}/`, { activo: !professional.activo });
      setMessage(`Perfil profesional ${professional.activo ? 'desactivado' : 'activado'}.`);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo cambiar el estado del perfil.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.navbar}>
        <div style={styles.logoContainer}>
          <BrandMark size={34} />
          <span style={styles.logoText}>ServiGo Admin</span>
        </div>
        <div style={styles.userMenu}>
          <span style={styles.userName}>{user?.firstName || 'Administración'}</span>
          <NotificationBell userId={user?.id} />
          <button type="button" onClick={logout} style={styles.logout}><LogOut size={16} />Salir</button>
        </div>
      </header>

      <main style={styles.content}>
        <div style={styles.titleRow}>
          <div>
            <h1 style={styles.mainTitle}>Panel administrativo</h1>
            <p style={styles.mainSubtitle}>Supervisa cuentas, profesionales y reservas de la plataforma.</p>
          </div>
          <button type="button" onClick={refreshDashboard} disabled={loading} style={styles.refresh}><RefreshCw size={15} />Actualizar</button>
        </div>

        {error && <p role="alert" style={styles.error}>{error}</p>}
        {message && <p role="status" style={styles.success}>{message}</p>}

        <section style={styles.metrics}>
          <Metric icon={<Users size={19} />} label="Usuarios registrados" value={loading ? '…' : stats?.usuarios ?? users.length} />
          <Metric icon={<Briefcase size={19} />} label="Profesionales activos" value={loading ? '…' : stats?.profesionales ?? professionals.filter((item) => item.activo).length} />
          <Metric icon={<CalendarDays size={19} />} label="Reservas" value={loading ? '…' : stats?.reservas ?? bookings.length} />
          <Metric icon={<ShieldCheck size={19} />} label="Citas completadas" value={loading ? '…' : stats?.citasCompletadas ?? 0} />
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Gestión de usuarios y clientes</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {users.map((target) => (
                  <tr key={target.id || target._id}>
                    <td>{target.firstName} {target.lastName}</td>
                    <td>{target.email}</td>
                    <td>{roleName(target.rol)}</td>
                    <td><span style={{ ...styles.status, ...(target.activo ? styles.active : styles.inactive) }}>{statusName(target.activo)}</span></td>
                    <td>
                      <button type="button" disabled={loading || busyId === (target.id || target._id) || (target.id || target._id) === user?.id} onClick={() => toggleUser(target)} style={styles.actionButton}>
                        {busyId === (target.id || target._id) ? 'Guardando…' : target.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && <tr><td colSpan="5" style={styles.empty}>No hay usuarios registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Gestión de profesionales</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr><th>Negocio</th><th>Propietario</th><th>Enlace</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {professionals.map((professional) => {
                  const ownerId = typeof professional.usuario === 'object'
                    ? professional.usuario.id || professional.usuario._id
                    : professional.usuario;
                  const owner = users.find((item) => (item.id || item._id) === ownerId) ||
                    (typeof professional.usuario === 'object' ? professional.usuario : null);
                  return (
                    <tr key={professional.id || professional._id}>
                      <td>{professional.nombreNegocio}</td>
                      <td>{owner?.firstName} {owner?.lastName}</td>
                      <td>/p/{professional.enlacePersonalizado}</td>
                      <td><span style={{ ...styles.status, ...(professional.activo ? styles.active : styles.inactive) }}>{statusName(professional.activo)}</span></td>
                      <td><button type="button" disabled={loading || busyId === (professional.id || professional._id)} onClick={() => toggleProfessional(professional)} style={styles.actionButton}>{professional.activo ? 'Desactivar' : 'Activar'}</button></td>
                    </tr>
                  );
                })}
                {!loading && professionals.length === 0 && <tr><td colSpan="5" style={styles.empty}>No hay perfiles profesionales.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Supervisión de reservas</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr><th>Cliente</th><th>Profesional</th><th>Servicio</th><th>Fecha y hora</th><th>Duración</th><th>Precio</th><th>Estado</th></tr></thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id || booking._id}>
                    <td>{booking.cliente?.firstName} {booking.cliente?.lastName}</td>
                    <td>{booking.profesional?.nombreNegocio}</td>
                    <td>{booking.servicio?.nombre}</td>
                    <td>{booking.fecha} {booking.hora}</td>
                    <td>{booking.duracion || booking.servicio?.duracion} min</td>
                    <td>${Number(booking.precio || booking.servicio?.precio || 0).toLocaleString()} COP</td>
                    <td>{booking.estado}</td>
                  </tr>
                ))}
                {!loading && bookings.length === 0 && <tr><td colSpan="7" style={styles.empty}>No hay reservas para supervisar.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return <article style={styles.metric}><span style={styles.metricIcon}>{icon}</span><div><span style={styles.metricLabel}>{label}</span><strong style={styles.metricValue}>{value}</strong></div></article>;
}

const styles = {
  container: { minHeight: '100vh', background: '#f9fafb', fontFamily: 'sans-serif', textAlign: 'left' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e5e7eb' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '9px' },
  logoText: { fontSize: '20px', fontWeight: 800, color: '#1f2937' },
  userMenu: { display: 'flex', alignItems: 'center', gap: '16px' },
  userName: { color: '#374151', fontSize: '14px', fontWeight: 600 },
  logout: { display: 'inline-flex', alignItems: 'center', gap: '6px', border: 0, background: 'transparent', color: '#b91c1c', cursor: 'pointer' },
  content: { maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '28px', margin: '32px auto', padding: '0 20px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' },
  mainTitle: { margin: 0, color: '#1f2937', fontSize: '28px', fontWeight: 800 },
  mainSubtitle: { margin: '7px 0 0', color: '#6b7280', fontSize: '14px' },
  refresh: { display: 'inline-flex', alignItems: 'center', gap: '7px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '8px', padding: '9px 12px', color: '#374151', fontWeight: 600, cursor: 'pointer' },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' },
  metric: { display: 'flex', alignItems: 'center', gap: '13px', padding: '18px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' },
  metricIcon: { width: '42px', height: '42px', display: 'grid', placeItems: 'center', borderRadius: '12px', color: '#6b21a8', background: '#f3e8ff' },
  metricLabel: { display: 'block', color: '#6b7280', fontSize: '12px' },
  metricValue: { display: 'block', marginTop: '4px', color: '#1f2937', fontSize: '21px' },
  section: { display: 'flex', flexDirection: 'column', gap: '13px' },
  sectionTitle: { margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: 750 },
  tableWrap: { overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' },
  table: { width: '100%', minWidth: '720px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#374151' },
  status: { padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 },
  active: { color: '#15803d', background: '#dcfce7' },
  inactive: { color: '#9a3412', background: '#ffedd5' },
  actionButton: { padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', background: '#fff', color: '#4b5563', fontWeight: 600, cursor: 'pointer' },
  empty: { padding: '24px', textAlign: 'center', color: '#6b7280' },
  error: { margin: 0, padding: '12px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '14px' },
  success: { margin: 0, padding: '12px', background: '#f0fdf4', color: '#15803d', borderRadius: '8px', fontSize: '14px' }
};
