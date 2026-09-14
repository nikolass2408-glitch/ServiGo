import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // 1. Importamos el hook useAuth

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('cliente');

  const navigate = useNavigate();
  const { login } = useAuth(); // 2. Extraemos la función login

  const handleSubmit = (e) => {
    e.preventDefault();

    // 3. Guardamos el usuario en el contexto global
    const userData = {
      email,
      rol,
      nombre: rol === 'admin' ? 'Super Admin' : rol === 'profesional' ? 'Carlos Mendoza' : 'Daniel Franco'
    };
    
    login(userData);

    // 4. Redirección según el rol
    if (rol === 'cliente') {
      navigate('/cliente');
    } else if (rol === 'profesional') {
      navigate('/profesional');
    } else if (rol === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>S</div>
          <h2 style={styles.title}>¡Bienvenido de nuevo!</h2>
          <p style={styles.subtitle}>Ingresa tus credenciales para acceder a ServiGo</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tipo de Usuario</label>
            <div style={styles.iconInputWrapper}>
              <UserCheck size={18} color="#9ca3af" style={styles.inputIcon} />
              <select 
                value={rol} 
                onChange={(e) => setRol(e.target.value)}
                style={styles.select}
              >
                <option value="cliente">Cliente</option>
                <option value="profesional">Prestador de Servicio</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <div style={styles.iconInputWrapper}>
              <Mail size={18} color="#9ca3af" style={styles.inputIcon} />
              <input 
                type="email" 
                placeholder="ejemplo@correo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.iconInputWrapper}>
              <Lock size={18} color="#9ca3af" style={styles.inputIcon} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" style={styles.submitBtn}>
            Ingresar <ArrowRight size={18} />
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            ¿Aún no tienes una cuenta?{' '}
            <Link to="/registro" style={styles.registerLink}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', fontFamily: 'sans-serif', padding: '20px' },
  card: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' },
  header: { textAlign: 'center', marginBottom: '28px' },
  logoBadge: { backgroundColor: '#6b21a8', color: '#ffffff', fontWeight: 'bold', fontSize: '20px', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' },
  title: { fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: '0 0 6px 0' },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  iconInputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '12px' },
  input: { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box', cursor: 'pointer' },
  submitBtn: { backgroundColor: '#6b21a8', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' },
  footer: { marginTop: '24px', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '16px' },
  footerText: { fontSize: '13px', color: '#6b7280', margin: 0 },
  registerLink: { color: '#6b21a8', fontWeight: '600', textDecoration: 'none' }
};