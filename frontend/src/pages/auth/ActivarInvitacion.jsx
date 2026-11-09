import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import API from '../../services/api';
import BrandMark from '../../components/BrandMark';

export default function ActivarInvitacion() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    API.get(`/invitaciones/${encodeURIComponent(searchParams.get('token') || '')}/`)
      .then(({ data }) => {
        if (active) setInvitation(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.error || 'La invitación no es válida o ya venció.');
      });
    return () => { active = false; };
  }, [searchParams]);

  const activate = async (event) => {
    event.preventDefault();
    setError('');
    if (invitation?.requierePassword && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSaving(true);
    try {
      await API.post('/invitaciones/aceptar/', {
        token: searchParams.get('token'),
        ...(invitation.requierePassword ? { password } : {})
      });
      navigate('/login', { replace: true, state: { rol: 'profesional' } });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo activar la cuenta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={styles.page}>
      <form onSubmit={activate} style={styles.card}>
        <BrandMark size={42} />
        <h1 style={styles.title}>Invitación profesional</h1>
        <p style={styles.copy}>
          {invitation
            ? `${invitation.nombre || invitation.email}, te invitaron a unirte a ${invitation.empresa}.`
            : 'Verificando el enlace de invitación…'}
        </p>
        {invitation?.requierePassword && (
          <>
            <label style={styles.field}>
              Nueva contraseña
              <span style={styles.input}>
                <Lock size={17} />
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </span>
            </label>
            <label style={styles.field}>
              Confirmar contraseña
              <span style={styles.input}>
                <Lock size={17} />
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </span>
            </label>
          </>
        )}
        {error && <p role="alert" style={styles.error}>{error}</p>}
        <button type="submit" disabled={saving || !invitation} style={styles.submit}>
          {saving ? 'Procesando…' : invitation?.requierePassword ? 'Activar cuenta' : 'Aceptar invitación'}
        </button>
        <Link to="/login" style={styles.link}>Volver a iniciar sesión</Link>
      </form>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: '#f6f3ff', fontFamily: 'Arial, sans-serif' },
  card: { width: 'min(100%, 440px)', display: 'grid', gap: 16, padding: 30, border: '1px solid #e6def7', borderRadius: 18, background: '#fff', boxShadow: '0 18px 48px rgba(47, 28, 82, .1)' },
  title: { margin: 0, color: '#211832', fontSize: 24 },
  copy: { margin: 0, color: '#706a7c', lineHeight: 1.5 },
  field: { display: 'grid', gap: 7, color: '#423c4d', fontSize: 13, fontWeight: 700 },
  input: { display: 'flex', alignItems: 'center', gap: 9, padding: '11px 12px', border: '1px solid #dcd6e4', borderRadius: 9, color: '#766394' },
  error: { margin: 0, color: '#b91c1c', fontSize: 13 },
  submit: { minHeight: 45, border: 0, borderRadius: 9, background: 'linear-gradient(110deg, #4c1d95, #7c3aed)', color: '#fff', fontWeight: 700, cursor: 'pointer' },
  link: { color: '#6d28d9', textAlign: 'center', fontSize: 13 }
};
