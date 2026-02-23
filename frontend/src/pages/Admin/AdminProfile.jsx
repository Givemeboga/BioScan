import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api';
import './AdminProfile.css';

export default function AdminProfile() {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        let userId = localStorage.getItem('user_id');
        
        // Fallback: try to extract user_id from JWT token if localStorage doesn't have it
        if (!userId) {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              userId = payload.sub || payload.user_id;
            } catch (e) {
              console.warn('Could not decode token:', e);
            }
          }
        }
        
        if (!userId) {
          setError('User ID not found. Please log in again.');
          setLoading(false);
          return;
        }

        const data = await apiClient.get(`/api/admin/users/${userId}`);
        setAdminData({
          id: data.id,
          nom: data.nom,
          nom_utilisateur: data.nom,
          email: data.email,
          role: data.role || 'System Administrator',
          dateCreation: data.dateCreation,
          dernierLogin: '2026-02-23T23:45:00Z', // This would come from a separate API later
          mfaEnabled: true, // This would come from user settings/database
          statut: data.status,
          passwordLastUpdated: '2025-12-10T14:20:00Z', // This would come from database
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        setError(err.message || 'Failed to fetch admin profile');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSimpleDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    return status === 'ACTIVE' ? 'active' : 'locked';
  };

  const getMFAStatusText = (enabled) => {
    return enabled ? 'Activé' : 'Désactivé';
  };

  if (loading) {
    return (
      <div className="admin-profile-container">
        <header className="profile-header">
          <div className="header-content">
            <h1>Mon Profil</h1>
            <p>Chargement des informations...</p>
          </div>
        </header>
        <div className="profile-content">
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px', color: '#666' }}>
            Chargement des données...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-profile-container">
        <header className="profile-header">
          <div className="header-content">
            <h1>Mon Profil</h1>
            <p>Erreur de chargement</p>
          </div>
        </header>
        <div className="profile-content">
          <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f', fontSize: '16px' }}>
            <p style={{ marginBottom: '20px' }}>Erreur: {error}</p>
            <button 
              onClick={() => navigate('/signin')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Retour à la Connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="admin-profile-container">
        <header className="profile-header">
          <div className="header-content">
            <h1>Mon Profil</h1>
            <p>Données non disponibles</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      <header className="profile-header">
        <div className="header-content">
          <h1>Mon Profil</h1>
          <p>Informations du compte administrateur système</p>
        </div>
      </header>

      <div className="profile-content">
        {/* Main Profile Card */}
        <div className="profile-card">
          <div className="card-header">
            <div className="avatar-section">
              <div className="avatar">
                {adminData.nom
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="avatar-info">
                <h2>{adminData.nom}</h2>
                <p>@{adminData.nom_utilisateur}</p>
              </div>
            </div>
            <div className="role-badge system-admin">
              {adminData.role}
            </div>
          </div>

          <div className="card-divider"></div>

          {/* Contact Information Section */}
          <div className="profile-section">
            <h3 className="section-title">Informations de Contact</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Adresse E-mail</label>
                <span className="info-value">{adminData.email}</span>
              </div>
              <div className="info-item">
                <label>Nom d'utilisateur</label>
                <span className="info-value">@{adminData.nom_utilisateur}</span>
              </div>
            </div>
          </div>

          <div className="card-divider"></div>

          {/* Account Information Section */}
          <div className="profile-section">
            <h3 className="section-title">Informations du Compte</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Date de Création</label>
                <span className="info-value">{formatSimpleDate(adminData.dateCreation)}</span>
              </div>
              <div className="info-item">
                <label>Dernière Connexion</label>
                <span className="info-value">{formatDate(adminData.dernierLogin)}</span>
              </div>
              <div className="info-item">
                <label>Statut du Compte</label>
                <span className={`info-value status-badge ${getStatusColor(adminData.statut)}`}>
                  {adminData.statut === 'ACTIVE' ? 'Actif' : 'Verrouillé'}
                </span>
              </div>
              <div className="info-item">
                <label>Mot de Passe Mis à Jour</label>
                <span className="info-value">{formatSimpleDate(adminData.passwordLastUpdated)}</span>
              </div>
            </div>
          </div>

          <div className="card-divider"></div>

          {/* Security Section */}
          <div className="profile-section">
            <h3 className="section-title">Sécurité</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Authentification Multi-Facteurs (MFA)</label>
                <span className={`info-value mfa-badge ${adminData.mfaEnabled ? 'enabled' : 'disabled'}`}>
                  {getMFAStatusText(adminData.mfaEnabled)}
                </span>
              </div>
              <div className="info-item">
                <label>Rôle</label>
                <span className="info-value role-text">System Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <div className="info-box-icon">ℹ️</div>
          <div className="info-box-content">
            <h4>Compte Administrateur Système</h4>
            <p>
              Ce compte dispose de droits d'accès complets à la plateforme BioScan. Pour des raisons
              de sécurité, les modifications de ce compte sont limitées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
