// src/pages/patient/MesBilans.jsx
import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Download, RefreshCw } from 'lucide-react';
import './MesBilans.css';

const API_BASE_URL = 'http://localhost:8000';

export default function MesBilans() {
  const [bilans, setBilans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const token = localStorage.getItem('token');

  const fetchBilans = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Vous devez être connecté pour voir vos bilans.');
      setLoading(false);
      return;
    }

    try {
      // ✅ GET /api/bilans-biologiques/ → filtre automatiquement par patient connecté
      const response = await fetch(`${API_BASE_URL}/api/bilans-biologiques/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Session expirée, veuillez vous reconnecter.');
        if (response.status === 404) throw new Error('Aucun profil patient associé à ce compte.');
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();
      setBilans(data);
    } catch (err) {
      console.error('[MesBilans] Erreur :', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBilans(); }, []);

  const getStatusInfo = (statutRaw) => {
    const s = String(statutRaw ?? 'BROUILLON').trim().toUpperCase().replace(/\s+/g, '_');
    if (s === 'VALIDE' || s === 'VALIDÉ')  return { label: 'Validé',        className: 'badge-valid',    icon: CheckCircle, canDownload: true  };
    if (s === 'EN_COURS')                  return { label: 'En cours',      className: 'badge-pending',  icon: Clock,       canDownload: false };
    if (s === 'BROUILLON')                 return { label: 'En validation', className: 'badge-pending',  icon: Clock,       canDownload: false };
    if (s === 'REJETE' || s === 'REJETÉ')  return { label: 'Rejeté',        className: 'badge-rejected', icon: AlertCircle, canDownload: false };
    return                                        { label: 'Inconnu',       className: 'badge-unknown',  icon: AlertCircle, canDownload: false };
  };

  const handleDownload = async (nomFichier) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/bilans-biologiques/download/${nomFichier}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Fichier introuvable');
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = nomFichier; a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Erreur téléchargement : ${err.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  // ── Loading ──
  if (loading) return (
    <div className="mes-bilans">
      <WelcomeCard />
      <div className="mes-bilans-loading">
        <RefreshCw size={32} className="spin" />
        <p>Chargement de vos bilans...</p>
      </div>
    </div>
  );

  // ── Erreur ──
  if (error) return (
    <div className="mes-bilans">
      <WelcomeCard />
      <div className="mes-bilans-error">
        <AlertCircle size={32} color="#ef4444" />
        <p>{error}</p>
        <button className="mes-bilans-btn-retry" onClick={fetchBilans}>
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    </div>
  );

  // ── Résultat ──
  return (
    <div className="mes-bilans">
      <WelcomeCard count={bilans.length} />

      {bilans.length === 0 ? (
        <div className="no-bilans">
          <FileText size={48} color="#94a3b8" />
          <p>Aucun bilan disponible pour le moment.</p>
        </div>
      ) : (
        <div className="mes-bilans-list">
          {bilans.map((bilan) => {
            const statusInfo = getStatusInfo(bilan.statut);
            const StatusIcon = statusInfo.icon;
            return (
              <div key={bilan.bilan_id} className="mes-bilans-card">
                <div className="mes-bilans-card-header">
                  <div className="mes-bilans-card-title-section">
                    <FileText size={24} color="#3b82f6" />
                    <div>
                      <h3 className="mes-bilans-card-title">{bilan.type || '—'}</h3>
                      <p className="mes-bilans-card-date">{formatDate(bilan.date_generation)}</p>
                    </div>
                  </div>
                  <div className="mes-bilans-card-actions">
                    <div className={`mes-bilans-status-badge ${statusInfo.className}`}>
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </div>
                    {statusInfo.canDownload && bilan.nom_fichier && (
                      <button
                        className="mes-bilans-btn-download"
                        onClick={() => handleDownload(bilan.nom_fichier)}
                      >
                        <Download size={16} /> Télécharger
                      </button>
                    )}
                  </div>
                </div>

                <div className="mes-bilans-card-details">
                  <p className="mes-bilans-detail-item"><strong>Patient :</strong> {bilan.patient_nom_complet || '—'}</p>
                  {bilan.age && (
                    <p className="mes-bilans-detail-item"><strong>Âge :</strong> {bilan.age} ans</p>
                  )}
                </div>

                {(statusInfo.label === 'En validation' || statusInfo.label === 'Rejeté') && (
                  <div className={`mes-bilans-card-alert ${statusInfo.className.includes('pending') ? 'pending' : 'rejected'}`}>
                    <p>
                      {statusInfo.label === 'En validation'
                        ? "Ce bilan est en cours de validation. Vous serez notifié dès qu'il sera prêt."
                        : "Ce bilan a été rejeté. Contactez votre médecin pour plus d'informations."}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WelcomeCard({ count }) {
  return (
    <div className="mes-bilans-welcome-card">
      <div className="mes-bilans-welcome-header">
        <h2 className="mes-bilans-welcome-title">Mes Bilans</h2>
        <span className="mes-bilans-welcome-emoji">📋</span>
      </div>
      <p className="mes-bilans-welcome-subtitle">
        Consultez et téléchargez vos bilans médicaux.
        {count !== undefined && count > 0 && (
          <span className="mes-bilans-count"> — {count} bilan{count > 1 ? 's' : ''}</span>
        )}
      </p>
    </div>
  );
}