import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, LockKeyhole, Mail } from 'lucide-react';
import API from '../../services/api';
import BrandMark from '../../components/BrandMark';

export default function RecuperarPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMensaje('');

    if (token && password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      if (token) {
        const response = await API.post('/restablecer-password/', {
          token,
          password
        });
        setMensaje(response.data.message || 'Contraseña actualizada.');
      } else {
        const response = await API.post('/recuperar-password/', {
          email: email.trim().toLowerCase()
        });
        setMensaje(response.data.message);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        'No fue posible completar la solicitud. Intenta de nuevo.'
      );
    } finally {
      setCargando(false);
    }
  };

  const titulo = token ? 'Crear nueva contraseña' : 'Recuperar contraseña';

  return (
    <main style={styles.container}>
      <section style={styles.card}>
        <BrandMark size={44} style={styles.brandMark} />
        <h1 style={styles.title}>{titulo}</h1>
        <p style={styles.subtitle}>
          {token
            ? 'Elige una contraseña segura para volver a entrar a ServiGo.'
            : 'Escribe el correo asociado a tu cuenta de cliente o prestador.'}
        </p>

        {mensaje ? (
          <div role="status" style={styles.success}>
            <CheckCircle size={22} />
            <p>{mensaje}</p>
            <Link to="/login" style={styles.link}>Volver a iniciar sesión</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {token ? (
              <>
                <label style={styles.field}>
                  <span>Nueva contraseña</span>
                  <span style={styles.inputWrap}>
                    <LockKeyhole size={17} style={styles.inputIcon} />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      placeholder="Mínimo 8 caracteres"
                      style={styles.input}
                    />
                  </span>
                </label>
                <label style={styles.field}>
                  <span>Confirmar contraseña</span>
                  <span style={styles.inputWrap}>
                    <LockKeyhole size={17} style={styles.inputIcon} />
                    <input
                      type="password"
                      value={confirmarPassword}
                      onChange={(event) => setConfirmarPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      placeholder="Repite la contraseña"
                      style={styles.input}
                    />
                  </span>
                </label>
              </>
            ) : (
              <label style={styles.field}>
                <span>Correo electrónico</span>
                <span style={styles.inputWrap}>
                  <Mail size={17} style={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    placeholder="correo@ejemplo.com"
                    style={styles.input}
                  />
                </span>
              </label>
            )}

            {error && <p role="alert" style={styles.error}>{error}</p>}

            <button type="submit" disabled={cargando} style={styles.submit}>
              {cargando
                ? 'Procesando...'
                : token
                  ? 'Guardar contraseña'
                  : 'Enviar enlace'}
            </button>
          </form>
        )}

        {!mensaje && (
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={15} />
            Volver al inicio de sesión
          </Link>
        )}
      </section>
    </main>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    backgroundColor: '#f9fafb',
    fontFamily: 'sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    boxSizing: 'border-box',
    padding: '32px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
  },
  brandMark: {
    margin: '0 auto 14px'
  },
  title: {
    margin: 0,
    color: '#1f2937',
    fontSize: '22px',
    textAlign: 'center'
  },
  subtitle: {
    margin: '8px 0 24px',
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: 1.5,
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    color: '#374151',
    fontSize: '13px',
    fontWeight: 600
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#9ca3af'
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 12px 11px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    font: 'inherit',
    fontWeight: 400
  },
  submit: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '44px',
    padding: '10px 14px',
    border: 0,
    borderRadius: '8px',
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  error: {
    margin: 0,
    padding: '10px 12px',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    fontSize: '13px'
  },
  success: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    color: '#15803d',
    textAlign: 'center'
  },
  link: {
    color: '#6b21a8',
    fontWeight: 600,
    textDecoration: 'none'
  },
  backLink: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginTop: '20px',
    color: '#6b21a8',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none'
  }
};