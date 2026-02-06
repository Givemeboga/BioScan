// src/pages/medecin/RapportAnomalie.jsx
import React, { useState } from 'react';
import './RapportAnomalie.css';

export default function RapportAnomalie() {
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [rapportAction, setRapportAction] = useState(null); // 'valider' | 'rejeter' | null

  // Données exemple – à remplacer par tes vraies données / appel API
  const rapports = [
    {
      id: 1,
      patient: 'Ahmed Ben Ali',
      age: 48,
      dateBilan: '05/02/2026',
      typeBilan: 'Hémogramme complet + NFS',
      dateRapport: '06/02/2026',
      statutRapport: 'En attente',
      priorite: 'Haute',
      bilanResume: 'Leucocytes : 14.2 × 10⁹/L (élevé)\nPlaquettes : 120 × 10⁹/L (basse)\nHb : 11.2 g/dL\nNeutrophiles : 78% (élevé)',
      rapportTexte: 'Suspicion de syndrome myélodysplasique. Présence de 6% de blastes. Anomalies morphologiques marquées sur la lignée granuleuse. Recommandation urgente : myélogramme + immunophénotypage + caryotype.',
    },
    {
      id: 2,
      patient: 'Leila Ben Romdhane',
      age: 29,
      dateBilan: '04/02/2026',
      typeBilan: 'Bilan thyroïdien complet',
      dateRapport: '05/02/2026',
      statutRapport: 'En attente',
      priorite: 'Moyenne',
      bilanResume: 'TSH : 0.02 mUI/L (très basse)\nT4 libre : 32 pmol/L (élevée)\nT3 libre : 12.8 pmol/L (élevée)\nAnticorps anti-TPO : négatif',
      rapportTexte: 'Hyperthyroïdie franche. Tableau clinique évocateur de maladie de Basedow malgré anticorps négatifs. À discuter : dosage TRAb et échographie thyroïdienne Doppler.',
    },
    {
      id: 3,
      patient: 'Mohamed Salah',
      age: 62,
      dateBilan: '03/02/2026',
      typeBilan: 'Bilan rénal complet',
      dateRapport: '04/02/2026',
      statutRapport: 'En cours',
      priorite: 'Haute',
      bilanResume: 'Créatinine : 180 µmol/L (élevée)\nDFG estimé : 32 mL/min\nUrée : 12.5 mmol/L',
      rapportTexte: 'Insuffisance rénale aiguë sur terrain chronique. Probable néphropathie diabétique décompensée. Hospitalisation recommandée pour bilan étiologique et prise en charge.',
    },
  ];

  const handleConsulter = (rapport) => {
    setSelectedRapport(rapport);
    setRapportAction(null);
  };

  return (
    <div className="rapport-anomalie-page">
      {/* En-tête */}
      <div className="page-header">
        <h1>Rapports d’Anomalie</h1>
        <p>Validation et suivi des anomalies détectées</p>
      </div>

      {/* Tableau principal */}
      <div className="table-container">
        <table className="rapport-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date bilan</th>
              <th>Type bilan</th>
              <th>Date rapport</th>
              <th>Statut</th>
              <th>Priorité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rapports.map((rapport) => (
              <tr key={rapport.id} className={rapport.priorite === 'Haute' ? 'row-urgent' : ''}>
                <td>{rapport.patient} <span className="age">({rapport.age} ans)</span></td>
                <td>{rapport.dateBilan}</td>
                <td>{rapport.typeBilan}</td>
                <td>{rapport.dateRapport}</td>
                <td>
                  <span className={`status-badge ${rapport.statutRapport.toLowerCase().replace(/\s+/g, '-')}`}>
                    {rapport.statutRapport}
                  </span>
                </td>
                <td>
                  <span className={`priorite-badge ${rapport.priorite.toLowerCase()}`}>
                    {rapport.priorite}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-consulter"
                    onClick={() => handleConsulter(rapport)}
                  >
                    Consulter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vue détaillée quand un rapport est sélectionné */}
      {selectedRapport && (
        <div className="detail-view">
          <div className="detail-header">
            <h2>Détails – {selectedRapport.patient}</h2>
            <button className="btn-close" onClick={() => setSelectedRapport(null)}>
              × Fermer
            </button>
          </div>

          <div className="detail-content">
            {/* Colonne gauche : Bilan */}
            <div className="bilan-column">
              <h3>Bilan du patient</h3>
              <div className="bilan-resume">
                <p><strong>Date :</strong> {selectedRapport.dateBilan}</p>
                <p><strong>Type :</strong> {selectedRapport.typeBilan}</p>
                <p><strong>Résultats clés :</strong></p>
                <pre>{selectedRapport.bilanResume}</pre>
              </div>
            </div>

            {/* Colonne droite : Rapport + boutons */}
            <div className="rapport-column">
              <h3>Rapport d’anomalie</h3>
              <div className="rapport-texte">
                <pre>{selectedRapport.rapportTexte}</pre>
              </div>

              {/* Zone des boutons d’action */}
              <div className="rapport-actions">
                {rapportAction === null && (
                  <div className="action-initial">
                    <button 
                      className="btn btn-valider"
                      onClick={() => setRapportAction('valider')}
                    >
                      Valider le rapport
                    </button>
                    <button 
                      className="btn btn-rejeter"
                      onClick={() => setRapportAction('rejeter')}
                    >
                      Rejeter le rapport
                    </button>
                  </div>
                )}

                {rapportAction === 'valider' && (
                  <div className="action-secondaire">
                    <button className="btn btn-accepter">Accepter le bilan</button>
                    <button className="btn btn-rejeter-bilan">Rejeter le bilan</button>
                  </div>
                )}

                {rapportAction === 'rejeter' && (
                  <div className="action-secondaire">
                    <button className="btn btn-rejeter-rapport">Rejeter définitivement</button>
                    <button className="btn btn-correction">Demander correction</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}