import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowLeft,
  Briefcase,
  UserCheck,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

import API from '../../services/api';

export default function Registro() {
  const navigate = useNavigate();

  const [tipoCuenta, setTipoCuenta] = useState('cliente');

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError('La contraseña debe incluir mayúscula, minúscula y número.');
      return;
    }

    if (!aceptaTerminos) {
      setError('Debes aceptar los Términos y Condiciones.');
      return;
    }

    setCargando(true);

    try {
      const correo = email.trim().toLowerCase();

      const response = await API.post('/registro/', {
        username: correo, // el correo se usa como usuario para iniciar sesión
        nombre,
        email: correo,
        telefono,
        password,
        rol: tipoCuenta // 'cliente' o 'profesional'
      });

      console.log('Registro OK:', response.data);
      alert('¡Registro exitoso!');
      navigate('/login');
    } catch (err) {
      console.error('ERROR REGISTRO:', err.response?.data || err);
      setError(
        err.response?.data?.error ||
          'No fue posible registrar el usuario.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>

      <div style={styles.card}>

        <Link to="/" style={styles.backLink}>
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <div style={styles.header}>

          <div style={styles.logoBadge}>
            S
          </div>

          <h2 style={styles.title}>
            Crea tu cuenta
          </h2>

          <p style={styles.subtitle}>
            Únete a ServiGo y comienza a agendar o prestar servicios
          </p>

        </div>

        <div style={styles.roleSelector}>

          <button
            type="button"
            onClick={() => setTipoCuenta('cliente')}
            style={{
              ...styles.roleBtn,
              ...(tipoCuenta === 'cliente'
                ? styles.roleBtnActive
                : {})
            }}
          >
            <UserCheck size={16} />
            Soy Cliente
          </button>

          <button
            type="button"
            onClick={() => setTipoCuenta('profesional')}
            style={{
              ...styles.roleBtn,
              ...(tipoCuenta === 'profesional'
                ? styles.roleBtnActive
                : {})
            }}
          >
            <Briefcase size={16} />
            Soy Profesional
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          {/* NOMBRE */}
          <div style={styles.inputGroup}>

            <label style={styles.label}>
              Nombre completo
            </label>

            <div style={styles.inputWrapper}>

              <User size={18} color="#9ca3af" />

              <input
                type="text"
                placeholder="Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={styles.input}
                required
              />

            </div>

          </div>

          {/* CORREO */}
          <div style={styles.inputGroup}>

            <label style={styles.label}>
              Correo electrónico
            </label>

            <div style={styles.inputWrapper}>

              <Mail size={18} color="#9ca3af" />

              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />

            </div>

          </div>

          {/* TELEFONO */}
          <div style={styles.inputGroup}>

            <label style={styles.label}>
              Teléfono de contacto
            </label>

            <div style={styles.inputWrapper}>

              <Phone size={18} color="#9ca3af" />

              <input
                type="tel"
                placeholder="+57 300 000 0000"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                style={styles.input}
                required
              />

            </div>

          </div>

          {/* CONTRASEÑA */}
          <div style={styles.inputGroup}>

            <label style={styles.label}>
              Contraseña
            </label>

            <div style={styles.passwordWrapper}>

              <Lock size={18} color="#9ca3af" />

              <input
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Mín. 8 caracteres, mayúscula, minúscula y número"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.passwordInput}
                minLength={8}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarPassword(!mostrarPassword)
                }
                style={styles.eyeButton}
              >

                {mostrarPassword ? (
                  <EyeOff size={18} color="#6b7280" />
                ) : (
                  <Eye size={18} color="#6b7280" />
                )}

              </button>

            </div>

            {password.length > 0 && password.length < 8 && (
              <span style={styles.passwordError}>
                Mínimo 8 caracteres
              </span>
            )}

          </div>

          {/* TERMINOS */}
          <button
            type="button"
            onClick={() =>
              setAceptaTerminos(!aceptaTerminos)
            }
            style={styles.termsButton}
          >

            <span
              style={{
                ...styles.checkbox,
                ...(aceptaTerminos
                  ? styles.checkboxChecked
                  : {})
              }}
            >

              {aceptaTerminos && (
                <Check
                  size={14}
                  color="#ffffff"
                />
              )}

            </span>

            <span style={styles.termsText}>
              Acepto los Términos y Condiciones
            </span>

          </button>

          {/* ERROR */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* BOTON */}
          <button
            type="submit"
            disabled={cargando}
            style={{
              ...styles.btnSubmit,
              ...(password.length >= 8 && aceptaTerminos
                ? {}
                : styles.btnDisabled),
              opacity: cargando ? 0.7 : 1,
              cursor: cargando ? 'not-allowed' : 'pointer'
            }}
          >
            {cargando
              ? 'Registrando...'
              : `Registrarme como ${
                  tipoCuenta === 'cliente'
                    ? 'Cliente'
                    : 'Profesional'
                }`}
          </button>

        </form>

        {/* LOGIN */}
        <div style={styles.footer}>

          <p style={styles.footerText}>
            ¿Ya tienes una cuenta?{' '}

            <Link
              to="/login"
              style={styles.loginLink}
            >
              Inicia sesión aquí
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

const styles = {

  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 10px 25px rgba(107, 33, 168, 0.10)',
    border: '1px solid #f3e8ff'
  },

  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '13px',
    marginBottom: '20px'
  },

  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },

  logoBadge: {
    width: '40px',
    height: '40px',
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 10px',
    fontSize: '20px',
    fontWeight: 'bold'
  },

  title: {
    fontSize: '22px',
    color: '#1f2937',
    margin: '0 0 5px'
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
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    padding: '9px',
    borderRadius: '8px',
    color: '#6b7280',
    fontWeight: '600',
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
    gap: '5px'
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
    padding: '9px 12px'
  },

  input: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    width: '100%',
    fontSize: '13px'
  },

  passwordWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f9fafb',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '9px 12px'
  },

  passwordInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    width: '100%',
    fontSize: '13px'
  },

  eyeButton: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    padding: '2px'
  },

  passwordError: {
    color: '#dc2626',
    fontSize: '11px'
  },

  termsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: '5px 0',
    textAlign: 'left'
  },

  checkbox: {
    width: '18px',
    height: '18px',
    minWidth: '18px',
    border: '2px solid #d1d5db',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  checkboxChecked: {
    backgroundColor: '#6b21a8',
    borderColor: '#6b21a8'
  },

  termsText: {
    fontSize: '12px',
    color: '#4b5563'
  },

  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '9px',
    fontSize: '12px',
    textAlign: 'center'
  },

  btnSubmit: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  btnDisabled: {
    backgroundColor: '#d1d5db',
    color: '#6b7280'
  },

  footer: {
    marginTop: '20px',
    paddingTop: '14px',
    borderTop: '1px solid #f3f4f6',
    textAlign: 'center'
  },

  footerText: {
    fontSize: '13px',
    color: '#6b7280'
  },

  loginLink: {
    color: '#6b21a8',
    fontWeight: '600',
    textDecoration: 'none'
  }
};

