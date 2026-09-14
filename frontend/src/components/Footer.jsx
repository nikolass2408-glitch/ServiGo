import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        
        {/* LADO IZQUIERDO: Logo y Lema */}
        <div style={styles.brandColumn}>
          <div style={styles.logoContainer}>
            <div style={styles.logoBadge}>S</div>
            <span style={styles.logoText}>ServiGo</span>
          </div>
          <p style={styles.tagline}>Agenda. Reserva. Listo.</p>
        </div>

        {/* LADO DERECHO: Links de navegación */}
        <div style={styles.linksColumn}>
          <a href="#inicio" style={styles.link}>Inicio</a>
          <a href="#servicios" style={styles.link}>Explorar servicios</a>
          <a href="#funciona" style={styles.link}>¿Cómo funciona?</a>
          <a href="#contacto" style={styles.link}>Contacto</a>
        </div>

      </div>

      {/* LÍNEA INFERIOR DE DERECHOS DE AUTOR */}
      <div style={styles.copyrightBar}>
        <p style={styles.copyrightText}>
          © 2025 ServiGo. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

// ESTILOS DE LA SECCIÓN
const styles = {
  footer: {
    backgroundColor: '#3b0764', // Morado muy oscuro profesional
    color: '#ffffff',
    padding: '48px 40px 24px 40px',
    fontFamily: 'sans-serif'
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1000px',
    margin: '0 auto',
    paddingBottom: '32px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    flexWrap: 'wrap',
    gap: '24px'
  },
  brandColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logoBadge: {
    backgroundColor: '#ffffff',
    color: '#6b21a8',
    fontWeight: 'bold',
    fontSize: '18px',
    padding: '4px 10px',
    borderRadius: '8px'
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#ffffff'
  },
  tagline: {
    fontSize: '13px',
    color: '#d8b4fe',
    margin: 0
  },
  linksColumn: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  link: {
    color: '#e9d5ff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500'
  },
  copyrightBar: {
    maxWidth: '1000px',
    margin: '0 auto',
    paddingTop: '24px',
    textAlign: 'left'
  },
  copyrightText: {
    fontSize: '12px',
    color: '#a855f7',
    margin: 0
  }
};