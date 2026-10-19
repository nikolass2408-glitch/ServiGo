import { Star } from 'lucide-react';

export function RatingDisplay({ value = 0, count = 0 }) {
  const rating = Number(value) || 0;

  return (
    <span
      aria-label={count ? `${rating.toFixed(1)} de 5, ${count} calificaciones` : 'Sin calificaciones'}
      style={styles.display}
    >
      {count ? (
        <>
          <Star size={18} fill="#e9a820" color="#e9a820" aria-hidden="true" />
          <strong style={styles.score}>{rating.toFixed(2)}</strong>
        </>
      ) : <span>Sin calificaciones</span>}
    </span>
  );
}

export function RatingInput({ value = 0, onChange, disabled = false }) {
  return (
    <span role="group" aria-label="Califica esta reserva" style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
          aria-pressed={value === star}
          disabled={disabled}
          onClick={() => onChange(star)}
          style={styles.starButton}
        >
          <Star
            size={21}
            fill={star <= value ? '#e9a820' : 'none'}
            color={star <= value ? '#e9a820' : '#a8a3ad'}
          />
        </button>
      ))}
    </span>
  );
}

const styles = {
  display: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '5px', color: '#625b68', fontSize: '12px' },
  score: { color: '#252132', fontSize: '13px' },
  stars: { display: 'inline-flex', alignItems: 'center', gap: '2px' },
  starButton: { display: 'grid', width: '30px', height: '30px', placeItems: 'center', padding: 0, border: 0, borderRadius: '5px', background: 'transparent', cursor: 'pointer' }
};
