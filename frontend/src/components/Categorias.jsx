import React from 'react';
// Importamos los íconos de la librería lucide-react para las categorías
import { Scissors, Sparkles, Heart, PenTool, Dumbbell, MoreHorizontal, Search, MapPin } from 'lucide-react';

export default function Categorias() {
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
    <section style={styles.section}>
      {/* Título de la sección */}
      <h2 style={styles.title}>¿Qué servicio estás buscando?</h2>

      {/* BARRA DE BÚSQUEDA */}
      <div style={styles.searchContainer}>
        {/* Campo de búsqueda por servicio */}
        <div style={styles.inputGroup}>
          <Search size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Buscar servicio..." 
            style={styles.input}
          />
        </div>

        {/* Campo de búsqueda por ubicación */}
        <div style={styles.inputGroup}>
          <MapPin size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Ciudad o ubicación..." 
            style={styles.input}
          />
        </div>

        {/* Botón Buscar */}
        <button style={styles.btnSearch}>Buscar</button>
      </div>

      {/* REJILLA DE CATEGORÍAS */}
      <div style={styles.grid}>
        {listaCategorias.map((item) => (
          <div key={item.id} style={styles.categoryCard}>
            <div style={styles.iconCircle}>
              {item.icon}
            </div>
            <span style={styles.categoryName}>{item.nombre}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ESTILOS DE LA SECCIÓN
const styles = {
  section: {
    padding: '60px 40px',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontFamily: 'sans-serif'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '32px'
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '800px',
    margin: '0 auto 48px auto',
    flexWrap: 'wrap'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    padding: '10px 18px',
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
    borderRadius: '24px',
    padding: '12px 32px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  grid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    flexWrap: 'wrap',
    maxWidth: '900px',
    margin: '0 auto'
  },
  categoryCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
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