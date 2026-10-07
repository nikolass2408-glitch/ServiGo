import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const crearEnlace = (nombre) =>
  String(nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export default function PerfilPanel({ profesional = false, onSaved }) {
  const { user, updateUser } = useAuth();
  const [datos, setDatos] = useState({
    firstName: '',
    lastName: '',
    email: '',
    telefono: '',
    nombreNegocio: '',
    tipoNegocio: 'OTRO',
    descripcion: '',
    direccion: '',
    imagen: '',
    enlacePersonalizado: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [profesionalId, setProfesionalId] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const previewUrl = datos.imagen.startsWith('/uploads/')
    ? new URL(datos.imagen, API.defaults.baseURL).toString()
    : datos.imagen;

  useEffect(() => {
    let activo = true;
    API.get('/perfil/')
      .then(({ data }) => {
        if (!activo) return;
        setProfesionalId(data.profesional?._id || data.profesional?.id || '');
        setDatos((actuales) => ({
          ...actuales,
          firstName: data.usuario.firstName || '',
          lastName: data.usuario.lastName || '',
          email: data.usuario.email || '',
          telefono: data.usuario.telefono || '',
          nombreNegocio: data.profesional?.nombreNegocio ||
            `${data.usuario.firstName || ''} ${data.usuario.lastName || ''}`.trim(),
          tipoNegocio: data.profesional?.tipoNegocio || 'OTRO',
          descripcion: data.profesional?.descripcion || '',
          direccion: data.profesional?.direccion || '',
          imagen: data.profesional?.imagen || '',
          enlacePersonalizado: data.profesional?.enlacePersonalizado ||
            crearEnlace(`${data.usuario.firstName || ''}-${user?.id?.slice(0, 6) || ''}`)
        }));
      })
      .catch((requestError) => {
        if (activo) setError(requestError.response?.data?.error || 'No se pudo cargar el perfil.');
      });
    return () => { activo = false; };
  }, [user?.id]);

  const cambiar = (campo) => (event) => {
    setDatos((actuales) => ({ ...actuales, [campo]: event.target.value }));
  };

  const cargarImagen = async (event) => {
    const archivo = event.target.files?.[0];
    event.target.value = '';
    if (!archivo) return;

    const tipos = ['image/png', 'image/jpeg', 'image/webp'];
    const limiteBytes = import.meta.env.VITE_DEMO_MODE === 'false' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (!tipos.includes(archivo.type)) {
      setError('Selecciona una imagen PNG, JPEG o WebP.');
      return;
    }
    if (archivo.size > limiteBytes) {
      setError(`La imagen debe pesar ${limiteBytes / (1024 * 1024)} MB o menos.`);
      return;
    }

    setError('');
    setMensaje('');
    if (import.meta.env.VITE_DEMO_MODE !== 'false') {
      const lector = new FileReader();
      lector.onload = () => {
        if (typeof lector.result !== 'string') {
          setError('No se pudo leer el archivo de imagen.');
          return;
        }
        setDatos((actuales) => ({ ...actuales, imagen: lector.result }));
        setMensaje('Imagen cargada. Guarda los cambios del perfil para publicarla.');
      };
      lector.onerror = () => setError('No se pudo leer el archivo de imagen.');
      lector.readAsDataURL(archivo);
      return;
    }

    if (!profesionalId) {
      setError('Guarda primero la información del negocio y vuelve a cargar la imagen.');
      return;
    }
    setSubiendoImagen(true);
    try {
      const formulario = new FormData();
      formulario.append('imagen', archivo);
      const { data } = await API.post('/profesionales/imagen/', formulario, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDatos((actuales) => ({ ...actuales, imagen: data.imagen }));
      setMensaje('Imagen del negocio cargada correctamente.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo cargar la imagen.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const guardar = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setError('');
    setMensaje('');
    try {
      const payload = {
        firstName: datos.firstName.trim(),
        lastName: datos.lastName.trim(),
        email: datos.email.trim().toLowerCase(),
        telefono: datos.telefono.trim()
      };
      if (profesional) {
        payload.profesional = {
          nombreNegocio: datos.nombreNegocio.trim(),
          tipoNegocio: datos.tipoNegocio,
          descripcion: datos.descripcion.trim(),
          telefono: datos.telefono.trim(),
          correo: datos.email.trim().toLowerCase(),
          direccion: datos.direccion.trim(),
          imagen: datos.imagen.trim(),
          enlacePersonalizado: datos.enlacePersonalizado.trim() || crearEnlace(datos.nombreNegocio)
        };
      }
      const { data } = await API.patch('/perfil/', payload);
      setProfesionalId(data.profesional?._id || data.profesional?.id || '');
      updateUser?.(data.usuario);
      onSaved?.();
      setMensaje('Tu perfil se guardó correctamente.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo guardar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section style={styles.panel}>
      <div style={styles.heading}>
        <div>
          <h2 style={styles.title}>{profesional ? 'Perfil personal y del negocio' : 'Mi perfil'}</h2>
          <p style={styles.subtitle}>Actualiza tus datos de contacto y la información de tu cuenta.</p>
        </div>
        <span style={styles.avatar}>{(datos.firstName || user?.firstName || 'S').slice(0, 1).toUpperCase()}</span>
      </div>

      <form onSubmit={guardar} style={styles.form}>
        <label style={styles.field}>
          <span>Nombre</span>
          <input value={datos.firstName} onChange={cambiar('firstName')} autoComplete="given-name" required />
        </label>
        <label style={styles.field}>
          <span>Apellido</span>
          <input value={datos.lastName} onChange={cambiar('lastName')} autoComplete="family-name" />
        </label>
        <label style={styles.field}>
          <span>Correo electrónico</span>
          <input type="email" value={datos.email} onChange={cambiar('email')} autoComplete="email" required />
        </label>
        <label style={styles.field}>
          <span>Teléfono</span>
          <input type="tel" value={datos.telefono} onChange={cambiar('telefono')} autoComplete="tel" />
        </label>

        {profesional && (
          <>
            <label style={styles.field}>
              <span>Nombre del negocio o actividad</span>
              <input value={datos.nombreNegocio} onChange={cambiar('nombreNegocio')} required />
            </label>
            <label style={styles.field}>
              <span>Tipo de negocio</span>
              <select value={datos.tipoNegocio} onChange={cambiar('tipoNegocio')}>
                <option value="BARBERIA">Barbería</option>
                <option value="RESTAURANTE">Restaurante</option>
                <option value="SPA">Spa</option>
                <option value="GIMNASIO">Gimnasio</option>
                <option value="FOTOGRAFIA">Fotografía</option>
                <option value="EDUCACION">Educación</option>
                <option value="MASCOTAS">Mascotas</option>
                <option value="SALUD">Salud</option>
                <option value="AUTOMOTRIZ">Automotriz</option>
                <option value="OTRO">Otros</option>
              </select>
            </label>
            <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
              <span>Descripción</span>
              <textarea value={datos.descripcion} onChange={cambiar('descripcion')} rows={3} />
            </label>
            <label style={styles.field}>
              <span>Dirección o ubicación</span>
              <input value={datos.direccion} onChange={cambiar('direccion')} />
            </label>
            <label style={styles.field}>
              <span>Imagen o logo (URL opcional)</span>
              <input type="text" value={datos.imagen.startsWith('data:') || datos.imagen.startsWith('/uploads/') ? '' : datos.imagen} onChange={cambiar('imagen')} placeholder="https://..." />
            </label>
            <label style={styles.field}>
              <span>Subir imagen (PNG, JPEG o WebP)</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={cargarImagen} disabled={subiendoImagen} />
              <small>{subiendoImagen ? 'Subiendo imagen...' : `Tamaño máximo: ${import.meta.env.VITE_DEMO_MODE === 'false' ? '5 MB' : '2 MB'}.`}</small>
            </label>
            <label style={styles.field}>
              <span>Enlace personalizado</span>
              <input value={datos.enlacePersonalizado} onChange={cambiar('enlacePersonalizado')} required />
              <small>
                Enlace público:{' '}
                <a href={`/p/${datos.enlacePersonalizado}`} target="_blank" rel="noreferrer">
                  /p/{datos.enlacePersonalizado || 'tu-negocio'}
                </a>
              </small>
            </label>
            {datos.imagen && (
              <img src={previewUrl} alt="Vista previa del logo del negocio" style={styles.preview} />
            )}
          </>
        )}

        {error && <p role="alert" style={styles.error}>{error}</p>}
        {mensaje && <p role="status" style={styles.success}>{mensaje}</p>}
        <button type="submit" disabled={guardando} style={styles.button}>
          <Save size={16} />
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </section>
  );
}

const styles = {
  panel: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(31, 41, 55, 0.04)'
  },
  heading: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  title: { margin: 0, fontSize: '20px', color: '#1f2937' },
  subtitle: { margin: '6px 0 0', color: '#6b7280', fontSize: '14px' },
  avatar: { width: '44px', height: '44px', display: 'grid', placeItems: 'center', borderRadius: '14px', background: '#f3e8ff', color: '#6b21a8', fontWeight: 800 },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px', color: '#374151', fontSize: '13px', fontWeight: 600 },
  input: { boxSizing: 'border-box' },
  button: { justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 16px', border: 0, borderRadius: '9px', background: '#6b21a8', color: '#fff', fontWeight: 700, cursor: 'pointer' },
  error: { gridColumn: '1 / -1', margin: 0, color: '#b91c1c' },
  success: { gridColumn: '1 / -1', margin: 0, color: '#15803d' },
  preview: { width: '100%', maxWidth: '140px', maxHeight: '100px', objectFit: 'contain', borderRadius: '10px' }
};
