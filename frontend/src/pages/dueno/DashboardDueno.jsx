import { useCallback, useEffect, useState } from 'react';
import { BriefcaseBusiness, Check, Clock3, MailPlus, Plus, Save, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { crearHorarioEmpresaEjemplo, DIAS_SEMANA, resumirHorarioEmpresa } from '../../utils/horarioEmpresa';
import './DashboardDueno.css';

const emptyService = { profesional: '', nombre: '', descripcion: '', precio: '', duracion: '30' };
const emptyCompany = { nombre: '', tipoNegocio: 'OTRO', telefono: '', direccion: '', descripcion: '' };

export default function DashboardDueno() {
  const { user, logout } = useAuth();
  const [panel, setPanel] = useState(null);
  const [activeSection, setActiveSection] = useState('resumen');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [newCompany, setNewCompany] = useState(emptyCompany);
  const [horarioEmpresa, setHorarioEmpresa] = useState(crearHorarioEmpresaEjemplo);
  const [invite, setInvite] = useState({ nombre: '', email: '', telefono: '' });
  const [service, setService] = useState(emptyService);
  const [editingService, setEditingService] = useState('');
  const [serviceView, setServiceView] = useState('active');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadPanel = useCallback(async () => {
    const { data } = await API.get('/empresa/panel/');
    setPanel(data);
    const companyId = selectedCompanyId || data.empresas[0]?.empresa?._id || '';
    setSelectedCompanyId(companyId);
    const company = data.empresas.find((item) => String(item.empresa._id) === String(companyId));
    setHorarioEmpresa(company?.empresa.horarioEmpresa || crearHorarioEmpresaEjemplo());
    setService((current) => ({
      ...current,
      profesional: current.profesional || data.empresas[0]?.profesionales.find((item) => item.estado === 'ACTIVA')?._id || ''
    }));
  }, [selectedCompanyId]);

  useEffect(() => {
    let active = true;
    API.get('/empresa/panel/')
      .then(({ data }) => {
        if (active) {
          setPanel(data);
          const firstCompany = data.empresas[0];
          setSelectedCompanyId(firstCompany?.empresa?._id || '');
          setHorarioEmpresa(firstCompany?.empresa?.horarioEmpresa || crearHorarioEmpresaEjemplo());
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
      setMessage(`Invitación creada para ${data.email}. Aprueba al profesional desde esta lista cuando quieras activarlo.`);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo invitar al profesional.');
    } finally {
      setBusy(false);
    }
  };

  const approveProfessional = async (professional) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { data } = await API.patch(
        `/empresa/${selectedCompanyId}/profesionales/${professional._id}/aprobar/`
      );
      await loadPanel();
      setMessage(data.disponibilidadConfigurada
        ? data.horariosCreados
          ? `Profesional aprobado y activado. Se configuraron ${data.horariosCreados} días; sus servicios activos ya pueden recibir reservas.`
          : 'Profesional aprobado y activado. Se conservaron sus horarios; sus servicios activos ya pueden recibir reservas.'
        : 'Profesional aprobado y activado. Configura su disponibilidad para que sus servicios puedan recibir reservas.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo aprobar al profesional.');
    } finally {
      setBusy(false);
    }
  };

  const toggleProfessionalAccount = async (professional) => {
    const shouldActivate = !professional.usuario?.activo;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await API.patch(`/empresa/${selectedCompanyId}/profesionales/${professional._id}/estado/`, {
        activo: shouldActivate
      });
      await loadPanel();
      setMessage(shouldActivate ? 'Cuenta profesional activada.' : 'Cuenta profesional desactivada.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo cambiar el estado de la cuenta.');
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
      setHorarioEmpresa(data.horarioEmpresa || crearHorarioEmpresaEjemplo());
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
  const profesionalesActivos = profesionales.filter((item) => ['ACTIVA', 'APROBADA'].includes(item.estado)).length;
  const invitacionesPendientes = profesionales.filter((item) => item.estado === 'PENDIENTE').length;
  const serviciosActivos = servicios.filter((item) => item.activo).length;
  const serviciosInactivos = servicios.filter((item) => !item.activo).length;
  const serviciosVisibles = servicios.filter((item) => serviceView === 'active' ? item.activo : !item.activo);

  const navegarA = (section) => {
    setActiveSection(section);
    requestAnimationFrame(() => {
      document.getElementById(`owner-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const saveCompanyHours = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await API.patch(`/empresa/${selectedCompanyId}/horario/`, { horarioEmpresa });
      await loadPanel();
      setMessage('Horario de atención actualizado.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo guardar el horario de la empresa.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="company-page"><p>Cargando empresa…</p></main>;

  return (
    <div className="company-page">
      <header className="company-topbar">
        <div className="company-brand"><span><BriefcaseBusiness size={20} /></span><div><strong>ServiGo Empresa</strong><small>Panel del dueño</small></div></div>
        <div className="company-user">
          {companyPanels.length > 0 && (
            <label className="company-selector">Empresa
              <select value={selectedCompanyId} onChange={(event) => {
                setSelectedCompanyId(event.target.value);
                const company = companyPanels.find((item) => String(item.empresa._id) === event.target.value);
                setHorarioEmpresa(company?.empresa.horarioEmpresa || crearHorarioEmpresaEjemplo());
                setService({ ...emptyService, profesional: '' });
                setEditingService('');
                setError('');
                setMessage('');
              }}>
                {companyPanels.map((item) => <option key={item.empresa._id} value={item.empresa._id}>{item.empresa.nombre}</option>)}
              </select>
            </label>
          )}
          <span className="company-user-name">{nombreDueno}</span>
        </div>
      </header>

      <div className="dashboard-layout company-layout">
        <DashboardSidebar
          role="Dueño de empresa"
          userName={nombreDueno}
          activeId={activeSection}
          items={[
            { id: 'resumen', label: 'Resumen', icon: 'overview' },
            { id: 'horario', label: 'Horario', icon: 'agenda' },
            { id: 'equipo', label: 'Equipo', icon: 'users', count: profesionales.length },
            { id: 'servicios', label: 'Servicios', icon: 'services', count: serviciosActivos }
          ]}
          onSelect={navegarA}
          onLogout={logout}
        />
        <main className="dashboard-main company-main">
          {error && <p className="company-alert" role="alert">{error}</p>}
          {message && <p className="company-success" role="status">{message}</p>}

          {panel && (
            <>
              <section className="company-content company-create-section">
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
          <section className="company-intro" id="owner-resumen">
            <span className="company-kicker">ADMINISTRACIÓN DE EMPRESA</span>
            <h1>{selectedCompany.empresa.nombre}</h1>
            <p>{selectedCompany.empresa.descripcion || 'Administra tu equipo profesional y los servicios de tu empresa.'}</p>
            <span className="company-location">{selectedCompany.empresa.direccion} · {selectedCompany.empresa.tipoNegocio}</span>
            <p className="company-hours-summary"><Clock3 size={15} />{resumirHorarioEmpresa(selectedCompany.empresa.horarioEmpresa)}</p>
          </section>

          <section className="company-overview" aria-label="Resumen de la empresa">
            <article className="company-metric"><span className="company-metric-icon"><Users size={18} /></span><div><span>Profesionales activos</span><strong>{profesionalesActivos}</strong></div></article>
            <article className="company-metric"><span className="company-metric-icon is-pending"><MailPlus size={18} /></span><div><span>Invitaciones pendientes</span><strong>{invitacionesPendientes}</strong></div></article>
            <article className="company-metric"><span className="company-metric-icon is-service"><BriefcaseBusiness size={18} /></span><div><span>Servicios activos</span><strong>{serviciosActivos}</strong></div></article>
          </section>

          <section className="company-content" id="owner-horario">
            <div className="company-section-heading"><div><Clock3 size={19} /><h2>Horario de atención</h2></div></div>
            <form className="company-card company-form company-hours-form" onSubmit={saveCompanyHours}>
              <p>Este horario se aplicará junto con la disponibilidad configurada por cada profesional.</p>
              <label className="company-hours-toggle">
                <input
                  type="checkbox"
                  checked={horarioEmpresa.abierto24Horas}
                  onChange={(event) => setHorarioEmpresa({ ...horarioEmpresa, abierto24Horas: event.target.checked })}
                />
                La empresa atiende 24 horas, todos los días
              </label>
              {!horarioEmpresa.abierto24Horas && horarioEmpresa.dias.map((dia) => (
                <div className="company-hours-day" key={dia.dia}>
                  <label className="company-hours-open">
                    <input
                      type="checkbox"
                      checked={dia.abierto}
                      onChange={(event) => setHorarioEmpresa({
                        ...horarioEmpresa,
                        dias: horarioEmpresa.dias.map((item) =>
                          item.dia === dia.dia ? { ...item, abierto: event.target.checked } : item
                        )
                      })}
                    />
                    {DIAS_SEMANA[dia.dia]}
                  </label>
                  <label>Desde
                    <input
                      type="time"
                      value={dia.horaInicio}
                      disabled={!dia.abierto}
                      onChange={(event) => setHorarioEmpresa({
                        ...horarioEmpresa,
                        dias: horarioEmpresa.dias.map((item) =>
                          item.dia === dia.dia ? { ...item, horaInicio: event.target.value } : item
                        )
                      })}
                    />
                  </label>
                  <label>Hasta
                    <input
                      type="time"
                      value={dia.horaFin}
                      disabled={!dia.abierto}
                      onChange={(event) => setHorarioEmpresa({
                        ...horarioEmpresa,
                        dias: horarioEmpresa.dias.map((item) =>
                          item.dia === dia.dia ? { ...item, horaFin: event.target.value } : item
                        )
                      })}
                    />
                  </label>
                </div>
              ))}
              <button className="company-primary" disabled={busy}><Save size={16} />{busy ? 'Guardando…' : 'Guardar horario'}</button>
            </form>
          </section>

          <section className="company-content" id="owner-equipo">
            <div className="company-section-heading"><div><Users size={19} /><h2>Profesionales</h2></div><span>{profesionales.length} integrantes</span></div>
            <div className="company-team">
              <form className="company-card company-form" onSubmit={sendInvite}>
                <h3><MailPlus size={18} /> Invitar profesional</h3>
                <p>Agrega al profesional y apruébalo desde esta lista para habilitarlo en tu empresa.</p>
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
                    <span className={`company-status ${item.estado === 'PENDIENTE' ? 'is-pending' : item.estado === 'APROBADA' ? 'is-approved' : item.usuario?.activo ? 'is-active' : 'is-pending'}`}>
                      {item.estado === 'PENDIENTE' ? 'Invitación pendiente' : item.estado === 'APROBADA' ? 'Aprobado por ti' : item.usuario?.activo ? 'Cuenta activa' : 'Cuenta desactivada'}
                    </span>
                    {['PENDIENTE', 'APROBADA'].includes(item.estado) && (
                      <button className="company-primary company-approve-button" type="button" disabled={busy} onClick={() => approveProfessional(item)}>
                        <Check size={15} />{item.estado === 'PENDIENTE' ? 'Aprobar sin código' : 'Preparar reservas'}
                      </button>
                    )}
                    {item.estado !== 'PENDIENTE' && (
                      <button
                        className={item.usuario?.activo ? 'company-secondary company-account-toggle' : 'company-primary company-account-toggle'}
                        type="button"
                        disabled={busy}
                        onClick={() => toggleProfessionalAccount(item)}
                      >
                        {item.usuario?.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="company-content" id="owner-servicios">
            <div className="company-section-heading"><div><BriefcaseBusiness size={19} /><h2>Servicios de la empresa</h2></div><span>{serviciosActivos} activos · {serviciosInactivos} inactivos</span></div>
            <div className="company-service-filter" role="group" aria-label="Filtrar servicios">
              <button type="button" className={serviceView === 'active' ? 'is-selected' : ''} onClick={() => setServiceView('active')}>Activos <span>{serviciosActivos}</span></button>
              <button type="button" className={serviceView === 'inactive' ? 'is-selected' : ''} onClick={() => setServiceView('inactive')}>Inactivos <span>{serviciosInactivos}</span></button>
            </div>
            <div className="company-services">
              <form className="company-card company-form" onSubmit={saveService}>
                <h3><Plus size={18} /> {editingService ? 'Editar servicio' : 'Registrar servicio'}</h3>
                <p>Los servicios activos se podrán reservar cuando el profesional tenga disponibilidad activa.</p>
                <label>Profesional responsable
                  <select value={service.profesional} onChange={(event) => setService({ ...service, profesional: event.target.value })} required disabled={Boolean(editingService)}>
                    <option value="">Selecciona un profesional</option>
                    {profesionales.map((item) => <option key={item._id} value={item._id}>{[item.usuario?.firstName, item.usuario?.lastName].filter(Boolean).join(' ')}{item.estado === 'PENDIENTE' ? ' (invitación pendiente)' : item.estado === 'APROBADA' ? ' (aprobado)' : ''}</option>)}
                  </select>
                </label>
                <label>Nombre del servicio<input value={service.nombre} onChange={(event) => setService({ ...service, nombre: event.target.value })} required /></label>
                <label>Descripción<textarea rows="3" value={service.descripcion} onChange={(event) => setService({ ...service, descripcion: event.target.value })} /></label>
                <div className="company-fields-row">
                  <label>Precio (COP)<input type="number" min="0" step="100" value={service.precio} onChange={(event) => setService({ ...service, precio: event.target.value })} required /></label>
                  <label>Duración (minutos)<input type="number" min="1" value={service.duracion} onChange={(event) => setService({ ...service, duracion: event.target.value })} required /></label>
                </div>
                <button className="company-primary" disabled={busy || (!editingService && !profesionales.some((item) => ['ACTIVA', 'APROBADA'].includes(item.estado)))}><Save size={16} />{busy ? 'Guardando…' : 'Guardar servicio'}</button>
                {editingService && <button className="company-secondary" type="button" onClick={() => { setEditingService(''); setService(emptyService); }}>Cancelar edición</button>}
              </form>
              <div className="company-service-list">
                {serviciosVisibles.length === 0 ? <p className="company-empty">{serviceView === 'active' ? 'No tienes servicios activos.' : 'No hay servicios inactivos.'}</p> : serviciosVisibles.map((item) => (
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
                      {item.activo && <button className="company-danger" type="button" disabled={busy} onClick={() => deleteService(item)}><Trash2 size={14} /> Eliminar</button>}
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
      </div>
    </div>
  );
}
