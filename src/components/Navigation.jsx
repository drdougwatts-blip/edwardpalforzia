import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/log-dose', label: 'Log Dose' },
  { to: '/dose-log', label: 'Dose History' },
  { to: '/clinic-visit', label: 'Log Clinic Visit' },
  { to: '/clinic-history', label: 'Clinic History' },
  { to: '/appointments', label: 'Appointments' },
  { to: '/report', label: 'Report' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/pdf-export', label: 'PDF Export' },
];

export default function Navigation() {
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
    </nav>
  );
}
