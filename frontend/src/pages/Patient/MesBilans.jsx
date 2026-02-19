// src/pages/patient/MesBilans.jsx
import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import axios from 'axios';
import './MesBilans.css';

const API_BASE = 'http://127.0.0.1:8000';
const PATIENT_ID = 1; // ← À remplacer plus tard par l'ID dynamique du patient connecté

export default function MesBilans() {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBilans = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_BASE}/api/bilans-biologiques/patient/`,
          {
            params: {
              patient_id: PATIENT_ID,
              limit: 50,
              offset: 0,
            },
          }
        );

        const rawData = Array.isArray(response.data) 
          ? response.data 
          : response.data.results || response.data.data || [];

        console.log("Données brutes reçues :", rawData); // ← utile pour debug

        const formatted = rawData.map((item, index) => {
          // Debug temporaire : on log les valeurs suspectes
          if (item.statut != null && typeof item.statut !== 'string') {
            console.warn(`statut non-string pour bilan #${index + 1} :`, item.statut, item);
          }

          return {
            id: item.bilan_id || `temp-${index}`,
            type: item.type || 'Bilan non nommé',
            date: formatDate(item.date_generation),
            statut: item.statut ?? 'BROUILLON', // valeur par défaut si null/undefined
            nomFichier: item.nom_fichier || null,
            medecin: item.medecin_nom || 'Non renseigné',
            laboratoire: 'BioLab Central', // statique pour l'instant
          };
        });

        setBilans(formatted);
      } catch (err) {
        console.error('Erreur chargement bilans :', err);
        setError(
          err.response?.status === 404
            ? 'Aucun bilan trouvé pour ce patient.'
            : 'Impossible de charger vos bilans pour le moment.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBilans();
  }, []);

  // ────────────────────────────────────────────────
  // Fonction robuste pour gérer n'importe quelle valeur de statut
  // ────────────────────────────────────────────────
  const getStatusInfo = (statutRaw) => {
    // Conversion ultra-sécurisée en chaîne
    const s = String(statutRaw ?? 'BROUILLON')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_'); // au cas où il y aurait des espaces bizarres

    if (s === 'VALIDE' || s === 'VALIDÉ') {
      return {
        label: 'Validé',
        className: 'badge-valid',
        icon: CheckCircle,
        canDownload: true,
      };
    }

    if (s === 'EN_COURS' || s.includes('ENCOURS')) {
      return {
        label: 'En cours',
        className: 'badge-pending',
        icon: Clock,
        canDownload: false,
      };
    }

    if (s === 'BROUILLON') {
      return {
        label: 'En validation',
        className: 'badge-pending',
        icon: Clock,
        canDownload: false,
      };
    }

    if (s.includes('REJET') || s === 'REJETE' || s === 'REFUSE') {
      return {
        label: 'Rejeté',
        className: 'badge-rejected',
        icon: AlertCircle,
        canDownload: false,
      };
    }

    // Tout le reste → inconnu
    return {
      label: s || 'Inconnu',
      className: 'badge-unknown',
      icon: AlertCircle,
      canDownload: false,
    };
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fr-TN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const handleDownload = (nomFichier) => {
    if (!nomFichier) {
      alert('Aucun fichier disponible pour ce bilan.');
      return;
    }
    // Adapter selon votre configuration de stockage des fichiers
    const url = `${API_BASE}/media/bilans/${nomFichier}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="loading">Chargement de vos bilans...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="mes-bilans">
      <div className="mes-bilans-welcome-card">
        <div className="mes-bilans-welcome-header">
          <h2 className="mes-bilans-welcome-title">Mes Bilans</h2>
          <span className="mes-bilans-welcome-emoji">📋</span>
        </div>
        <p className="mes-bilans-welcome-subtitle">
          Consultez et téléchargez tous vos bilans médicaux.
        </p>
      </div>

      {bilans.length === 0 ? (
        <div className="no-bilans">
          <p>Aucun bilan disponible pour le moment.</p>
          <small>Les nouveaux résultats apparaîtront ici dès qu'ils seront validés.</small>
        </div>
      ) : (
        <div className="mes-bilans-list">
          {bilans.map((bilan) => {
            const statusInfo = getStatusInfo(bilan.statut);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={bilan.id} className="mes-bilans-card">
                <div className="mes-bilans-card-header">
                  <div className="mes-bilans-card-title-section">
                    <FileText size={24} color="#3b82f6" />
                    <div>
                      <h3 className="mes-bilans-card-title">{bilan.type}</h3>
                      <p className="mes-bilans-card-date">{bilan.date}</p>
                    </div>
                  </div>

                  <div className="mes-bilans-card-actions">
                    <div className={`mes-bilans-status-badge ${statusInfo.className}`}>
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </div>

                    {statusInfo.canDownload && bilan.nomFichier && (
                      <button
                        className="mes-bilans-btn-download"
                        onClick={() => handleDownload(bilan.nomFichier)}
                      >
                        <Download size={16} />
                        Télécharger
                      </button>
                    )}
                  </div>
                </div>

                <div className="mes-bilans-card-details">
                  <p className="mes-bilans-detail-item">
                    <strong>Type :</strong> {bilan.type}
                  </p>
                  <p className="mes-bilans-detail-item">
                    <strong>Laboratoire :</strong> {bilan.laboratoire}
                  </p>
                  <p className="mes-bilans-detail-item">
                    <strong>Médecin prescripteur :</strong> {bilan.medecin}
                  </p>
                </div>

                {(statusInfo.label === 'En validation' || statusInfo.label === 'Rejeté') && (
                  <div className={`mes-bilans-card-alert ${statusInfo.className.includes('pending') ? 'pending' : 'rejected'}`}>
                    <p>
                      {statusInfo.label === 'En validation'
                        ? 'Ce bilan est en cours de validation. Vous serez notifié dès qu’il sera prêt.'
                        : 'Ce bilan a été rejeté. Contactez votre médecin pour plus d’informations.'}
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