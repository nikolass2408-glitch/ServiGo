import { Link } from 'react-router-dom';
import { CalendarDays, Check, House, Search, UserRound } from 'lucide-react';
import './HomeLanding.css';

export default function Hero() {
  return (
    <section id="portada" className="home-hero" style={styles.heroSection}>
        <div className="home-hero__layout" style={styles.contentWrap}>
          <div style={styles.leftColumn}>
            <div style={styles.badge}>
              Tu cita, en un solo lugar
            </div>

            <h1 style={styles.title}>
              Agenda tu próximo servicio,
              <span style={styles.titleHighlight}> fácil y rápido.</span>
            </h1>

            <p style={styles.subtitle}>
              Encuentra profesionales, consulta sus servicios y reserva tu cita en pocos minutos.
            </p>

            <div style={styles.buttonGroup}>
              <a href="#servicios" style={styles.btnPrimary}><Search size={16} />Buscar un servicio</a>
              <Link to="/registro" style={styles.btnSecondary}>Soy profesional</Link>
            </div>
          </div>

          <div className="home-hero__visual" aria-label="Vista de agenda y calendario">
            <div className="home-hero__phone">
              <div className="home-hero__speaker" />
              <div className="home-hero__screen">
                <div className="home-hero__app-brand"><span>S</span> ServiGo</div>
                <div className="home-hero__appointment-title">Tu próxima cita</div>
                <div className="home-hero__appointment">
                  <span className="home-hero__service-icon"><CalendarDays size={17} /></span>
                  <span><strong>Agenda tu servicio</strong><small>Elige fecha y horario</small></span>
                  <Check size={15} className="home-hero__check" />
                </div>
                <div className="home-hero__phone-nav"><House size={15} /><Search size={15} /><CalendarDays size={15} /><UserRound size={15} /></div>
              </div>
            </div>
            <div className="home-hero__calendar">
              <div className="home-hero__calendar-heading"><strong>Elige una fecha</strong><span>›</span></div>
              <div className="home-hero__weekdays"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
              <div className="home-hero__days">{Array.from({ length: 21 }, (_, index) => <span key={index} className={index === 13 ? 'is-selected' : ''}>{index + 1}</span>)}</div>
            </div>
            <span className="home-hero__floating-check"><Check size={22} /></span>
          </div>
        </div>
    </section>
  );
}

const styles = {
  heroSection: {
    background: 'transparent',
    padding: '34px 32px 22px',
    fontFamily: 'sans-serif'
  },
  contentWrap: {
    display: 'grid',
    alignItems: 'center',
    gap: '24px',
    maxWidth: '1120px',
    margin: '0 auto'
  },
  leftColumn: {
    flex: 1,
    maxWidth: '600px'
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  brandText: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#1f2937'
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#f3e8ff',
    color: '#7e22ce',
    fontSize: '12px',
    fontWeight: '700',
    padding: '6px 12px',
    borderRadius: '999px',
    marginBottom: '14px'
  },
  title: {
    fontSize: '42px',
    fontWeight: '900',
    lineHeight: '1.08',
    color: '#1f2937',
    margin: '0 0 18px',
    letterSpacing: '0'
  },
  titleHighlight: {
    display: 'block',
    color: '#7c3aed'
  },
  subtitle: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#4b5563',
    marginBottom: '22px',
    maxWidth: '560px'
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '8px'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '999px',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'none',
    boxShadow: '0 8px 24px rgba(107, 33, 168, 0.18)'
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1.5px solid #d1d5db',
    borderRadius: '999px',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  metricsRow: {
    display: 'flex',
    gap: '18px',
    flexWrap: 'wrap'
  },
  metricBox: {
    minWidth: '120px',
    backgroundColor: '#ffffff',
    border: '1px solid #e9d5ff',
    borderRadius: '18px',
    padding: '14px 18px',
    boxShadow: '0 10px 30px rgba(91, 33, 182, 0.08)'
  },
  metricValue: {
    display: 'block',
    fontSize: '22px',
    color: '#1f2937',
    marginBottom: '4px'
  },
  metricLabel: {
    fontSize: '12px',
    color: '#6b7280'
  },
  visualPanel: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center'
  },
  cardMain: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#fff',
    border: '1px solid rgba(124, 58, 237, 0.12)',
    borderRadius: '28px',
    padding: '24px',
    boxShadow: '0 24px 60px rgba(76, 29, 149, 0.12)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '22px'
  },
  cardTag: {
    backgroundColor: '#f3e8ff',
    color: '#6b21a8',
    borderRadius: '999px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '700'
  },
  cardStatus: {
    color: '#047857',
    fontSize: '12px',
    fontWeight: '700'
  },
  serviceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 12px',
    borderRadius: '16px',
    backgroundColor: '#faf5ff',
    marginBottom: '12px'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  meta: {
    color: '#6b7280',
    fontSize: '12px',
    marginTop: '4px'
  },
  aboutSection: {
    padding: '32px 80px 80px',
    backgroundColor: '#ffffff',
    fontFamily: 'sans-serif'
  },
  aboutHeader: {
    maxWidth: '680px',
    margin: '0 auto 28px',
    textAlign: 'center'
  },
  sectionEyebrow: {
    margin: '0 0 10px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#7c3aed',
    fontWeight: '700',
    fontSize: '12px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '36px',
    lineHeight: '1.2',
    color: '#1f2937',
    fontWeight: '800'
  },
  aboutGrid: {
    maxWidth: '1180px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '24px'
  },
  infoCard: {
    background: 'linear-gradient(180deg, #f8f5ff 0%, #ffffff 100%)',
    border: '1px solid #e9d5ff',
    borderRadius: '24px',
    padding: '26px 22px',
    boxShadow: '0 10px 30px rgba(124, 58, 237, 0.05)'
  },
  iconCircle: {
    width: '54px',
    height: '54px',
    borderRadius: '18px',
    backgroundColor: '#ede9fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    marginBottom: '16px'
  },
  cardTitle: {
    fontSize: '22px',
    margin: '0 0 10px',
    color: '#1f2937'
  },
  cardText: {
    margin: 0,
    color: '#4b5563',
    lineHeight: '1.7',
    fontSize: '15px'
  }
};
