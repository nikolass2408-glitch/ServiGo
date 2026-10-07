import { useCallback, useEffect, useState } from 'react';
import { Bell, CalendarClock, ChartNoAxesCombined, Clock3, Plus, Save, Trash2, Users } from 'lucide-react';
import API from '../services/api';
import { DAY_NAMES } from '../services/demoApi';

const tabs = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'horarios', label: 'Horarios' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'notificaciones', label: 'Notificaciones' }
];

export default function ProfessionalWorkspace({ user }) {
  const [tab, setTab] = useState('servicios');
  const [professionalId, setProfessionalId] = useState('');
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [clients, setClients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);
  const [serviceForm, setServiceForm] = useState({ nombre: '', descripcion: '', precio: '', duracion: '30', categoria: 'Otros' });
  const [scheduleForm, setScheduleForm] = useState({ dia: '1', horaInicio: '09:00', horaFin: '17:00' });
  const [blockForm, setBlockForm] = useState({ fecha: '', horaInicio: '12:00', horaFin: '13:00', motivo: '' });
  const [editingService, setEditingService] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchWorkspace = useCallback(async () => {
    const { data: profile } = await API.get('/perfil/');
    const id = profile.profesional?._id || profile.profesional?.id;
    if (!id) throw new Error('Completa primero tu perfil profesional.');
    const [serviceResponse, scheduleResponse, blockResponse, clientResponse, notificationResponse] = await Promise.all([
      API.get(`/servicios/gestion/${id}/`),
      API.get('/horarios/', { params: { profesional: id } }),
      API.get('/disponibilidad/bloqueos/', { params: { profesional: id } }),
      API.get(`/profesional/${id}/clientes/`),
      API.get(`/notificaciones/${user.id}/`)
    ]);
    return {
      id,
      services: serviceResponse.data,
      schedules: scheduleResponse.data,
      blocks: blockResponse.data,
      clients: clientResponse.data,
      notifications: notificationResponse.data
    };
  }, [user.id]);

  const applyWorkspace = useCallback((workspace) => {
    setProfessionalId(workspace.id);
    setServices(workspace.services);
    setSchedules(workspace.schedules);
    setBlocks(workspace.blocks);
    setClients(workspace.clients);
    setNotifications(workspace.notifications);
    setError('');
  }, []);

  const loadWorkspace = useCallback(async () => {
    applyWorkspace(await fetchWorkspace());
  }, [applyWorkspace, fetchWorkspace]);

  useEffect(() => {
    let active = true;
    fetchWorkspace().then((workspace) => {
      if (active) applyWorkspace(workspace);
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.error || requestError.message || 'No se pudo cargar el panel profesional.');
    });
    return () => { active = false; };
  }, [applyWorkspace, fetchWorkspace]);

  const submitService = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (editingService) {
        await API.patch(`/servicios/${editingService}/`, { ...serviceForm, precio: Number(serviceForm.precio), duracion: Number(serviceForm.duracion) });
      } else {
        await API.post('/servicios/', { ...serviceForm, profesional: professionalId, precio: Number(serviceForm.precio), duracion: Number(serviceForm.duracion) });
      }
      setEditingService('');
      setServiceForm({ nombre: '', descripcion: '', precio: '', duracion: '30', categoria: 'Otros' });
      await loadWorkspace();
      setMessage('Servicio guardado.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo guardar el servicio.');
    } finally {
      setBusy(false);
    }
  };

  const editService = (service) => {
    setEditingService(service._id || service.id);
    setServiceForm({
      nombre: service.nombre,
      descripcion: service.descripcion || '',
      precio: String(service.precio),
      duracion: String(service.duracion),
      categoria: service.categoria || 'Otros'
    });
    setTab('servicios');
  };

  const toggleService = async (service) => {
    setBusy(true);
    setError('');
    try {
      await API.patch(`/servicios/${service._id || service.id}/`, { activo: !service.activo });
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo cambiar el estado del servicio.');
    } finally {
      setBusy(false);
    }
  };

  const addSchedule = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await API.post('/horarios/', { ...scheduleForm, profesional: professionalId, dia: Number(scheduleForm.dia) });
      await loadWorkspace();
      setMessage('Horario agregado.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo guardar el horario.');
    } finally {
      setBusy(false);
    }
  };

  const toggleSchedule = async (schedule) => {
    setBusy(true);
    setError('');
    try {
      await API.patch(`/horarios/${schedule._id || schedule.id}/modificar/`, { activo: !schedule.activo });
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo modificar el horario.');
    } finally {
      setBusy(false);
    }
  };

  const addBlock = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await API.post('/disponibilidad/bloqueos/', { ...blockForm, profesional: professionalId });
      await loadWorkspace();
      setMessage('Bloqueo agregado a la disponibilidad.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo bloquear el horario.');
    } finally {
      setBusy(false);
    }
  };

  const removeBlock = async (blockId) => {
    setBusy(true);
    setError('');
    try {
      await API.delete(`/disponibilidad/bloqueos/${blockId}/`);
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo eliminar el bloqueo.');
    } finally {
      setBusy(false);
    }
  };

  const showClientHistory = async (client) => {
    setError('');
    setSelectedClient(client);
    try {
      const { data } = await API.get(`/profesional/${professionalId}/clientes/${client.id || client._id}/historial/`);
      setClientHistory(data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo cargar el historial del cliente.');
    }
  };

  useEffect(() => {
    if (tab !== 'estadisticas' || !professionalId) return;
    let active = true;
    Promise.all([
      API.get(`/profesional/${professionalId}/estadisticas/resumen/`),
      API.get(`/profesional/${professionalId}/estadisticas/servicios/`),
      API.get(`/profesional/${professionalId}/estadisticas/completadas/`),
      API.get(`/profesional/${professionalId}/estadisticas/ingresos/`)
    ]).then(([summary, servicesReport, completed, income]) => {
      if (active) setReports({ summary: summary.data, services: servicesReport.data, completed: completed.data, income: income.data });
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.error || 'No se pudieron cargar las estadísticas.');
    });
    return () => { active = false; };
  }, [tab, professionalId]);

  return (
    <section style={styles.panel}>
      <div style={styles.heading}>
        <div>
          <h2 style={styles.title}>Herramientas profesionales</h2>
          <p style={styles.subtitle}>Administra tu negocio, disponibilidad y clientes desde un solo lugar.</p>
        </div>
        <CalendarClock color="#6b21a8" size={28} />
      </div>

      <nav style={styles.tabs} aria-label="Herramientas profesionales">
        {tabs.map((item) => (
          <button key={item.id} type="button" onClick={() => { setTab(item.id); setError(''); setMessage(''); }} style={{ ...styles.tab, ...(tab === item.id ? styles.activeTab : {}) }}>
            {item.label}
          </button>
        ))}
      </nav>

      {error && (
        <div role="alert" style={styles.error}>
          <span>{error}</span>
          <button type="button" onClick={() => loadWorkspace().catch((requestError) => setError(requestError.response?.data?.error || requestError.message))} style={styles.secondary}>Volver a cargar</button>
        </div>
      )}
      {message && <p role="status" style={styles.success}>{message}</p>}

      {tab === 'servicios' && (
        <div style={styles.layout}>
          <form onSubmit={submitService} style={styles.formCard}>
            <h3 style={styles.sectionTitle}>{editingService ? 'Editar servicio' : 'Agregar servicio'}</h3>
            <label style={styles.field}>Nombre<input value={serviceForm.nombre} onChange={(event) => setServiceForm({ ...serviceForm, nombre: event.target.value })} required /></label>
            <label style={styles.field}>Descripción<textarea value={serviceForm.descripcion} onChange={(event) => setServiceForm({ ...serviceForm, descripcion: event.target.value })} rows={3} /></label>
            <div style={styles.row}>
              <label style={styles.field}>Precio<input type="number" min="0" step="100" value={serviceForm.precio} onChange={(event) => setServiceForm({ ...serviceForm, precio: event.target.value })} required /></label>
              <label style={styles.field}>Duración (minutos)<input type="number" min="1" value={serviceForm.duracion} onChange={(event) => setServiceForm({ ...serviceForm, duracion: event.target.value })} required /></label>
            </div>
            <label style={styles.field}>Categoría<input value={serviceForm.categoria} onChange={(event) => setServiceForm({ ...serviceForm, categoria: event.target.value })} /></label>
            <div style={styles.actions}>
              <button disabled={busy} style={styles.primary}><Save size={15} />{busy ? 'Guardando...' : editingService ? 'Guardar cambios' : 'Crear servicio'}</button>
              {editingService && <button type="button" onClick={() => { setEditingService(''); setServiceForm({ nombre: '', descripcion: '', precio: '', duracion: '30', categoria: 'Otros' }); }} style={styles.secondary}>Cancelar</button>}
            </div>
          </form>
          <div style={styles.list}>
            {services.length === 0 ? <p style={styles.empty}>Aún no tienes servicios registrados.</p> : services.map((service) => (
              <article key={service._id || service.id} style={styles.item}>
                <div style={styles.itemHeader}>
                  <div><h3 style={styles.itemTitle}>{service.nombre}</h3><p style={styles.muted}>{service.descripcion || service.categoria || 'Servicio profesional'}</p></div>
                  <span style={{ ...styles.badge, ...(service.activo ? styles.enabled : styles.disabled) }}>{service.activo ? 'Activo' : 'Inactivo'}</span>
                </div>
                <p style={styles.muted}>${Number(service.precio).toLocaleString()} COP · {service.duracion} min</p>
                <div style={styles.actions}>
                  <button type="button" onClick={() => editService(service)} style={styles.secondary}>Editar</button>
                  <button type="button" disabled={busy} onClick={() => toggleService(service)} style={styles.secondary}>{service.activo ? 'Desactivar' : 'Activar'}</button>
                  <button type="button" disabled={busy} onClick={() => API.delete(`/servicios/${service._id || service.id}/`).then(loadWorkspace).catch((requestError) => setError(requestError.response?.data?.error || requestError.message))} style={styles.danger}><Trash2 size={14} />Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'horarios' && (
        <div style={styles.layout}>
          <form onSubmit={addSchedule} style={styles.formCard}>
            <h3 style={styles.sectionTitle}>Días y horas de atención</h3>
            <label style={styles.field}>Día<select value={scheduleForm.dia} onChange={(event) => setScheduleForm({ ...scheduleForm, dia: event.target.value })}>{DAY_NAMES.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
            <div style={styles.row}>
              <label style={styles.field}>Desde<input type="time" value={scheduleForm.horaInicio} onChange={(event) => setScheduleForm({ ...scheduleForm, horaInicio: event.target.value })} required /></label>
              <label style={styles.field}>Hasta<input type="time" value={scheduleForm.horaFin} onChange={(event) => setScheduleForm({ ...scheduleForm, horaFin: event.target.value })} required /></label>
            </div>
            <button disabled={busy} style={styles.primary}><Plus size={15} />Agregar horario</button>
          </form>
          <div style={styles.list}>
            {schedules.map((schedule) => (
              <article key={schedule._id || schedule.id} style={styles.item}>
                <div style={styles.itemHeader}>
                  <strong>{DAY_NAMES[schedule.dia]} · {schedule.horaInicio}–{schedule.horaFin}</strong>
                  <span style={{ ...styles.badge, ...(schedule.activo ? styles.enabled : styles.disabled) }}>{schedule.activo ? 'Disponible' : 'Desactivado'}</span>
                </div>
                <button type="button" disabled={busy} onClick={() => toggleSchedule(schedule)} style={styles.secondary}>{schedule.activo ? 'Desactivar horario' : 'Activar horario'}</button>
              </article>
            ))}
          </div>
          <form onSubmit={addBlock} style={styles.formCard}>
            <h3 style={styles.sectionTitle}>Bloquear fecha y horario</h3>
            <label style={styles.field}>Fecha<input type="date" value={blockForm.fecha} onChange={(event) => setBlockForm({ ...blockForm, fecha: event.target.value })} min={new Date().toISOString().slice(0, 10)} required /></label>
            <div style={styles.row}>
              <label style={styles.field}>Desde<input type="time" value={blockForm.horaInicio} onChange={(event) => setBlockForm({ ...blockForm, horaInicio: event.target.value })} required /></label>
              <label style={styles.field}>Hasta<input type="time" value={blockForm.horaFin} onChange={(event) => setBlockForm({ ...blockForm, horaFin: event.target.value })} required /></label>
            </div>
            <label style={styles.field}>Motivo (opcional)<input value={blockForm.motivo} onChange={(event) => setBlockForm({ ...blockForm, motivo: event.target.value })} /></label>
            <button disabled={busy} style={styles.primary}><Clock3 size={15} />Bloquear horario</button>
            {blocks.map((block) => (
              <div key={block.id || block._id} style={styles.blockItem}>
                <span>{block.fecha} · {block.horaInicio}–{block.horaFin} {block.motivo && `· ${block.motivo}`}</span>
                <button type="button" aria-label="Quitar bloqueo" onClick={() => removeBlock(block.id || block._id)} style={styles.iconButton}><Trash2 size={15} /></button>
              </div>
            ))}
          </form>
        </div>
      )}

      {tab === 'clientes' && (
        <div style={styles.layout}>
          <div style={styles.list}>
            {clients.length === 0 ? <p style={styles.empty}>Tus clientes aparecerán aquí cuando recibas reservas.</p> : clients.map((client) => (
              <article key={client.id || client._id} style={styles.item}>
                <div style={styles.itemHeader}>
                  <div><h3 style={styles.itemTitle}>{client.firstName} {client.lastName}</h3><p style={styles.muted}>{client.email} · {client.telefono || 'Sin teléfono'}</p></div>
                  <button type="button" onClick={() => showClientHistory(client)} style={styles.secondary}><Users size={14} />Ver historial</button>
                </div>
              </article>
            ))}
          </div>
          {selectedClient && (
            <div style={styles.formCard}>
              <h3 style={styles.sectionTitle}>Historial: {selectedClient.firstName} {selectedClient.lastName}</h3>
              {clientHistory.length === 0 ? <p style={styles.muted}>Sin reservas registradas.</p> : clientHistory.map((booking) => (
                <p key={booking.id || booking._id} style={styles.historyItem}>
                  {booking.fecha} {booking.hora} · {booking.servicio?.nombre} · {booking.estado}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'estadisticas' && (
        reports ? (
          <div style={styles.statsGrid}>
            <Metric label="Reservas totales" value={reports.summary.total || 0} />
            <Metric label="Completadas" value={reports.completed.total_completadas || 0} />
            <Metric label="Pendientes" value={reports.summary.pendiente || 0} />
            <Metric label="Ingresos realizados" value={`$${Number(reports.income.ingresos_estimados || 0).toLocaleString()} COP`} />
            <div style={styles.formCard}>
              <h3 style={styles.sectionTitle}><ChartNoAxesCombined size={18} /> Servicios más solicitados</h3>
              {reports.services.map((item) => <p key={item.servicio} style={styles.historyItem}>{item.nombre}: {item.reservas} reservas</p>)}
            </div>
          </div>
        ) : <p style={styles.empty}>Cargando estadísticas...</p>
      )}

      {tab === 'notificaciones' && (
        <div style={styles.list}>
          {notifications.length === 0 ? <p style={styles.empty}>No tienes notificaciones por ahora.</p> : notifications.map((notification) => (
            <article key={notification.id || notification._id} style={styles.item}>
              <p style={styles.itemTitle}><Bell size={15} /> {notification.mensaje}</p>
              <p style={styles.muted}>{new Date(notification.creadaEn).toLocaleString()}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }) {
  return <article style={styles.metric}><span>{label}</span><strong>{value}</strong></article>;
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column', gap: '18px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(31, 41, 55, 0.04)' },
  heading: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  title: { margin: 0, fontSize: '20px', color: '#1f2937' },
  subtitle: { margin: '6px 0 0', color: '#6b7280', fontSize: '14px' },
  tabs: { display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' },
  tab: { border: '1px solid transparent', background: '#f9fafb', borderRadius: '8px', padding: '9px 13px', color: '#4b5563', cursor: 'pointer', fontWeight: 600 },
  activeTab: { background: '#f3e8ff', color: '#6b21a8', border: '1px solid #e9d5ff' },
  layout: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', alignItems: 'start', gap: '16px' },
  formCard: { display: 'flex', flexDirection: 'column', gap: '13px', padding: '18px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' },
  sectionTitle: { margin: 0, display: 'flex', alignItems: 'center', gap: '7px', fontSize: '16px', color: '#1f2937' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  item: { padding: '15px', border: '1px solid #e5e7eb', borderRadius: '11px', background: '#fff' },
  itemHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  itemTitle: { display: 'flex', alignItems: 'center', gap: '7px', margin: 0, color: '#1f2937', fontSize: '15px' },
  muted: { margin: '7px 0 0', color: '#6b7280', fontSize: '13px', lineHeight: 1.5 },
  badge: { flexShrink: 0, padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 },
  enabled: { color: '#15803d', background: '#dcfce7' },
  disabled: { color: '#6b7280', background: '#f3f4f6' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' },
  primary: { display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '7px', border: 0, borderRadius: '8px', padding: '10px 12px', background: '#6b21a8', color: '#fff', fontWeight: 700, cursor: 'pointer' },
  secondary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 11px', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' },
  danger: { display: 'inline-flex', alignItems: 'center', gap: '6px', border: 0, borderRadius: '8px', padding: '8px 11px', background: '#fef2f2', color: '#b91c1c', fontWeight: 600, cursor: 'pointer' },
  iconButton: { border: 0, borderRadius: '6px', padding: '6px', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer' },
  empty: { margin: 0, padding: '18px', borderRadius: '10px', background: '#f9fafb', color: '#6b7280', fontSize: '14px' },
  error: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', margin: 0, color: '#b91c1c', fontSize: '14px' },
  success: { margin: 0, color: '#15803d', fontSize: '14px' },
  blockItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f3f4f6', color: '#4b5563', fontSize: '12px' },
  historyItem: { margin: '8px 0 0', color: '#4b5563', fontSize: '13px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' },
  metric: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px', borderRadius: '12px', background: '#faf5ff', color: '#6b7280', fontSize: '13px' },
  metricValue: { fontSize: '23px', color: '#1f2937' }
};
