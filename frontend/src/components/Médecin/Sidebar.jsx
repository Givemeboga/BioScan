import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../../assets/Capture d’écran 2026-02-05 215037.png';

const navItems = [
  { to: '/',              label: 'Tableau de bord',     icon: 'home'     },
  { to: '/bilan-biologique', label: 'Bilans biologiques', icon: 'lab'      },
  { to: '/rapport-anomalie', label: 'Rapport anomalie',  icon: 'alert'    },
  { to: '/rapports-medicaux', label: 'Rapports médicaux', icon: 'report'   },
  { to: '/parametres',     label: 'Paramètres',         icon: 'settings'  },
];

function NavIcon({ name }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case 'home':
      return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'lab':
      return <svg {...props}><path d="M12 2v7l-4 5v6h8v-6l-4-5V2z"/><circle cx="12" cy="19" r="2"/></svg>;
    case 'alert':
      return <svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case 'report':
      return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
    case 'settings':
      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    default:
      return null;
  }
}

export default function Sidebar({ collapsed = false, onClose }) {
  const navigate = useNavigate();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header avec logo */}
      <div className="sidebar-header">
        <div className="logo-wrapper" onClick={() => navigate('/')} role="button" tabIndex={0}>
          <div className="logo-circle">
            <img src={logo} alt="BioScan" className="logo-img" />
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
            end={item.to === '/'}
          >
            <div className="icon-wrapper">
              <NavIcon name={item.icon} />
            </div>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => alert('Déconnexion...')}>
          <div className="icon-wrapper">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          {!collapsed && <span className="nav-label">Se déconnecter</span>}
        </button>
      </div>
    </aside>
  );
}