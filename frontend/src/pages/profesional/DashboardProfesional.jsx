import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Clock, DollarSign, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
// Importamos la lista de reservas para simular las citas del profesional
import { reservasMock } from '../../services/mockData';

export default function DashboardProfesional() {
  const [citas] = useState(reservasMock);

  return (
    <div style={styles.container}>
      
      {/* BARRA SUPERIOR DEL PANEL DE PROFESIONAL */}
      <header style={styles.navbar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBadge}>S</div>
          <span style={styles.logoText}>ServiGo Pro</span>
        </div>
        <div style={styles.userMenu}>
          <span style={styles.userName}>Barbería El Elegante</span>
          <Link to="/" style={styles.btnLogout}>
            <LogOut size={16} /> Salir
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={styles.content}>
        
        {/* ENCABEZADO Y ACCIONES */}
        <div style={styles.headerAction}>
          <div>
            <h1 style={styles.mainTitle}>Panel de Gestión</h1>
            <p style={styles.mainSubtitle}>Administra tus servicios y atiende tus próximas reservas.</p>
          </div>
          <button style={styles.btnAddService}>
            <Plus size={18} /> Agregar Servicio
          </button>
        </div>

        {/* METRICAS DE RENDIMIENTO */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricIconCircle}>
              <Calendar size={20} color="#6b21a8" />
            </div>
            <div>
              <span style={styles.metricLabel}>Reservas Activas</span>
              <h3 style={styles.metricValue}>2</h3>
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={{ ...styles.metricIconCircle, backgroundColor: '#dcfce7' }}>
              <DollarSign size={20} color="#15803d" />
            </div>
            <div>
              <span style={styles.metricLabel}>Ingresos Estimados</span>
              <h3 style={styles.metricValue}>$80.000 COP</h3>
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={{ ...styles.metricIconCircle, backgroundColor: '#fef3c7' }}>
              <Clock size={20} color="#b45309" />
            </div>
            <div>
              <span style={styles.metricLabel}>Pendientes por Confirmar</span>
              <h3 style={styles.metricValue}>1</h3>
            </div>
          </div>
        </div>

        {/* LISTA DE GESTIÓN DE CITAS RECIBIDAS */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Agenda de Citas</h2>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Servicio</th>
                  <th style={styles.th}>Fecha y Hora</th>
                  <th style={styles.th}>Precio</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((cita) => (
                  <tr key={cita.id} style={styles.tableBodyRow}>
                    <td style={styles.tdBold}>{cita.servicio}</td>
                    <td style={styles.td}>{cita.fecha} • {cita.hora}</td>
                    <td style={styles.td}>${cita.precio.toLocaleString()} COP</td>
                    <td style={styles.td}>
                      <span 
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: cita.estado === 'Confirmada' ? '#dcfce7' : '#fef3c7',
                          color: cita.estado === 'Confirmada' ? '#15803d' : '#b45309'
                        }}
                      >
                        {cita.estado}
                      </span>
                    </td>
                    <td style={styles.tdAction}>
                      {cita.estado === 'Pendiente' ? (
                        <button style={styles.btnConfirm}>
                          <CheckCircle size={14} /> Confirmar
                        </button>
                      ) : (
                        <span style={styles.labelReady}>En agenda</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}

// ESTILOS EN CSS-IN-JS
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'sans-serif'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logoBadge: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '16px',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  btnLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#ef4444',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500'
  },
  content: {
    maxWidth: '1000px',
    margin: '32px auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  headerAction: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },
  mainSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  btnAddService: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px'
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  metricIconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f3e8ff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: '12px',
    color: '#6b7280',
    display: 'block'
  },
  metricValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '4px 0 0 0'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px'
  },
  tableHeaderRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  th: {
    padding: '12px 16px',
    color: '#4b5563',
    fontWeight: '600'
  },
  tableBodyRow: {
    borderBottom: '1px solid #f3f4f6'
  },
  td: {
    padding: '14px 16px',
    color: '#374151'
  },
  tdBold: {
    padding: '14px 16px',
    color: '#1f2937',
    fontWeight: '600'
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px'
  },
  tdAction: {
    padding: '14px 16px'
  },
  btnConfirm: {
    backgroundColor: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  labelReady: {
    fontSize: '12px',
    color: '#6b7280'
  }
};