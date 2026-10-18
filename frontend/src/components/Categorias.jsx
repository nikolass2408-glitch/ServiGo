import { useEffect, useState } from 'react';
// Importamos los íconos de la librería lucide-react para las categorías
import { Scissors, Sparkles, Heart, PenTool, Dumbbell, MoreHorizontal, Search, MapPin, BriefcaseBusiness } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const nombresCategoria = {
  BARBERIA: 'Barbería',
  SPA: 'Belleza y bienestar',
  GIMNASIO: 'Entrenamiento',
  FOTOGRAFIA: 'Fotografía',
  RESTAURANTE: 'Restaurante',
  EDUCACION: 'Educación',
  MASCOTAS: 'Mascotas',
  SALUD: 'Salud',
  AUTOMOTRIZ: 'Automotriz',
  OTRO: 'Otros'
};

export default function Categorias() {
  const [busqueda, setBusqueda] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);

  useEffect(() => {
    let activo = true;
    Promise.all([API.get('/servicios/'), API.get('/profesionales/')])
      .then(([serviciosResponse, profesionalesResponse]) => {
        if (!activo) return;
        const profesionales = profesionalesResponse.data;
        setServicios(serviciosResponse.data.map((servicio) => {
          const profesionalId = typeof servicio.profesional === 'object'
            ? servicio.profesional?._id || servicio.profesional?.id
            : servicio.profesional;
          const profesional = profesionales.find((item) =>
            String(item._id || item.id) === String(profesionalId)
          ) || (typeof servicio.profesional === 'object' ? servicio.profesional : {});
          return {
            ...servicio,
            id: servicio._id || servicio.id,
            categoria: nombresCategoria[profesional.tipoNegocio] || 'Servicios',
            profesional: profesional.nombreNegocio || profesional.nombre || 'Profesional ServiGo',
            ubicacion: profesional.direccion || '',
            enlacePersonalizado: profesional.enlacePersonalizado
          };
        }));
      })
      .catch((requestError) => {
        if (activo) setError(requestError.response?.data?.error || 'No se pudieron cargar los servicios.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => { activo = false; };
  }, []);

  const normalizarTexto = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const serviciosFiltrados = servicios.filter((servicio) =>
    normalizarTexto(`${servicio.nombre} ${servicio.categoria || ''} ${servicio.profesional}`)
      .includes(normalizarTexto(busqueda.trim())) &&
    normalizarTexto(servicio.ubicacion).includes(normalizarTexto(ubicacion.trim()))
  );

  // Lista de categorías con sus íconos y nombres
  const listaCategorias = [
    { id: 1, nombre: 'Barbería', icon: <Scissors size={24} color="#6b21a8" /> },
    { id: 2, nombre: 'Belleza', icon: <Sparkles size={24} color="#6b21a8" /> },
    { id: 3, nombre: 'Uñas', icon: <Heart size={24} color="#6b21a8" /> },
    { id: 4, nombre: 'Tatuajes', icon: <PenTool size={24} color="#6b21a8" /> },
    { id: 5, nombre: 'Entrenamiento', icon: <Dumbbell size={24} color="#6b21a8" /> },
    { id: 6, nombre: 'Otros', icon: <MoreHorizontal size={24} color="#6b21a8" /> }
  ];

  return (
    <section id="servicios" style={styles.section}>
      {/* Título de la sección */}
      <div style={styles.sectionHeading}>
        <span style={styles.eyebrow}>DESCUBRE SERVIGO</span>
        <h2 style={styles.title}>¿Qué servicio estás buscando?</h2>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <form style={styles.searchContainer} onSubmit={(event) => { event.preventDefault(); setMostrarResultados(true); }}>
        {/* Campo de búsqueda por servicio */}
        <div style={styles.inputGroup}>
          <Search size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Buscar servicio..." 
            style={styles.input}
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>

        {/* Campo de búsqueda por ubicación */}
        <div style={styles.inputGroup}>
          <MapPin size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Ciudad o ubicación..." 
            style={styles.input}
            value={ubicacion}
            onChange={(event) => setUbicacion(event.target.value)}
          />
        </div>

        {/* Botón Buscar */}
        <button type="submit" style={styles.btnSearch}>Buscar</button>
      </form>

      {/* REJILLA DE CATEGORÍAS */}
      <div style={styles.grid}>
        <button type="button" style={styles.categoryCard} onClick={() => { setBusqueda(''); setMostrarResultados(true); }}>
          <span style={styles.categoryAll}><BriefcaseBusiness size={16} /></span>
          <span style={styles.categoryName}>Todos los servicios</span>
        </button>
        {listaCategorias.map((item) => (
          <button key={item.id} type="button" style={styles.categoryCard} onClick={() => { setBusqueda(item.nombre); setMostrarResultados(true); }}>
            <div style={styles.iconCircle}>
              {item.icon}
            </div>
            <span style={styles.categoryName}>{item.nombre}</span>
          </button>
        ))}
      </div>

      {mostrarResultados && <div style={styles.results}>
        {cargando ? <p>Cargando servicios...</p> : error ? <p role="alert">{error}</p> : serviciosFiltrados.length ? (
          serviciosFiltrados.map((servicio) => (
            <article key={servicio.id} style={styles.serviceCard}>
              <span style={styles.categoryName}>{servicio.categoria || 'Servicio'}</span>
              <h3 style={styles.serviceTitle}>{servicio.nombre}</h3>
              <p style={styles.provider}>{servicio.profesional}</p>
              <p style={styles.address}>{servicio.ubicacion || 'Dirección por confirmar'}</p>
              <p style={styles.description}>{servicio.descripcion || 'Servicio disponible para reservar.'}</p>
              <p style={styles.details}>${Number(servicio.precio || 0).toLocaleString()} COP · {servicio.duracion} min</p>
              {servicio.enlacePersonalizado && <Link to={`/p/${servicio.enlacePersonalizado}`} style={styles.profileLink}>Ver</Link>}
            </article>
          ))
        ) : <p>No encontramos servicios con esos filtros.</p>}
      </div>}
    </section>
  );
}

// ESTILOS DE LA SECCIÓN
const styles = {
  section: {
    padding: '28px 32px 40px',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontFamily: 'sans-serif'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 18px'
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '760px',
    margin: '0 auto 18px',
    flexWrap: 'wrap'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '999px',
    padding: '10px 16px',
    flex: '1',
    minWidth: '220px'
  },
  input: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    color: '#374151'
  },
  btnSearch: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '999px',
    padding: '12px 32px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  grid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    flexWrap: 'wrap',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  categoryCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    border: 0,
    background: 'transparent',
    padding: 0,
    color: '#2d2544',
    font: 'inherit'
  },
  categoryAll: { display: 'grid', width: '40px', height: '40px', placeItems: 'center', borderRadius: '50%', background: '#f3e8ff', color: '#6b21a8' },
  results: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', maxWidth: '1000px', margin: '36px auto 0', textAlign: 'left' },
  serviceCard: { padding: '18px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' },
  serviceTitle: { margin: '8px 0', color: '#1f2937' },
  profileLink: { display: 'inline-block', marginTop: '8px', color: '#6b21a8', fontWeight: 700 },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#f3e8ff', // Círculo morado claro
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.2s'
  },
  categoryName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563'
  }
};