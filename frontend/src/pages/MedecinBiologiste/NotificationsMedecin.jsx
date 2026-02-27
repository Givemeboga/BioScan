// src/pages/MedecinBiologiste/NotificationsMedecin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './NotificationsMedecin.css';

const API_BASE = 'http://localhost:8000/api';

function getToken() {
  return (
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')
  );
}

function getUserId() {
  try {
    const raw = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
    if (raw) return parseInt(raw, 10);
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id || parseInt(payload.sub, 10) || null;
  } catch (_) { return null; }
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const TYPE_META = {
  bilan:    { icon: '🧪', label: 'Bilan',    bg: '#dbeafe', color: '#1d4ed8', iconBg: '#dbeafe' },
  anomalie: { icon: '⚠️', label: 'Anomalie', bg: '#fef3c7', color: '#b45309', iconBg: '#fef3c7' },
  system:   { icon: '🔄', label: 'Système',  bg: '#dcfce7', color: '#15803d', iconBg: '#dcfce7' },
  message:  { icon: '✉️', label: 'Message',  bg: '#ede9fe', color: '#7c3aed', iconBg: '#ede9fe' },
};

function getType(titre = '') {
  const t = titre.toLowerCase();
  if (t.includes('bilan'))     return 'bilan';
  if (t.includes('anomal'))    return 'anomalie';
  if (t.includes('message'))   return 'message';
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

export default function NotificationsMedecin() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [filter,        setFilter]        = useState('ALL');

  const userId = getUserId();

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setError('Identifiant introuvable. Reconnectez-vous.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: 100, offset: 0 });
      const res = await fetch(
        `${API_BASE}/notifications/patient/${userId}?${params}`,
        { headers: authHeaders() }
      );
      if (res.status === 401) throw new Error('Session expirée, reconnectez-vous.');
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
  }, [userId]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Computed ─────────────────────────────────────────────
  const unreadCount = notifications.filter(n => n.statut === 'UNREAD').length;
  const displayed   = notifications.filter(n => {
    if (filter === 'UNREAD') return n.statut === 'UNREAD';
    if (filter === 'READ')   return n.statut === 'READ';
    return true;
  });

  // ── Actions ──────────────────────────────────────────────
  const markAsRead = async (notification_id) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notification_id}/lire`, {
        method: 'PUT', headers: authHeaders(),
      });
      if (!res.ok) return;
      setNotifications(prev =>
        prev.map(n => n.notification_id === notification_id ? { ...n, statut: 'READ' } : n)
      );
    } catch (err) { console.error('[markAsRead]', err); }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/patient/${userId}/lire-tout`, {
        method: 'PUT', headers: authHeaders(),
      });
      if (!res.ok) return;
      setNotifications(prev => prev.map(n => ({ ...n, statut: 'READ' })));
    } catch (err) { console.error('[markAllAsRead]', err); }
  };

  const deleteNotification = async (notification_id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/notifications/${notification_id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) return;
      setNotifications(prev => prev.filter(n => n.notification_id !== notification_id));
    } catch (err) { console.error('[deleteNotification]', err); }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="nm-page">

      {/* Header */}
      <div className="nm-header">
        <div>
          <h1>🔔 Mes Notifications</h1>
          <p>
            Vous avez <strong>{unreadCount}</strong>{' '}
            notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="nm-actions">
          {unreadCount > 0 && (
            <button className="nm-btn-primary" onClick={markAllAsRead}>
              ✅ Tout marquer comme lu
            </button>
          )}
          <button className="nm-btn-secondary" onClick={fetchNotifications}>
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="nm-tabs">
        {[
          { key: 'ALL',    label: 'Toutes',   count: notifications.length },
          { key: 'UNREAD', label: 'Non lues', count: unreadCount },
          { key: 'READ',   label: 'Lues',     count: notifications.length - unreadCount },
        ].map(f => (
          <button
            key={f.key}
            className={`nm-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.count > 0 && (
              <span className="nm-badge">{f.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div className="nm-stats">
          <strong>{displayed.length}</strong> notification{displayed.length !== 1 ? 's' : ''} affichée{displayed.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="nm-loading">
          <div className="nm-spinner" />
          <p>Chargement des notifications…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="nm-error">
          <span>⚠️ {error}</span>
          <button onClick={fetchNotifications}>Réessayer</button>
        </div>
      )}

      {/* List */}
      {!loading && !error && (
        <div className="nm-list">
          {displayed.length === 0 ? (
            <div className="nm-empty">
              <div className="nm-empty-icon">🔔</div>
              <h3>Aucune notification</h3>
              <p>Vous serez notifié(e) dès qu'il y aura du nouveau.</p>
            </div>
          ) : (
            displayed.map((notif) => {
              const isRead = notif.statut === 'READ';
              const type   = getType(notif.titre);
              const meta   = TYPE_META[type];

              return (
                <div
                  key={notif.notification_id}
                  className={`nm-item ${isRead ? 'read' : 'unread'}`}
                  onClick={() => !isRead && markAsRead(notif.notification_id)}
                >
                  {/* Icon */}
                  <div className="nm-icon" style={{ background: meta.iconBg }}>
                    {meta.icon}
                  </div>

                  {/* Content */}
                  <div className="nm-content">
                    <div className="nm-content-header">
                      <h3 className="nm-title">{notif.titre || '(Sans titre)'}</h3>
                      <span
                        className="nm-type-badge"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {notif.description && (
                      <p className="nm-desc">{notif.description}</p>
                    )}

                    <div className="nm-meta">
                      <span className="nm-time">🕐 {timeAgo(notif.date_generation)}</span>
                      {notif.date_generation && (
                        <span className="nm-date">
                          {new Date(notif.date_generation).toLocaleString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="nm-item-actions">
                    {!isRead && (
                      <button
                        className="nm-btn-read"
                        title="Marquer comme lu"
                        onClick={(e) => { e.stopPropagation(); markAsRead(notif.notification_id); }}
                      >✓</button>
                    )}
                    <button
                      className="nm-btn-del"
                      title="Supprimer"
                      onClick={(e) => deleteNotification(notif.notification_id, e)}
                    >✕</button>
                  </div>

                  {/* Unread dot */}
                  {!isRead && <div className="nm-dot" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}