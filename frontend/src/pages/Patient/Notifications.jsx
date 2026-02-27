// src/pages/patient/Notifications.jsx
import React, { useState, useEffect } from 'react';
import {
  Bell, CheckCircle, AlertCircle,
  Trash2, Check, RefreshCw,
} from 'lucide-react';
import './Notifications.css';

const API_BASE = 'http://127.0.0.1:8000';

// ── Helpers token / user_id ───────────────────────────────────
const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  sessionStorage.getItem('token') ||
  sessionStorage.getItem('access_token') ||
  null;

const getUserId = () =>
  localStorage.getItem('user_id') ||
  localStorage.getItem('userId') ||
  sessionStorage.getItem('user_id') ||
  null;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ─────────────────────────────────────────────────────────────

const getTypeAndIcon = (statut) => {
  switch (statut) {
    case 'READ':   return { type: 'success', Icon: CheckCircle };
    case 'UNREAD': return { type: 'info',    Icon: Bell };
    default:       return { type: 'info',    Icon: Bell };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.getFullYear() > 9999) return '—';
    const diff    = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60_000);
    const heures  = Math.floor(diff / 3_600_000);
    const jours   = Math.floor(diff / 86_400_000);
    if (minutes < 1)  return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (heures  < 24) return `Il y a ${heures}h`;
    if (jours  === 1) return 'Hier';
    if (jours   < 7)  return `Il y a ${jours} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  } catch {
    return '—';
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState('tous');

  const user_id = getUserId();

  // ── Fetch ─────────────────────────────────────────────────
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);

    if (!user_id) {
      setError('Identifiant utilisateur introuvable. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/notifications/patient/${user_id}`,
        { headers: getHeaders() }
      );
      if (res.status === 401) throw new Error('Session expirée. Veuillez vous reconnecter.');
      if (res.status === 403) throw new Error('Accès non autorisé.');
      if (!res.ok) throw new Error('Impossible de charger les notifications.');
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // ── Marquer une comme lue ─────────────────────────────────
  const marquerCommeLu = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/notifications/${id}/lire`,
        { method: 'PUT', headers: getHeaders() }
      );
      if (!res.ok) throw new Error('Erreur lors de la mise à jour.');
      setNotifications(prev =>
        prev.map(n => n.notification_id === id ? { ...n, statut: 'READ' } : n)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Marquer tout comme lu ─────────────────────────────────
  const marquerToutCommeLu = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/notifications/patient/${user_id}/lire-tout`,
        { method: 'PUT', headers: getHeaders() }
      );
      if (!res.ok) throw new Error('Erreur lors de la mise à jour.');
      setNotifications(prev => prev.map(n => ({ ...n, statut: 'READ' })));
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Supprimer ─────────────────────────────────────────────
  const supprimerNotification = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/notifications/${id}`,
        { method: 'DELETE', headers: getHeaders() }
      );
      if (!res.ok) throw new Error('Erreur lors de la suppression.');
      setNotifications(prev => prev.filter(n => n.notification_id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Computed ──────────────────────────────────────────────
  const filtered     = filter === 'non-lus'
    ? notifications.filter(n => n.statut !== 'READ')
    : notifications;
  const nombreNonLus = notifications.filter(n => n.statut !== 'READ').length;

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="notifications">
      <div className="notifications-loading">
        <RefreshCw size={28} className="spin" />
        <span>Chargement des notifications…</span>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="notifications">

      {/* Hero card */}
      <div className="notifications-welcome-card">
        <div className="notifications-welcome-header">
          <div className="notifications-welcome-left">
            <div className="notifications-bell-wrap">
              <Bell size={22} />
              {nombreNonLus > 0 && (
                <span className="notifications-bell-badge">{nombreNonLus}</span>
              )}
            </div>
            <div>
              <h2 className="notifications-welcome-title">Notifications</h2>
              <p className="notifications-welcome-subtitle">
                {nombreNonLus > 0
                  ? `${nombreNonLus} notification${nombreNonLus > 1 ? 's' : ''} non lue${nombreNonLus > 1 ? 's' : ''}`
                  : 'Toutes vos notifications sont à jour ✓'}
              </p>
            </div>
          </div>
          <button
            className="notifications-refresh-btn"
            onClick={fetchNotifications}
            title="Actualiser"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="notifications-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Panneau */}
      <div className="notifications-container">

        {/* Toolbar */}
        <div className="notifications-header">
          <div className="notifications-filters">
            <button
              className={`notifications-filter-btn ${filter === 'tous' ? 'active' : ''}`}
              onClick={() => setFilter('tous')}
            >
              Toutes
              <span className="notifications-chip">{notifications.length}</span>
            </button>
            <button
              className={`notifications-filter-btn ${filter === 'non-lus' ? 'active' : ''}`}
              onClick={() => setFilter('non-lus')}
            >
              Non lues
              {nombreNonLus > 0 && (
                <span className="notifications-chip unread">{nombreNonLus}</span>
              )}
            </button>
          </div>

          {nombreNonLus > 0 && (
            <button className="notifications-mark-all-btn" onClick={marquerToutCommeLu}>
              <Check size={14} />
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Liste */}
        <div className="notifications-list">
          {filtered.length === 0 ? (
            <div className="notifications-empty">
              <Bell size={48} strokeWidth={1.2} />
              <p>Aucune notification{filter === 'non-lus' ? ' non lue' : ''}</p>
            </div>
          ) : (
            filtered.map((notif) => {
              const { type, Icon } = getTypeAndIcon(notif.statut);
              const estLu = notif.statut === 'READ';
              return (
                <div
                  key={notif.notification_id}
                  className={`notification-item ${estLu ? 'lu' : 'non-lu'} ${type}`}
                >
                  {!estLu && <div className="notification-bar" />}

                  <div className={`notification-icon ${type}`}>
                    <Icon size={20} />
                  </div>

                  <div className="notification-content">
                    <div className="notification-header-row">
                      <h4 className="notification-titre">{notif.titre}</h4>
                      <span className="notification-date">
                        {formatDate(notif.date_generation)}
                      </span>
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
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      className="notification-action-btn delete"
                      onClick={() => supprimerNotification(notif.notification_id)}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
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