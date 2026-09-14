import React from 'react';

// Exportamos el componente Hero para usarlo en la página principal
export default function Hero() {
  return (
    // <section>: Contenedor principal del banner con un degradado de fondo suave
    <section style={styles.container}>
      
      {/* COLUMNA IZQUIERDA: Textos y Botones de Acción */}
      <div style={styles.leftColumn}>
        
        {/* Píldora / Badge superior decorativo */}
        <div style={styles.badge}>
          Tu cita, en un solo lugar
        </div>

        {/* Título Principal */}
        <h1 style={styles.title}>
          Agenda tu próximo <br />
          <span style={styles.titleHighlight}>servicio, fácil y rápido.</span>
        </h1>

        {/* Subtítulo descriptivo */}
        <p style={styles.subtitle}>
          Encuentra profesionales, consulta sus servicios <br />
          y reserva tu cita en pocos minutos.
        </p>

        {/* Botones de acción principales */}
        <div style={styles.buttonGroup}>
          {/* Botón principal morado */}
          <button style={styles.btnPrimary}>
            🔍 Buscar un servicio
          </button>
          
          {/* Botón secundario con borde */}
          <button style={styles.btnSecondary}>
            Soy profesional
          </button>
        </div>
      </div>

      {/* COLUMNA DERECHA: Tarjeta Ilustrativa de la App/Reserva */}
      <div style={styles.rightColumn}>
        <div style={styles.cardPreview}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLogo}>S ServiGo</span>
            <span style={styles.cardStatus}>Tu próxima cita</span>
          </div>
          
          <div style={styles.cardBody}>
            <h3 style={styles.serviceTitle}>Corte de cabello</h3>
            <p style={styles.providerName}>Barbería Premium</p>
            <p style={styles.timeInfo}>📅 Sáb, 14 de sep • 10:00 a.m.</p>
            <span style={styles.confirmedBadge}>Confirmada</span>
          </div>
        </div>
      </div>

    </section>
  );
}

// OBJETO DE ESTILOS CSS
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '60px 80px',
    backgroundColor: '#faf5ff', // Fondo morado muy claro
    fontFamily: 'sans-serif',
    minHeight: '420px'
  },
  
  leftColumn: {
    maxWidth: '550px'
  },
  
  // Etiqueta flotante morada
  badge: {
    display: 'inline-block',
    backgroundColor: '#f3e8ff',
    color: '#7e22ce',
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 14px',
    borderRadius: '20px',
    marginBottom: '16px'
  },
  
  title: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#1e1b4b',
    lineHeight: '1.2',
    marginBottom: '16px'
  },
  
  titleHighlight: {
    color: '#6b21a8' // Resaltado en morado ServiGo
  },
  
  subtitle: {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.5',
    marginBottom: '28px'
  },
  
  buttonGroup: {
    display: 'flex',
    gap: '16px'
  },
  
  btnPrimary: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '24px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  
  btnSecondary: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1.5px solid #d1d5db',
    borderRadius: '24px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  
  rightColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // Vista previa simulada de la tarjeta de cita
  cardPreview: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(107, 33, 168, 0.15)',
    width: '280px',
    border: '1px solid #f3e8ff'
  },
  
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '12px',
    marginBottom: '16px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#6b21a8'
  },
  
  cardStatus: {
    color: '#6b7280',
    fontWeight: 'normal'
  },
  
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  
  serviceTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#111827'
  },
  
  providerName: {
    margin: 0,
    fontSize: '13px',
    color: '#6b7280'
  },
  
  timeInfo: {
    margin: '8px 0',
    fontSize: '12px',
    color: '#4b5563',
    fontWeight: '500'
  },
  
  confirmedBadge: {
    display: 'inline-block',
    backgroundColor: '#f3e8ff',
    color: '#6b21a8',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '12px',
    alignSelf: 'flex-start'
  }
};