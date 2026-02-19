import React, { useState } from 'react';
import { Activity, FileText, TrendingUp, MessageCircle, Settings, User, Bell, Search, LogOut, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import './PatientDashboard.css';
import logoFonce from '../../assets/logo foncé.png';

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="patient-dashboard-wrapper">
      <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={logoFonce} alt="BioScan Logo" className="sidebar-logo" />
        </div>

        <nav className="nav-menu">
          <div className="nav-item active">
            <Activity size={20} />
            <span>Dashboard</span>
          </div>
          <div className="nav-item">
            <FileText size={20} />
            <span>Mes bilans</span>
          </div>
          <div className="nav-item">
            <TrendingUp size={20} />
            <span>Historique</span>
          </div>
          <div className="nav-item">
            <MessageCircle size={20} />
            <span>Messages</span>
          </div>
        </nav>

        <div className="nav-item nav-item-bottom">
          <Settings size={20} />
          <span>Paramètres</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="search-input"
            />
          </div>
          
          <div className="header-actions">
            <div className="notification-icon">
              <Bell size={22} color="#6b7280" />
              <div className="notification-badge">3</div>
            </div>
            
            <div className="user-menu-container">
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`user-menu-trigger ${showUserMenu ? 'active' : ''}`}
              >
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yosra" 
                  alt="Profile" 
                  className="user-avatar"
                />
                <span className="user-name">Yosra</span>
                <ChevronRight size={16} color="#9ca3af" className={`chevron ${showUserMenu ? 'rotated' : ''}`} />
              </div>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-item">
                    <User size={16} color="#6b7280" />
                    <span>Mon Profil</span>
                  </div>
                  <div className="dropdown-item">
                    <Settings size={16} color="#6b7280" />
                    <span>Paramètres</span>
                  </div>
                  <div className="dropdown-item logout">
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="card welcome-card animate-in">
          <div className="welcome-header">
            <h2 className="welcome-title">Bonjour Yosra</h2>
            <span className="welcome-emoji">👋</span>
          </div>
          <p className="welcome-subtitle">Voici vos bilans récents.</p>
        </div>

        <div className="content-grid">
          {/* Recent Tests */}
          <div className="left-column">
            {/* Blood Test */}
            <div className="card test-card animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="test-header">
                <div>
                  <h3 className="test-title">Bilan sanguin complet</h3>
                  <p className="test-date">15 Février 2026</p>
                </div>
                <div className="status-badge badge-valid">
                  <CheckCircle size={14} />
                  Validé
                </div>
              </div>
              <button className="btn-primary">Consulter le rapport</button>
            </div>

            {/* Urine Test */}
            <div className="card test-card animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="test-header">
                <div>
                  <h3 className="test-title">Bilan urinaire</h3>
                  <p className="test-date">02 Mars 2026</p>
                </div>
                <div className="status-badge badge-pending">
                  <Clock size={14} />
                  En validation
                </div>
              </div>
              <button className="btn-primary">Consulter le rapport</button>
            </div>

            {/* Hormone Analysis */}
            <div className="card test-card animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="test-header">
                <div>
                  <h3 className="test-title">Analyse hormonale</h3>
                  <p className="test-date">20 Janvier 2026</p>
                </div>
                <div className="status-badge badge-rejected">
                  <AlertCircle size={14} />
                  Rejeté
                </div>
              </div>
              <button className="btn-primary">Consulter le rapport</button>
            </div>

            {/* Analysis Summary */}
            <div className="card summary-card animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="summary-header">
                <div className="summary-icon">
                  <Activity size={24} color="white" strokeWidth={2.5} />
                </div>
                <div className="summary-text">
                  <h3 className="summary-title">Résumé de votre analyse</h3>
                  <p className="summary-status">Votre état général est satisfaisant.</p>
                  <p className="summary-note">Certains indicateurs sont légèrement à la normale.</p>
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-name">Hémoglobine</span>
                    <span className="metric-value">12,1 g/dL</span>
                  </div>
                  <p className="metric-status low">Légèrement bas</p>
                  <div className="metric-bar">
                    <div className="metric-fill low" style={{ width: '70%' }}></div>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-name">Fer</span>
                    <span className="metric-value">35 µg/dL</span>
                  </div>
                  <p className="metric-status normal">Normal</p>
                  <div className="metric-bar">
                    <div className="metric-fill normal" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* What does this mean */}
            <div className="card info-card animate-in" style={{ animationDelay: '0.5s' }}>
              <h3 className="info-title">Qu'est-ce que cela signifie ?</h3>
              <p className="info-text">
                Votre taux de fer est un peu bas, ce qui peut expliquer une fatigue passagère.
              </p>
              <p className="info-text">
                Une alimentation riche en fer peut aider à améliorer la situation.
              </p>
              <div className="ai-analysis">
                <Activity size={20} color="#3b82f6" />
                <div className="ai-text">
                  <p className="ai-label">Analyse assistée par IA</p>
                </div>
                <div className="ai-validation">
                  <CheckCircle size={16} color="#10b981" />
                  <span className="validation-text">Validé par Dr. Martin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - History */}
          <div className="right-column">
            <div className="card history-card animate-in" style={{ animationDelay: '0.6s' }}>
              <h3 className="history-title">Historique de vos bilans</h3>
              
              <div className="history-item">
                <div className="history-item-header">
                  <CheckCircle size={18} color="#10b981" />
                  <h4 className="history-item-title">Bilan sanguin complet</h4>
                </div>
                <p className="history-item-date">15 Février 2026</p>
                <div className="history-badges">
                  <div className="status-badge badge-valid small">Validé</div>
                  <span className="history-meta">129s 820 mm</span>
                </div>
                <div className="history-details">
                  <div className="detail-row">
                    <span className="detail-label">↑ Hémoglobine</span>
                    <span className="detail-value">12,1 g/dL</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🔶 Fer</span>
                    <div className="detail-value-group">
                      <span className="detail-value">33 µg/dL</span>
                      <span className="detail-status">→ Normal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="history-item">
                <div className="history-item-header">
                  <Clock size={18} color="#f59e0b" />
                  <h4 className="history-item-title">Bilan urinaire</h4>
                </div>
                <p className="history-item-date">02 Mars 2026</p>
                <div className="status-badge badge-pending small">En validation</div>
              </div>

              <div className="history-item">
                <div className="history-item-header">
                  <CheckCircle size={18} color="#10b981" />
                  <h4 className="history-item-title">Cholestérol</h4>
                  <ChevronRight size={16} color="#9ca3af" />
                </div>
                <p className="metric-value-large">1,9 g/L</p>
                <div className="metric-bar">
                  <div className="metric-fill normal" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="history-item">
                <div className="history-item-header">
                  <CheckCircle size={18} color="#10b981" />
                  <h4 className="history-item-title">Glycémie</h4>
                  <ChevronRight size={16} color="#9ca3af" />
                </div>
                <p className="metric-value-large">0,92 g/L</p>
                <div className="metric-bar">
                  <div className="metric-fill normal" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>

            {/* Medication Reminder */}
            <div className="card medication-card animate-in" style={{ animationDelay: '0.7s' }}>
              <h3 className="medication-title">Répur de 1ᵉ médication</h3>
              
              <div className="medication-item">
                <div className="history-item-header">
                  <CheckCircle size={18} color="#10b981" />
                  <h4 className="medication-item-title">Bilan sanguin complet</h4>
                </div>
                <p className="medication-date">15 Février 2026</p>
                <div className="history-badges">
                  <div className="status-badge badge-valid small">Validé</div>
                  <span className="medication-meta">129s 820 mm</span>
                </div>
                <div className="medication-details">
                  <div className="detail-row">
                    <span className="detail-label">↑ Hémoglobine</span>
                    <span className="detail-value">12,1 g/dL</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🔶 Fer</span>
                    <div className="detail-value-group">
                      <span className="detail-value">35 µg/dL</span>
                      <span className="detail-status">→ Normal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="medication-item">
                <div className="history-item-header">
                  <AlertCircle size={18} color="#dc2626" />
                  <h4 className="medication-item-title">Bilan urinaire</h4>
                </div>
                <p className="medication-date">02 Mars 2026</p>
                <div className="history-badges">
                  <div className="status-badge badge-valid small">Validé</div>
                  <span className="medication-meta">Mé Ors</span>
                </div>
              </div>

              <div className="medication-item">
                <div className="history-item-header">
                  <AlertCircle size={18} color="#dc2626" />
                  <h4 className="medication-item-title">Analyse hormonale</h4>
                </div>
                <p className="medication-date">20 Janvier 2026</p>
                <div className="history-badges">
                  <div className="status-badge badge-rejected small">Rejeté</div>
                  <span className="medication-meta">Re</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}