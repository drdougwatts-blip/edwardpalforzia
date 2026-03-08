import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navigation() {
  const { user, role, logout } = useAuth();

  if (!user) return null;

  const parentLinks = [
    { to: '/', label: 'Home' },
    { to: '/log-dose', label: 'Log Dose' },
    { to: '/dose-log', label: 'Dose History' },
    { to: '/clinic-visit', label: 'Log Clinic Visit' },
    { to: '/clinic-history', label: 'Clinic History' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/report', label: 'Report' },
  ];

  const doctorLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/dose-log', label: 'Dose Log' },
    { to: '/clinic-history', label: 'Clinic Visits' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/report', label: 'Reports' },
    { to: '/pdf-export', label: 'PDF Export' },
  ];

  const links = role === 'doctor' ? doctorLinks : parentLinks;

  return (
    <nav className="nav-bar">
      <div className="nav-brand">
        <span className="nav-logo">🥜</span>
        <span className="nav-title">Edward's Palforzia Tracker</span>
      </div>
      <div className="nav-links">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="nav-user">
        <span className="nav-role-badge">{role}</span>
        <button onClick={logout} className="btn btn-sm btn-outline">Logout</button>
      </div>
    </nav>
  );
}
