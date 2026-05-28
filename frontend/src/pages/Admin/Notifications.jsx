import React, { useEffect, useMemo, useState } from 'react';
import { notificationsService } from '../../services/adminService';
import './Notifications.css';

const FILTERS = [
  { key: 'TOUS', label: 'Toutes' },
  { key: 'danger', label: 'Critiques' },
  { key: 'warning', label: 'Alertes' },
  { key: 'info', label: 'Infos' },
];

function SeverityIcon({ severity }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  if (severity === 'danger') {
    return (
      <svg {...common}>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  if (severity === 'warning') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('TOUS');

  const load = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getNotifications({ limit: 100 });
      setNotifications(data?.notifications || []);
      setError(null);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    const previous = notifications;
    setNotifications((list) => list.filter((n) => n.id !== id));
    try {
      await notificationsService.deleteNotification(id);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setNotifications(previous); // rollback
    }
  };

  const counts = useMemo(() => {
    return notifications.reduce(
      (acc, n) => {
        acc.TOUS += 1;
        acc[n.severity] = (acc[n.severity] || 0) + 1;
        return acc;
      },
      { TOUS: 0, danger: 0, warning: 0, info: 0 }
    );
  }, [notifications]);

  const visible = useMemo(() => {
    if (filter === 'TOUS') return notifications;
    return notifications.filter((n) => n.severity === filter);
  }, [notifications, filter]);

  return (
    <div className="admin-notifications">
      <div className="notif-header">
        <div className="notif-header-text">
          <h1>Notifications</h1>
          <p>Journal des événements système et de sécurité</p>
        </div>
        <button className="btn-refresh" onClick={load} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Actualiser
        </button>
      </div>

      <div className="notif-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`notif-filter ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="notif-filter-count">{counts[f.key] || 0}</span>
          </button>
        ))}
      </div>

      <div className="notif-card">
        {loading ? (
          <div className="notif-state">Chargement des notifications…</div>
        ) : error ? (
          <div className="notif-state error">Erreur : {error}</div>
        ) : visible.length === 0 ? (
          <div className="notif-state">Aucune notification à afficher.</div>
        ) : (
          <ul className="notif-list">
            {visible.map((n) => (
              <li key={n.id} className={`notif-item sev-${n.severity}`}>
                <span className={`notif-icon sev-${n.severity}`}>
                  <SeverityIcon severity={n.severity} />
                </span>
                <div className="notif-body">
                  <div className="notif-title-row">
                    <span className="notif-title">{n.title}</span>
                    {n.status && (
                      <span className={`notif-status ${String(n.status).toUpperCase() === 'SUCCESS' ? 'ok' : 'fail'}`}>
                        {n.status}
                      </span>
                    )}
                  </div>
                  <div className="notif-meta">
                    {n.username ? (
                      <span className="notif-user">{n.username}</span>
                    ) : (
                      <span className="notif-user muted">Utilisateur inconnu</span>
                    )}
                    {n.email && <span className="notif-sep">•</span>}
                    {n.email && <span className="notif-email">{n.email}</span>}
                    {n.ip && <span className="notif-sep">•</span>}
                    {n.ip && <span className="notif-ip">IP {n.ip}</span>}
                  </div>
                </div>
                <button
                  className="notif-delete"
                  title="Supprimer"
                  aria-label="Supprimer la notification"
                  onClick={() => handleDelete(n.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
