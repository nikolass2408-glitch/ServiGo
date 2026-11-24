import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock3, MapPin } from 'lucide-react';
import API from '../services/api';
import BrandMark from '../components/BrandMark';
import ModalAgendar from '../components/ModalAgendar';
import { useAuth } from '../context/AuthContext';

export default function PublicProfessional() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const imageUrl = profile?.imagen?.startsWith('/uploads/')
    ? new URL(profile.imagen, API.defaults.baseURL).toString()
    : profile?.imagen;

  useEffect(() => {
    let active = true;
    API.get('/profesionales/')
      .then(async ({ data }) => {
        const found = data.find((item) => item.enlacePersonalizado === slug);
        if (!found) throw new Error('No se encontró el perfil profesional.');
        const { data: serviceData } = await API.get('/servicios/', { params: { profesional: found._id || found.id } });
        if (active) {
          setProfile(found);
          setServices(serviceData);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.error || requestError.message || 'No se pudo cargar el perfil.');
      });
    return () => { active = false; };
  }, [slug]);

  const book = async ({ fecha, hora }) => {
    await API.post('/reservas/', {
      profesional: profile._id || profile.id,
      servicio: selectedService._id || selectedService.id,
      fecha,
      hora
    });
    setMessage('Solicitud de reserva enviada. El profesional recibirá una notificación.');
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.brand}><BrandMark size={34} /><strong>ServiGo</strong></Link>
        {user ? <span style={styles.account}>{user.firstName}</span> : <Link to="/login" style={styles.login}>Iniciar sesión</Link>}
      </header>

      {error ? <p role="alert" style={styles.error}>{error}</p> : !profile ? <p style={styles.loading}>Cargando perfil...</p> : (
        <div style={styles.content}>
          <section style={styles.profile}>
            {imageUrl ? <img src={imageUrl} alt={`Logo de ${profile.nombreNegocio}`} style={styles.image} /> : <BrandMark size={72} />}
            <div>
              <p style={styles.eyebrow}>Perfil profesional</p>
              <h1 style={styles.title}>{profile.nombreNegocio}</h1>
              <p style={styles.description}>{profile.descripcion || 'Servicios profesionales con reserva en línea.'}</p>
              <p style={styles.meta}><MapPin size={15} />{profile.direccion || 'Ubicación por confirmar'}</p>
              {profile.telefono && <p style={styles.meta}>Tel. {profile.telefono}</p>}
            </div>
          </section>

          {message && <p role="status" style={styles.success}>{message}</p>}
          <section>
            <h2 style={styles.sectionTitle}>Servicios disponibles</h2>
            {services.length ? (
              <div style={styles.grid}>
                {services.map((service) => (
                  <article key={service.id || service._id} style={styles.service}>
                    <h3 style={styles.serviceTitle}>{service.nombre}</h3>
                    <p style={styles.description}>{service.descripcion || 'Reserva este servicio en línea.'}</p>
                    <p style={styles.meta}><Clock3 size={15} />{service.duracion} min · ${Number(service.precio).toLocaleString()} COP</p>
                    {user?.rol === 'cliente' ? (
                      <button type="button" onClick={() => { setMessage(''); setSelectedService(service); }} style={styles.book}>Reservar servicio</button>
                    ) : <Link to={user ? '/login' : '/registro'} style={styles.bookLink}>Inicia sesión como cliente para reservar</Link>}
                  </article>
                ))}
              </div>
            ) : <p style={styles.loading}>Este profesional aún no tiene servicios publicados.</p>}
          </section>
        </div>
      )}

      {selectedService && (
        <ModalAgendar
          servicio={{
            ...selectedService,
            profesionalId: profile._id || profile.id,
            profesional: profile.nombreNegocio,
            duracion: `${selectedService.duracion} min`
          }}
          onClose={() => setSelectedService(null)}
          onConfirmar={book}
        />
      )}
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f9fafb', fontFamily: 'sans-serif', color: '#1f2937' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', borderBottom: '1px solid #e5e7eb', background: '#fff' },
  brand: { display: 'flex', alignItems: 'center', gap: '9px', color: '#1f2937', textDecoration: 'none', fontSize: '19px' },
  account: { fontSize: '14px', color: '#4b5563' },
  login: { color: '#6b21a8', fontWeight: 700, textDecoration: 'none' },
  content: { maxWidth: '1050px', display: 'flex', flexDirection: 'column', gap: '34px', margin: '36px auto', padding: '0 20px' },
  profile: { display: 'flex', alignItems: 'center', gap: '24px', padding: '28px', border: '1px solid #e9d5ff', borderRadius: '20px', background: 'linear-gradient(135deg, #faf5ff, #fff)' },
  image: { width: '90px', height: '90px', objectFit: 'cover', borderRadius: '20px' },
  eyebrow: { margin: '0 0 5px', color: '#7c3aed', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' },
  title: { margin: 0, color: '#1f2937', fontSize: '32px', fontWeight: 800 },
  description: { margin: '8px 0', color: '#6b7280', fontSize: '14px', lineHeight: 1.6 },
  meta: { display: 'flex', alignItems: 'center', gap: '6px', margin: '8px 0 0', color: '#4b5563', fontSize: '13px' },
  sectionTitle: { margin: '0 0 15px', fontSize: '22px', color: '#1f2937' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' },
  service: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '14px', background: '#fff' },
  serviceTitle: { margin: 0, fontSize: '17px' },
  book: { marginTop: '16px', padding: '10px 15px', border: 0, borderRadius: '8px', background: '#6b21a8', color: '#fff', fontWeight: 700, cursor: 'pointer' },
  bookLink: { marginTop: '16px', color: '#6b21a8', fontSize: '13px', fontWeight: 700 },
  loading: { maxWidth: '1050px', margin: '30px auto', padding: '0 20px', color: '#6b7280' },
  error: { margin: '30px auto', maxWidth: '800px', padding: '15px', color: '#b91c1c', background: '#fef2f2', borderRadius: '9px' },
  success: { padding: '12px', background: '#f0fdf4', color: '#15803d', borderRadius: '8px' }
};
