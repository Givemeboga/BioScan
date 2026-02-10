// src/pages/medecin/BilanBiologique.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BilanBiologique.css';

export default function BilanBiologique() {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pour le modal
  const [selectedBilan, setSelectedBilan] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [prioriteFilter, setPrioriteFilter] = useState('Tous'); // ← NOUVEAU filtre priorité

  const API_URL = 'http://127.0.0.1:8000/api/bilans-biologiques/';

  useEffect(() => {
    const fetchBilans = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(API_URL);
        let rawData = response.data;
        if (rawData.results) rawData = rawData.results;
        if (rawData.data) rawData = rawData.data;

        const formatted = rawData.map(item => ({
          id: item.id || item.bilan_id || Math.random().toString(36).slice(2),
          patient: item.patient_nom_complet || item.patient || 'Patient inconnu',
          age: item.age || 0,
          date: formatDate(item.date_generation),
          type: item.type || item.nom_fichier?.replace('.pdf', '') || 'Bilan biologique',
          statut: mapStatut(item.statut),
          priorite: estimerPriorite(item.statut),
        }));

        setBilans(formatted);
      } catch (err) {
        console.error('Erreur chargement bilans:', err);
        setError('Impossible de charger les bilans.');
      } finally {
        setLoading(false);
      }
    };

    fetchBilans();
  }, []);

  // Helpers (inchangés)
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
    if (s.includes('BROUILLON')) return 'En attente';
    if (s.includes('TERMINE')) return 'Terminé';
    if (s.includes('EN COURS')) return 'En cours';
    if (s.includes('VALIDE')) return 'Validé';
    return s || 'En attente';
  };

  const estimerPriorite = (statut) => {
    const s = (statut || '').toUpperCase();
    if (s.includes('BROUILLON') || s.includes('EN COURS')) return 'Haute';
    if (s.includes('TERMINE') || s.includes('VALIDE')) return 'Faible';
    return 'Moyenne';
  };

  // Filtrage mis à jour avec priorité
  const filteredBilans = bilans.filter((bilan) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      bilan.patient.toLowerCase().includes(searchLower) ||
      bilan.type.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'Tous' || bilan.statut === statusFilter;
    const matchesPriorite = prioriteFilter === 'Tous' || bilan.priorite === prioriteFilter;

    return matchesSearch && matchesStatus && matchesPriorite;
  });

  const openDetails = (bilan) => setSelectedBilan(bilan);
  const closeModal = () => setSelectedBilan(null);

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="bilan-biologique-page">
      <div className="page-header">
        <h1>Bilans Biologiques</h1>
        <p>Gestion et suivi des analyses demandées</p>
      </div>

      <div className="actions-bar">
        <div className="search-filter-group">
          <input
            type="text"
            placeholder="Rechercher patient ou type de bilan..."
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

          {/* NOUVEAU : filtre par priorité */}
          <select
            value={prioriteFilter}
            onChange={(e) => setPrioriteFilter(e.target.value)}
            className="status-filter" // on réutilise la même classe pour cohérence
          >
            <option value="Tous">Toutes priorités</option>
            <option value="Haute">Haute</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Faible">Faible</option>
          </select>
        </div>

        {/* Le bouton + Nouveau bilan a été supprimé */}
      </div>

      <div className="results-info">
        {filteredBilans.length} bilan(s) trouvé(s)
      </div>

      <div className="table-container">
        <table className="bilan-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Type de bilan</th>
              <th>Statut</th>
              <th>Priorité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBilans.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  Aucun bilan ne correspond à votre recherche
                </td>
              </tr>
            ) : (
              filteredBilans.map((bilan) => (
                <tr
                  key={bilan.id}
                  className={bilan.priorite === 'Haute' ? 'row-highlight' : ''}
                >
                  <td className="patient-name">
                    {bilan.patient} <span className="age">({bilan.age} ans)</span>
                  </td>
                  <td>{bilan.date}</td>
                  <td>{bilan.type}</td>
                  <td>
                    <span
                      className={`status-badge ${bilan.statut.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {bilan.statut}
                    </span>
                  </td>
                  <td>
                    <span className={`priorite-badge ${bilan.priorite.toLowerCase()}`}>
                      {bilan.priorite}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {/* Seulement "Voir détails" reste */}
                    <button
                      className="btn-action view"
                      onClick={() => openDetails(bilan)}
                    >
                      Voir détails
                    </button>
                    {/* Bouton Modifier supprimé */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal (inchangé) */}
      {selectedBilan && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>

            <h2>Détails du bilan</h2>

            <div className="modal-info">
              <p>
                <strong>Patient :</strong> {selectedBilan.patient} ({selectedBilan.age} ans)
              </p>
              <p>
                <strong>Date :</strong> {selectedBilan.date}
              </p>
              <p>
                <strong>Type :</strong> {selectedBilan.type}
              </p>
              <p>
                <strong>Statut :</strong> {selectedBilan.statut}
              </p>
              <p>
                <strong>Priorité :</strong> {selectedBilan.priorite}
              </p>
            </div>

            <div className="results-section">
              <h3>Résultats / Aperçu</h3>
              <p className="placeholder">
                (Les résultats détaillés apparaîtront ici une fois implémentés)
              </p>
            </div>

            <div className="modal-actions">
              <button onClick={closeModal}>Fermer</button>
              <button className="btn-primary">Télécharger le PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}