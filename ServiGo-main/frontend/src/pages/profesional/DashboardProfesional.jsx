import { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Eye,
  LogOut,
  X,
  User,
  Phone,
  RefreshCw,
  Ban
} from 'lucide-react';

import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import PerfilPanel from '../../components/PerfilPanel';
import ProfessionalWorkspace from '../../components/ProfessionalWorkspace';
import BrandMark from '../../components/BrandMark';

const normalizarCita = (cita) => {
  const estadoCode = String(cita.estado || 'PENDIENTE').toUpperCase();
  const estados = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    CANCELADA: 'Cancelada',
    COMPLETADA: 'Completada',
    REPROGRAMADA: 'Reprogramada',
    RECHAZADA: 'Rechazada'
  };
  return { ...cita, estadoCode, estado: estados[estadoCode] || estadoCode };
};

export default function DashboardProfesional() {
  const { user, logout } = useAuth();
  const [profileRevision, setProfileRevision] = useState(0);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [accionEnCurso, setAccionEnCurso] = useState('');
  const [errorAccion, setErrorAccion] = useState('');
  const [mensajeAccion, setMensajeAccion] = useState('');
  const [mostrarReprogramacion, setMostrarReprogramacion] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [fechaMinima] = useState(() => {
    const fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
    return fecha.toISOString().slice(0, 10);
  });

  useEffect(() => {
    let activo = true;
    bookingService.getReservas()
      .then((data) => {
        if (activo) setCitas(Array.isArray(data) ? data.map(normalizarCita) : []);
      })
      .catch((error) => {
        if (activo) {
          setError(
            error.response?.data?.error ||
            error.message ||
            'Error cargando las reservas'
          );
        }
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const ejecutarAccionReserva = async (accion, cita = reservaSeleccionada, datos = {}) => {
    if (!cita) return;

    setAccionEnCurso(accion);
    setErrorAccion('');
    setMensajeAccion('');
    setError('');

    try {
      let respuesta;
      if (accion === 'confirmar') {
        respuesta = await bookingService.confirmarReserva(cita._id);
      } else if (accion === 'rechazar') {
        respuesta = await bookingService.rechazarReserva(cita._id);
      } else if (accion === 'completar') {
        respuesta = await bookingService.completarReserva(cita._id);
      } else if (accion === 'cancelar') {
        respuesta = await bookingService.cancelarReserva(cita._id);
      } else {
        respuesta = await bookingService.reprogramarReserva(
          cita._id,
          datos.fecha,
          datos.hora
        );
      }

      const actualizada = normalizarCita(respuesta);
      setCitas((actuales) => actuales.map((item) =>
        item._id === actualizada._id ? actualizada : item
      ));
      if (reservaSeleccionada?._id === actualizada._id) {
        setReservaSeleccionada(actualizada);
      }
      setMostrarReprogramacion(false);
      setMensajeAccion(
        accion === 'confirmar'
          ? 'Cita confirmada.'
          : accion === 'rechazar'
            ? 'Solicitud rechazada.'
            : accion === 'completar'
              ? 'Cita marcada como completada.'
          : accion === 'cancelar'
            ? 'Cita cancelada.'
            : 'Cita reprogramada.'
      );
    } catch (error) {
      const mensaje = error.response?.data?.error || 'No se pudo actualizar la cita.';
      if (reservaSeleccionada?._id === cita._id) setErrorAccion(mensaje);
      else setError(mensaje);
    } finally {
      setAccionEnCurso('');
    }
  };

  const confirmarReserva = (cita) => ejecutarAccionReserva('confirmar', cita);

  const abrirReserva = (cita) => {
    setReservaSeleccionada(cita);
    setErrorAccion('');
    setMensajeAccion('');
    setMostrarReprogramacion(false);
  };

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
    ejecutarAccionReserva('reprogramar', reservaSeleccionada, {
      fecha: nuevaFecha,
      hora: nuevaHora
    });
  };

  const citasActivas = ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(
    reservaSeleccionada?.estadoCode
  );

  const obtenerNombreCliente = (cita) => {
    const cliente = cita?.cliente;

    if (!cliente) {
      return 'Cliente no disponible';
    }

    const nombre = cliente.firstName || '';
    const apellido = cliente.lastName || '';

    return (
      `${nombre} ${apellido}`.trim() ||
      cliente.username ||
      'Cliente'
    );
  };

  const obtenerTelefono = (cita) => {
    return cita?.cliente?.telefono || 'No registrado';
  };

  const reservasActivas = citas.filter(
    (cita) => ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(cita.estadoCode)
  ).length;

  const pendientes = citas.filter(
    (cita) => cita.estadoCode === 'PENDIENTE'
  ).length;

  const ingresos = citas
    .filter(
      (cita) => cita.estadoCode === 'COMPLETADA'
    )
    .reduce((total, cita) => {
      return (
        total +
        Number(
          cita.precio ||
          cita.servicio?.precio ||
          0
        )
      );
    }, 0);

  return (
    <div style={styles.container}>

      {/* NAVBAR */}
      <header style={styles.navbar}>

        <div style={styles.logoContainer}>
          <BrandMark size={36} />

          <span style={styles.logoText}>
            ServiGo Pro
          </span>
        </div>

        <div style={styles.userMenu}>

          <span style={styles.userName}>
            {user?.firstName || 'Profesional'}
          </span>

          <button type="button" onClick={logout} style={styles.btnLogout}>
            <LogOut size={16} />
            Salir
          </button>

        </div>

      </header>


      {/* CONTENIDO */}

      <main style={styles.content}>

        <div>
          <h1 style={styles.mainTitle}>
            Panel de Gestión
          </h1>

          <p style={styles.mainSubtitle}>
            Administra tus servicios y atiende tus próximas reservas.
          </p>
        </div>

        <PerfilPanel profesional onSaved={() => setProfileRevision((revision) => revision + 1)} />
        <ProfessionalWorkspace key={profileRevision} user={user} />

        {/* ERROR */}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}


        {/* MÉTRICAS */}

        <div style={styles.metrics}>

          <div style={styles.card}>

            <Calendar
              size={30}
              color="#6b21a8"
            />

            <div>
              <span style={styles.label}>
                Reservas Activas
              </span>

              <strong style={styles.number}>
                {loading ? '...' : reservasActivas}
              </strong>
            </div>

          </div>


          <div style={styles.card}>

            <CheckCircle
              size={30}
              color="#15803d"
            />

            <div>
              <span style={styles.label}>
                Pendientes
              </span>

              <strong style={styles.number}>
                {loading ? '...' : pendientes}
              </strong>
            </div>

          </div>


          <div style={styles.card}>

            <div>
              <span style={styles.label}>
                Ingresos estimados
              </span>

              <strong style={styles.number}>
                ${loading ? '...' : ingresos.toLocaleString()} COP
              </strong>
            </div>

          </div>

        </div>


        {/* TABLA */}

        <section>

          <h2 style={styles.sectionTitle}>
            Agenda de Citas
          </h2>


          <div style={styles.tableContainer}>

            {loading ? (

              <div style={styles.message}>
                Cargando reservas...
              </div>

            ) : citas.length === 0 ? (

              <div style={styles.message}>
                No hay reservas para mostrar.
              </div>

            ) : (

              <table style={styles.table}>

                <thead>

                  <tr>
                    <th style={styles.th}>
                      Servicio
                    </th>

                    <th style={styles.th}>
                      Fecha
                    </th>

                    <th style={styles.th}>
                      Hora
                    </th>

                    <th style={styles.th}>
                      Precio
                    </th>

                    <th style={styles.th}>
                      Estado
                    </th>

                    <th style={styles.th}>
                      Acciones
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {citas.map((cita) => (

                    <tr key={cita._id}>

                      <td style={styles.td}>
                        {cita.servicio?.nombre || 'Sin servicio'}
                      </td>

                      <td style={styles.td}>
                        {cita.fecha}
                      </td>

                      <td style={styles.td}>
                        {cita.hora}
                      </td>

                      <td style={styles.td}>
                        $
                        {Number(
                          cita.precio ||
                          cita.servicio?.precio ||
                          0
                        ).toLocaleString()}
                      </td>

                      <td style={styles.td}>

                        <span
                          style={{
                            ...styles.estado,

                            backgroundColor:
                              cita.estadoCode === 'CONFIRMADA'
                                ? '#dcfce7'
                                : '#fef3c7',

                            color:
                              cita.estadoCode === 'CONFIRMADA'
                                ? '#15803d'
                                : '#b45309'
                          }}
                        >
                          {cita.estado}
                        </span>

                      </td>

                      <td style={styles.td}>

                        <div style={styles.actions}>

                          {cita.estadoCode === 'PENDIENTE' && (

                            <button
                              type="button"
                              style={styles.confirmar}
                              onClick={() =>
                                confirmarReserva(cita)
                              }
                            >
                              <CheckCircle size={14} />
                              Confirmar
                            </button>

                          )}

                          <button
                            type="button"
                            style={styles.ver}
                            onClick={() =>
                              abrirReserva(cita)
                            }
                          >
                            <Eye size={14} />
                            Ver
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </section>

      </main>


      {/* MODAL */}

      {reservaSeleccionada && (

        <div
          style={styles.overlay}
          onClick={() => setReservaSeleccionada(null)}
        >

          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >

            <div style={styles.modalHeader}>

              <div>
                <h2 style={styles.modalTitle}>
                  Información del cliente
                </h2>

                <p style={styles.modalSubtitle}>
                  Persona que realizó la reserva
                </p>
              </div>

              <button
                type="button"
                style={styles.close}
                aria-label="Cerrar información de la cita"
                onClick={() =>
                  setReservaSeleccionada(null)
                }
              >
                <X size={20} />
              </button>

            </div>


            <div style={styles.modalBody}>

              {/* NOMBRE */}

              <div style={styles.info}>

                <User
                  size={20}
                  color="#6b21a8"
                />

                <div>

                  <span style={styles.infoLabel}>
                    Nombre
                  </span>

                  <strong>
                    {obtenerNombreCliente(
                      reservaSeleccionada
                    )}
                  </strong>

                </div>

              </div>


              {/* TELÉFONO */}

              <div style={styles.info}>

                <Phone
                  size={20}
                  color="#6b21a8"
                />

                <div>

                  <span style={styles.infoLabel}>
                    Teléfono
                  </span>

                  <strong>
                    {obtenerTelefono(
                      reservaSeleccionada
                    )}
                  </strong>

                </div>

              </div>


              {/* RESERVA */}

              <div style={styles.reservaInfo}>

                <h3>
                  Información de la reserva
                </h3>

                <p>
                  <strong>Servicio:</strong>{' '}
                  {reservaSeleccionada.servicio?.nombre}
                </p>

                <p>
                  <strong>Fecha:</strong>{' '}
                  {reservaSeleccionada.fecha}
                </p>

                <p>
                  <strong>Hora:</strong>{' '}
                  {reservaSeleccionada.hora}
                </p>

                <p>
                  <strong>Estado:</strong>{' '}
                  {reservaSeleccionada.estado}
                </p>

              </div>

              {errorAccion && <p role="alert" style={styles.actionError}>{errorAccion}</p>}
              {mensajeAccion && <p role="status" style={styles.actionSuccess}>{mensajeAccion}</p>}

              {mostrarReprogramacion ? (
                <form onSubmit={enviarReprogramacion} style={styles.reprogramForm}>
                  <label style={styles.formField}>
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
                  <label style={styles.formField}>
                    <span style={styles.infoLabel}>Nueva hora</span>
                    <input
                      type="time"
                      value={nuevaHora}
                      onChange={(event) => setNuevaHora(event.target.value)}
                      required
                      style={styles.actionInput}
                    />
                  </label>
                  <div style={styles.modalActions}>
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
                <div style={styles.modalActions}>
                  {['PENDIENTE', 'REPROGRAMADA'].includes(reservaSeleccionada.estadoCode) && (
                    <button
                      type="button"
                      style={{ ...styles.actionButton, ...styles.actionPrimary }}
                      onClick={() => ejecutarAccionReserva('confirmar')}
                      disabled={Boolean(accionEnCurso)}
                    >
                      <CheckCircle size={15} />
                      {accionEnCurso === 'confirmar' ? 'Confirmando...' : 'Confirmar cita'}
                    </button>
                  )}
                  {['PENDIENTE', 'REPROGRAMADA'].includes(reservaSeleccionada.estadoCode) && (
                    <button
                      type="button"
                      style={{ ...styles.actionButton, ...styles.actionDanger }}
                      onClick={() => ejecutarAccionReserva('rechazar')}
                      disabled={Boolean(accionEnCurso)}
                    >
                      <X size={15} />
                      {accionEnCurso === 'rechazar' ? 'Rechazando...' : 'Rechazar'}
                    </button>
                  )}
                  {reservaSeleccionada.estadoCode === 'CONFIRMADA' && (
                    <button
                      type="button"
                      style={{ ...styles.actionButton, ...styles.actionPrimary }}
                      onClick={() => ejecutarAccionReserva('completar')}
                      disabled={Boolean(accionEnCurso)}
                    >
                      <CheckCircle size={15} />
                      {accionEnCurso === 'completar' ? 'Actualizando...' : 'Marcar completada'}
                    </button>
                  )}
                  {citasActivas && (
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

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


const styles = {

  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'Arial, sans-serif'
  },

  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb'
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  logoText: {
    fontSize: '20px',
    fontWeight: 'bold'
  },

  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  userName: {
    fontSize: '14px',
    fontWeight: '600'
  },

  btnLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#ef4444',
    background: 'transparent',
    border: 0,
    cursor: 'pointer'
  },

  content: {
    maxWidth: '1100px',
    margin: '30px auto',
    padding: '0 20px'
  },

  mainTitle: {
    margin: 0,
    fontSize: '28px',
    color: '#1f2937'
  },

  mainSubtitle: {
    color: '#6b7280'
  },

  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '15px',
    borderRadius: '8px',
    margin: '20px 0'
  },

  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    margin: '25px 0'
  },

  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },

  label: {
    display: 'block',
    color: '#6b7280',
    fontSize: '13px'
  },

  number: {
    display: 'block',
    marginTop: '5px',
    fontSize: '20px'
  },

  sectionTitle: {
    fontSize: '20px',
    color: '#1f2937'
  },

  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },

  th: {
    padding: '14px',
    textAlign: 'left',
    backgroundColor: '#f9fafb',
    color: '#4b5563'
  },

  td: {
    padding: '14px',
    borderTop: '1px solid #f3f4f6'
  },

  estado: {
    padding: '5px 9px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },

  actions: {
    display: 'flex',
    gap: '8px'
  },

  confirmar: {
    backgroundColor: '#15803d',
    color: '#fff',
    border: 'none',
    padding: '7px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },

  ver: {
    backgroundColor: '#6b21a8',
    color: '#fff',
    border: 'none',
    padding: '7px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },

  message: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280'
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  },

  modal: {
    width: '90%',
    maxWidth: '480px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },

  modalHeader: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e5e7eb'
  },

  modalTitle: {
    margin: 0
  },

  modalSubtitle: {
    color: '#6b7280',
    fontSize: '13px'
  },

  close: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer'
  },

  modalBody: {
    padding: '20px'
  },

  info: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '12px'
  },

  infoLabel: {
    display: 'block',
    color: '#6b7280',
    fontSize: '12px',
    marginBottom: '3px'
  },

  reservaInfo: {
    backgroundColor: '#f9fafb',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px'
  },

  modalActions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '16px'
  },

  reprogramForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px'
  },

  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  actionInput: {
    boxSizing: 'border-box',
    width: '100%',
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
    color: '#fff'
  },

  actionSecondary: {
    backgroundColor: '#f3e8ff',
    color: '#581c87'
  },

  actionDanger: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c'
  },

  actionError: {
    color: '#b91c1c',
    fontSize: '13px'
  },

  actionSuccess: {
    color: '#15803d',
    fontSize: '13px'
  }
};
