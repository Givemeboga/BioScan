// src/layouts/PatientLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity, FileText, TrendingUp, MessageCircle,
  Settings, User, Bell, Search, LogOut, ChevronRight,
} from 'lucide-react';
import './PatientLayout.css';
import logoFonce from '../../assets/foncé.png';

const API_BASE       = 'http://127.0.0.1:8000';
const FALLBACK_PHOTO = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback';

// ── Helpers ───────────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  sessionStorage.getItem('token') ||
  sessionStorage.getItem('access_token') ||
  null;

const getUserId = () =>
  localStorage.getItem('user_id') ||
  sessionStorage.getItem('user_id') ||
  null;

const buildPhotoUrl = (photoUrl) => {
  if (!photoUrl) return FALLBACK_PHOTO;
  if (photoUrl.startsWith('http')) return photoUrl;
  const path = photoUrl.startsWith('/') ? photoUrl : `/media/photos/${photoUrl}`;
  return `${API_BASE}${path}`;
};

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

export default function PatientLayout() {
  const [showUserMenu,   setShowUserMenu]   = useState(false);
  const [userName,       setUserName]       = useState('');
  const [userPhoto,      setUserPhoto]      = useState(FALLBACK_PHOTO);
  const [nbNotifUnread,  setNbNotifUnread]  = useState(0);
  const [searchQuery,    setSearchQuery]    = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // ── Ferme le menu si clic en dehors ────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Charge le profil utilisateur ───────────────────────────
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/patient/profil/me`, {
          headers: getHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();

        setUserName(data.nom_utilisateur || 'Patient');
        setUserPhoto(buildPhotoUrl(data.photo_url));
      } catch (err) {
        console.error('[Layout] Erreur chargement profil :', err);
      }
    };

    fetchUserInfo();
  }, [location.pathname]); // Re-fetch à chaque changement de page pour avoir la photo à jour

  // ── Charge le nombre de notifications non lues ─────────────
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token  = getToken();
      const userId = getUserId();
      if (!token || !userId) return;

      try {
        const res = await fetch(
          `${API_BASE}/api/notifications/patient/${userId}?statut=UNREAD&limit=100`,
          { headers: getHeaders() }
        );
        if (!res.ok) return;
        const data = await res.json();
        setNbNotifUnread(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.error('[Layout] Erreur notifications :', err);
      }
    };

    fetchUnreadCount();
  }, [location.pathname]); // Met à jour le badge à chaque navigation

  // ── Déconnexion ────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  // ── Recherche ──────────────────────────────────────────────
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Adaptez cette route selon votre app
      navigate(`/patient/mes-bilans?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="patient-layout-wrapper">
      <div className="patient-layout-container">

        {/* ── Sidebar ── */}
        <div className="patient-sidebar">
          <div className="patient-sidebar-header">
            <img src={logoFonce} alt="BioScan Logo" className="patient-sidebar-logo" />
          </div>

          <nav className="patient-nav-menu">
            <Link to="/patient/dashboard"
              className={`patient-nav-item ${isActive('/patient/dashboard') ? 'active' : ''}`}>
              <Activity size={20} />
              <span>Dashboard</span>
            </Link>

            <Link to="/patient/mes-bilans"
              className={`patient-nav-item ${isActive('/patient/mes-bilans') ? 'active' : ''}`}>
              <FileText size={20} />
              <span>Mes bilans</span>
            </Link>

            <Link to="/patient/rapport"
              className={`patient-nav-item ${isActive('/patient/rapport') ? 'active' : ''}`}>
              <TrendingUp size={20} />
              <span>Mes rapports</span>
            </Link>

            <Link to="/patient/messages"
              className={`patient-nav-item ${isActive('/patient/messages') ? 'active' : ''}`}>
              <MessageCircle size={20} />
              <span>Messages</span>
            </Link>
          </nav>

          <Link to="/patient/parametres"
            className={`patient-nav-item patient-nav-item-bottom ${isActive('/patient/parametres') ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Paramètres</span>
          </Link>
        </div>

        {/* ── Main Content ── */}
        <div className="patient-main-content">

          {/* ── Header / Topbar ── */}
          <div className="patient-header">

            {/* Recherche */}
            <div className="patient-search-container">
              <Search size={20} className="patient-search-icon" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="patient-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>

            <div className="patient-header-actions">

              {/* Cloche notifications avec badge dynamique */}
              <Link to="/patient/notifications" className="patient-notification-icon">
                <Bell size={22} color="#6b7280" />
                {nbNotifUnread > 0 && (
                  <div className="patient-notification-badge">
                    {nbNotifUnread > 99 ? '99+' : nbNotifUnread}
                  </div>
                )}
              </Link>

              {/* Menu utilisateur */}
              <div className="patient-user-menu-container" ref={dropdownRef}>
                <div
                  onClick={() => setShowUserMenu(prev => !prev)}
                  className={`patient-user-menu-trigger ${showUserMenu ? 'active' : ''}`}
                >
                  <img
                    src={userPhoto}
                    alt="Photo de profil"
                    className="patient-user-avatar"
                    onError={(e) => { e.target.src = FALLBACK_PHOTO; }}
                  />
                  <span className="patient-user-name">
                    {userName
                      ? userName.split(' ')[0]   // Affiche seulement le prénom
                      : '…'
                    }
                  </span>
                  <ChevronRight
                    size={16}
                    color="#9ca3af"
                    className={`patient-chevron ${showUserMenu ? 'rotated' : ''}`}
                  />
                </div>

                {showUserMenu && (
                  <div className="patient-user-dropdown">
                    {/* Entête du dropdown avec photo + nom complet */}
                    <div className="patient-dropdown-header">
                      <img
                        src={userPhoto}
                        alt="avatar"
                        className="patient-dropdown-avatar"
                        onError={(e) => { e.target.src = FALLBACK_PHOTO; }}
                      />
                      <div className="patient-dropdown-user-info">
                        <span className="patient-dropdown-name">{userName || 'Patient'}</span>
                        <span className="patient-dropdown-role">Patient</span>
                      </div>
                    </div>

                    <div className="patient-dropdown-divider" />

                    <Link
                      to="/patient/profil"
                      className="patient-dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} color="#6b7280" />
                      <span>Mon Profil</span>
                    </Link>

                    <Link
                      to="/patient/parametres"
                      className="patient-dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={16} color="#6b7280" />
                      <span>Paramètres</span>
                    </Link>

                    <div className="patient-dropdown-divider" />

                    <div
                      className="patient-dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Déconnexion</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Page Content ── */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}