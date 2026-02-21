import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Médecin/Topbar.css';

export default function Topbar({ pageTitle = 'Administration', onToggleSidebar, sidebarOpen = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 🔹 Fonction pour aller au profil admin
  const goToProfile = () => {
    navigate('/admin/profile'); 
  };

  // 🔹 Récupération des infos de l'admin depuis localStorage
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('role');
    
    // Utiliser les données stockées lors du login
    setUser({
      id: userId || '1',
      name: 'Admin', // Vous pouvez stocker le nom lors du login aussi
      role: role || 'Administrateur',
      avatar: null
    });
  }, []);

  return (
    <header className={`topbar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="topbar-left">
        <button className="btn-menu" aria-label="Ouvrir / fermer le menu" onClick={onToggleSidebar}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <h1 className="page-title">{pageTitle}</h1>
      </div>

      <div className="topbar-right">
        {/* Notifications */}
        <button className="topbar-btn notification-btn" onClick={() => navigate('/admin/notifications')}>
          <div className="icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 17v1a3 3 0 006 0v-1M6 10a6 6 0 1112 0v4l2 2v1H4v-1l2-2v-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="notification-badge">5</span>
          </div>
        </button>

        {/* Profil utilisateur */}
        <div
          className="topbar-user"
          onClick={goToProfile}
          role="button"
          tabIndex={0}
          title="Mon profil"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') goToProfile();
          }}
        >
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=dc2626&color=fff&size=128`}
            alt="Avatar administrateur"
            className="avatar"
          />
          <div className="user-info">
            <span className="username">{user?.name || 'Administrateur'}</span>
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
