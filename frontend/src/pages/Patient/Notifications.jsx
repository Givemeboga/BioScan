// src/pages/patient/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, FileText, Calendar, Trash2, Check } from 'lucide-react';
import './Notifications.css';

const API_BASE   = 'http://127.0.0.1:8000';
const PATIENT_ID = 1; // ← remplace par l'ID du patient connecté

// ── Icône et type selon le statut BDD ─────────────────────────────────────────
const getTypeAndIcon = (statut) => {
  switch (statut) {
    case 'VALIDE':    return { type: 'success', icon: CheckCircle };
    case 'EN_COURS':  return { type: 'pending', icon: Clock };
    case 'REJETE':    return { type: 'error',   icon: AlertCircle };
    case 'RDV':       return { type: 'warning', icon: Calendar };
    case 'RAPPORT':   return { type: 'info',    icon: FileText };
    default:          return { type: 'info',    icon: Bell };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const diff = new Date() - date;
  const minutes = Math.floor(diff / 60000);
  const heures  = Math.floor(diff / 3600000);
  const jours   = Math.floor(diff / 86400000);
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (heures  < 24) return `Il y a ${heures}h`;
  if (jours   === 1) return 'Hier';
  if (jours   < 7)  return `Il y a ${jours} jours`;
  return date.toLocaleDateString('fr-FR');
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filter,   setFilter]   = useState('tous');

  // ── GET au montage ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/notifications/patient/${PATIENT_ID}`);
        if (!res.ok) throw new Error('Impossible de charger les notifications');
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // ── Marquer une comme lue ────────────────────────────────────────────────────
  const marquerCommeLu = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}/lire`, { method: 'PUT' });
      if (!res.ok) throw new Error();
      setNotifications(prev =>
        prev.map(n => n.notification_id === id ? { ...n, statut: 'LU' } : n)
      );
    } catch {
      setError('Erreur lors de la mise à jour');
    }
  };

  // ── Marquer tout comme lu ────────────────────────────────────────────────────
  const marquerToutCommeLu = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/notifications/patient/${PATIENT_ID}/lire-tout`,
        { method: 'PUT' }
      );
      if (!res.ok) throw new Error();
      setNotifications(prev => prev.map(n => ({ ...n, statut: 'LU' })));
    } catch {
      setError('Erreur lors de la mise à jour');
    }
  };

  // ── Supprimer ────────────────────────────────────────────────────────────────
  const supprimerNotification = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setNotifications(prev => prev.filter(n => n.notification_id !== id));
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const getFiltered = () =>
    filter === 'non-lus'
      ? notifications.filter(n => n.statut !== 'LU')
      : notifications;

  const nombreNonLus = notifications.filter(n => n.statut !== 'LU').length;

  // ── Rendu ────────────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="notifications"><div className="notifications-loading">Chargement...</div></div>;
  }

  return (
    <div className="notifications">
      <div className="notifications-welcome-card">
        <div className="notifications-welcome-header">
          <h2 className="notifications-welcome-title">Notifications</h2>
          <span className="notifications-welcome-emoji">🔔</span>
        </div>
        <p className="notifications-welcome-subtitle">
          {nombreNonLus > 0
            ? `Vous avez ${nombreNonLus} notification${nombreNonLus > 1 ? 's' : ''} non lue${nombreNonLus > 1 ? 's' : ''}`
            : 'Toutes vos notifications sont à jour'}
        </p>
      </div>

      {error && <div className="profil-message error">{error}</div>}

      <div className="notifications-container">
        {/* Filtres */}
        <div className="notifications-header">
          <div className="notifications-filters">
            <button
              className={`notifications-filter-btn ${filter === 'tous' ? 'active' : ''}`}
              onClick={() => setFilter('tous')}
            >
              Toutes ({notifications.length})
            </button>
            <button
              className={`notifications-filter-btn ${filter === 'non-lus' ? 'active' : ''}`}
              onClick={() => setFilter('non-lus')}
            >
              Non lues ({nombreNonLus})
            </button>
          </div>
          {nombreNonLus > 0 && (
            <button className="notifications-mark-all-btn" onClick={marquerToutCommeLu}>
              <Check size={16} /> Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Liste */}
        <div className="notifications-list">
          {getFiltered().length === 0 ? (
            <div className="notifications-empty">
              <Bell size={48} color="#cbd5e1" />
              <p>Aucune notification</p>
            </div>
          ) : (
            getFiltered().map((notif) => {
              const { type, icon: Icon } = getTypeAndIcon(notif.statut);
              const estLu = notif.statut === 'LU';
              return (
                <div
                  key={notif.notification_id}
                  className={`notification-item ${estLu ? 'lu' : 'non-lu'} ${type}`}
                >
                  <div className="notification-icon">
                    <Icon size={24} />
                  </div>

                  <div className="notification-content">
                    <div className="notification-header-row">
                      <h4 className="notification-titre">{notif.titre}</h4>
                      <span className="notification-date">{formatDate(notif.date_generation)}</span>
                    </div>
                    <p className="notification-message">{notif.description}</p>
                  </div>

                  <div className="notification-actions">
                    {!estLu && (
                      <button
                        className="notification-action-btn mark-read"
                        onClick={() => marquerCommeLu(notif.notification_id)}
                        title="Marquer comme lu"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      className="notification-action-btn delete"
                      onClick={() => supprimerNotification(notif.notification_id)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}