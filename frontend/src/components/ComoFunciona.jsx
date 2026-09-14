import React from 'react';
// Importamos íconos ilustrativos de lucide-react para los 3 pasos
import { Search, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

export default function ComoFunciona() {
  // Definimos los 3 pasos explicativos
  const pasos = [
    {
      numero: '1',
      icon: <Search size={28} color="#6b21a8" />,
      titulo: 'Encuentra',
      descripcion: 'Busca el profesional o servicio que necesitas.'
    },
    {
      numero: '2',
      icon: <Calendar size={28} color="#6b21a8" />,
      titulo: 'Reserva',
      descripcion: 'Elige la fecha y horario disponible.'
    },
    {
      numero: '3',
      icon: <CheckCircle size={28} color="#6b21a8" />,
      titulo: 'Listo',
      descripcion: 'Recibe la confirmación de tu reserva.'
    }
  ];

  return (
    <section id="funciona" style={styles.section}>
      {/* ENCABEZADO DE LA SECCIÓN */}
      <h2 style={styles.title}>¿Cómo funciona?</h2>
      <p style={styles.subtitle}>
        Reservar tu cita es muy fácil. Solo sigue estos pasos:
      </p>

      {/* CONTENEDOR DE PASOS */}
      <div style={styles.stepsContainer}>
        {pasos.map((paso, index) => (
          <React.Fragment key={paso.numero}>
            
            {/* Tarjeta de cada paso */}
            <div style={styles.stepCard}>
              <div style={styles.badgeNumber}>{paso.numero}</div>
              <div style={styles.iconCircle}>{paso.icon}</div>
              <h3 style={styles.stepTitle}>{paso.titulo}</h3>
              <p style={styles.stepDescription}>{paso.descripcion}</p>
            </div>

            {/* Flecha conectora entre pasos (no se muestra en el último paso) */}
            {index < pasos.length - 1 && (
              <div style={styles.arrowContainer}>
                <ArrowRight size={20} color="#c084fc" />
              </div>
            )}

          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

// ESTILOS DE LA SECCIÓN
const styles = {
  section: {
    padding: '60px 40px',
    backgroundColor: '#faf5ff', // Fondo violeta suave para contrastar
    textAlign: 'center',
    fontFamily: 'sans-serif'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b7280',
    marginBottom: '48px'
  },
  stepsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  stepCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '220px',
    position: 'relative'
  },
  badgeNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '12px'
  },
  iconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(107, 33, 168, 0.08)',
    marginBottom: '16px'
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px'
  },
  stepDescription: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.4'
  },
  arrowContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '40px'
  }
};