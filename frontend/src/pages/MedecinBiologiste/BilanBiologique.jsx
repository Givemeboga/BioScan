// src/pages/medecin/BilanBiologique.jsx
import React, { useState } from 'react';
import './BilanBiologique.css';

export default function BilanBiologique() {
  // Données exemple (à remplacer par appel API plus tard)
  const [bilans] = useState([
    { id: 1, patient: 'Ahmed Ben Ali', age: 48, date: '05/02/2026', type: 'Hémogramme complet + NFS', statut: 'En attente', priorite: 'Moyenne' },
    { id: 2, patient: 'Fatma Trabelsi', age: 35, date: '04/02/2026', type: 'Bilan lipidique + Glycémie', statut: 'Terminé', priorite: 'Faible' },
    { id: 3, patient: 'Mohamed Salah', age: 62, date: '03/02/2026', type: 'Bilan rénal complet', statut: 'En cours', priorite: 'Haute' },
    { id: 4, patient: 'Leila Ben Romdhane', age: 29, date: '02/02/2026', type: 'Thyroïde (TSH, T3, T4)', statut: 'Validé', priorite: 'Faible' },
    { id: 5, patient: 'Karim Jouini', age: 51, date: '01/02/2026', type: 'Bilan hépatique', statut: 'En attente', priorite: 'Haute' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');

  const filteredBilans = bilans.filter(bilan => {
    const matchesSearch = bilan.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bilan.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tous' || bilan.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bilan-biologique-page">
      {/* En-tête */}
      <div className="page-header">
        <h1>Bilans Biologiques</h1>
        <p>Gestion et suivi des analyses demandées</p>
      </div>

      {/* Barre d'actions */}
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
        </div>

        <button className="btn btn-primary">
          + Nouveau bilan
        </button>
      </div>

      {/* Résultats */}
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
                <td colSpan="6" className="no-data">
                  Aucun bilan ne correspond à votre recherche
                </td>
              </tr>
            ) : (
              filteredBilans.map(bilan => (
                <tr key={bilan.id} className={bilan.priorite === 'Haute' ? 'row-highlight' : ''}>
                  <td className="patient-name">
                    {bilan.patient} <span className="age">({bilan.age} ans)</span>
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
                    <button className="btn-action view">Voir détails</button>
                    <button className="btn-action edit">Modifier</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}