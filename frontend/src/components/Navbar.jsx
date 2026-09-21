import React from 'react';
// 1. Importamos Link para la navegación interna sin recargar la página
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header style={styles.header}>
      
      {/* LOGO (Nos lleva al inicio '/') */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBadge}>S</div>
          <span style={styles.logoText}>ServiGo</span>
        </div>
      </Link>

      {/* MENÚ DE NAVEGACIÓN */}
      <nav style={styles.navLinks}>
        <Link to="/" style={{ ...styles.link, ...styles.activeLink }}>Inicio</Link>
        <a href="#servicios" style={styles.link}>Explorar servicios</a>
        <a href="#funciona" style={styles.link}>¿Cómo funciona?</a>
      </nav>

      {/* BOTONES CONECTADOS A LOGIN Y REGISTRO */}
      <div style={styles.authButtons}>
        {/* Enlace a la ruta /login */}
        <Link to="/login">
          <button style={styles.btnSecondary}>Iniciar sesión</button>
        </Link>
        
        {/* Enlace a la ruta /registro */}
        <Link to="/registro">
          <button style={styles.btnPrimary}>Registrarme</button>
        </Link>
      </div>
      
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    fontFamily: 'sans-serif'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  logoBadge: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '18px',
    padding: '6px 12px',
    borderRadius: '8px'
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  navLinks: {
    display: 'flex',
    gap: '24px'
  },
  link: {
    textDecoration: 'none',
    color: '#4b5563',
    fontWeight: '500',
    fontSize: '15px'
  },
  activeLink: {
    color: '#6b21a8',
    borderBottom: '2px solid #6b21a8',
    paddingBottom: '4px'
  },
  authButtons: {
    display: 'flex',
    gap: '12px'
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#374151',
    fontWeight: '600',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  btnPrimary: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    fontWeight: '600',
    padding: '8px 20px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};