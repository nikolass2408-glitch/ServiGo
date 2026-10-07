import BrandMark from './BrandMark';

export default function Hero() {
  return (
    <>
      <section id="inicio" style={styles.heroSection}>
        <div style={styles.contentWrap}>
          <div style={styles.leftColumn}>
            <div style={styles.brandRow}>
              <BrandMark size={54} />
              <span style={styles.brandText}>ServiGo</span>
            </div>

            <div style={styles.badge}>
              Bienvenidos a ServiGo
            </div>

            <h1 style={styles.title}>
              Tu agenda inteligente para
              <span style={styles.titleHighlight}> servicios de confianza.</span>
            </h1>

            <p style={styles.subtitle}>
              Conectamos a clientes y profesionales para reservar, organizar y
              gestionar citas de forma rápida, segura y sencilla.
            </p>

            <div style={styles.buttonGroup}>
              <button style={styles.btnPrimary}>🔍 Buscar un servicio</button>
              <button style={styles.btnSecondary}>Soy profesional</button>
            </div>

            <div style={styles.metricsRow}>
              <div style={styles.metricBox}>
                <strong style={styles.metricValue}>4.9/5</strong>
                <span style={styles.metricLabel}>Valoración</span>
              </div>
              <div style={styles.metricBox}>
                <strong style={styles.metricValue}>500+</strong>
                <span style={styles.metricLabel}>Profesionales</span>
              </div>
              <div style={styles.metricBox}>
                <strong style={styles.metricValue}>24/7</strong>
                <span style={styles.metricLabel}>Disponibilidad</span>
              </div>
            </div>
          </div>

          <div style={styles.visualPanel}>
            <div style={styles.cardMain}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTag}>Hoy</span>
                <span style={styles.cardStatus}>Disponibilidad alta</span>
              </div>

              <div style={styles.serviceItem}>
                <div style={styles.avatar}>✂️</div>
                <div>
                  <strong>Corte de cabello</strong>
                  <div style={styles.meta}>10:00 AM · Confirmada</div>
                </div>
              </div>

              <div style={styles.serviceItem}>
                <div style={styles.avatar}>💅</div>
                <div>
                  <strong>Manicura</strong>
                  <div style={styles.meta}>12:30 PM · Disponible</div>
                </div>
              </div>

              <div style={styles.serviceItem}>
                <div style={styles.avatar}>🧖</div>
                <div>
                  <strong>Masaje relajante</strong>
                  <div style={styles.meta}>3:00 PM · Próximo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="quienes-somos" style={styles.aboutSection}>
        <div style={styles.aboutHeader}>
          <p style={styles.sectionEyebrow}>Quiénes somos</p>
          <h2 style={styles.sectionTitle}>Una plataforma hecha para facilitar tu día a día.</h2>
        </div>

        <div style={styles.aboutGrid}>
          <div style={styles.infoCard}>
            <div style={styles.iconCircle}>🎯</div>
            <h3 style={styles.cardTitle}>Nuestra misión</h3>
            <p style={styles.cardText}>
              Ayudar a personas y negocios a organizar servicios, reservas y horarios de
              manera más clara y eficiente.
            </p>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.iconCircle}>🤝</div>
            <h3 style={styles.cardTitle}>Nuestra comunidad</h3>
            <p style={styles.cardText}>
              ServiGo reúne profesionales independientes y clientes que buscan confianza,
              calidad y rapidez en cada cita.
            </p>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.iconCircle}>✨</div>
            <h3 style={styles.cardTitle}>Nuestra promesa</h3>
            <p style={styles.cardText}>
              Diseñamos una experiencia moderna para que reservar un servicio sea sencillo,
              cómodo y sin complicaciones.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

const styles = {
  heroSection: {
    background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 40%, #ffffff 100%)',
    padding: '48px 80px 28px',
    fontFamily: 'sans-serif'
  },
  contentWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '32px',
    maxWidth: '1200px',
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
    fontSize: '13px',
    fontWeight: '700',
    padding: '7px 14px',
    borderRadius: '999px',
    marginBottom: '20px',
    letterSpacing: '0.3px'
  },
  title: {
    fontSize: '52px',
    fontWeight: '900',
    lineHeight: '1.08',
    color: '#1f2937',
    margin: '0 0 18px',
    letterSpacing: '-1px'
  },
  titleHighlight: {
    display: 'block',
    color: '#7c3aed'
  },
  subtitle: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: '#4b5563',
    marginBottom: '28px',
    maxWidth: '560px'
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '28px'
  },
  btnPrimary: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '999px',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(107, 33, 168, 0.18)'
  },
  btnSecondary: {
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
