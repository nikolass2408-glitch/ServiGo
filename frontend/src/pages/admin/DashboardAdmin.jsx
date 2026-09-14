import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, DollarSign, ShieldCheck, Check, X, LogOut } from 'lucide-react';

export default function DashboardAdmin() {
  // Estado simulado de profesionales pendientes por aprobación
  const [solicitudes, setSolicitudes] = useState([
    { id: 1, nombre: 'Carlos Mendoza', servicio: 'Plomería y Reparaciones', fecha: '2026-09-12', estado: 'Pendiente' },
    { id: 2, nombre: 'María Fernánda López', servicio: 'Maquillaje Profesional', fecha: '2026-09-13', estado: 'Pendiente' }
  ]);

  const aprobarSolicitud = (id) => {
    setSolicitudes(solicitudes.filter(sol => sol.id !== id));
  };

  return (
    <div style={styles.container}>
      
      {/* BARRA SUPERIOR DEL PANEL DE ADMINISTRACIÓN */}
      <header style={styles.navbar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBadge}>S</div>
          <span style={styles.logoText}>ServiGo Admin</span>
        </div>
        <div style={styles.userMenu}>
          <span style={styles.userName}>Super Admin</span>
          <Link to="/" style={styles.btnLogout}>
            <LogOut size={16} /> Salir
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={styles.content}>
        
        {/* ENCABEZADO */}
        <div>
          <h1 style={styles.mainTitle}>Panel de Control Global</h1>
          <p style={styles.mainSubtitle}>Supervisa el rendimiento del sistema y administra las solicitudes de la plataforma.</p>
        </div>

        {/* MÉTRICAS GLOBALES DEL SISTEMA */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricIconCircle}>
              <Users size={20} color="#6b21a8" />
            </div>
            <div>
              <span style={styles.metricLabel}>Total Usuarios</span>
              <h3 style={styles.metricValue}>1,248</h3>
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={{ ...styles.metricIconCircle, backgroundColor: '#e0f2fe' }}>
              <Briefcase size={20} color="#0284c7" />
            </div>
            <div>
              <span style={styles.metricLabel}>Profesionales Activos</span>
              <h3 style={styles.metricValue}>184</h3>
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={{ ...styles.metricIconCircle, backgroundColor: '#dcfce7' }}>
              <DollarSign size={20} color="#15803d" />
            </div>
            <div>
              <span style={styles.metricLabel}>Volumen de Transacciones</span>
              <h3 style={styles.metricValue}>$14.8M COP</h3>
            </div>
          </div>
        </div>

        {/* TABLA DE SOLICITUDES PENDIENTES */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <ShieldCheck size={20} color="#6b21a8" /> Solicitudes de Registro de Profesionales
          </h2>

          <div style={styles.tableContainer}>
            {solicitudes.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Nombre del Solicitante</th>
                    <th style={styles.th}>Categoría / Servicio</th>
                    <th style={styles.th}>Fecha de Solicitud</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((sol) => (
                    <tr key={sol.id} style={styles.tableBodyRow}>
                      <td style={styles.tdBold}>{sol.nombre}</td>
                      <td style={styles.td}>{sol.servicio}</td>
                      <td style={styles.td}>{sol.fecha}</td>
                      <td style={styles.tdAction}>
                        <button style={styles.btnApprove} onClick={() => aprobarSolicitud(sol.id)}>
                          <Check size={14} /> Aprobar
                        </button>
                        <button style={styles.btnReject} onClick={() => aprobarSolicitud(sol.id)}>
                          <X size={14} /> Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={styles.emptyState}>
                No hay solicitudes pendientes de validación por el momento.
              </div>
            )}
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
    backgroundColor: '#1f2937',
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
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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
  tdAction: {
    padding: '14px 16px',
    display: 'flex',
    gap: '8px'
  },
  btnApprove: {
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
  btnReject: {
    backgroundColor: '#ef4444',
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
  emptyState: {
    padding: '32px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px'
  }
};