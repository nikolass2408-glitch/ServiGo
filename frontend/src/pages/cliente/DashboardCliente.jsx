import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Calendar,
  Search,
  Clock,
  MapPin,
  User,
  LogOut,
  Eye,
  X,
  Check,
  RefreshCw,
  Ban,
  House,
  BriefcaseBusiness,
  History,
  CalendarCheck,
  ChevronRight
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import ModalAgendar from '../../components/ModalAgendar';
import PanelProfesionalesReserva from '../../components/PanelProfesionalesReserva';
import BrandMark from '../../components/BrandMark';
import { bookingService } from '../../services/bookingService';
import API from '../../services/api';
import PerfilPanel from '../../components/PerfilPanel';
import './DashboardCliente.css';

/* --------------------------------------------------
   NORMALIZAR DATOS DE LAS RESERVAS
-------------------------------------------------- */

const normalizarReserva = (reserva) => {
  const servicio =
    typeof reserva.servicio === 'object' && reserva.servicio !== null
      ? reserva.servicio
      : {};

  const profesional =
    typeof reserva.profesional === 'object' &&
    reserva.profesional !== null
      ? reserva.profesional
      : {};

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
    servicio:
      servicio.nombre ||
      reserva.servicioNombre ||
      (typeof reserva.servicio === 'string' ? reserva.servicio : '') ||
      'Servicio',
    profesional:
      profesional.nombreNegocio ||
      reserva.profesionalNombre ||
      (typeof reserva.profesional === 'string'
        ? reserva.profesional
        : '') ||
      'Profesional',
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

  const nombresCategoria = {
    BARBERIA: 'Barbería',
    SPA: 'Belleza y bienestar',
    GIMNASIO: 'Entrenamiento',
    FOTOGRAFIA: 'Fotografía',
    RESTAURANTE: 'Restaurante',
    EDUCACION: 'Educación',
    MASCOTAS: 'Mascotas',
    SALUD: 'Salud',
    AUTOMOTRIZ: 'Automotriz',
    OTRO: 'Otros'
  };

/* --------------------------------------------------
   DASHBOARD DEL CLIENTE
-------------------------------------------------- */

export default function DashboardCliente() {
  const { user, logout } = useAuth();

  const nombreUsuario =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.nombre ||
    user?.username ||
    'Cliente';

const navigate = useNavigate();
const location = useLocation();

const rutasCliente = {
  inicio: '/cliente/inicio',
  servicios: '/cliente/servicios',
  reservas: '/cliente/reservas',
  historial: '/cliente/historial',
  perfil: '/cliente/perfil'
};

const rutaActual = location.pathname.replace(/\/+$/, '');
const activeSection = Object.keys(rutasCliente).find(
  (nombre) => rutasCliente[nombre] === rutaActual
) || 'inicio';

  const [servicios, setServicios] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [errorServicios, setErrorServicios] = useState('');

  const [busquedaServicio, setBusquedaServicio] = useState('');
  const [busquedaUbicacion, setBusquedaUbicacion] = useState('');

  const [reservas, setReservas] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(true);
  const [errorReservas, setErrorReservas] = useState('');

  const [fechaMinima] = useState(() => {
    const fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
    return fecha.toISOString().slice(0, 10);
  });

  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [servicioParaReservar, setServicioParaReservar] = useState(null);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const [accionEnCurso, setAccionEnCurso] = useState('');
  const [errorAccion, setErrorAccion] = useState('');
  const [mensajeAccion, setMensajeAccion] = useState('');

  const [mostrarReprogramacion, setMostrarReprogramacion] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');

  const [servicioVisto, setServicioVisto] = useState(null);

  /* --------------------------------------------------
     FILTRAR SERVICIOS
  -------------------------------------------------- */

  const serviciosFiltrados = servicios.filter((servicio) => {
    const textoServicio =
      `${servicio.nombre} ${servicio.categoria} ${servicio.profesional}`
        .toLowerCase();

    const ubicacion = String(servicio.ubicacion || '').toLowerCase();

    return (
      textoServicio.includes(busquedaServicio.trim().toLowerCase()) &&
      ubicacion.includes(busquedaUbicacion.trim().toLowerCase())
    );
  });

  /* --------------------------------------------------
     SEPARAR RESERVAS ACTIVAS E HISTORIAL
  -------------------------------------------------- */

  const reservasActivas = reservas.filter((reserva) =>
    ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(
      reserva.estadoCode
    )
  );

  const reservasHistorial = reservas.filter((reserva) =>
    ['COMPLETADA', 'CANCELADA', 'RECHAZADA'].includes(
      reserva.estadoCode
    )
  );

  const reservasVisibles =
    activeSection === 'historial' ? reservasHistorial : reservasActivas;

  /* --------------------------------------------------
     CARGAR SERVICIOS, PROFESIONALES Y RESERVAS
  -------------------------------------------------- */

  useEffect(() => {
    let activo = true;

    const cargarServicios = async () => {
      try {
        const [serviciosResponse, profesionalesResponse] =
          await Promise.all([
            API.get('/servicios/'),
            API.get('/profesionales/')
          ]);

        if (!activo) return;

        const profesionales = Array.isArray(profesionalesResponse.data)
          ? profesionalesResponse.data
          : [];

        const listaServicios = Array.isArray(serviciosResponse.data)
          ? serviciosResponse.data
          : [];

        const serviciosPreparados = listaServicios.map((servicio) => {
          const profesionalId =
            typeof servicio.profesional === 'object' &&
            servicio.profesional !== null
              ? servicio.profesional._id || servicio.profesional.id
              : servicio.profesional;

          const profesional = profesionales.find(
            (item) =>
              String(item._id || item.id) === String(profesionalId)
          );

          return {
            id: servicio._id || servicio.id,
            profesionalId,
            nombre: servicio.nombre || 'Servicio sin nombre',
            empresa: servicio.empresa?.nombre || '',
            categoria:
              servicio.categoria ||
              nombresCategoria[servicio.empresa?.tipoNegocio] ||
              nombresCategoria[profesional?.tipoNegocio] ||
              'Servicios',
            profesional: servicio.empresa?.nombre
              ? `${[profesional?.usuario?.firstName, profesional?.usuario?.lastName].filter(Boolean).join(' ') || 'Profesional'} · ${servicio.empresa.nombre}`
              : profesional?.nombreNegocio || 'Profesional ServiGo',
            precio: Number(servicio.precio || 0),
            duracion: `${Number(servicio.duracion || 0)} min`,
            duracionMinutos: Number(servicio.duracion || 0),
            ubicacion: servicio.empresa?.direccion || profesional?.direccion || '',
            profesionalImagen: profesional?.imagen || '',
            profesionalDescripcion: profesional?.descripcion || '',
            profesionalTipo: profesional?.tipoNegocio || '',
            enlacePersonalizado: profesional?.enlacePersonalizado || '',
            descripcion: servicio.descripcion || ''
          };
        });

        setServicios(serviciosPreparados);
        setErrorServicios('');
      } catch (error) {
        if (activo) {
          setErrorServicios(
            error.response?.data?.error ||
              'No se pudieron cargar los servicios.'
          );
        }
      } finally {
        if (activo) {
          setCargandoServicios(false);
        }
      }
    };

    const cargarReservas = async () => {
  try {
    const data = await bookingService.getReservas();

    if (!activo) return;

    console.log("Reservas recibidas:", data);

    setReservas(
      Array.isArray(data) ? data.map(normalizarReserva) : []
    );

    setErrorReservas('');
  } catch (error) {
    console.error("Error al cargar las citas:", error);
  } finally {
    if (activo) {
      setCargandoReservas(false);
    }
  }
};

    cargarServicios();
    cargarReservas();

    return () => {
      activo = false;
    };
  }, []);

  /* --------------------------------------------------
     CREAR RESERVA
  -------------------------------------------------- */

  const handleNuevaReserva = async (datosReserva) => {
    const nuevaReserva = await bookingService.crearReserva({
      servicio: servicioSeleccionado.id,
      profesional: servicioSeleccionado.profesionalId,
      fecha: datosReserva.fecha,
      hora: datosReserva.hora
    });

    const reservaPreparada = normalizarReserva(nuevaReserva);

    setReservas((actuales) => [reservaPreparada, ...actuales]);

    return nuevaReserva;
  };

  /* --------------------------------------------------
     ABRIR DETALLES DE UNA RESERVA
  -------------------------------------------------- */

  const abrirReserva = (reserva) => {
    setReservaSeleccionada(reserva);
    setErrorAccion('');
    setMensajeAccion('');
    setMostrarReprogramacion(false);
  };

  const abrirPanelReserva = (servicio) => {
    setServicioParaReservar(servicio);
    setServicioVisto(null);
  };

  /* --------------------------------------------------
     ACTUALIZAR RESERVA EN PANTALLA
  -------------------------------------------------- */

  const actualizarReserva = (datos) => {
    const actualizada = normalizarReserva(datos);

    setReservas((actuales) =>
      actuales.map((reserva) =>
        String(reserva.id) === String(actualizada.id)
          ? actualizada
          : reserva
      )
    );

    setReservaSeleccionada(actualizada);
  };

  /* --------------------------------------------------
     CONFIRMAR, RECHAZAR, CANCELAR O REPROGRAMAR
  -------------------------------------------------- */

  const ejecutarAccionReserva = async (accion, datos = {}) => {
    if (!reservaSeleccionada || accionEnCurso) return;

    setAccionEnCurso(accion);
    setErrorAccion('');
    setMensajeAccion('');

    try {
      let respuesta;

      if (accion === 'confirmar') {
        respuesta = await bookingService.confirmarReserva(
          reservaSeleccionada.id
        );
      } else if (accion === 'rechazar') {
        respuesta = await bookingService.rechazarReserva(
          reservaSeleccionada.id
        );
      } else if (accion === 'cancelar') {
        respuesta = await bookingService.cancelarReserva(
          reservaSeleccionada.id
        );
      } else if (accion === 'reprogramar') {
        respuesta = await bookingService.reprogramarReserva(
          reservaSeleccionada.id,
          datos.fecha,
          datos.hora
        );
      }

      actualizarReserva(respuesta);
      setMostrarReprogramacion(false);

      const mensajes = {
        confirmar: 'Cita confirmada.',
        rechazar: 'Cita rechazada.',
        cancelar: 'Cita cancelada.',
        reprogramar: 'Cita reprogramada.'
      };

      setMensajeAccion(mensajes[accion] || 'Cita actualizada.');
    } catch (error) {
      setErrorAccion(
        error.response?.data?.error ||
          'No se pudo actualizar la cita. Intenta de nuevo.'
      );
    } finally {
      setAccionEnCurso('');
    }
  };

  const estadoSeleccionado =
    reservaSeleccionada?.estadoCode ||
    String(reservaSeleccionada?.estado || '').toUpperCase();

  const citaActiva = [
    'PENDIENTE',
    'CONFIRMADA',
    'REPROGRAMADA'
  ].includes(estadoSeleccionado);

  /* --------------------------------------------------
     REPROGRAMAR RESERVA
  -------------------------------------------------- */

  const iniciarReprogramacion = () => {
    const hora = String(reservaSeleccionada?.hora || '');

    const partes = hora.match(
      /^(\d{1,2}):(\d{2})(?:\s*(a\.?m\.?|p\.?m\.?))?$/i
    );

    let horaInicial = '';

    if (partes) {
      let horas = Number(partes[1]);

      const periodo = partes[3]
        ?.toLowerCase()
        .replaceAll('.', '');

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

    ejecutarAccionReserva('reprogramar', {
      fecha: nuevaFecha,
      hora: nuevaHora
    });
  };

  /* --------------------------------------------------
     CAMBIAR DE SECCIÓN
  -------------------------------------------------- */

  const cambiarSeccion = (seccion) => {
  navigate(rutasCliente[seccion] || rutasCliente.inicio);
  setServicioVisto(null);
};
  /* --------------------------------------------------
     INTERFAZ
  -------------------------------------------------- */

  return (
    <div style={styles.container}>
      {/* BARRA SUPERIOR */}
      <header style={styles.navbar}>
        <div style={styles.logoContainer}>
          <BrandMark size={36} />

          <div>
            <span style={styles.logoText}>ServiGo</span>
            <span style={styles.logoSubtitle}>Panel de cliente</span>
          </div>
        </div>

        <div style={styles.userMenu}>
          <div style={styles.userIdentity}>
            <div style={styles.userAvatar}>
              <User size={18} />
            </div>

            <div style={styles.userInfo}>
              <span style={styles.userName}>{nombreUsuario}</span>
              <span style={styles.userRole}>Cliente</span>
            </div>
          </div>

          <button
            onClick={logout}
            style={styles.btnLogout}
            type="button"
          >
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* CONTENEDOR DEL PANEL */}
      <div className="servigo-dashboard" style={styles.layout}>
        {/* BARRA LATERAL */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeading}>MENÚ PRINCIPAL</div>

          <nav style={styles.sidebarNav}>
            <button
              type="button"
              onClick={() => cambiarSeccion('inicio')}
              style={{
                ...styles.sidebarItem,
                ...(activeSection === 'inicio'
                  ? styles.sidebarItemActive
                  : {})
              }}
            >
              <House size={19} />
              <span>Inicio</span>
              {activeSection === 'inicio' && (
                <ChevronRight size={16} style={styles.sidebarArrow} />
              )}
            </button>

            <button
              type="button"
              onClick={() => cambiarSeccion('servicios')}
              style={{
                ...styles.sidebarItem,
                ...(activeSection === 'servicios'
                  ? styles.sidebarItemActive
                  : {})
              }}
            >
              <BriefcaseBusiness size={19} />
              <span>Servicios</span>
              {activeSection === 'servicios' && (
                <ChevronRight size={16} style={styles.sidebarArrow} />
              )}
            </button>

            <button
              type="button"
              onClick={() => cambiarSeccion('reservas')}
              style={{
                ...styles.sidebarItem,
                ...(activeSection === 'reservas'
                  ? styles.sidebarItemActive
                  : {})
              }}
            >
              <CalendarCheck size={19} />
              <span>Mis reservas</span>
              <span style={styles.sidebarCount}>
                {reservasActivas.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => cambiarSeccion('historial')}
              style={{
                ...styles.sidebarItem,
                ...(activeSection === 'historial'
                  ? styles.sidebarItemActive
                  : {})
              }}
            >
              <History size={19} />
              <span>Historial</span>
            </button>

            <button
              type="button"
              onClick={() => cambiarSeccion('perfil')}
              style={{
                ...styles.sidebarItem,
                ...(activeSection === 'perfil'
                  ? styles.sidebarItemActive
                  : {})
              }}
            >
              <User size={19} />
              <span>Mi perfil</span>
            </button>
          </nav>

          <div style={styles.sidebarSpacer} />

          <div style={styles.sidebarHelp}>
            <div style={styles.sidebarHelpIcon}>
              <BriefcaseBusiness size={20} />
            </div>

            <strong>¿Necesitas un servicio?</strong>

            <p>
              Encuentra profesionales y agenda tu próxima cita.
            </p>

            <button
              type="button"
              style={styles.sidebarHelpButton}
              onClick={() => cambiarSeccion('servicios')}
            >
              Explorar servicios
              <ChevronRight size={15} />
            </button>
          </div>

          <div style={styles.sidebarFooter}>
            <BrandMark size={23} />
            <span>ServiGo</span>
            <span style={styles.sidebarVersion}>Cliente</span>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main style={styles.content}>
          {/* INICIO */}
          {activeSection === 'inicio' && (
            <section style={styles.section}>
              <div style={styles.welcomePanel}>
                <div style={styles.welcomeContent}>
                  <span style={styles.welcomeEyebrow}>
                    TU ESPACIO PERSONAL
                  </span>

                  <h1 style={styles.welcomeTitle}>
                    ¡Hola, {nombreUsuario}!
                  </h1>

                  <p style={styles.welcomeText}>
                    Gestiona tus reservas y encuentra los servicios
                    que necesitas en un solo lugar.
                  </p>

                  <button
                    type="button"
                    style={styles.welcomeButton}
                    onClick={() => cambiarSeccion('servicios')}
                  >
                    Explorar servicios
                    <ChevronRight size={17} />
                  </button>
                </div>

                <div style={styles.welcomeDecoration}>
                  <div style={styles.welcomeIconCircle}>
                    <BriefcaseBusiness size={44} />
                  </div>
                </div>
              </div>

              <div>
                <h2 style={styles.pageTitle}>Resumen de tu actividad</h2>
                <p style={styles.pageDescription}>
                  Aquí tienes el estado de tus reservas.
                </p>
              </div>

              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div
                    style={{
                      ...styles.statIcon,
                      backgroundColor: '#f3e8ff',
                      color: '#7e22ce'
                    }}
                  >
                    <CalendarCheck size={21} />
                  </div>

                  <span style={styles.statLabel}>Reservas activas</span>

                  <strong style={styles.statNumber}>
                    {cargandoReservas ? '...' : reservasActivas.length}
                  </strong>

                  <span style={styles.statDescription}>
                    Citas pendientes o confirmadas
                  </span>
                </div>

                <div style={styles.statCard}>
                  <div
                    style={{
                      ...styles.statIcon,
                      backgroundColor: '#dcfce7',
                      color: '#15803d'
                    }}
                  >
                    <Check size={21} />
                  </div>

                  <span style={styles.statLabel}>Completadas</span>

                  <strong style={styles.statNumber}>
                    {cargandoReservas
                      ? '...'
                      : reservas.filter(
                          (reserva) =>
                            reserva.estadoCode === 'COMPLETADA'
                        ).length}
                  </strong>

                  <span style={styles.statDescription}>
                    Servicios finalizados
                  </span>
                </div>

                <div style={styles.statCard}>
                  <div
                    style={{
                      ...styles.statIcon,
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8'
                    }}
                  >
                    <BriefcaseBusiness size={21} />
                  </div>

                  <span style={styles.statLabel}>Servicios disponibles</span>

                  <strong style={styles.statNumber}>
                    {cargandoServicios ? '...' : servicios.length}
                  </strong>

                  <span style={styles.statDescription}>
                    Opciones para ti
                  </span>
                </div>
              </div>

              <div style={styles.sectionHeadingRow}>
                <div>
                  <h2 style={styles.pageTitle}>Tus próximas reservas</h2>
                  <p style={styles.pageDescription}>
                    Consulta rápidamente tus citas activas.
                  </p>
                </div>

                <button
                  type="button"
                  style={styles.textLinkButton}
                  onClick={() => cambiarSeccion('reservas')}
                >
                  Ver todas
                  <ChevronRight size={16} />
                </button>
              </div>

              {errorReservas && (
                <p role="alert" style={styles.errorText}>
                  {errorReservas}
                </p>
              )}

              {cargandoReservas ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>Cargando tus reservas...</p>
                </div>
              ) : reservasActivas.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <Calendar size={28} />
                  </div>

                  <p style={styles.emptyTitle}>
                    Todavía no tienes reservas
                  </p>

                  <p style={styles.emptyText}>
                    Cuando agendes un servicio, aparecerá aquí.
                  </p>

                  <button
                    type="button"
                    style={styles.btnBook}
                    onClick={() => cambiarSeccion('servicios')}
                  >
                    Buscar servicios
                  </button>
                </div>
              ) : (
                <div style={styles.reservasGrid}>
                  {reservasActivas.slice(0, 3).map((item) => (
                    <div key={item.id} style={styles.reservaCard}>
                      <div style={styles.reservaHeader}>
                        <span style={styles.serviceName}>
                          {item.servicio}
                        </span>

                        <span
                          style={{
                            ...styles.statusBadge,
                            ...estiloEstado(item.estadoCode)
                          }}
                        >
                          {item.estado}
                        </span>
                      </div>

                      <p style={styles.providerName}>
                        <User size={14} />
                        {item.profesional}
                      </p>

                      <div style={styles.reservaDetails}>
                        <span style={styles.metaItem}>
                          <Calendar size={14} />
                          {item.fecha}
                        </span>

                        <span style={styles.metaItem}>
                          <Clock size={14} />
                          {item.hora}
                        </span>
                      </div>

                      <div style={styles.reservaFooter}>
                        <span style={styles.price}>
                          ${item.precio.toLocaleString('es-CO')} COP
                        </span>

                        <button
                          type="button"
                          style={styles.btnView}
                          onClick={() => abrirReserva(item)}
                        >
                          <Eye size={14} />
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.quickActions}>
                <button
                  type="button"
                  style={styles.quickAction}
                  onClick={() => cambiarSeccion('servicios')}
                >
                  <div style={styles.quickActionIcon}>
                    <Search size={21} />
                  </div>

                  <div style={styles.quickActionText}>
                    <strong>Buscar un servicio</strong>
                    <span>Encuentra profesionales disponibles.</span>
                  </div>

                  <ChevronRight size={18} />
                </button>

                <button
                  type="button"
                  style={styles.quickAction}
                  onClick={() => cambiarSeccion('historial')}
                >
                  <div
                    style={{
                      ...styles.quickActionIcon,
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8'
                    }}
                  >
                    <History size={21} />
                  </div>

                  <div style={styles.quickActionText}>
                    <strong>Consultar historial</strong>
                    <span>Revisa tus reservas anteriores.</span>
                  </div>

                  <ChevronRight size={18} />
                </button>
              </div>
            </section>
          )}

          {/* SERVICIOS */}
          {activeSection === 'servicios' && (
            <section style={styles.section}>
              <div>
                <span style={styles.pageEyebrow}>DESCUBRE SERVIGO</span>
                <h1 style={styles.pageTitle}>Explorar servicios</h1>
                <p style={styles.pageDescription}>
                  Encuentra el profesional que necesitas y agenda tu cita.
                </p>
              </div>

              <div style={styles.searchPanel}>
                <div style={styles.searchField}>
                  <Search size={18} color="#9ca3af" />

                  <input
                    aria-label="Buscar por servicio"
                    placeholder="Nombre o categoría"
                    value={busquedaServicio}
                    onChange={(event) =>
                      setBusquedaServicio(event.target.value)
                    }
                    style={styles.searchInput}
                  />
                </div>

                <div style={styles.searchField}>
                  <MapPin size={18} color="#9ca3af" />

                  <input
                    aria-label="Buscar por ubicación"
                    placeholder="Ciudad o ubicación"
                    value={busquedaUbicacion}
                    onChange={(event) =>
                      setBusquedaUbicacion(event.target.value)
                    }
                    style={styles.searchInput}
                  />
                </div>
              </div>

              <div style={styles.resultsHeading}>
                <span style={styles.resultsCount}>
                  {serviciosFiltrados.length}{' '}
                  {serviciosFiltrados.length === 1
                    ? 'servicio encontrado'
                    : 'servicios encontrados'}
                </span>

                {(busquedaServicio || busquedaUbicacion) && (
                  <button
                    type="button"
                    style={styles.clearFilters}
                    onClick={() => {
                      setBusquedaServicio('');
                      setBusquedaUbicacion('');
                    }}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              {cargandoServicios ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>Cargando servicios...</p>
                </div>
              ) : errorServicios ? (
                <p role="alert" style={styles.errorText}>
                  {errorServicios}
                </p>
              ) : serviciosFiltrados.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <Search size={28} />
                  </div>

                  <p style={styles.emptyTitle}>
                    No encontramos servicios
                  </p>

                  <p style={styles.emptyText}>
                    Prueba con otro nombre, categoría o ubicación.
                  </p>
                </div>
              ) : (
                <div style={styles.serviciosGrid}>
                  {serviciosFiltrados.map((servicio) => (
                    <div key={servicio.id} style={styles.servicioCard}>
                      <div style={styles.serviceCardTop}>
                        <span style={styles.cardCategory}>
                          {servicio.categoria}
                        </span>

                        <div style={styles.serviceCardIcon}>
                          <BriefcaseBusiness size={21} />
                        </div>
                      </div>

                      <h3 style={styles.servicioTitle}>
                        {servicio.nombre}
                      </h3>

                      <p style={styles.servicioProvider}>
                        <User size={14} />
                        {servicio.profesional}
                      </p>

                      <p style={styles.descripcionServicio}>
                        {servicio.descripcion ||
                          'Consulta los detalles para conocer este servicio.'}
                      </p>

                      <div style={styles.serviceMetaList}>
                        <span style={styles.metaItem}>
                          <MapPin size={15} />
                          {servicio.ubicacion ||
                            'Ubicación no disponible'}
                        </span>

                        <span style={styles.metaItem}>
                          <Clock size={15} />
                          {servicio.duracion}
                        </span>
                      </div>

                      <div style={styles.servicioCardFooter}>
                        <div>
                          <span style={styles.priceCaption}>Precio</span>
                          <strong style={styles.price}>
                            ${servicio.precio.toLocaleString('es-CO')} COP
                          </strong>
                        </div>

                        <div style={styles.serviceCardActions}>
                          <button
                            type="button"
                            style={styles.btnView}
                            onClick={() => setServicioVisto(servicio)}
                          >
                            Ver
                            <ChevronRight size={15} />
                          </button>
                          <button
                            type="button"
                            style={styles.btnReserve}
                            onClick={() => abrirPanelReserva(servicio)}
                          >
                            Reservar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* MIS RESERVAS */}
          {activeSection === 'reservas' && (
            <section style={styles.section}>
              <div>
                <span style={styles.pageEyebrow}>ORGANIZA TU TIEMPO</span>
                <h1 style={styles.pageTitle}>Mis reservas</h1>
                <p style={styles.pageDescription}>
                  Consulta y administra tus citas pendientes y confirmadas.
                </p>
              </div>

              <div style={styles.reservationSummary}>
                <div>
                  <span style={styles.statLabel}>Reservas activas</span>
                  <strong style={styles.summaryNumber}>
                    {reservasActivas.length}
                  </strong>
                </div>

                <CalendarCheck size={30} color="#7e22ce" />
              </div>

              {cargandoReservas ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>Cargando tus reservas...</p>
                </div>
              ) : errorReservas ? (
                <p role="alert" style={styles.errorText}>
                  {errorReservas}
                </p>
              ) : reservasActivas.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <Calendar size={28} />
                  </div>

                  <p style={styles.emptyTitle}>
                    No tienes reservas activas
                  </p>

                  <p style={styles.emptyText}>
                    Puedes explorar los servicios disponibles y reservar
                    cuando lo necesites.
                  </p>

                  <button
                    type="button"
                    style={styles.btnBook}
                    onClick={() => cambiarSeccion('servicios')}
                  >
                    Explorar servicios
                  </button>
                </div>
              ) : (
                <div style={styles.reservasGrid}>
                  {reservasVisibles.map((item) => (
                    <div key={item.id} style={styles.reservaCard}>
                      <div style={styles.reservaHeader}>
                        <span style={styles.serviceName}>
                          {item.servicio}
                        </span>

                        <span
                          style={{
                            ...styles.statusBadge,
                            ...estiloEstado(item.estadoCode)
                          }}
                        >
                          {item.estado}
                        </span>
                      </div>

                      <p style={styles.providerName}>
                        <User size={14} />
                        {item.profesional}
                      </p>

                      <div style={styles.reservaDetails}>
                        <span style={styles.metaItem}>
                          <Calendar size={14} />
                          {item.fecha}
                        </span>

                        <span style={styles.metaItem}>
                          <Clock size={14} />
                          {item.hora}
                        </span>
                      </div>

                      {item.ubicacion && (
                        <p style={styles.reservaLocation}>
                          <MapPin size={14} />
                          {item.ubicacion}
                        </p>
                      )}

                      <div style={styles.reservaFooter}>
                        <span style={styles.price}>
                          ${item.precio.toLocaleString('es-CO')} COP
                        </span>

                        <button
                          type="button"
                          style={styles.btnView}
                          onClick={() => abrirReserva(item)}
                        >
                          <Eye size={14} />
                          Administrar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* HISTORIAL */}
          {activeSection === 'historial' && (
            <section style={styles.section}>
              <div>
                <span style={styles.pageEyebrow}>TUS ACTIVIDADES</span>
                <h1 style={styles.pageTitle}>Historial de reservas</h1>
                <p style={styles.pageDescription}>
                  Consulta las citas que ya terminaron o fueron canceladas.
                </p>
              </div>

              {cargandoReservas ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>Cargando el historial...</p>
                </div>
              ) : errorReservas ? (
                <p role="alert" style={styles.errorText}>
                  {errorReservas}
                </p>
              ) : reservasHistorial.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <History size={28} />
                  </div>

                  <p style={styles.emptyTitle}>
                    Tu historial está vacío
                  </p>

                  <p style={styles.emptyText}>
                    Las reservas completadas o canceladas aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div style={styles.reservasGrid}>
                  {reservasHistorial.map((item) => (
                    <div key={item.id} style={styles.reservaCard}>
                      <div style={styles.reservaHeader}>
                        <span style={styles.serviceName}>
                          {item.servicio}
                        </span>

                        <span
                          style={{
                            ...styles.statusBadge,
                            ...estiloEstado(item.estadoCode)
                          }}
                        >
                          {item.estado}
                        </span>
                      </div>

                      <p style={styles.providerName}>
                        <User size={14} />
                        {item.profesional}
                      </p>

                      <div style={styles.reservaDetails}>
                        <span style={styles.metaItem}>
                          <Calendar size={14} />
                          {item.fecha}
                        </span>

                        <span style={styles.metaItem}>
                          <Clock size={14} />
                          {item.hora}
                        </span>
                      </div>

                      <div style={styles.reservaFooter}>
                        <span style={styles.price}>
                          ${item.precio.toLocaleString('es-CO')} COP
                        </span>

                        <button
                          type="button"
                          style={styles.btnView}
                          onClick={() => abrirReserva(item)}
                        >
                          <Eye size={14} />
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* MI PERFIL */}
          {activeSection === 'perfil' && (
            <section style={styles.section}>
              <div>
                <span style={styles.pageEyebrow}>TU CUENTA</span>
                <h1 style={styles.pageTitle}>Mi perfil</h1>
                <p style={styles.pageDescription}>
                  Consulta y gestiona la información de tu cuenta.
                </p>
              </div>

              <div style={styles.profilePanel}>
                <PerfilPanel />
              </div>
            </section>
          )}
        </main>
      </div>

      {/* --------------------------------------------------
          MODAL: INFORMACIÓN DE LA RESERVA
      -------------------------------------------------- */}

      {reservaSeleccionada && (
        <div style={styles.modalOverlay}>
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-reserva"
          >
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.pageEyebrow}>DETALLES</span>

                <h2 id="titulo-reserva" style={styles.modalTitle}>
                  Información de la reserva
                </h2>
              </div>

              <button
                type="button"
                style={styles.btnClose}
                onClick={() => setReservaSeleccionada(null)}
                aria-label="Cerrar detalles de la reserva"
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.infoBlock}>
                <span style={styles.infoLabel}>Servicio</span>
                <strong style={styles.infoValue}>
                  {reservaSeleccionada.servicio}
                </strong>
              </div>

              <div style={styles.infoBlock}>
                <span style={styles.infoLabel}>Profesional</span>
                <span style={styles.infoValue}>
                  {reservaSeleccionada.profesional}
                </span>
              </div>

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

              <div style={styles.infoBlock}>
                <span style={styles.infoLabel}>Estado</span>

                <span
                  style={{
                    ...styles.statusBadge,
                    ...estiloEstado(reservaSeleccionada.estadoCode),
                    alignSelf: 'flex-start'
                  }}
                >
                  {reservaSeleccionada.estado}
                </span>
              </div>

              <div style={styles.infoBlock}>
                <span style={styles.infoLabel}>Precio</span>

                <strong style={styles.modalPrice}>
                  ${reservaSeleccionada.precio.toLocaleString('es-CO')} COP
                </strong>
              </div>

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

            {errorAccion && (
              <p role="alert" style={styles.errorText}>
                {errorAccion}
              </p>
            )}

            {mensajeAccion && (
              <p role="status" style={styles.successText}>
                {mensajeAccion}
              </p>
            )}

            {mostrarReprogramacion ? (
              <form
                onSubmit={enviarReprogramacion}
                style={styles.rescheduleForm}
              >
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
                    style={{
                      ...styles.actionButton,
                      ...styles.actionSecondary
                    }}
                    onClick={() => setMostrarReprogramacion(false)}
                    disabled={Boolean(accionEnCurso)}
                  >
                    Volver
                  </button>

                  <button
                    type="submit"
                    style={{
                      ...styles.actionButton,
                      ...styles.actionPrimary
                    }}
                    disabled={Boolean(accionEnCurso)}
                  >
                    <RefreshCw size={15} />

                    {accionEnCurso === 'reprogramar'
                      ? 'Guardando...'
                      : 'Guardar horario'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.reservationActions}>
                {['PENDIENTE', 'REPROGRAMADA'].includes(
                  estadoSeleccionado
                ) && (
                  <>
                    <button
                      type="button"
                      style={{
                        ...styles.actionButton,
                        ...styles.actionPrimary
                      }}
                      onClick={() => ejecutarAccionReserva('confirmar')}
                      disabled={Boolean(accionEnCurso)}
                    >
                      <Check size={15} />

                      {accionEnCurso === 'confirmar'
                        ? 'Confirmando...'
                        : 'Confirmar cita'}
                    </button>

                    <button
                      type="button"
                      style={{
                        ...styles.actionButton,
                        ...styles.actionDanger
                      }}
                      onClick={() => ejecutarAccionReserva('rechazar')}
                      disabled={Boolean(accionEnCurso)}
                    >
                      <X size={15} />

                      {accionEnCurso === 'rechazar'
                        ? 'Rechazando...'
                        : 'Rechazar cita'}
                    </button>
                  </>
                )}

                {citaActiva && (
                  <>
                    <button
                      type="button"
                      style={{
                        ...styles.actionButton,
                        ...styles.actionSecondary
                      }}
                      onClick={iniciarReprogramacion}
                      disabled={Boolean(accionEnCurso)}
                    >
                      <RefreshCw size={15} />
                      Reprogramar
                    </button>

                    <button
                      type="button"
                      style={{
                        ...styles.actionButton,
                        ...styles.actionDanger
                      }}
                      onClick={() => ejecutarAccionReserva('cancelar')}
                      disabled={Boolean(accionEnCurso)}
                    >
                      <Ban size={15} />

                      {accionEnCurso === 'cancelar'
                        ? 'Cancelando...'
                        : 'Cancelar cita'}
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              style={styles.btnModalClose}
              onClick={() => setReservaSeleccionada(null)}
              disabled={Boolean(accionEnCurso)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------
          MODAL: INFORMACIÓN DEL SERVICIO
      -------------------------------------------------- */}

      {servicioVisto && (
        <div style={styles.modalOverlay}>
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-servicio"
          >
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.pageEyebrow}>DETALLES DEL SERVICIO</span>

                <h2 id="titulo-servicio" style={styles.modalTitle}>
                  Información del servicio
                </h2>
              </div>

              <button
                type="button"
                style={styles.btnClose}
                onClick={() => setServicioVisto(null)}
                aria-label="Cerrar detalles del servicio"
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalContent}>
              <span style={styles.cardCategory}>
                {servicioVisto.categoria}
              </span>

              <h3 style={styles.modalServiceTitle}>
                {servicioVisto.nombre}
              </h3>

              <p style={styles.descripcionModal}>
                {servicioVisto.descripcion ||
                  'El prestador ofrece este servicio con reserva previa.'}
              </p>

              <div style={styles.infoBlock}>
                <span style={styles.infoLabel}>Profesional</span>

                <span style={styles.infoValue}>
                  {servicioVisto.profesional}
                </span>
              </div>

              <div style={styles.infoBlock}>
                <span style={styles.infoLabel}>
                  <MapPin size={14} />
                  Ubicación
                </span>

                <span style={styles.infoValue}>
                  {servicioVisto.ubicacion || 'Ubicación no disponible'}
                </span>
              </div>

              <div style={styles.infoBlock}>
                <span style={styles.infoLabel}>
                  <Clock size={14} />
                  Duración
                </span>

                <span style={styles.infoValue}>
                  {servicioVisto.duracion}
                </span>
              </div>

              <div style={styles.infoBlock}>
                <span style={styles.infoLabel}>Precio</span>

                <strong style={styles.modalPrice}>
                  ${servicioVisto.precio.toLocaleString('es-CO')} COP
                </strong>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.btnSecondary}
                onClick={() => setServicioVisto(null)}
              >
                Cerrar
              </button>

              <button
                type="button"
                style={styles.btnBook}
                onClick={() => abrirPanelReserva(servicioVisto)}
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA AGENDAR */}
      {servicioParaReservar && (
        <PanelProfesionalesReserva
          key={servicioParaReservar.id}
          servicio={servicioParaReservar}
          servicios={servicios}
          onClose={() => setServicioParaReservar(null)}
          onSelect={(servicio) => {
            setServicioParaReservar(null);
            setServicioSeleccionado(servicio);
          }}
        />
      )}

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

/* --------------------------------------------------
   COLORES SEGÚN EL ESTADO DE LA RESERVA
-------------------------------------------------- */

function estiloEstado(estado) {
  const colores = {
    PENDIENTE: {
      backgroundColor: '#fef3c7',
      color: '#b45309'
    },
    CONFIRMADA: {
      backgroundColor: '#dcfce7',
      color: '#15803d'
    },
    CANCELADA: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c'
    },
    COMPLETADA: {
      backgroundColor: '#dbeafe',
      color: '#1d4ed8'
    },
    REPROGRAMADA: {
      backgroundColor: '#f3e8ff',
      color: '#6b21a8'
    },
    RECHAZADA: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c'
    }
  };

  return colores[estado] || {
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };
}

/* --------------------------------------------------
   ESTILOS DEL DASHBOARD
-------------------------------------------------- */

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f7f8fc',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#1f2937'
  },

  navbar: {
    minHeight: '76px',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '14px 32px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #eaecf0',
    position: 'sticky',
    top: 0,
    zIndex: 50
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  logoText: {
    display: 'block',
    fontSize: '21px',
    fontWeight: '800',
    letterSpacing: '-0.6px',
    color: '#1f2937'
  },

  logoSubtitle: {
    display: 'block',
    marginTop: '1px',
    fontSize: '11px',
    color: '#9ca3af'
  },

  userMenu: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '18px'
  },

  userIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px'
  },

  userAvatar: {
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: '#f3e8ff',
    color: '#7e22ce'
  },

  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },

  userName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#374151'
  },

  userRole: {
    fontSize: '11px',
    color: '#9ca3af'
  },

  btnLogout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    color: '#6b7280',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '9px',
    padding: '9px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  layout: {
    display: 'grid',
    gridTemplateColumns: '245px minmax(0, 1fr)',
    minHeight: 'calc(100vh - 76px)',
    alignItems: 'stretch'
  },

  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    padding: '27px 16px 18px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #eaecf0',
    boxSizing: 'border-box',
    minWidth: 0
  },

  sidebarHeading: {
    padding: '0 12px',
    marginBottom: '15px',
    color: '#9ca3af',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1.1px'
  },

  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },

  sidebarItem: {
    width: '100%',
    minHeight: '45px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 12px',
    border: '1px solid transparent',
    borderRadius: '9px',
    backgroundColor: 'transparent',
    color: '#667085',
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'left',
    cursor: 'pointer'
  },

  sidebarItemActive: {
    backgroundColor: '#f3e8ff',
    color: '#6b21a8',
    borderColor: '#ead5ff'
  },

  sidebarArrow: {
    marginLeft: 'auto'
  },

  sidebarCount: {
    marginLeft: 'auto',
    minWidth: '22px',
    height: '22px',
    padding: '0 5px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '7px',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    fontSize: '11px',
    fontWeight: '700'
  },

  sidebarSpacer: {
    flex: 1,
    minHeight: '30px'
  },

  sidebarHelp: {
    padding: '17px 14px',
    backgroundColor: '#faf5ff',
    border: '1px solid #f0e3ff',
    borderRadius: '12px',
    marginBottom: '22px'
  },

  sidebarHelpIcon: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    borderRadius: '9px',
    backgroundColor: '#ead5ff',
    color: '#7e22ce'
  },

  sidebarHelpStrong: {
    fontSize: '13px',
    color: '#374151'
  },

  sidebarHelpButton: {
    width: '100%',
    marginTop: '9px',
    padding: '9px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#7e22ce',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },

  sidebarFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '15px 5px 0',
    borderTop: '1px solid #f0f1f4',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '700'
  },

  sidebarVersion: {
    marginLeft: 'auto',
    padding: '4px 7px',
    borderRadius: '6px',
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    fontSize: '10px',
    fontWeight: '600'
  },

  content: {
    width: '100%',
    minWidth: 0,
    maxWidth: '1500px',
    margin: '0 auto',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    boxSizing: 'border-box'
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '23px',
    minWidth: 0
  },

  pageEyebrow: {
    display: 'block',
    marginBottom: '8px',
    color: '#8b5cf6',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1.2px'
  },

  pageTitle: {
    margin: 0,
    color: '#1f2937',
    fontSize: '23px',
    fontWeight: '800',
    letterSpacing: '-0.6px',
    lineHeight: 1.35
  },

  pageDescription: {
    margin: '7px 0 0',
    color: '#8a94a6',
    fontSize: '13px',
    lineHeight: 1.6
  },

  welcomePanel: {
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '25px',
    minHeight: '230px',
    padding: '32px',
    boxSizing: 'border-box',
    borderRadius: '18px',
    background: 'linear-gradient(115deg, #241044 0%, #5b21b6 65%, #7c3aed 100%)',
    color: '#ffffff'
  },

  welcomeContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '560px'
  },

  welcomeEyebrow: {
    color: '#d8b4fe',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1.5px'
  },

  welcomeTitle: {
    margin: '12px 0 10px',
    fontSize: '31px',
    fontWeight: '800',
    letterSpacing: '-1px',
    lineHeight: 1.2,
    overflowWrap: 'anywhere'
  },

  welcomeText: {
    maxWidth: '490px',
    margin: '0 0 22px',
    color: '#e9ddff',
    fontSize: '14px',
    lineHeight: 1.7
  },

  welcomeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px 15px',
    border: 'none',
    borderRadius: '9px',
    backgroundColor: '#ffffff',
    color: '#5b21b6',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },

  welcomeDecoration: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '150px',
    height: '150px',
    flexShrink: 0,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },

  welcomeIconCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100px',
    height: '100px',
    borderRadius: '28px',
    backgroundColor: 'rgba(255,255,255,0.13)',
    color: '#ffffff'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '15px'
  },

  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '9px',
    padding: '21px',
    backgroundColor: '#ffffff',
    border: '1px solid #eaecf0',
    borderRadius: '13px',
    boxShadow: '0 2px 8px rgba(16,24,40,0.025)',
    minWidth: 0
  },

  statIcon: {
    width: '43px',
    height: '43px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px'
  },

  statLabel: {
    color: '#7b8495',
    fontSize: '12px',
    fontWeight: '600'
  },

  statNumber: {
    color: '#1f2937',
    fontSize: '28px',
    lineHeight: 1.2,
    fontWeight: '800'
  },

  statDescription: {
    color: '#9ca3af',
    fontSize: '11px',
    lineHeight: 1.5
  },

  sectionHeadingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },

  textLinkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#7e22ce',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },

  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '14px',
    marginTop: '4px'
  },

  quickAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    minWidth: 0,
    padding: '17px',
    border: '1px solid #eaecf0',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    color: '#6b7280',
    textAlign: 'left',
    cursor: 'pointer'
  },

  quickActionIcon: {
    width: '42px',
    height: '42px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '11px',
    backgroundColor: '#f3e8ff',
    color: '#7e22ce'
  },

  quickActionText: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: '5px',
    minWidth: 0
  },

  searchPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '12px',
    padding: '15px',
    backgroundColor: '#ffffff',
    border: '1px solid #eaecf0',
    borderRadius: '13px'
  },

  searchField: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
    padding: '0 12px',
    border: '1px solid #eaecf0',
    borderRadius: '9px',
    backgroundColor: '#ffffff'
  },

  searchInput: {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    padding: '12px 0',
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    backgroundColor: 'transparent',
    color: '#1f2937'
  },

  resultsHeading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px'
  },

  resultsCount: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '600'
  },

  clearFilters: {
    padding: '6px 0',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#7e22ce',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },

  reservasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px'
  },

  reservaCard: {
    backgroundColor: '#ffffff',
    borderRadius: '13px',
    padding: '18px',
    border: '1px solid #eaecf0',
    boxShadow: '0 2px 8px rgba(16,24,40,0.025)',
    minWidth: 0
  },

  reservaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    gap: '10px'
  },

  serviceName: {
    fontWeight: '700',
    fontSize: '14px',
    color: '#1f2937',
    overflowWrap: 'anywhere'
  },

  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '10px',
    fontWeight: '700',
    padding: '5px 9px',
    borderRadius: '7px',
    whiteSpace: 'nowrap'
  },

  providerName: {
    fontSize: '12px',
    color: '#7b8495',
    margin: '0 0 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },

  reservaDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '12px',
    color: '#7b8495',
    marginBottom: '13px'
  },

  reservaLocation: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '5px',
    color: '#7b8495',
    fontSize: '12px',
    lineHeight: 1.5,
    margin: '0 0 13px'
  },

  reservaFooter: {
    borderTop: '1px solid #f0f1f4',
    paddingTop: '13px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },

  price: {
    fontWeight: '800',
    color: '#6b21a8',
    fontSize: '13px'
  },

  priceCaption: {
    display: 'block',
    marginBottom: '4px',
    color: '#9ca3af',
    fontSize: '10px'
  },

  serviciosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '17px'
  },

  servicioCard: {
    backgroundColor: '#ffffff',
    borderRadius: '13px',
    padding: '19px',
    border: '1px solid #eaecf0',
    boxShadow: '0 2px 8px rgba(16,24,40,0.025)',
    display: 'flex',
    flexDirection: 'column',
    gap: '11px',
    minWidth: 0
  },

  serviceCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px'
  },

  serviceCardIcon: {
    width: '39px',
    height: '39px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    backgroundColor: '#f3e8ff',
    color: '#7e22ce'
  },

  cardCategory: {
    display: 'inline-flex',
    fontSize: '10px',
    fontWeight: '700',
    color: '#6b21a8',
    backgroundColor: '#f3e8ff',
    padding: '6px 9px',
    borderRadius: '7px',
    alignSelf: 'flex-start'
  },

  servicioTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0,
    overflowWrap: 'anywhere'
  },

  servicioProvider: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#7b8495',
    margin: 0
  },

  descripcionServicio: {
    margin: 0,
    color: '#7b8495',
    fontSize: '12px',
    lineHeight: 1.7,
    overflowWrap: 'anywhere'
  },

  serviceMetaList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
    paddingTop: '5px',
    color: '#7b8495',
    fontSize: '12px'
  },

  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    minWidth: 0,
    overflowWrap: 'anywhere'
  },

  metaSeparator: {
    color: '#d1d5db'
  },

  servicioCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: 'auto',
    borderTop: '1px solid #f0f1f4',
    paddingTop: '14px'
  },

  serviceCardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px'
  },

  btnView: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px'
  },

  btnReserve: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },

  btnBook: {
    alignSelf: 'center',
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },

  emptyState: {
    gridColumn: '1 / -1',
    backgroundColor: '#ffffff',
    border: '1px solid #eaecf0',
    borderRadius: '13px',
    padding: '38px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    textAlign: 'center'
  },

  emptyIcon: {
    width: '58px',
    height: '58px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '5px',
    borderRadius: '16px',
    backgroundColor: '#f3e8ff',
    color: '#7e22ce'
  },

  emptyTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#374151',
    margin: '4px 0 0'
  },

  emptyText: {
    fontSize: '12px',
    color: '#8a94a6',
    lineHeight: 1.6,
    margin: 0
  },

  errorText: {
    color: '#b91c1c',
    fontSize: '13px',
    lineHeight: 1.5,
    margin: '8px 0 0'
  },

  successText: {
    color: '#15803d',
    fontSize: '13px',
    lineHeight: 1.5,
    margin: '12px 0 0',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: '#f0fdf4'
  },

  reservationSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '19px 22px',
    border: '1px solid #ead5ff',
    borderRadius: '12px',
    backgroundColor: '#faf5ff'
  },

  summaryNumber: {
    display: 'block',
    marginTop: '7px',
    fontSize: '27px',
    fontWeight: '800',
    color: '#6b21a8'
  },

  profilePanel: {
    width: '100%',
    minWidth: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #eaecf0',
    borderRadius: '13px',
    padding: '20px',
    boxSizing: 'border-box'
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.52)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    overflowY: 'auto',
    backdropFilter: 'blur(3px)'
  },

  modal: {
    width: '100%',
    maxWidth: '490px',
    backgroundColor: '#ffffff',
    border: '1px solid #eaecf0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxSizing: 'border-box'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '21px'
  },

  modalTitle: {
    margin: 0,
    fontSize: '19px',
    lineHeight: 1.4,
    color: '#1f2937',
    fontWeight: '800'
  },

  modalServiceTitle: {
    margin: 0,
    fontSize: '21px',
    color: '#1f2937',
    fontWeight: '800',
    overflowWrap: 'anywhere'
  },

  btnClose: {
    flexShrink: 0,
    border: 'none',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    width: '35px',
    height: '35px',
    borderRadius: '9px',
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
    gap: '6px',
    color: '#374151',
    fontSize: '14px',
    minWidth: 0
  },

  infoLabel: {
    color: '#8a94a6',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },

  infoValue: {
    color: '#374151',
    fontSize: '13px',
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  },

  infoRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px'
  },

  modalPrice: {
    color: '#6b21a8',
    fontSize: '18px',
    fontWeight: '800'
  },

  descripcionModal: {
    margin: 0,
    color: '#7b8495',
    fontSize: '13px',
    lineHeight: 1.7,
    overflowWrap: 'anywhere'
  },

  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
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

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  actionInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    font: 'inherit',
    fontSize: '13px',
    color: '#374151',
    backgroundColor: '#ffffff'
  },

  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: '700',
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
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },

  btnModalClose: {
    width: '100%',
    marginTop: '23px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '9px',
    padding: '11px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  }
};