import { useCallback, useEffect, useState } from 'react';
import { BriefcaseBusiness, LogOut, MailPlus, Plus, Save, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import './DashboardDueno.css';

const emptyService = { profesional: '', nombre: '', descripcion: '', precio: '', duracion: '30' };
const emptyCompany = { nombre: '', tipoNegocio: 'OTRO', telefono: '', direccion: '', descripcion: '' };

export default function DashboardDueno() {
  const { user, logout } = useAuth();
  const [panel, setPanel] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [newCompany, setNewCompany] = useState(emptyCompany);
  const [invite, setInvite] = useState({ nombre: '', email: '', telefono: '' });
  const [service, setService] = useState(emptyService);
  const [editingService, setEditingService] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadPanel = useCallback(async () => {
    const { data } = await API.get('/empresa/panel/');
    setPanel(data);
    setSelectedCompanyId((current) => current || data.empresas[0]?.empresa?._id || '');
    setService((current) => ({
      ...current,
      profesional: current.profesional || data.empresas[0]?.profesionales.find((item) => item.estado === 'ACTIVA')?._id || ''
    }));
  }, []);

  useEffect(() => {
    let active = true;
    API.get('/empresa/panel/')
      .then(({ data }) => {
        if (active) {
          setPanel(data);
          setSelectedCompanyId(data.empresas[0]?.empresa?._id || '');
          setService((current) => ({
            ...current,
            profesional: current.profesional || data.empresas[0]?.profesionales.find((item) => item.estado === 'ACTIVA')?._id || ''
          }));
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.error || 'No se pudo cargar la empresa.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const sendInvite = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { data } = await API.post(`/empresa/${selectedCompanyId}/profesionales/`, invite);
      setInvite({ nombre: '', email: '', telefono: '' });
      await loadPanel();
      setMessage(`Invitación enviada a ${data.email}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo invitar al profesional.');
    } finally {
      setBusy(false);
    }
  };

  const saveService = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        ...service,
        empresa: selectedCompanyId,
        precio: Number(service.precio),
        duracion: Number(service.duracion)
      };
      if (editingService) {
        delete payload.profesional;
        delete payload.empresa;
        await API.patch(`/servicios/${editingService}/`, payload);
      } else {
        await API.post('/servicios/', payload);
      }
      setEditingService('');
      setService({ ...emptyService, profesional: service.profesional });
      await loadPanel();
      setMessage('Servicio guardado y asignado al profesional.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo guardar el servicio.');
    } finally {
      setBusy(false);
    }
  };

  const createCompany = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { data } = await API.post('/empresa/', newCompany);
      setNewCompany(emptyCompany);
      const { data: refreshedPanel } = await API.get('/empresa/panel/');
      setPanel(refreshedPanel);
      setSelectedCompanyId(data._id);
      setService({ ...emptyService, profesional: '' });
      setMessage(`Se creó ${data.nombre}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo crear la empresa.');
    } finally {
      setBusy(false);
    }
  };

  const editService = (item) => {
    setEditingService(item._id);
    setService({
      profesional: item.profesional?._id || '',
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      precio: String(item.precio),
      duracion: String(item.duracion)
    });
  };

  const toggleService = async (item) => {
    setBusy(true);
    setError('');
    try {
      await API.patch(`/servicios/${item._id}/`, { activo: !item.activo });
      await loadPanel();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo cambiar el estado.');
    } finally {
      setBusy(false);
    }
  };

  const deleteService = async (item) => {
    setBusy(true);
    setError('');
    try {
      await API.delete(`/servicios/${item._id}/`);
      await loadPanel();
      setMessage('Servicio desactivado.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo desactivar el servicio.');
    } finally {
      setBusy(false);
    }
  };

  const nombreDueno = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email;
  const companyPanels = panel?.empresas || [];
  const selectedCompany = companyPanels.find((item) => String(item.empresa._id) === String(selectedCompanyId));
  const profesionales = selectedCompany?.profesionales || [];
  const servicios = selectedCompany?.servicios || [];

  if (loading) return <main className="company-page"><p>Cargando empresa…</p></main>;

  return (
    <main className="company-page">
      <header className="company-topbar">
        <div className="company-brand"><span><BriefcaseBusiness size={20} /></span><div><strong>ServiGo Empresa</strong><small>Panel del dueño</small></div></div>
        <div className="company-user">
          {companyPanels.length > 0 && (
            <label className="company-selector">Empresa
              <select value={selectedCompanyId} onChange={(event) => {
                setSelectedCompanyId(event.target.value);
                setService({ ...emptyService, profesional: '' });
                setEditingService('');
                setError('');
                setMessage('');
              }}>
                {companyPanels.map((item) => <option key={item.empresa._id} value={item.empresa._id}>{item.empresa.nombre}</option>)}
              </select>
            </label>
          )}
          <span>{nombreDueno}</span><button type="button" onClick={logout}><LogOut size={16} /> Cerrar sesión</button>
        </div>
      </header>

      {error && <p className="company-alert" role="alert">{error}</p>}
      {message && <p className="company-success" role="status">{message}</p>}

      {panel && (
        <>
          <section className="company-content">
            <details className="company-card company-create-details">
              <summary><Plus size={16} /> Crear otra empresa</summary>
              <form className="company-form company-create-form" onSubmit={createCompany}>
                <label>Nombre de la empresa<input value={newCompany.nombre} onChange={(event) => setNewCompany({ ...newCompany, nombre: event.target.value })} required /></label>
                <label>Tipo de negocio
                  <select value={newCompany.tipoNegocio} onChange={(event) => setNewCompany({ ...newCompany, tipoNegocio: event.target.value })}>
                    <option value="BARBERIA">Barbería</option><option value="RESTAURANTE">Restaurante</option><option value="SPA">Spa</option><option value="GIMNASIO">Gimnasio</option><option value="FOTOGRAFIA">Fotografía</option><option value="EDUCACION">Educación</option><option value="MASCOTAS">Mascotas</option><option value="SALUD">Salud</option><option value="AUTOMOTRIZ">Automotriz</option><option value="OTRO">Otros</option>
                  </select>
                </label>
                <label>Dirección<input value={newCompany.direccion} onChange={(event) => setNewCompany({ ...newCompany, direccion: event.target.value })} required /></label>
                <label>Teléfono<input type="tel" value={newCompany.telefono} onChange={(event) => setNewCompany({ ...newCompany, telefono: event.target.value })} /></label>
                <label>Descripción<textarea rows="2" value={newCompany.descripcion} onChange={(event) => setNewCompany({ ...newCompany, descripcion: event.target.value })} /></label>
                <button className="company-primary" disabled={busy}><Plus size={16} /> Crear empresa</button>
              </form>
            </details>
          </section>

          {!selectedCompany && (
            <section className="company-content">
              <div className="company-card company-empty">Crea tu primera empresa para registrar profesionales y servicios.</div>
            </section>
          )}
          {selectedCompany && <>
          <section className="company-intro">
            <span className="company-kicker">ADMINISTRACIÓN DE EMPRESA</span>
            <h1>{selectedCompany.empresa.nombre}</h1>
            <p>{selectedCompany.empresa.descripcion || 'Administra tu equipo profesional y los servicios de tu empresa.'}</p>
            <span className="company-location">{selectedCompany.empresa.direccion} · {selectedCompany.empresa.tipoNegocio}</span>
          </section>

          <section className="company-content">
            <div className="company-section-heading"><div><Users size={19} /><h2>Profesionales</h2></div><span>{profesionales.length} integrantes</span></div>
            <div className="company-team">
              <form className="company-card company-form" onSubmit={sendInvite}>
                <h3><MailPlus size={18} /> Invitar profesional</h3>
                <p>Enviaremos un enlace para que acepte la invitación. Si no tiene cuenta profesional, podrá crear su contraseña.</p>
                <label>Nombre completo<input value={invite.nombre} onChange={(event) => setInvite({ ...invite, nombre: event.target.value })} required /></label>
                <label>Correo electrónico<input type="email" value={invite.email} onChange={(event) => setInvite({ ...invite, email: event.target.value })} required /></label>
                <label>Teléfono<input type="tel" value={invite.telefono} onChange={(event) => setInvite({ ...invite, telefono: event.target.value })} /></label>
                <button className="company-primary" disabled={busy}><MailPlus size={16} />{busy ? 'Enviando…' : 'Enviar invitación'}</button>
              </form>
              <div className="company-team-list">
                {profesionales.length === 0 ? <p className="company-empty">Aún no tienes profesionales. Envía una invitación para comenzar.</p> : profesionales.map((item) => (
                  <article className="company-card company-person" key={item._id}>
                    <div className="company-person-avatar">{item.usuario?.firstName?.slice(0, 1) || '?'}</div>
                    <div className="company-person-copy">
                      <strong>{[item.usuario?.firstName, item.usuario?.lastName].filter(Boolean).join(' ') || 'Profesional'}</strong>
                      <span>{item.usuario?.email}</span>
                    </div>
                    <span className={`company-status ${item.estado === 'ACTIVA' ? 'is-active' : 'is-pending'}`}>
                      {item.estado === 'ACTIVA' ? 'Profesional activo' : 'Invitación pendiente'}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="company-content">
            <div className="company-section-heading"><div><BriefcaseBusiness size={19} /><h2>Servicios de la empresa</h2></div><span>{servicios.length} servicios</span></div>
            <div className="company-services">
              <form className="company-card company-form" onSubmit={saveService}>
                <h3><Plus size={18} /> {editingService ? 'Editar servicio' : 'Registrar servicio'}</h3>
                <p>Asigna cada servicio a un profesional de tu equipo.</p>
                <label>Profesional responsable
                  <select value={service.profesional} onChange={(event) => setService({ ...service, profesional: event.target.value })} required disabled={Boolean(editingService)}>
                    <option value="">Selecciona un profesional</option>
                    {profesionales.map((item) => <option key={item._id} value={item._id} disabled={item.estado !== 'ACTIVA'}>{[item.usuario?.firstName, item.usuario?.lastName].filter(Boolean).join(' ')}{item.estado === 'ACTIVA' ? '' : ' (invitación pendiente)'}</option>)}
                  </select>
                </label>
                <label>Nombre del servicio<input value={service.nombre} onChange={(event) => setService({ ...service, nombre: event.target.value })} required /></label>
                <label>Descripción<textarea rows="3" value={service.descripcion} onChange={(event) => setService({ ...service, descripcion: event.target.value })} /></label>
                <div className="company-fields-row">
                  <label>Precio (COP)<input type="number" min="0" step="100" value={service.precio} onChange={(event) => setService({ ...service, precio: event.target.value })} required /></label>
                  <label>Duración (minutos)<input type="number" min="1" value={service.duracion} onChange={(event) => setService({ ...service, duracion: event.target.value })} required /></label>
                </div>
                <button className="company-primary" disabled={busy || (!editingService && !profesionales.some((item) => item.estado === 'ACTIVA'))}><Save size={16} />{busy ? 'Guardando…' : 'Guardar servicio'}</button>
                {editingService && <button className="company-secondary" type="button" onClick={() => { setEditingService(''); setService(emptyService); }}>Cancelar edición</button>}
              </form>
              <div className="company-service-list">
                {servicios.length === 0 ? <p className="company-empty">Todavía no hay servicios registrados.</p> : servicios.map((item) => (
                  <article className="company-card company-service-card" key={item._id}>
                    <div className="company-service-title">
                      <div><h3>{item.nombre}</h3><p>{[item.profesional?.usuario?.firstName, item.profesional?.usuario?.lastName].filter(Boolean).join(' ') || 'Profesional'}</p></div>
                      <span className={`company-status ${item.activo ? 'is-active' : 'is-pending'}`}>{item.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    <p className="company-service-description">{item.descripcion || 'Sin descripción'}</p>
                    <strong>${Number(item.precio).toLocaleString('es-CO')} COP · {item.duracion} min</strong>
                    <div className="company-service-actions">
                      <button className="company-secondary" type="button" onClick={() => editService(item)}>Editar</button>
                      <button className="company-secondary" type="button" disabled={busy} onClick={() => toggleService(item)}>{item.activo ? 'Desactivar' : 'Activar'}</button>
                      {item.activo && <button className="company-danger" type="button" disabled={busy} onClick={() => deleteService(item)}><Trash2 size={14} /> Quitar</button>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
          </>}
        </>
      )}
    </main>
  );
}
