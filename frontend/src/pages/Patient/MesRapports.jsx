// src/pages/patient/MesRapports.jsx
import React, { useEffect, useState } from "react";
import {
  FileText, CheckCircle, Clock, AlertCircle,
  Download, RefreshCw,
} from "lucide-react";
import "./MesRapports.css";

const API_BASE = "http://localhost:8000";

export default function MesRapports() {
  const [rapports,      setRapports]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [statutFilter,  setStatutFilter]  = useState("");

  const token = localStorage.getItem("token");

  const fetchRapports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: 50, offset: 0 });
      if (statutFilter) params.append("statut", statutFilter);

      const res = await fetch(
        `${API_BASE}/api/rapports-medicaux/?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expirée, veuillez vous reconnecter.");
        throw new Error(`Erreur serveur : ${res.status}`);
      }

      const data = await res.json();
      setRapports(data);
    } catch (err) {
      console.error("Erreur chargement rapports :", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRapports();
  }, [statutFilter]);

  const handleDownload = async (nomFichier) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/rapports-medicaux/download/${nomFichier}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Fichier introuvable");
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = nomFichier;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Erreur téléchargement : ${err.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  const getStatusInfo = (statut) => {
    const s = (statut || "").toUpperCase();
    if (s === "VALIDE")     return { label: "Validé",       className: "badge-valid",    icon: CheckCircle, canDownload: true  };
    if (s === "EN_COURS")   return { label: "En cours",     className: "badge-pending",  icon: Clock,       canDownload: false };
    if (s === "BROUILLON")  return { label: "En validation", className: "badge-pending", icon: Clock,       canDownload: false };
    if (s === "EN_ATTENTE") return { label: "En attente",   className: "badge-pending",  icon: Clock,       canDownload: false };
    if (s === "REJETE")     return { label: "Rejeté",       className: "badge-rejected", icon: AlertCircle, canDownload: false };
    return                         { label: statut,         className: "badge-unknown",  icon: AlertCircle, canDownload: false };
  };

  if (loading) return (
    <div className="mes-rapports">
      <div className="mes-rapports-welcome-card">
        <div className="mes-rapports-welcome-header">
          <h2>Mes Rapports Médicaux</h2>
          <span>📄</span>
        </div>
      </div>
      <div className="mes-rapports-loading">
        <RefreshCw size={32} className="spin" />
        <p>Chargement de vos rapports...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="mes-rapports">
      <div className="mes-rapports-welcome-card">
        <div className="mes-rapports-welcome-header">
          <h2>Mes Rapports Médicaux</h2>
          <span>📄</span>
        </div>
      </div>
      <div className="mes-rapports-error">
        <AlertCircle size={32} color="#ef4444" />
        <p>{error}</p>
        <button onClick={fetchRapports}>
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="mes-rapports">

      <div className="mes-rapports-welcome-card">
        <div className="mes-rapports-welcome-header">
          <h2>Mes Rapports Médicaux</h2>
          <span>📄</span>
        </div>
        <p>Consultez et téléchargez tous vos rapports médicaux.</p>
      </div>

      {/* Filtre statut */}
      <div className="mes-rapports-filters">
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="VALIDE">Validé</option>
          <option value="BROUILLON">Brouillon</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="EN_COURS">En cours</option>
          <option value="REJETE">Rejeté</option>
        </select>
      </div>

      {rapports.length === 0 ? (
        <div className="no-rapports">
          <FileText size={48} color="#94a3b8" />
          <p>Aucun rapport disponible pour le moment.</p>
        </div>
      ) : (
        <div className="mes-rapports-list">
          {rapports.map((rapport) => {
            const statusInfo = getStatusInfo(rapport.statut);
            const StatusIcon = statusInfo.icon;
            return (
              <div key={rapport.rapport_medical_id} className="mes-rapports-card">

                <div className="mes-rapports-card-header">
                  <div className="mes-rapports-card-title-section">
                    <FileText size={24} color="#2e7fc1" />
                    <div>
                      <h3>{rapport.bilan_type || "Rapport médical"}</h3>
                      <p className="mes-rapports-card-date">
                        {formatDate(rapport.date_generation)}
                      </p>
                    </div>
                  </div>

                  <div className="mes-rapports-card-actions">
                    <div className={`mes-rapports-status-badge ${statusInfo.className}`}>
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </div>

                    {statusInfo.canDownload && rapport.bilan_nom_fichier && (
                      <button
                        className="mes-rapports-btn-download"
                        onClick={() => handleDownload(rapport.bilan_nom_fichier)}
                      >
                        <Download size={16} />
                        Télécharger
                      </button>
                    )}
                  </div>
                </div>

                <div className="mes-rapports-card-details">
                  <p><strong>Patient :</strong> {rapport.patient_nom_complet || "—"}</p>
                  {rapport.age && <p><strong>Âge :</strong> {rapport.age} ans</p>}
                  {rapport.date_validation && (
                    <p><strong>Validé le :</strong> {formatDate(rapport.date_validation)}</p>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}