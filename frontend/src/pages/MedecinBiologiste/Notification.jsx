// src/pages/Notification/Notification.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './Notification.css';

// ✅ Toujours "localhost" — jamais "127.0.0.1" pour éviter les blocages CORS
const API_BASE = 'http://localhost:8000/api';

function getToken() {
  return (
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')
  );
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const TYPE_META = {
  bilan:    { icon: '🧪', label: 'Bilan' },
  anomalie: { icon: '⚠️', label: 'Anomalie' },
  system:   { icon: '🔄', label: 'Système' },
  message:  { icon: '✉️', label: 'Message' },
};

function getType(titre = '') {
  const t = titre.toLowerCase();
  if (t.includes('bilan'))   return 'bilan';
  if (t.includes('anomal'))  return 'anomalie';
  if (t.includes('message')) return 'message';
  return 'system';
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "À l'instant";
  if (mins  < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours} h`;
  if (days  < 7)  return `Il y a ${days} j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [filter,        setFilter]        = useState('ALL');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: 100, offset: 0 });
      if (filter !== 'ALL') params.set('statut', filter);

      const res = await fetch(`${API_BASE}/notifications/me?${params}`, {
        headers: authHeaders(),
      });
      if (res.status === 401) throw new Error('Session expirée, veuillez vous reconnecter.');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Erreur ${res.status}`);
      }
      setNotifications(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/me/count`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.unread_count ?? 0);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchCount();
  }, [fetchNotifications, fetchCount]);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT', headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, statut_notification: 'READ' } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) { console.error('[markAsRead]', err); }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/me/read-all`, {
        method: 'PUT', headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setNotifications(prev => prev.map(n => ({ ...n, statut_notification: 'READ' })));
      setUnreadCount(0);
    } catch (err) { console.error('[markAllAsRead]', err); }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const removed = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (removed?.statut_notification === 'UNREAD') setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) { console.error('[deleteNotification]', err); }
  };

  return (
    <div className="notification-page">
      <div className="page-header">
        <div className="header-left">
          <h1>🔔 Notifications</h1>
          <p>
            Vous avez <strong>{unreadCount}</strong>{' '}
            notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="btn-mark-all" onClick={markAllAsRead}>
              ✅ Tout marquer comme lu
            </button>
          )}
          <button className="btn-refresh" onClick={() => { fetchNotifications(); fetchCount(); }}>
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        {[
          { key: 'ALL',    label: 'Toutes' },
          { key: 'UNREAD', label: 'Non lues' },
          { key: 'READ',   label: 'Lues' },
        ].map(f => (
          <button
            key={f.key}
            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === 'UNREAD' && unreadCount > 0 && (
              <span className="tab-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Chargement des notifications…</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-state">
          <span>⚠️ {error}</span>
          <button onClick={() => { fetchNotifications(); fetchCount(); }}>Réessayer</button>
        </div>
      )}

      {!loading && !error && (
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>Aucune notification</h3>
              <p>Vous serez notifié(e) dès qu'il y aura du nouveau.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isRead = notif.statut_notification === 'READ';
              const type   = getType(notif.titre);
              const meta   = TYPE_META[type] || TYPE_META.system;
              return (
                <div
                  key={notif.id}
                  className={`notification-item ${isRead ? 'read' : 'unread'}`}
                  onClick={() => !isRead && markAsRead(notif.id)}
                >
                  <div className={`notification-icon icon-${type}`}>
                    <span>{meta.icon}</span>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h3 className="notification-title">{notif.titre || '(Sans titre)'}</h3>
                      <span className={`badge badge-${type}`}>{meta.label}</span>
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">🕐 {timeAgo(notif.date_generation)}</span>
                      {notif.date_generation && (
                        <span className="notification-date">
                          {new Date(notif.date_generation).toLocaleString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!isRead && (
                      <button
                        className="btn-read"
                        title="Marquer comme lu"
                        onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                      >✓</button>
                    )}
                    <button
                      className="btn-delete"
                      title="Supprimer"
                      onClick={(e) => deleteNotification(notif.id, e)}
                    >✕</button>
                  </div>
                  {!isRead && <div className="unread-dot" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}