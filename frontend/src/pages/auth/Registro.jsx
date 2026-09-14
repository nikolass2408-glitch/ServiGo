import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowLeft, Briefcase, UserCheck } from 'lucide-react';

export default function Registro() {
  // Estado local para seleccionar el tipo de cuenta (Cliente o Profesional)
  const [tipoCuenta, setTipoCuenta] = useState('cliente');

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* BOTÓN REGRESAR AL INICIO */}
        <Link to="/" style={styles.backLink}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        {/* ENCABEZADO */}
        <div style={styles.header}>
          <div style={styles.logoBadge}>S</div>
          <h2 style={styles.title}>Crea tu cuenta</h2>
          <p style={styles.subtitle}>Únete a ServiGo y comienza a agendar o prestar servicios</p>
        </div>

        {/* SELECTOR DE TIPO DE USUARIO */}
        <div style={styles.roleSelector}>
          <button 
            type="button"
            style={{
              ...styles.roleBtn,
              ...(tipoCuenta === 'cliente' ? styles.roleBtnActive : {})
            }}
            onClick={() => setTipoCuenta('cliente')}
          >
            <UserCheck size={16} /> Soy Cliente
          </button>
          
          <button 
            type="button"
            style={{
              ...styles.roleBtn,
              ...(tipoCuenta === 'profesional' ? styles.roleBtnActive : {})
            }}
            onClick={() => setTipoCuenta('profesional')}
          >
            <Briefcase size={16} /> Soy Profesional
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={(e) => e.preventDefault()} style={styles.form}>
          
          {/* CAMPO: NOMBRE COMPLETO */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre completo</label>
            <div style={styles.inputWrapper}>
              <User size={18} color="#9ca3af" />
              <input 
                type="text" 
                placeholder="Juan Pérez" 
                style={styles.input} 
                required 
              />
            </div>
          </div>

          {/* CAMPO: CORREO ELECTRÓNICO */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo electrónico</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#9ca3af" />
              <input 
                type="email" 
                placeholder="ejemplo@correo.com" 
                style={styles.input} 
                required 
              />
            </div>
          </div>

          {/* CAMPO: TELÉFONO */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Teléfono de contacto</label>
            <div style={styles.inputWrapper}>
              <Phone size={18} color="#9ca3af" />
              <input 
                type="tel" 
                placeholder="+57 300 000 0000" 
                style={styles.input} 
                required 
              />
            </div>
          </div>

          {/* CAMPO: CONTRASEÑA */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#9ca3af" />
              <input 
                type="password" 
                placeholder="••••••••" 
                style={styles.input} 
                required 
              />
            </div>
          </div>

          {/* BOTÓN SUBMIT */}
          <button type="submit" style={styles.btnSubmit}>
            Registrarme como {tipoCuenta === 'cliente' ? 'Cliente' : 'Profesional'}
          </button>
        </form>

        {/* PIE DE TARJETA: ENLACE A LOGIN */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" style={styles.loginLink}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

// ESTILOS EN CSS-IN-JS
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    padding: '20px',
    fontFamily: 'sans-serif'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 10px 25px rgba(107, 33, 168, 0.1)',
    border: '1px solid #f3e8ff'
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  logoBadge: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 10px auto'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0
  },
  roleSelector: {
    display: 'flex',
    gap: '8px',
    backgroundColor: '#f3f4f6',
    padding: '4px',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  roleBtn: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    padding: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  roleBtnActive: {
    backgroundColor: '#ffffff',
    color: '#6b21a8',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151'
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f9fafb',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '8px 12px'
  },
  input: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '13px',
    color: '#1f2937'
  },
  btnSubmit: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '14px'
  },
  footerText: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0
  },
  loginLink: {
    color: '#6b21a8',
    fontWeight: '600',
    textDecoration: 'none'
  }
};