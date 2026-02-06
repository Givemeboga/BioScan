import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Topbar.css';

export default function Topbar({
  pageTitle = 'Tableau de bord',
  onToggleSidebar,
  user,
  sidebarOpen = false,          // ← Ajouté : on reçoit l'état de la sidebar
}) {
  const navigate = useNavigate();

  return (
    <header className={`topbar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="topbar-left">
       
    

        {/* Hamburger (visible sur mobile ou quand sidebar fermée) */}
        <button
          className="btn-menu"
          aria-label="Ouvrir / fermer le menu latéral"
          onClick={onToggleSidebar}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <h1 className="page-title">{pageTitle}</h1>
      </div>

      <div className="topbar-right">
        {/* Notifications (exemple) */}
        <button
          className="topbar-btn notification-btn"
          aria-label="Notifications"
          onClick={() => alert('Notifications (à implémenter)')}
        >
          <div className="icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 17v1a3 3 0 006 0v-1M6 10a6 6 0 1112 0v4l2 2v1H4v-1l2-2v-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="notification-badge">3</span>
          </div>
        </button>

        {/* Profil utilisateur */}
        <div
          className="topbar-user"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          title="Mon profil"
        >
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Dr')}&background=2563eb&color=fff&size=128`
            }
            alt="Avatar utilisateur"
            className="avatar"
          />
          <div className="user-info">
            <span className="username">{user?.name || 'Utilisateur'}</span>
            {user?.role && <span className="user-role">{user.role}</span>}
          </div>

          <svg className="chevron-down" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </header>
  );
}