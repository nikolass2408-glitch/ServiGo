import React from 'react';
// Importamos los íconos para la sección de beneficios inferiores
import { Calendar, Clock, Users, Bell, Smartphone, ArrowRight } from 'lucide-react';

export default function BannerProfesionales() {
  // Lista de características principales con sus íconos
  const caracteristicas = [
    { id: 1, icon: <Calendar size={22} color="#6b21a8" />, titulo: 'Reservas fáciles' },
    { id: 2, icon: <Clock size={22} color="#6b21a8" />, titulo: 'Horarios organizados' },
    { id: 3, icon: <Users size={22} color="#6b21a8" />, titulo: 'Gestión de clientes' },
    { id: 4, icon: <Bell size={22} color="#6b21a8" />, titulo: 'Notificaciones' },
    { id: 5, icon: <Smartphone size={22} color="#6b21a8" />, titulo: 'Acceso desde cualquier dispositivo' }
  ];

  return (
    <section style={styles.section}>
      
      {/* TARJETA MORADA PRINCIPAL - LLAMADO PARA PROFESIONALES */}
      <div style={styles.bannerCard}>
        
        {/* Lado izquierdo: Textos y botón */}
        <div style={styles.bannerTextContent}>
          <span style={styles.badgePro}>Para profesionales</span>
          <h2 style={styles.bannerTitle}>Haz crecer tu negocio con ServiGo</h2>
          <p style={styles.bannerSubtitle}>
            Organiza tus servicios, horarios, clientes y reservas desde un solo lugar.
          </p>
          <button style={styles.btnCreateProfile}>
            Crear mi perfil profesional <ArrowRight size={16} />
          </button>
        </div>

        {/* Lado derecho: Vista previa simulada de la Dashboard del profesional */}
        <div style={styles.previewContainer}>
          <div style={styles.dashboardMockup}>
            <div style={styles.mockupHeader}>
              <span style={styles.mockupLogo}>S ServiGo</span>
            </div>
            <div style={styles.mockupBody}>
              <p style={styles.mockupTitle}>Tus reservas</p>
              <div style={styles.reservationItem}>
                <span>👤 Corte de cabello</span>
                <span style={styles.statusConfirmed}>10:00 a.m. • Confirmada</span>
              </div>
              <div style={styles.reservationItem}>
                <span>👤 Manicura</span>
                <span style={styles.statusConfirmed}>12:00 p.m. • Confirmada</span>
              </div>
              <div style={styles.reservationItem}>
                <span>👤 Masaje relajante</span>
                <span style={styles.statusPending}>3:00 p.m. • Pendiente</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECCIÓN INFERIOR: CARACTERÍSTICAS / BENEFICIOS */}
      <div style={styles.featuresHeader}>
        <h3 style={styles.featuresMainTitle}>Todo lo que necesitas para organizar tus citas.</h3>
      </div>

      <div style={styles.featuresGrid}>
        {caracteristicas.map((item) => (
          <div key={item.id} style={styles.featureCard}>
            <div style={styles.featureIconCircle}>
              {item.icon}
            </div>
            <span style={styles.featureTitle}>{item.titulo}</span>
          </div>
        ))}
      </div>

    </section>
  );
}

// ESTILOS DE LA SECCIÓN
const styles = {
  section: {
    padding: '60px 40px',
    backgroundColor: '#ffffff',
    fontFamily: 'sans-serif'
  },
  bannerCard: {
    backgroundColor: '#6b21a8', // Color morado institucional
    borderRadius: '24px',
    padding: '48px',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1000px',
    margin: '0 auto 60px auto',
    gap: '32px',
    flexWrap: 'wrap'
  },
  bannerTextContent: {
    flex: '1',
    minWidth: '280px'
  },
  badgePro: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 12px',
    borderRadius: '16px',
    display: 'inline-block',
    marginBottom: '16px'
  },
  bannerTitle: {
    fontSize: '32px',
    fontWeight: '800',
    margin: '0 0 12px 0',
    lineHeight: '1.2'
  },
  bannerSubtitle: {
    fontSize: '15px',
    color: '#e9d5ff',
    margin: '0 0 24px 0',
    lineHeight: '1.5'
  },
  btnCreateProfile: {
    backgroundColor: '#ffffff',
    color: '#6b21a8',
    border: 'none',
    borderRadius: '24px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  previewContainer: {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    minWidth: '280px'
  },
  dashboardMockup: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    width: '100%',
    maxWidth: '320px',
    color: '#1f2937',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },
  mockupHeader: {
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '8px',
    marginBottom: '12px',
    fontWeight: 'bold',
    color: '#6b21a8',
    fontSize: '14px'
  },
  mockupLogo: {
    display: 'inline-block'
  },
  mockupBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  mockupTitle: {
    margin: '0 0 4px 0',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#374151'
  },
  reservationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    padding: '6px 8px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px'
  },
  statusConfirmed: {
    color: '#059669',
    fontWeight: '600'
  },
  statusPending: {
    color: '#d97706',
    fontWeight: '600'
  },
  featuresHeader: {
    textAlign: 'center',
    marginBottom: '36px'
  },
  featuresMainTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1f2937'
  },
  featuresGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    flexWrap: 'wrap',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '140px',
    textAlign: 'center'
  },
  featureIconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: '#f3e8ff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  featureTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4b5563',
    lineHeight: '1.3'
  }
};