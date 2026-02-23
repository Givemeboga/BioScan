// src/pages/medecin/BilanBiologique.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BilanBiologique.css';

export default function BilanBiologiqueMedecin() {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pour le modal
  const [selectedBilan, setSelectedBilan] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [prioriteFilter, setPrioriteFilter] = useState('Tous');

  // ────────────────────────────────────────────────
  // Configuration – À adapter selon ton backend
  // ────────────────────────────────────────────────
  const API_BASE = 'http://127.0.0.1:8000';
  const MEDECIN_ID = 1; // ← Pour tester – à remplacer par l'ID réel du médecin connecté

  useEffect(() => {
    const API_URL = `${API_BASE}/api/bilans-biologiques/patient/medecin?medecin_id=${MEDECIN_ID}`;
    const fetchBilansMedecin = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(API_URL, {
          params: {
            limit: 50,   // optionnel – tu peux augmenter
            offset: 0,
          },
        });

        let rawData = response.data;

        // Normalisation au cas où la réponse serait paginée ou enveloppée
        if (Array.isArray(rawData)) {
          // cas le plus courant avec FastAPI liste directe
        } else if (rawData.results) {
          rawData = rawData.results;
        } else if (rawData.data) {
          rawData = rawData.data;
        } else {
          rawData = [];
        }

        const formatted = rawData.map(item => ({
          id: item.bilan_id || Math.random().toString(36).slice(2),
          patient: item.patient_nom_complet || 'Patient inconnu',
          age: item.age ?? '—',
          date: formatDate(item.date_generation),
          type: item.type || (item.nom_fichier?.replace('.pdf', '') || 'Bilan inconnu'),
          statut: mapStatut(item.statut),
          priorite: estimerPriorite(item.statut),
          // Optionnel : on peut stocker plus d’infos si besoin
          fichier: item.nom_fichier,
          bilanId: item.bilan_id,
        }));

        setBilans(formatted);
      } catch (err) {
        console.error('Erreur chargement bilans médecin:', err);
        setError(
          err.response?.status === 404
            ? 'Aucun bilan trouvé pour ce médecin ou route non disponible.'
            : 'Impossible de charger les bilans.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBilansMedecin();
  }, []); // ← dépendances vides → exécuté une seule fois

  // Helpers (inchangés ou légèrement améliorés)
  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'Date invalide';
    }
  };

  const mapStatut = (statut) => {
    const s = (statut || '').toUpperCase();
    if (s === 'BROUILLON') return 'En attente';
    if (s === 'EN_COURS')  return 'En cours';
    if (s === 'TERMINE')   return 'Terminé';
    if (s === 'VALIDE')    return 'Validé';
    return s || 'En attente';
  };

  const estimerPriorite = (statut) => {
    const s = (statut || '').toUpperCase();
    if (s === 'BROUILLON' || s === 'EN_COURS') return 'Haute';
    if (s === 'TERMINE' || s === 'VALIDE')     return 'Faible';
    return 'Moyenne';
  };

  // Filtrage client-side
  const filteredBilans = bilans.filter((bilan) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      bilan.patient.toLowerCase().includes(searchLower) ||
      bilan.type.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'Tous' || bilan.statut === statusFilter;
    const matchesPriorite = prioriteFilter === 'Tous' || bilan.priorite === prioriteFilter;

    return matchesSearch && matchesStatus && matchesPriorite;
  });

  const openDetails = (bilan) => setSelectedBilan(bilan);
  const closeModal = () => setSelectedBilan(null);

  if (loading) return <div className="loading">Chargement des bilans assignés...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="bilan-biologique-page">
      <div className="page-header">
        <h1>Mes Bilans Biologiques</h1>
        <p>Analyses qui vous ont été assignées</p>
      </div>

      <div className="actions-bar">
        <div className="search-filter-group">
          <input
            type="text"
            placeholder="Rechercher patient ou type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Validé">Validé</option>
          </select>

          <select
            value={prioriteFilter}
            onChange={(e) => setPrioriteFilter(e.target.value)}
            className="status-filter"
          >
            <option value="Tous">Toutes priorités</option>
            <option value="Haute">Haute</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Faible">Faible</option>
          </select>
        </div>
      </div>

      <div className="results-info">
        {filteredBilans.length} bilan(s) assigné(s) trouvé(s)
      </div>

      <div className="table-container">
        <table className="bilan-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Priorité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBilans.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  Aucun bilan ne vous est assigné ou ne correspond à vos filtres
                </td>
              </tr>
            ) : (
              filteredBilans.map((bilan) => (
                <tr
                  key={bilan.id}
                  className={bilan.priorite === 'Haute' ? 'row-highlight' : ''}
                >
                  <td className="patient-name">
                    {bilan.patient} <span className="age">({bilan.age})</span>
                  </td>
                  <td>{bilan.date}</td>
                  <td>{bilan.type}</td>
                  <td>
                    <span className={`status-badge ${bilan.statut.toLowerCase().replace(/\s+/g, '-')}`}>
                      {bilan.statut}
                    </span>
                  </td>
                  <td>
                    <span className={`priorite-badge ${bilan.priorite.toLowerCase()}`}>
                      {bilan.priorite}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-action view" onClick={() => openDetails(bilan)}>
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedBilan && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>

            <h2>Détails du bilan assigné</h2>

            <div className="modal-info">
              <p><strong>Patient :</strong> {selectedBilan.patient} ({selectedBilan.age})</p>
              <p><strong>Date :</strong> {selectedBilan.date}</p>
              <p><strong>Type :</strong> {selectedBilan.type}</p>
              <p><strong>Statut :</strong> {selectedBilan.statut}</p>
              <p><strong>Priorité :</strong> {selectedBilan.priorite}</p>
            </div>

            <div className="results-section">
              <h3>Aperçu / Résultats</h3>
              <p className="placeholder">
                (Détails complets et PDF à venir)
              </p>
            </div>

            <div className="modal-actions">
              <button onClick={closeModal}>Fermer</button>
              <button className="btn-primary">Télécharger PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}