import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  UserCheck,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [rol, setRol] = useState('cliente');

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setCargando(true);

    try {
      // LOGIN CONTRA EL BACKEND (el usuario es el correo, en minúsculas)
      const usuario = await login(
        username.trim().toLowerCase(),
        password
      );

      console.log('Usuario autenticado:', usuario);

      // VERIFICAR EL ROL (AuthContext ya lo traduce a
      // 'cliente', 'profesional' o 'admin')
      if (rol === 'cliente' && usuario.rol !== 'cliente') {
        throw new Error(
          'La cuenta ingresada no corresponde a un cliente.'
        );
      }

      if (rol === 'profesional' && usuario.rol !== 'profesional') {
        throw new Error(
          'La cuenta ingresada no corresponde a un prestador de servicio.'
        );
      }

      if (rol === 'admin' && usuario.rol !== 'admin') {
        throw new Error(
          'La cuenta ingresada no corresponde a un administrador.'
        );
      }

      // REDIRECCIÓN
      if (usuario.rol === 'cliente') {
        navigate('/cliente');
      } else if (usuario.rol === 'profesional') {
        navigate('/profesional');
      } else if (usuario.rol === 'admin') {
        navigate('/admin');
      } else {
        throw new Error('Rol de usuario no reconocido.');
      }

    } catch (error) {
      console.error('ERROR LOGIN:', error.response?.data || error);

      if (error.response) {
        // Error enviado por Express
        setError(
          error.response.data?.error ||
          'No fue posible iniciar sesión.'
        );
      } else {
        setError(
          error.message ||
          'No fue posible conectar con el servidor.'
        );
      }

    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>

      <div style={styles.card}>

        {/* ENCABEZADO */}
        <div style={styles.header}>

          <div style={styles.logoBadge}>
            S
          </div>

          <h2 style={styles.title}>
            ¡Bienvenido de nuevo!
          </h2>

          <p style={styles.subtitle}>
            Ingresa tus credenciales para acceder a ServiGo
          </p>

        </div>

        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          {/* TIPO DE USUARIO */}
          <div style={styles.inputGroup}>

            <label style={styles.label}>
              Tipo de Usuario
            </label>

            <div style={styles.iconInputWrapper}>

              <UserCheck
                size={18}
                color="#9ca3af"
                style={styles.inputIcon}
              />

              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                style={styles.select}
              >

                <option value="cliente">
                  Cliente
                </option>

                <option value="profesional">
                  Prestador de Servicio
                </option>

                <option value="admin">
                  Administrador
                </option>

              </select>

            </div>

          </div>

          {/* USUARIO */}
          <div style={styles.inputGroup}>

            <label style={styles.label}>
              Usuario (tu correo)
            </label>

            <div style={styles.iconInputWrapper}>

              <UserCheck
                size={18}
                color="#9ca3af"
                style={styles.inputIcon}
              />

              <input
                type="text"
                placeholder="Ingresa tu correo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
              />

            </div>

          </div>

          {/* CONTRASEÑA */}
          <div style={styles.inputGroup}>

            <label style={styles.label}>
              Contraseña
            </label>

            <div style={styles.iconInputWrapper}>

              <Lock
                size={18}
                color="#9ca3af"
                style={styles.inputIcon}
              />

              <input
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.passwordInput}
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarPassword(!mostrarPassword)
                }
                style={styles.eyeButton}
              >

                {mostrarPassword ? (
                  <EyeOff
                    size={18}
                    color="#6b7280"
                  />
                ) : (
                  <Eye
                    size={18}
                    color="#6b7280"
                  />
                )}

              </button>

            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* BOTÓN */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: cargando ? 0.7 : 1,
              cursor: cargando ? 'not-allowed' : 'pointer'
            }}
            disabled={cargando}
          >

            {cargando ? (
              'Ingresando...'
            ) : (
              <>
                Ingresar
                <ArrowRight size={18} />
              </>
            )}

          </button>

        </form>

        {/* REGISTRO */}
        <div style={styles.footer}>

          <p style={styles.footerText}>
            ¿Aún no tienes una cuenta?{' '}

            <Link
              to="/registro"
              style={styles.registerLink}
            >
              Regístrate aquí
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}


// ========================================
// ESTILOS
// ========================================

const styles = {

  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    fontFamily: 'sans-serif',
    padding: '20px'
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '36px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb'
  },

  header: {
    textAlign: 'center',
    marginBottom: '28px'
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
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px auto'
  },

  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 6px 0'
  },

  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151'
  },

  iconInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  inputIcon: {
    position: 'absolute',
    left: '12px',
    zIndex: 1
  },

  input: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },

  passwordInput: {
    width: '100%',
    padding: '10px 42px 10px 40px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },

  select: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },

  eyeButton: {
    position: 'absolute',
    right: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: '4px'
  },

  errorMessage: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px',
    textAlign: 'center'
  },

  submitBtn: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px'
  },

  footer: {
    marginTop: '24px',
    textAlign: 'center',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '16px'
  },

  footerText: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0
  },

  registerLink: {
    color: '#6b21a8',
    fontWeight: '600',
    textDecoration: 'none'
  }

};