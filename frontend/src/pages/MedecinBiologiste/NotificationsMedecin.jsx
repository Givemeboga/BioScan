import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, RefreshCw, FileText, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import './NotificationsMedecin.css';

const API_BASE = 'http://127.0.0.1:8000';

const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  sessionStorage.getItem('token') ||
  null;

const authHeaders = () => {
  const token = getToken();
  if (!token) throw new Error('Aucun token trouvé');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const NotifIcon = ({ type }) => {
  const p = { size: 18 };
  const t = (type || 'info').toUpperCase();
  switch (t) {
    case 'BILAN':   return <FileText      {...p} />;
    case 'RAPPORT': return <FileText      {...p} />;
    case 'ALERTE':  return <AlertTriangle {...p} />;
    case 'SUCCES':  return <CheckCircle   {...p} />;
    default:        return <Info          {...p} />;
  }
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Date invalide';
  
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60)     return "À l'instant";
  if (diff < 3600)   return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400)  return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Normalisation des champs
const getId     = (n) => n.id || n.notification_id || null;
const getStatut = (n) => (n.statut_notification || n.statut || 'READ').toUpperCase();
const getMessage= (n) => n.titre || n.message || n.contenu || 'Notification sans titre';
const getType   = (n) => n.type || 'info';
const getDate   = (n) => n.date_generation || n.date_envoi || n.created_at;

const FILTERS = [
  { value: 'ALL',    label: 'Toutes'   },
  { value: 'UNREAD', label: 'Non lues' },
  { value: 'READ',   label: 'Lues'     },
];

export default function NotificationsMedecin() {
  const [notifs,       setNotifs]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [filter,       setFilter]       = useState('ALL');
  const [actionMap,    setActionMap]    = useState({}); // id → 'read'|'delete'|null

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = authHeaders();
      const params = new URLSearchParams({ limit: '100', offset: '0' });
      if (filter !== 'ALL') params.append('statut', filter);

      const url = `${API_BASE}/api/notifications/me?${params}`;
      const res = await fetch(url, { headers, method: 'GET' });

      if (res.status === 401 || res.status === 403) {
        throw new Error('Session expirée ou accès refusé. Veuillez vous reconnecter.');
      }
      if (res.status === 405) {
        throw new Error('Méthode non autorisée (405). Vérifiez la configuration backend.');
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Erreur ${res.status} : ${txt || res.statusText}`);
      }

      const data = await res.json();
      setNotifs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[fetchNotifs]', err);
      setError(err.message || 'Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const updateAction = (id, actionType = null) => {
    setActionMap(prev => ({ ...prev, [id]: actionType }));
  };

  const markAsRead = async (id) => {
    if (!id) return;
    updateAction(id, 'read');
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: authHeaders(),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Erreur ${res.status}: ${txt || 'Échec'}`);
      }

      setNotifs(prev =>
        prev.map(n => getId(n) === id ? { ...n, statut_notification: 'READ' } : n)
      );
    } catch (err) {
      console.error('[markAsRead]', err);
      alert('Échec de la mise à jour : ' + err.message);
    } finally {
      updateAction(id, null);
    }
  };

  const deleteNotif = async (id) => {
    if (!id || !window.confirm('Supprimer cette notification ?')) return;
    updateAction(id, 'delete');
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      
      setNotifs(prev => prev.filter(n => getId(n) !== id));
    } catch (err) {
      console.error('[deleteNotif]', err);
      alert('Impossible de supprimer');
    } finally {
      updateAction(id, null);
    }
  };

  const markAllRead = async () => {
    if (!window.confirm('Marquer toutes les notifications comme lues ?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/notifications/me/read-all`, {
        method: 'PUT',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      setNotifs(prev => prev.map(n => ({ ...n, statut_notification: 'READ' })));
    } catch (err) {
      console.error('[markAllRead]', err);
      alert('Échec : ' + err.message);
    }
  };

  const unreadCount = notifs.filter(n => getStatut(n) === 'UNREAD').length;

  return (
    <div className="nm-page">
      <div className="nm-header">
        <div className="nm-header-left">
          <div className="nm-header-icon">
            <Bell size={22} />
            {unreadCount > 0 && <span className="nm-header-badge">{unreadCount}</span>}
          </div>
          <div>
            <h1 className="nm-title">Notifications</h1>
            <p className="nm-subtitle">
              {unreadCount > 0
                ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Aucune notification en attente'}
            </p>
          </div>
        </div>

        <div className="nm-header-actions">
          {unreadCount > 0 && (
            <button className="nm-btn nm-btn-secondary" onClick={markAllRead}>
              <CheckCheck size={15} /> Tout marquer lu
            </button>
          )}
          <button
            className="nm-btn nm-btn-icon"
            onClick={fetchNotifs}
            disabled={loading}
            title="Actualiser"
          >
            <RefreshCw size={15} className={loading ? 'nm-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="nm-filters">
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`nm-filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            {f.value === 'UNREAD' && unreadCount > 0 && (
              <span className="nm-filter-count">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="nm-loading">
          <RefreshCw size={30} className="nm-spin" />
          <p>Chargement des notifications...</p>
        </div>
      ) : error ? (
        <div className="nm-error">
          <AlertTriangle size={26} />
          <p>{error}</p>
          <button className="nm-btn nm-btn-primary" onClick={fetchNotifs}>
            Réessayer
          </button>
        </div>
      ) : notifs.length === 0 ? (
        <div className="nm-empty">
          <div className="nm-empty-icon">
            <Bell size={38} strokeWidth={1.2} />
          </div>
          <p className="nm-empty-title">Aucune notification</p>
          <p className="nm-empty-sub">
            {filter === 'UNREAD'
              ? 'Toutes vos notifications sont lues.'
              : "Vous n'avez reçu aucune notification pour le moment."}
          </p>
        </div>
      ) : (
        <div className="nm-list">
          {notifs.map((n) => {
            const id     = getId(n);
            if (!id) return null;

            const statut   = getStatut(n);
            const isUnread = statut === 'UNREAD';
            const typeKey  = getType(n).toLowerCase();
            const action   = actionMap[id] || null;

            return (
              <div
                key={id}
                className={`nm-item ${isUnread ? 'nm-item--unread' : ''} nm-item--${typeKey}`}
              >
                {isUnread && <div className="nm-unread-dot" />}

                <div className={`nm-item-icon nm-item-icon--${typeKey}`}>
                  <NotifIcon type={typeKey} />
                </div>

                <div className="nm-item-body">
                  <p className="nm-item-message">{getMessage(n)}</p>
                  <span className="nm-item-date">{formatDate(getDate(n))}</span>
                </div>

                <div className="nm-item-actions">
                  {isUnread && (
                    <button
                      className="nm-action-btn nm-action-btn--read"
                      onClick={() => markAsRead(id)}
                      disabled={!!action}
                      title="Marquer comme lu"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button
                    className="nm-action-btn nm-action-btn--delete"
                    onClick={() => deleteNotif(id)}
                    disabled={!!action}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}