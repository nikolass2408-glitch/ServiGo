import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Clock,
  MapPin,
  User,
  LogOut,
  Eye,
  X
} from 'lucide-react';

import { serviciosMock, reservasMock } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import ModalAgendar from '../../components/ModalAgendar';

export default function DashboardCliente() {
  const { user, logout } = useAuth();

  const [servicios] = useState(serviciosMock);
  const [reservas, setReservas] = useState(reservasMock);

  // Servicio que se va a agendar
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  // Reserva que el usuario quiere consultar
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  // Servicio que el usuario quiere consultar
  const [servicioVisto, setServicioVisto] = useState(null);

  // Cuando se crea una nueva reserva
  const handleNuevaReserva = (nuevaReserva) => {
    setReservas([nuevaReserva, ...reservas]);
  };

  return (
    <div style={styles.container}>

      {/* =========================
          BARRA SUPERIOR
      ========================== */}
      <header style={styles.navbar}>

        <div style={styles.logoContainer}>
          <div style={styles.logoBadge}>S</div>
          <span style={styles.logoText}>ServiGo</span>
        </div>

        <div style={styles.userMenu}>
          <span style={styles.userName}>
            Hola, {user?.nombre || 'Cliente'}
          </span>

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
      <main style={styles.content}>

        {/* =========================
            MIS RESERVAS ACTIVAS
        ========================== */}
        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            <Calendar size={20} color="#6b21a8" />
            Mis reservas activas
          </h2>

          <div style={styles.reservasGrid}>

            {reservas.length === 0 ? (

              <div style={styles.emptyState}>
                <Calendar size={30} color="#9ca3af" />

                <p style={styles.emptyTitle}>
                  No tienes reservas activas
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
                      onClick={() => setReservaSeleccionada(item)}
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

      </main>


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


            {/* BOTÓN CERRAR */}
            <button
              style={styles.btnModalClose}
              onClick={() => setReservaSeleccionada(null)}
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

  logoBadge: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '16px',
    padding: '4px 10px',
    borderRadius: '6px'
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
