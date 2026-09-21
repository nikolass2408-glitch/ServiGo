import React from 'react';

// Componente principal del Hero
export default function Hero() {
  return (
    <section style={styles.container}>

      {/* COLUMNA IZQUIERDA: Textos y botones */}
      <div style={styles.leftColumn}>

        {/* Badge superior */}
        <div style={styles.badge}>
          Tu cita, en un solo lugar
        </div>

        {/* Título principal */}
        <h1 style={styles.title}>
          Agenda tu próximo <br />
          <span style={styles.titleHighlight}>
            servicio, fácil y rápido.
          </span>
        </h1>

        {/* Descripción */}
        <p style={styles.subtitle}>
          Encuentra profesionales, consulta sus servicios <br />
          y reserva tu cita en pocos minutos.
        </p>

        {/* Botones */}
        <div style={styles.buttonGroup}>

          {/* Botón principal */}
          <button style={styles.btnPrimary}>
            🔍 Buscar un servicio
          </button>

          {/* Botón secundario */}
          <button style={styles.btnSecondary}>
            Soy profesional
          </button>

        </div>

      </div>

    </section>
  );
}


// ===============================
// ESTILOS
// ===============================

const styles = {

  // Contenedor principal
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '60px 80px',
    backgroundColor: '#faf5ff',
    fontFamily: 'sans-serif',
    minHeight: '420px'
  },

  // Columna del contenido
  leftColumn: {
    maxWidth: '550px'
  },

  // Badge
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

  // Título
  title: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#1e1b4b',
    lineHeight: '1.2',
    marginBottom: '16px',
    marginTop: 0
  },

  // Parte morada del título
  titleHighlight: {
    color: '#6b21a8'
  },

  // Subtítulo
  subtitle: {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.5',
    marginBottom: '28px'
  },

  // Contenedor de botones
  buttonGroup: {
    display: 'flex',
    gap: '16px'
  },

  // Botón principal
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

  // Botón secundario
  btnSecondary: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1.5px solid #d1d5db',
    borderRadius: '24px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  }

};
