import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Activity, FileText, TrendingUp, MessageCircle, Settings, User, Bell, Search, LogOut, ChevronRight } from 'lucide-react';
import './PatientLayout.css';
import logoFonce from '../../assets/foncé.png';

export default function PatientLayout() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  return (
    <div className="patient-layout-wrapper">
      <div className="patient-layout-container">
        {/* Sidebar */}
        <div className="patient-sidebar">
          <div className="patient-sidebar-header">
            <img src={logoFonce} alt="BioScan Logo" className="patient-sidebar-logo" />
          </div>

          <nav className="patient-nav-menu">
            <Link to="/patient/dashboard" className={`patient-nav-item ${location.pathname === '/patient/dashboard' ? 'active' : ''}`}>
              <Activity size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/patient/mes-bilans" className={`patient-nav-item ${location.pathname === '/patient/mes-bilans' ? 'active' : ''}`}>
              <FileText size={20} />
              <span>Mes bilans</span>
            </Link>
            <Link to="/patient/historique" className={`patient-nav-item ${location.pathname === '/patient/historique' ? 'active' : ''}`}>
              <TrendingUp size={20} />
              <span>Historique</span>
            </Link>
            <Link to="/patient/messages" className={`patient-nav-item ${location.pathname === '/patient/messages' ? 'active' : ''}`}>
              <MessageCircle size={20} />
              <span>Messages</span>
            </Link>
          </nav>

          <Link to="/patient/parametres" className={`patient-nav-item patient-nav-item-bottom ${location.pathname === '/patient/parametres' ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Paramètres</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="patient-main-content">
          {/* Header */}
          <div className="patient-header">
            <div className="patient-search-container">
              <Search size={20} className="patient-search-icon" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="patient-search-input"
              />
            </div>
            
            <div className="patient-header-actions">
              <Link to="/patient/notifications" className="patient-notification-icon">
                <Bell size={22} color="#6b7280" />
                <div className="patient-notification-badge">3</div>
              </Link>
              
              <div className="patient-user-menu-container">
                <div 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`patient-user-menu-trigger ${showUserMenu ? 'active' : ''}`}
                >
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yosra" 
                    alt="Profile" 
                    className="patient-user-avatar"
                  />
                  <span className="patient-user-name">Yosra</span>
                  <ChevronRight size={16} color="#9ca3af" className={`patient-chevron ${showUserMenu ? 'rotated' : ''}`} />
                </div>
                
                {showUserMenu && (
                  <div className="patient-user-dropdown">
                    <Link to="/patient/profil" className="patient-dropdown-item">
                      <User size={16} color="#6b7280" />
                      <span>Mon Profil</span>
                    </Link>
                    <Link to="/patient/parametres" className="patient-dropdown-item">
                      <Settings size={16} color="#6b7280" />
                      <span>Paramètres</span>
                    </Link>
                    <div className="patient-dropdown-item logout">
                      <LogOut size={16} />
                      <span>Déconnexion</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Content - This is where child routes will render */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}