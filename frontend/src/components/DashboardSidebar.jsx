import { useState } from 'react';
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Search,
  ShieldCheck,
  UserRound,
  Users
} from 'lucide-react';
import './DashboardSidebar.css';

const icons = {
  profile: UserRound,
  agenda: CalendarDays,
  search: Search,
  services: BriefcaseBusiness,
  users: Users,
  professionals: BriefcaseBusiness,
  overview: LayoutDashboard,
  bookings: CalendarDays
};

export default function DashboardSidebar({
  role,
  userName,
  items,
  activeId,
  onSelect
}) {
  const [collapsed, setCollapsed] = useState(false);
  const firstName = userName?.trim().split(/\s+/)[0] || 'Usuario';
  const initials = userName?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S';

  return (
    <aside
      className={`dashboard-sidebar${collapsed ? ' dashboard-sidebar--collapsed' : ''}`}
      aria-label={`Navegación de ${role}`}
    >
      <div className="dashboard-sidebar__top">
        <div className="dashboard-sidebar__brand">
          <span className="dashboard-sidebar__brand-mark"><ShieldCheck size={18} /></span>
          {!collapsed && <span>Mi espacio</span>}
        </div>
        <button
          type="button"
          className="dashboard-sidebar__toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>

      <div className="dashboard-sidebar__identity">
        <span className="dashboard-sidebar__avatar">{initials}</span>
        {!collapsed && (
          <span className="dashboard-sidebar__identity-copy">
            <strong>Hola, {firstName}</strong>
            <small>{role}</small>
          </span>
        )}
      </div>

      {!collapsed && <p className="dashboard-sidebar__caption">MENÚ PRINCIPAL</p>}
      <nav className="dashboard-sidebar__nav" aria-label="Secciones">
        {items.map((item) => {
          const Icon = icons[item.icon] || LayoutDashboard;
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              className={`dashboard-sidebar__item${active ? ' is-active' : ''}`}
              onClick={() => onSelect(item.id)}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.count > 0 && (
                <span className="dashboard-sidebar__count">{item.count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="dashboard-sidebar__footer">
          <span className="dashboard-sidebar__footer-mark">S</span>
          <span>ServiGo <small>Agenda. Reserva. Listo.</small></span>
        </div>
      )}
    </aside>
  );
}
