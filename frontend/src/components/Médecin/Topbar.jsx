// src/components/Topbar/Topbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Topbar.css';

const API = 'http://127.0.0.1:8000';

const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  sessionStorage.getItem('token') ||
  null;

const buildPhotoUrl = (photoUrl) => {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http')) return photoUrl;
  const path = photoUrl.startsWith('/') ? photoUrl : `/media/avatars/${photoUrl}`;
  return `${API}${path}`;
};

export default function Topbar({ pageTitle = 'Tableau de bord', onToggleSidebar, sidebarOpen = false }) {
  const navigate = useNavigate();
  const [user,           setUser]           = useState(null);
  const [nbNotifs,       setNbNotifs]       = useState(0);
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const dropdownRef = useRef(null);

  // ── Charger profil depuis /api/profil/me ──────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch(`${API}/api/profil/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setUser({
          id:     data.utilisateur_id,
          name:   data.nom_utilisateur || 'Utilisateur',
          role:   data.statut || 'Médecin Biologiste',
          avatar: buildPhotoUrl(data.photo_url),
        });
      })
      .catch(err => console.error('[Topbar] Erreur profil :', err));
  }, []);

  // ── Charger le nombre de notifs non lues ──────────────────────
  // Utilise /api/notifications/me/count — le backend lit le user_id depuis le JWT
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch(`${API}/api/notifications/me/count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : { unread_count: 0 })
      .then(data => setNbNotifs(data.unread_count || 0))
      .catch(() => setNbNotifs(0));
  }, []);

  // ── Fermer dropdown au clic extérieur ─────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goToProfile       = () => { navigate('/medecin-biologiste/profil'); setDropdownOpen(false); };
  const goToNotifications = () => navigate('/medecin-biologiste/notifications');

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  // Avatar fallback ui-avatars
  const avatarSrc = user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'DR')}&background=1e6bb5&color=fff&size=128`;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Dr';

  return (
    <header className={`topbar ${sidebarOpen ? 'sidebar-open' : ''}`}>

      {/* ── Gauche ── */}
      <div className="topbar-left">
        <button className="btn-menu" aria-label="Menu" onClick={onToggleSidebar}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <h1 className="page-title">{pageTitle}</h1>
      </div>

      {/* ── Droite ── */}
      <div className="topbar-right">

        {/* Bouton notifications */}
        <button
          className="topbar-notif-btn"
          onClick={goToNotifications}
          title="Notifications"
          aria-label="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 17v1a3 3 0 006 0v-1M6 10a6 6 0 1112 0v4l2 2v1H4v-1l2-2v-4z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {nbNotifs > 0 && (
            <span className="notif-badge">{nbNotifs > 99 ? '99+' : nbNotifs}</span>
          )}
        </button>

        {/* Profil + dropdown */}
        <div className="topbar-user-wrap" ref={dropdownRef}>
          <button
            className="topbar-user"
            onClick={() => setDropdownOpen(v => !v)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <img
              src={avatarSrc}
              alt="Avatar"
              className="topbar-avatar"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=DR&background=1e6bb5&color=fff&size=128`;
              }}
            />
            <div className="topbar-user-info">
              <span className="topbar-username">Dr. {firstName}</span>
              {user?.role && <span className="topbar-role">{user.role}</span>}
            </div>
            <svg
              className={`topbar-chevron ${dropdownOpen ? 'open' : ''}`}
              width="12" height="12" viewBox="0 0 12 12" fill="none"
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="topbar-dropdown">
              {/* Header dropdown */}
              <div className="topbar-dropdown-header">
                <img src={avatarSrc} alt="Avatar" className="topbar-dropdown-avatar"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=DR&background=1e6bb5&color=fff&size=128`; }}
                />
                <div>
                  <p className="topbar-dropdown-name">Dr. {user?.name || 'Utilisateur'}</p>
                  <p className="topbar-dropdown-role">{user?.role || 'Médecin Biologiste'}</p>
                </div>
              </div>

              <div className="topbar-dropdown-divider" />

              <button className="topbar-dropdown-item" onClick={goToProfile}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Mon profil
              </button>

              <button className="topbar-dropdown-item" onClick={goToNotifications}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 17v1a3 3 0 006 0v-1M6 10a6 6 0 1112 0v4l2 2v1H4v-1l2-2v-4z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Notifications
                {nbNotifs > 0 && <span className="topbar-dropdown-badge">{nbNotifs}</span>}
              </button>

              <div className="topbar-dropdown-divider" />

              <button className="topbar-dropdown-item topbar-dropdown-item--danger" onClick={handleLogout}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}