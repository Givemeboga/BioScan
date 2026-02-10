// src/pages/Notification/Notification.jsx
import React, { useState } from 'react';
import './Notification.css';

export default function Notification() {
  // Données mock (statiques) – tu peux les remplacer par un appel API plus tard
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'bilan',
      title: 'Nouveau bilan validé',
      message: 'Le bilan de M. Ahmed Ben Ali (ID: #1234) a été validé avec succès.',
      time: 'Il y a 15 minutes',
      date: '2026-02-07 14:30',
      read: false,
      priority: 'high',
    },
    {
      id: 2,
      type: 'anomalie',
      title: 'Rapport d\'anomalie créé',
      message: 'Un rapport d\'anomalie a été généré pour la patiente Fatma Trabelsi.',
      time: 'Il y a 2 heures',
      date: '2026-02-07 11:15',
      read: false,
      priority: 'medium',
    },
    {
      id: 3,
      type: 'system',
      title: 'Mise à jour système',
      message: 'La plateforme BioScan est maintenant en version 2.1.0.',
      time: 'Hier',
      date: '2026-02-06 09:45',
      read: true,
      priority: 'low',
    },
    {
      id: 4,
      type: 'message',
      title: 'Nouveau message du technicien',
      message: 'Bonjour Dr. Besbes, le bilan #5678 est prêt pour validation.',
      time: 'Il y a 3 jours',
      date: '2026-02-05 16:20',
      read: true,
      priority: 'medium',
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-page">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>
          Vous avez <strong>{unreadCount}</strong> notification(s) non lue(s)
        </p>

        {unreadCount > 0 && (
          <button className="btn-mark-all" onClick={markAllAsRead}>
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>Aucune notification</h3>
            <p>Vous serez notifié(e) dès qu'il y aura du nouveau.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${notif.read ? 'read' : 'unread'} ${notif.priority}`}
              onClick={() => !notif.read && markAsRead(notif.id)}
            >
              <div className="notification-icon">
                {notif.type === 'bilan' && <span>🧪</span>}
                {notif.type === 'anomalie' && <span>⚠️</span>}
                {notif.type === 'system' && <span>🔄</span>}
                {notif.type === 'message' && <span>✉️</span>}
              </div>

              <div className="notification-content">
                <h3 className="notification-title">{notif.title}</h3>
                <p className="notification-message">{notif.message}</p>
                <div className="notification-meta">
                  <span className="notification-time">{notif.time}</span>
                  <span className="notification-date">{notif.date}</span>
                </div>
              </div>

              {!notif.read && <div className="unread-indicator" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}