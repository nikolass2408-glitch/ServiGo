import { useEffect, useState } from 'react';
import {
  Calendar,
  Search,
  Clock,
  MapPin,
  User,
  LogOut,
  Eye,
  X,
  RefreshCw,
  Ban,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import ModalAgendar from '../../components/ModalAgendar';
import BrandMark from '../../components/BrandMark';
import { bookingService } from '../../services/bookingService';
import API from '../../services/api';
import PerfilPanel from '../../components/PerfilPanel';
import ClientNotifications from '../../components/ClientNotifications';
import NotificationBell from '../../components/NotificationBell';

const normalizarReserva = (reserva) => {
  const servicio = typeof reserva.servicio === 'object' ? reserva.servicio : {};
  const profesional = typeof reserva.profesional === 'object' ? reserva.profesional : {};
  const estadoCode = String(reserva.estado || 'PENDIENTE').toUpperCase();
  const estados = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    CANCELADA: 'Cancelada',
    COMPLETADA: 'Completada',
    REPROGRAMADA: 'Reprogramada',
    RECHAZADA: 'Rechazada'
  };

  return {
    id: reserva._id || reserva.id,
    servicio: servicio.nombre || reserva.servicioNombre || reserva.servicio || 'Servicio',
    profesional: profesional.nombreNegocio || reserva.profesionalNombre || reserva.profesional || 'Profesional',
    fecha: reserva.fecha,
    hora: reserva.hora,
    estado: estados[estadoCode] || estadoCode,
    estadoCode,
    precio: Number(servicio.precio ?? reserva.precio ?? 0),
    ubicacion: profesional.direccion || reserva.ubicacion || '',
    duracion: servicio.duracion
      ? `${servicio.duracion} min`
      : reserva.duracion || ''
  };
};

export default function DashboardCliente() {
  const { user, logout } = useAuth();
  const nombreUsuario =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.nombre ||
    user?.username ||
    'Cliente';
  const [activeSection, setActiveSection] = useState('perfil');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [servicios, setServicios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(true);
  const [errorReservas, setErrorReservas] = useState('');
  const [fechaMinima] = useState(() => {
    const fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
    return fecha.toISOString().slice(0, 10);
  });

  // Servicio que se va a agendar
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  // Reserva que el usuario quiere consultar
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [accionEnCurso, setAccionEnCurso] = useState('');
  const [errorAccion, setErrorAccion] = useState('');
  const [mensajeAccion, setMensajeAccion] = useState('');
  const [mostrarReprogramacion, setMostrarReprogramacion] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');

  // Servicio que el usuario quiere consultar
  const [servicioVisto, setServicioVisto] = useState(null);

  useEffect(() => {
    let activo = true;

    Promise.all([API.get('/servicios/'), API.get('/profesionales/')])
      .then(([serviciosResponse, profesionalesResponse]) => {
        if (!activo) return;
        const profesionales = profesionalesResponse.data;
        setServicios(serviciosResponse.data.map((servicio) => {
          const profesionalId = typeof servicio.profesional === 'object'
            ? servicio.profesional._id || servicio.profesional.id
            : servicio.profesional;
          const profesional = profesionales.find((item) =>
            (item._id || item.id) === profesionalId
          );
          return {
            id: servicio._id || servicio.id,
            profesionalId,
            nombre: servicio.nombre,
            categoria: servicio.categoria || profesional?.tipoNegocio || 'Servicios',
            profesional: profesional?.nombreNegocio || 'Profesional ServiGo',
            precio: Number(servicio.precio || 0),
            duracion: `${Number(servicio.duracion || 0)} min`,
            duracionMinutos: Number(servicio.duracion || 0),
            ubicacion: profesional?.direccion || '',
            descripcion: servicio.descripcion || ''
          };
        }));
      })
      .catch((error) => {
        if (activo) {
          setErrorReservas(
            error.response?.data?.error || 'No se pudieron cargar los servicios.'
          );
        }
      });

    bookingService.getReservas()
      .then((data) => {
        if (activo) setReservas(data.map(normalizarReserva));
      })
      .catch((error) => {
        if (activo) {
          setErrorReservas(
            error.response?.data?.error || 'No se pudieron cargar tus citas.'
          );
        }
      })
      .finally(() => {
        if (activo) setCargandoReservas(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  // Cuando se crea una nueva reserva
  const handleNuevaReserva = async (datosReserva) => {
    const nuevaReserva = await bookingService.crearReserva({
      servicio: servicioSeleccionado.id,
      profesional: servicioSeleccionado.profesionalId,
      fecha: datosReserva.fecha,
      hora: datosReserva.hora
    });
    setReservas((actuales) => [normalizarReserva(nuevaReserva), ...actuales]);
    return nuevaReserva;
  };

  const abrirReserva = (reserva) => {
    setReservaSeleccionada(reserva);
    setErrorAccion('');
    setMensajeAccion('');
    setMostrarReprogramacion(false);
  };

  const actualizarReserva = (datos) => {
    const actualizada = normalizarReserva(datos);
    setReservas((actuales) =>
      actuales.map((reserva) => reserva.id === actualizada.id ? actualizada : reserva)
    );
    setReservaSeleccionada(actualizada);
  };

  const ejecutarAccionReserva = async (accion, datos = {}) => {
    if (!reservaSeleccionada) return;

    setAccionEnCurso(accion);
    setErrorAccion('');
    setMensajeAccion('');

    try {
      let respuesta;
      if (accion === 'cancelar') {
        respuesta = await bookingService.cancelarReserva(reservaSeleccionada.id);
      } else {
        respuesta = await bookingService.reprogramarReserva(
          reservaSeleccionada.id,
          datos.fecha,
          datos.hora
        );
      }

      actualizarReserva(respuesta);
      setMostrarReprogramacion(false);
      setMensajeAccion(
        accion === 'cancelar'
            ? 'Cita cancelada.'
            : 'Cita reprogramada.'
      );
    } catch (error) {
      setErrorAccion(
        error.response?.data?.error || 'No se pudo actualizar la cita. Intenta de nuevo.'
      );
    } finally {
      setAccionEnCurso('');
    }
  };

  const estadoSeleccionado = reservaSeleccionada?.estadoCode ||
    String(reservaSeleccionada?.estado || '').toUpperCase();
  const citaActiva = ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(estadoSeleccionado);

  const iniciarReprogramacion = () => {
    const hora = String(reservaSeleccionada?.hora || '');
    const partes = hora.match(/^(\d{1,2}):(\d{2})(?:\s*(a\.?m\.?|p\.?m\.?))?$/i);
    let horaInicial = '';
    if (partes) {
      let horas = Number(partes[1]);
      const periodo = partes[3]?.toLowerCase().replaceAll('.', '');
      if (periodo === 'pm' && horas < 12) horas += 12;
      if (periodo === 'am' && horas === 12) horas = 0;
      horaInicial = `${String(horas).padStart(2, '0')}:${partes[2]}`;
    }

    setNuevaFecha(reservaSeleccionada?.fecha || '');
    setNuevaHora(horaInicial);
    setErrorAccion('');
    setMensajeAccion('');
    setMostrarReprogramacion(true);
  };

  const enviarReprogramacion = (event) => {
    event.preventDefault();
    ejecutarAccionReserva('reprogramar', { fecha: nuevaFecha, hora: nuevaHora });
  };

  return (
    <div style={styles.container}>

      {/* =========================
          BARRA SUPERIOR
      ========================== */}
      <header style={styles.navbar}>

        <div style={styles.logoContainer}>
          <BrandMark size={36} />
          <span style={styles.logoText}>ServiGo</span>
        </div>

        <div style={styles.userMenu}>
          <span style={styles.userName}>
            Hola, {nombreUsuario}
          </span>
          <NotificationBell userId={user?.id} />

          <button
            onClick={logout}
            style={styles.btnLogout}
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>

      </header>


      {/* =========================
          CONTENIDO PRINCIPAL
      ========================== */}
      <div className={`client-layout${sidebarCollapsed ? ' client-layout--collapsed' : ''}`}>
        <aside className="client-sidebar" aria-label="Navegación del cliente">
          <div className="client-sidebar__heading">
            {!sidebarCollapsed && <span>Mi espacio</span>}
            <button
              type="button"
              className="client-sidebar__toggle"
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              aria-label={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
              title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>
          <nav className="client-sidebar__nav" aria-label="Secciones">
            <button
              type="button"
              className={`client-sidebar__link${activeSection === 'perfil' ? ' is-active' : ''}`}
              onClick={() => setActiveSection('perfil')}
              aria-current={activeSection === 'perfil' ? 'page' : undefined}
              title={sidebarCollapsed ? 'Perfil' : undefined}
            >
              <UserRound size={18} />
              {!sidebarCollapsed && <span>Perfil</span>}
            </button>
            <button
              type="button"
              className={`client-sidebar__link${activeSection === 'agenda' ? ' is-active' : ''}`}
              onClick={() => setActiveSection('agenda')}
              aria-current={activeSection === 'agenda' ? 'page' : undefined}
              title={sidebarCollapsed ? 'Agenda de citas' : undefined}
            >
              <CalendarDays size={18} />
              {!sidebarCollapsed && <span>Agenda de citas</span>}
              {!sidebarCollapsed && reservas.length > 0 && (
                <span className="client-sidebar__count">{reservas.length}</span>
              )}
            </button>
          </nav>
        </aside>

        <main className="client-main" style={styles.content}>
        {activeSection === 'perfil' ? (
          <PerfilPanel />
        ) : (
          <>

        {/* =========================
            MIS RESERVAS ACTIVAS
        ========================== */}
        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            <Calendar size={20} color="#6b21a8" />
            Mi agenda de citas
          </h2>

          <div style={styles.reservasGrid}>

            {cargandoReservas ? (
              <p style={styles.emptyText}>Cargando tus citas...</p>
            ) : errorReservas ? (
              <p role="alert" style={styles.errorText}>{errorReservas}</p>
            ) : reservas.length === 0 ? (

              <div style={styles.emptyState}>
                <Calendar size={30} color="#9ca3af" />

                <p style={styles.emptyTitle}>
                  No tienes citas registradas
                </p>

                <p style={styles.emptyText}>
                  Explora nuestros servicios y agenda una cita.
                </p>
              </div>

            ) : (

              reservas.map((item) => (

                <div
                  key={item.id}
                  style={styles.reservaCard}
                >

                  {/* CABECERA */}
                  <div style={styles.reservaHeader}>

                    <span style={styles.serviceName}>
                      {item.servicio}
                    </span>

                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          item.estado === 'Confirmada'
                            ? '#dcfce7'
                            : '#fef3c7',

                        color:
                          item.estado === 'Confirmada'
                            ? '#15803d'
                            : '#b45309'
                      }}
                    >
                      {item.estado}
                    </span>

                  </div>


                  {/* PROFESIONAL */}
                  <p style={styles.providerName}>
                    <User size={14} />
                    {item.profesional}
                  </p>


                  {/* FECHA Y HORA */}
                  <div style={styles.reservaDetails}>

                    <span>
                      <Calendar size={14} />
                      {item.fecha}
                    </span>

                    <span>
                      <Clock size={14} />
                      {item.hora}
                    </span>

                  </div>


                  {/* PRECIO + BOTÓN VER */}
                  <div style={styles.reservaFooter}>

                    <span style={styles.price}>
                      ${item.precio.toLocaleString()} COP
                    </span>

                    <button
                      style={styles.btnView}
                      onClick={() => abrirReserva(item)}
                    >
                      <Eye size={14} />
                      Ver
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

        <ClientNotifications userId={user?.id} bookings={reservas} />

        {/* =========================
            EXPLORAR SERVICIOS
        ========================== */}
        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            <Search size={20} color="#6b21a8" />
            Explorar nuevos servicios
          </h2>


          <div style={styles.serviciosGrid}>

            {servicios.map((servicio) => (

              <div
                key={servicio.id}
                style={styles.servicioCard}
              >

                {/* CATEGORÍA */}
                <div style={styles.cardCategory}>
                  {servicio.categoria}
                </div>


                {/* NOMBRE */}
                <h3 style={styles.servicioTitle}>
                  {servicio.nombre}
                </h3>


                {/* PROFESIONAL */}
                <p style={styles.servicioProvider}>
                  {servicio.profesional}
                </p>


                {/* UBICACIÓN + DURACIÓN */}
                <p style={styles.servicioMeta}>

                  <span style={styles.metaItem}>
                    <MapPin size={14} />
                    {servicio.ubicacion}
                  </span>

                  <span style={styles.metaSeparator}>
                    •
                  </span>

                  <span style={styles.metaItem}>
                    <Clock size={14} />
                    {servicio.duracion}
                  </span>

                </p>


                {/* PRECIO + VER */}
                <div style={styles.servicioCardFooter}>

                  <span style={styles.price}>
                    ${servicio.precio.toLocaleString()} COP
                  </span>

                  <button
                    style={styles.btnView}
                    onClick={() => setServicioVisto(servicio)}
                  >
                    <Eye size={14} />
                    Ver
                  </button>

                </div>

              </div>

            ))}

          </div>

        </section>
          </>
        )}

      </main>
      </div>


      {/* ==================================================
          MODAL - INFORMACIÓN DE LA RESERVA
      ================================================== */}
      {reservaSeleccionada && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            {/* HEADER DEL MODAL */}
            <div style={styles.modalHeader}>

              <h2 style={styles.modalTitle}>
                Información de la reserva
              </h2>

              <button
                style={styles.btnClose}
                onClick={() => setReservaSeleccionada(null)}
              >
                <X size={20} />
              </button>

            </div>


            {/* CONTENIDO */}
            <div style={styles.modalContent}>

              {/* SERVICIO */}
              <div style={styles.infoBlock}>

                <span style={styles.infoLabel}>
                  Servicio
                </span>

                <strong style={styles.infoValue}>
                  {reservaSeleccionada.servicio}
                </strong>

              </div>


              {/* PROFESIONAL */}
              <div style={styles.infoBlock}>

                <span style={styles.infoLabel}>
                  Profesional
                </span>

                <span style={styles.infoValue}>
                  {reservaSeleccionada.profesional}
                </span>

              </div>


              {/* FECHA + HORA */}
              <div style={styles.infoRow}>

                <div style={styles.infoBlock}>

                  <span style={styles.infoLabel}>
                    <Calendar size={14} />
                    Fecha
                  </span>

                  <span style={styles.infoValue}>
                    {reservaSeleccionada.fecha}
                  </span>

                </div>


                <div style={styles.infoBlock}>

                  <span style={styles.infoLabel}>
                    <Clock size={14} />
                    Hora
                  </span>

                  <span style={styles.infoValue}>
                    {reservaSeleccionada.hora}
                  </span>

                </div>

              </div>


              {/* ESTADO */}
              <div style={styles.infoBlock}>

                <span style={styles.infoLabel}>
                  Estado
                </span>

                <span
                  style={{
                    ...styles.statusBadge,
                    alignSelf: 'flex-start',

                    backgroundColor:
                      reservaSeleccionada.estado === 'Confirmada'
                        ? '#dcfce7'
                        : '#fef3c7',

                    color:
                      reservaSeleccionada.estado === 'Confirmada'
                        ? '#15803d'
                        : '#b45309'
                  }}
                >
                  {reservaSeleccionada.estado}
                </span>

              </div>


              {/* PRECIO */}
              <div style={styles.infoBlock}>

                <span style={styles.infoLabel}>
                  Precio
                </span>

                <strong style={styles.modalPrice}>
                  ${reservaSeleccionada.precio.toLocaleString()} COP
                </strong>

              </div>


              {/* INFORMACIÓN EXTRA SI EXISTE */}
              {reservaSeleccionada.ubicacion && (

                <div style={styles.infoBlock}>

                  <span style={styles.infoLabel}>
                    <MapPin size={14} />
                    Ubicación
                  </span>

                  <span style={styles.infoValue}>
                    {reservaSeleccionada.ubicacion}
                  </span>

                </div>

              )}


              {reservaSeleccionada.duracion && (

                <div style={styles.infoBlock}>

                  <span style={styles.infoLabel}>
                    <Clock size={14} />
                    Duración
                  </span>

                  <span style={styles.infoValue}>
                    {reservaSeleccionada.duracion}
                  </span>

                </div>

              )}

            </div>


            {errorAccion && <p role="alert" style={styles.errorText}>{errorAccion}</p>}
            {mensajeAccion && <p role="status" style={styles.successText}>{mensajeAccion}</p>}

            {mostrarReprogramacion ? (
              <form onSubmit={enviarReprogramacion} style={styles.rescheduleForm}>
                <label style={styles.inputGroup}>
                  <span style={styles.infoLabel}>Nueva fecha</span>
                  <input
                    type="date"
                    value={nuevaFecha}
                    min={fechaMinima}
                    onChange={(event) => setNuevaFecha(event.target.value)}
                    required
                    style={styles.actionInput}
                  />
                </label>
                <label style={styles.inputGroup}>
                  <span style={styles.infoLabel}>Nueva hora</span>
                  <input
                    type="time"
                    value={nuevaHora}
                    onChange={(event) => setNuevaHora(event.target.value)}
                    required
                    style={styles.actionInput}
                  />
                </label>
                <div style={styles.reservationActions}>
                  <button
                    type="button"
                    style={{ ...styles.actionButton, ...styles.actionSecondary }}
                    onClick={() => setMostrarReprogramacion(false)}
                    disabled={Boolean(accionEnCurso)}
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    style={{ ...styles.actionButton, ...styles.actionPrimary }}
                    disabled={Boolean(accionEnCurso)}
                  >
                    <RefreshCw size={15} />
                    {accionEnCurso === 'reprogramar' ? 'Guardando...' : 'Guardar horario'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.reservationActions}>
                {citaActiva && (
                  <>
                    <button
                      type="button"
                      style={{ ...styles.actionButton, ...styles.actionSecondary }}
                      onClick={iniciarReprogramacion}
                      disabled={Boolean(accionEnCurso)}
                    >
                      <RefreshCw size={15} />
                      Reprogramar
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.actionButton, ...styles.actionDanger }}
                      onClick={() => ejecutarAccionReserva('cancelar')}
                      disabled={Boolean(accionEnCurso)}
                    >
                      <Ban size={15} />
                      {accionEnCurso === 'cancelar' ? 'Cancelando...' : 'Cancelar cita'}
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              style={styles.btnModalClose}
              onClick={() => setReservaSeleccionada(null)}
              disabled={Boolean(accionEnCurso)}
            >
              Cerrar
            </button>

          </div>

        </div>

      )}


      {/* ==================================================
          MODAL - INFORMACIÓN DEL SERVICIO
      ================================================== */}
      {servicioVisto && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            {/* HEADER */}
            <div style={styles.modalHeader}>

              <h2 style={styles.modalTitle}>
                Información del servicio
              </h2>

              <button
                style={styles.btnClose}
                onClick={() => setServicioVisto(null)}
              >
                <X size={20} />
              </button>

            </div>


            {/* CONTENIDO */}
            <div style={styles.modalContent}>

              {/* CATEGORÍA */}
              <span style={styles.cardCategory}>
                {servicioVisto.categoria}
              </span>


              {/* NOMBRE */}
              <h3 style={styles.modalServiceTitle}>
                {servicioVisto.nombre}
              </h3>


              {/* PROFESIONAL */}
              <div style={styles.infoBlock}>

                <span style={styles.infoLabel}>
                  Profesional
                </span>

                <span style={styles.infoValue}>
                  {servicioVisto.profesional}
                </span>

              </div>


              {/* UBICACIÓN */}
              <div style={styles.infoBlock}>

                <span style={styles.infoLabel}>
                  <MapPin size={14} />
                  Ubicación
                </span>

                <span style={styles.infoValue}>
                  {servicioVisto.ubicacion}
                </span>

              </div>


              {/* DURACIÓN */}
              <div style={styles.infoBlock}>

                <span style={styles.infoLabel}>
                  <Clock size={14} />
                  Duración
                </span>

                <span style={styles.infoValue}>
                  {servicioVisto.duracion}
                </span>

              </div>


              {/* PRECIO */}
              <div style={styles.infoBlock}>

                <span style={styles.infoLabel}>
                  Precio
                </span>

                <strong style={styles.modalPrice}>
                  ${servicioVisto.precio.toLocaleString()} COP
                </strong>

              </div>

            </div>


            {/* BOTONES */}
            <div style={styles.modalActions}>

              <button
                style={styles.btnSecondary}
                onClick={() => setServicioVisto(null)}
              >
                Cerrar
              </button>

              <button
                style={styles.btnBook}
                onClick={() => {

                  setServicioVisto(null);

                  setServicioSeleccionado(servicioVisto);

                }}
              >
                Agendar cita
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ==================================================
          MODAL PARA AGENDAR
      ================================================== */}
      {servicioSeleccionado && (

        <ModalAgendar
          servicio={servicioSeleccionado}
          onClose={() => setServicioSeleccionado(null)}
          onConfirmar={handleNuevaReserva}
        />

      )}

    </div>
  );
}


/* ======================================================
   ESTILOS
====================================================== */

const styles = {

  /* CONTENEDOR */
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'sans-serif'
  },


  /* NAVBAR */
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb'
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937'
  },

  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },

  btnLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#ef4444',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  },


  /* CONTENIDO */
  content: {
    width: '100%',
    minWidth: 0,
    maxWidth: '1000px',
    margin: '32px auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px'
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0
  },


  /* RESERVAS */
  reservasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },

  reservaCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },

  reservaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    gap: '10px'
  },

  serviceName: {
    fontWeight: '700',
    fontSize: '15px',
    color: '#1f2937'
  },

  statusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '12px'
  },

  providerName: {
    fontSize: '13px',
    color: '#4b5563',
    margin: '0 0 12px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  reservaDetails: {
    display: 'flex',
    gap: '12px',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '12px'
  },

  reservaDetailsSpan: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  reservaFooter: {
    borderTop: '1px solid #f3f4f6',
    paddingTop: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  price: {
    fontWeight: '700',
    color: '#6b21a8',
    fontSize: '14px'
  },


  /* SERVICIOS */
  serviciosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },

  servicioCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  cardCategory: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b21a8',
    backgroundColor: '#f3e8ff',
    padding: '2px 8px',
    borderRadius: '10px',
    alignSelf: 'flex-start'
  },

  servicioTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },

  servicioProvider: {
    fontSize: '13px',
    color: '#4b5563',
    margin: 0
  },

  servicioMeta: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 12px 0',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '5px'
  },

  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  metaSeparator: {
    color: '#9ca3af'
  },

  servicioCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '12px'
  },


  /* BOTÓN VER */
  btnView: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px'
  },


  /* BOTÓN AGENDAR */
  btnBook: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },


  /* ESTADO VACÍO */
  emptyState: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },

  emptyTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#374151',
    margin: '12px 0 4px'
  },

  emptyText: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0
  },

  errorText: {
    color: '#b91c1c',
    fontSize: '13px',
    margin: '12px 0 0'
  },

  successText: {
    color: '#15803d',
    fontSize: '13px',
    margin: '12px 0 0'
  },


  /* ==================================================
     MODALES
  ================================================== */

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },

  modal: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
    maxHeight: '90vh',
    overflowY: 'auto'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },

  modalTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#1f2937'
  },

  modalServiceTitle: {
    margin: 0,
    fontSize: '21px',
    color: '#1f2937'
  },

  btnClose: {
    border: 'none',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  infoBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    color: '#374151',
    fontSize: '14px'
  },

  infoLabel: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },

  infoValue: {
    color: '#374151',
    fontSize: '14px'
  },

  infoRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },

  modalPrice: {
    color: '#6b21a8',
    fontSize: '18px'
  },

  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '24px'
  },

  reservationActions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '20px'
  },

  rescheduleForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '20px'
  },

  actionInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    font: 'inherit'
  },

  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  actionPrimary: {
    backgroundColor: '#6b21a8',
    color: '#ffffff'
  },

  actionSecondary: {
    backgroundColor: '#f3e8ff',
    color: '#581c87'
  },

  actionDanger: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c'
  },

  btnSecondary: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  btnModalClose: {
    width: '100%',
    marginTop: '24px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
