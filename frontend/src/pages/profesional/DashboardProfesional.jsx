import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  Eye,
  LogOut,
  X,
  User,
  Phone
} from 'lucide-react';

import { bookingService } from '../../services/bookingService';

export default function DashboardProfesional() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await bookingService.getReservas();

      console.log('RESERVAS DEL BACKEND:', data);

      setCitas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('ERROR RESERVAS:', error);

      setError(
        error.response?.data?.message ||
        error.message ||
        'Error cargando las reservas'
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmarReserva = async (id) => {
    try {
      await bookingService.confirmarReserva(id);

      await cargarReservas();
    } catch (error) {
      console.error('ERROR CONFIRMANDO:', error);

      setError(
        error.response?.data?.message ||
        'No se pudo confirmar la reserva'
      );
    }
  };

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
    (cita) =>
      cita.estado !== 'Cancelada' &&
      cita.estado !== 'Rechazada' &&
      cita.estado !== 'Completada'
  ).length;

  const pendientes = citas.filter(
    (cita) => cita.estado === 'Pendiente'
  ).length;

  const ingresos = citas
    .filter(
      (cita) =>
        cita.estado !== 'Cancelada' &&
        cita.estado !== 'Rechazada'
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
          <div style={styles.logoBadge}>S</div>

          <span style={styles.logoText}>
            ServiGo Pro
          </span>
        </div>

        <div style={styles.userMenu}>

          <span style={styles.userName}>
            Barbería El Elegante
          </span>

          <Link
            to="/"
            style={styles.btnLogout}
          >
            <LogOut size={16} />
            Salir
          </Link>

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
                              cita.estado === 'Confirmada'
                                ? '#dcfce7'
                                : '#fef3c7',

                            color:
                              cita.estado === 'Confirmada'
                                ? '#15803d'
                                : '#b45309'
                          }}
                        >
                          {cita.estado}
                        </span>

                      </td>

                      <td style={styles.td}>

                        <div style={styles.actions}>

                          {cita.estado === 'Pendiente' && (

                            <button
                              type="button"
                              style={styles.confirmar}
                              onClick={() =>
                                confirmarReserva(cita._id)
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
                              setReservaSeleccionada(cita)
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

  logoBadge: {
    backgroundColor: '#6b21a8',
    color: '#fff',
    fontWeight: 'bold',
    padding: '6px 10px',
    borderRadius: '6px'
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
    textDecoration: 'none'
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
    overflow: 'hidden'
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
  }
};
