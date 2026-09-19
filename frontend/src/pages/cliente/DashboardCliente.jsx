import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Clock, MapPin, User, LogOut } from 'lucide-react';
import { serviciosMock, reservasMock } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import ModalAgendar from '../../components/ModalAgendar'; // 1. Importamos el modal

export default function DashboardCliente() {
  const { user, logout } = useAuth();
  const [servicios] = useState(serviciosMock);
  const [reservas, setReservas] = useState(reservasMock);
  
  // Estado para controlar qué servicio se va a agendar en el modal
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const handleNuevaReserva = (nuevaReserva) => {
    setReservas([nuevaReserva, ...reservas]);
  };

  return (
    <div style={styles.container}>
      
      {/* BARRA SUPERIOR */}
      <header style={styles.navbar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBadge}>S</div>
          <span style={styles.logoText}>ServiGo</span>
        </div>
        <div style={styles.userMenu}>
          <span style={styles.userName}>Hola, {user?.nombre || 'Cliente'}</span>
          <button onClick={logout} style={styles.btnLogout}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={styles.content}>
        
        {/* SECCIÓN 1: MIS RESERVAS ACTIVAS */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Calendar size={20} color="#6b21a8" /> Mis reservas activas
          </h2>

          <div style={styles.reservasGrid}>
            {reservas.map((item) => (
              <div key={item.id} style={styles.reservaCard}>
                <div style={styles.reservaHeader}>
                  <span style={styles.serviceName}>{item.servicio}</span>
                  <span 
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: item.estado === 'Confirmada' ? '#dcfce7' : '#fef3c7',
                      color: item.estado === 'Confirmada' ? '#15803d' : '#b45309'
                    }}
                  >
                    {item.estado}
                  </span>
                </div>
                <p style={styles.providerName}><User size={14} /> {item.profesional}</p>
                <div style={styles.reservaDetails}>
                  <span><Calendar size={14} /> {item.fecha}</span>
                  <span><Clock size={14} /> {item.hora}</span>
                </div>
                <div style={styles.reservaFooter}>
                  <span style={styles.price}>${item.precio.toLocaleString()} COP</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN 2: CATÁLOGO DE SERVICIOS */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Search size={20} color="#6b21a8" /> Explorar nuevos servicios
          </h2>

          <div style={styles.serviciosGrid}>
            {servicios.map((servicio) => (
              <div key={servicio.id} style={styles.servicioCard}>
                <div style={styles.cardCategory}>{servicio.categoria}</div>
                <h3 style={styles.servicioTitle}>{servicio.nombre}</h3>
                <p style={styles.servicioProvider}>{servicio.profesional}</p>
                <p style={styles.servicioMeta}>
                  <MapPin size={14} /> {servicio.ubicacion} • <Clock size={14} /> {servicio.duracion}
                </p>
                <div style={styles.servicioCardFooter}>
                  <span style={styles.price}>${servicio.precio.toLocaleString()} COP</span>
                  <button 
                    style={styles.btnBook}
                    onClick={() => setServicioSeleccionado(servicio)}
                  >
                    Agendar cita
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* RENDERIZADO DEL MODAL CUANDO HAY UN SERVICIO SELECCIONADO */}
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

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoBadge: { backgroundColor: '#6b21a8', color: '#ffffff', fontWeight: 'bold', fontSize: '16px', padding: '4px 10px', borderRadius: '6px' },
  logoText: { fontSize: '20px', fontWeight: 'bold', color: '#1f2937' },
  userMenu: { display: 'flex', alignItems: 'center', gap: '16px' },
  userName: { fontSize: '14px', fontWeight: '600', color: '#374151' },
  btnLogout: { display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', backgroundColor: 'transparent', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  content: { maxWidth: '1000px', margin: '32px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '40px' },
  section: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  reservasGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  reservaCard: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  reservaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  serviceName: { fontWeight: '700', fontSize: '15px', color: '#1f2937' },
  statusBadge: { fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px' },
  providerName: { fontSize: '13px', color: '#4b5563', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '4px' },
  reservaDetails: { display: 'flex', gap: '12px', fontSize: '12px', color: '#6b7280', marginBottom: '12px' },
  reservaFooter: { borderTop: '1px solid #f3f4f6', paddingTop: '8px' },
  price: { fontWeight: '700', color: '#6b21a8', fontSize: '14px' },
  serviciosGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  servicioCard: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardCategory: { fontSize: '11px', fontWeight: '600', color: '#6b21a8', backgroundColor: '#f3e8ff', padding: '2px 8px', borderRadius: '10px', alignSelf: 'flex-start' },
  servicioTitle: { fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: 0 },
  servicioProvider: { fontSize: '13px', color: '#4b5563', margin: 0 },
  servicioMeta: { fontSize: '12px', color: '#6b7280', margin: '4px 0 12px 0' },
  servicioCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid #f3f4f6', paddingTop: '12px' },
  btnBook: { backgroundColor: '#6b21a8', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }
};