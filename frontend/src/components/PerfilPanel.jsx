
import { useEffect, useState } from 'react';
import { Save, UserRound, Store, ImagePlus, MapPin, Link as LinkIcon } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import './PerfilPanel.css'

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

        setProfesionalId(
          data.profesional?._id || data.profesional?.id || ''
        );

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
        if (activo) {
          setError(
            requestError.response?.data?.error ||
            'No se pudo cargar el perfil.'
          );
        }
      });

    return () => {
      activo = false;
    };
  }, [user?.id]);

  const cambiar = (campo) => (event) => {
    setDatos((actuales) => ({
      ...actuales,
      [campo]: event.target.value
    }));
  };

  const cargarImagen = async (event) => {
    const archivo = event.target.files?.[0];
    event.target.value = '';

    if (!archivo) return;

    const tipos = ['image/png', 'image/jpeg', 'image/webp'];
    const limiteBytes = 5 * 1024 * 1024;

    if (!tipos.includes(archivo.type)) {
      setError('Selecciona una imagen PNG, JPEG o WebP.');
      return;
    }

    if (archivo.size > limiteBytes) {
      setError('La imagen debe pesar 5 MB o menos.');
      return;
    }

    setError('');
    setMensaje('');

    if (!profesionalId) {
      setError('Guarda primero la información del negocio y vuelve a cargar la imagen.');
      return;
    }

    setSubiendoImagen(true);

    try {
      const formulario = new FormData();
      formulario.append('imagen', archivo);

      const { data } = await API.post(
        '/profesionales/imagen/',
        formulario,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setDatos((actuales) => ({
        ...actuales,
        imagen: data.imagen
      }));

      setMensaje('Imagen del negocio cargada correctamente.');
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        requestError.message ||
        'No se pudo cargar la imagen.'
      );
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
          enlacePersonalizado:
            datos.enlacePersonalizado.trim() ||
            crearEnlace(datos.nombreNegocio)
        };
      }

      const { data } = await API.patch('/perfil/', payload);

      setProfesionalId(
        data.profesional?._id || data.profesional?.id || ''
      );

      updateUser?.(data.usuario);
      onSaved?.();
      setMensaje('Tu perfil se guardó correctamente.');
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        requestError.message ||
        'No se pudo guardar el perfil.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="sg-profile">
      <div className="sg-profile__heading">
        <div>
          <span className="sg-profile__eyebrow">SERVIGO / MI CUENTA</span>
          <h2 className="sg-profile__title">
            {profesional ? 'Mi perfil profesional' : 'Mi perfil'}
          </h2>
          <p className="sg-profile__subtitle">
            Administra tus datos y mantén tu información actualizada.
          </p>
        </div>

        <div className="sg-profile__avatar">
          {datos.firstName
            ? datos.firstName.slice(0, 1).toUpperCase()
            : <UserRound size={27} />}
        </div>
      </div>

      <form onSubmit={guardar} className="sg-profile__form">
        {error && (
          <p role="alert" className="sg-profile__message sg-profile__message--error">
            {error}
          </p>
        )}

        <div className="sg-profile__section">
          <div className="sg-profile__section-title">
            <UserRound size={19} />
            <div>
              <h3>Información personal</h3>
              <p>Tus datos básicos de contacto.</p>
            </div>
          </div>

          <div className="sg-profile__grid">
            <label className="sg-profile__field">
              <span>Nombre</span>
              <input
                value={datos.firstName}
                onChange={cambiar('firstName')}
                autoComplete="given-name"
                required
              />
            </label>

            <label className="sg-profile__field">
              <span>Apellido</span>
              <input
                value={datos.lastName}
                onChange={cambiar('lastName')}
                autoComplete="family-name"
              />
            </label>

            <label className="sg-profile__field">
              <span>Correo electrónico</span>
              <input
                type="email"
                value={datos.email}
                onChange={cambiar('email')}
                autoComplete="email"
                required
              />
            </label>

            <label className="sg-profile__field">
              <span>Teléfono</span>
              <input
                type="tel"
                value={datos.telefono}
                onChange={cambiar('telefono')}
                autoComplete="tel"
              />
            </label>
          </div>
        </div>

        {profesional && (
          <div className="sg-profile__section">
            <div className="sg-profile__section-title">
              <Store size={19} />
              <div>
                <h3>Información del negocio</h3>
                <p>Personaliza cómo se muestra tu actividad en ServiGo.</p>
              </div>
            </div>

            <div className="sg-profile__grid">
              <label className="sg-profile__field">
                <span>Nombre del negocio o actividad</span>
                <input
                  value={datos.nombreNegocio}
                  onChange={cambiar('nombreNegocio')}
                  required
                />
              </label>

              <label className="sg-profile__field">
                <span>Tipo de negocio</span>
                <select
                  value={datos.tipoNegocio}
                  onChange={cambiar('tipoNegocio')}
                >
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

              <label className="sg-profile__field sg-profile__field--full">
                <span>Descripción</span>
                <textarea
                  value={datos.descripcion}
                  onChange={cambiar('descripcion')}
                  rows={4}
                  placeholder="Cuéntales a tus clientes qué servicios ofreces..."
                />
              </label>

              <label className="sg-profile__field sg-profile__field--full">
                <span><MapPin size={14} /> Dirección o ubicación</span>
                <input
                  value={datos.direccion}
                  onChange={cambiar('direccion')}
                  placeholder="Dirección de tu negocio"
                />
              </label>
            </div>

            <div className="sg-profile__image-box">
              <div className="sg-profile__image-info">
                <div className="sg-profile__image-icon">
                  <ImagePlus size={23} />
                </div>
                <div>
                  <h4>Imagen o logo del negocio</h4>
                  <p>PNG, JPEG o WebP · Máximo 5 MB</p>
                </div>
              </div>

              {datos.imagen && (
                <div className="sg-profile__preview">
                  <img
                    src={previewUrl}
                    alt="Vista previa del logo del negocio"
                  />
                </div>
              )}

              <label className="sg-profile__field">
                <span>URL de imagen (opcional)</span>
                <input
                  type="text"
                  value={
                    datos.imagen.startsWith('data:') ||
                    datos.imagen.startsWith('/uploads/')
                      ? ''
                      : datos.imagen
                  }
                  onChange={cambiar('imagen')}
                  placeholder="https://..."
                />
              </label>

              <label className="sg-profile__field">
                <span>O selecciona una imagen de tu equipo</span>
                <input
                  className="sg-profile__file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={cargarImagen}
                  disabled={subiendoImagen}
                />
                {subiendoImagen && (
                  <small>Subiendo imagen...</small>
                )}
              </label>
            </div>

            <div className="sg-profile__link-box">
              <div className="sg-profile__section-title">
                <LinkIcon size={18} />
                <div>
                  <h3>Tu enlace público</h3>
                  <p>Comparte la página de tu negocio con tus clientes.</p>
                </div>
              </div>

              <label className="sg-profile__field">
                <span>Enlace personalizado</span>
                <input
                  value={datos.enlacePersonalizado}
                  onChange={cambiar('enlacePersonalizado')}
                  required
                />
              </label>

              <p className="sg-profile__public-link">
                Enlace: <a
                  href={`/p/${datos.enlacePersonalizado}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  /p/{datos.enlacePersonalizado || 'tu-negocio'}
                </a>
              </p>
            </div>
          </div>
        )}

        {mensaje && (
          <p role="status" className="sg-profile__message sg-profile__message--success">
            {mensaje}
          </p>
        )}

        <div className="sg-profile__actions">
          <button
            type="submit"
            disabled={guardando || subiendoImagen}
            className="sg-profile__save"
          >
            <Save size={17} />
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  );
}
