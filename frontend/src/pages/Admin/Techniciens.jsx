import React, { useMemo, useState } from 'react';
import './Techniciens.css';

const initialTechniciens = [
  {
    technicien_id: 1,
    nom: 'Ines Gharbi',
    departement: 'Laboratoire Central',
    email: 'ines.gharbi@bioscan.tn',
    telephone: '+216 27 987 321',
    utilisateur_id: 3,
    bilansTraites: 1247,
    analysesIA: 892,
    rapportsCrees: 1103,
    statut: 'ACTIVE',
    date_generation: '2026-01-19',
    derniereActivite: '2026-02-11 10:45',
    tempsTraitementMoyen: '8.4 min',
    bilansEnAttente: 12,
  },
  {
    technicien_id: 2,
    nom: 'Leila Mansour',
    departement: 'Hematologie',
    email: 'leila.mansour@bioscan.tn',
    telephone: '+216 29 220 990',
    utilisateur_id: 5,
    bilansTraites: 2134,
    analysesIA: 1876,
    rapportsCrees: 2089,
    statut: 'ACTIVE',
    date_generation: '2025-09-14',
    derniereActivite: '2026-02-11 11:20',
    tempsTraitementMoyen: '6.8 min',
    bilansEnAttente: 5,
  },
  {
    technicien_id: 3,
    nom: 'Fares Ben Ali',
    departement: 'Biochimie',
    email: 'fares.benali@bioscan.tn',
    telephone: '+216 26 543 789',
    utilisateur_id: 8,
    bilansTraites: 987,
    analysesIA: 654,
    rapportsCrees: 912,
    statut: 'ACTIVE',
    date_generation: '2025-12-01',
    derniereActivite: '2026-02-11 09:30',
    tempsTraitementMoyen: '9.2 min',
    bilansEnAttente: 18,
  },
  {
    technicien_id: 4,
    nom: 'Amira Jlidi',
    departement: 'Microbiologie',
    email: 'amira.jlidi@bioscan.tn',
    telephone: '+216 28 765 432',
    utilisateur_id: 11,
    bilansTraites: 756,
    analysesIA: 521,
    rapportsCrees: 698,
    statut: 'INACTIVE',
    date_generation: '2025-11-10',
    derniereActivite: '2026-02-05 14:15',
    tempsTraitementMoyen: '11.5 min',
    bilansEnAttente: 0,
  },
];

const statuts = ['TOUS', 'ACTIVE', 'INACTIVE'];

export default function AdminTechniciens() {
  const [techniciens, setTechniciens] = useState(initialTechniciens);
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('TOUS');
  const [selectedId, setSelectedId] = useState(null);

  const filteredTechniciens = useMemo(() => {
    return techniciens.filter((tech) => {
      const matchesSearch =
        tech.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.departement.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatut = statutFilter === 'TOUS' || tech.statut === statutFilter;
      return matchesSearch && matchesStatut;
    });
  }, [techniciens, searchTerm, statutFilter]);

  const updateTechnicienStatut = (technicien_id, statut) => {
    setTechniciens((prev) => prev.map((t) => (t.technicien_id === technicien_id ? { ...t, statut } : t)));
  };

  const selectedTechnicien = selectedId ? techniciens.find((t) => t.technicien_id === selectedId) : null;

  return (
    <div className="admin-techniciens-page">
      <header className="techniciens-header">
        <div>
          <h1>Gestion des techniciens</h1>
          <p>Suivi des techniciens de laboratoire et de leur performance.</p>
        </div>
        <button className="btn-primary">Ajouter un technicien</button>
      </header>

      <div className="techniciens-layout">
        <section className="techniciens-main">
          <div className="filters-card">
            <div className="filters-row">
              <div className="field-group">
                <label htmlFor="search">Recherche</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Nom, email ou departement"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label htmlFor="statut">Statut</label>
                <select id="statut" value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
                  {statuts.map((statut) => (
                    <option key={statut} value={statut}>
                      {statut}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="techniciens-grid">
            {filteredTechniciens.map((tech) => (
              <div
                key={tech.technicien_id}
                className={`technicien-card ${selectedId === tech.technicien_id ? 'selected' : ''}`}
                onClick={() => setSelectedId(tech.technicien_id)}
              >
                <div className="technicien-header">
                  <div className="technicien-avatar">{tech.nom[0]}</div>
                  <div className="technicien-info">
                    <h3>{tech.nom}</h3>
                    <p className="departement">{tech.departement}</p>
                  </div>
                  <span className={`status ${tech.statut === 'ACTIVE' ? 'active' : 'inactive'}`}>
                    {tech.statut}
                  </span>
                </div>

                <div className="technicien-stats">
                  <div className="stat-item">
                    <span className="stat-label">Bilans traités</span>
                    <span className="stat-value">{tech.bilansTraites}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Analyses IA</span>
                    <span className="stat-value">{tech.analysesIA}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Rapports créés</span>
                    <span className="stat-value">{tech.rapportsCrees}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">En attente</span>
                    <span className={`stat-value ${tech.bilansEnAttente > 10 ? 'warning' : ''}`}>
                      {tech.bilansEnAttente}
                    </span>
                  </div>
                </div>

                <div className="performance-badge">
                  <span className="perf-icon">⚡</span>
                  <span className="perf-text">Temps moyen: {tech.tempsTraitementMoyen}</span>
                </div>

                <div className="technicien-contact">
                  <div className="contact-item">📧 {tech.email}</div>
                  <div className="contact-item">📞 {tech.telephone}</div>
                </div>

                <div className="technicien-footer">
                  <span className="date-info">Inscrit le {tech.date_generation}</span>
                </div>
              </div>
            ))}

            {filteredTechniciens.length === 0 && (
              <div className="empty-state">Aucun technicien ne correspond aux filtres.</div>
            )}
          </div>
        </section>

        {selectedTechnicien && (
          <aside className="technicien-details">
            <div className="details-header">
              <h2>Détails</h2>
              <button className="btn-close" onClick={() => setSelectedId(null)}>
                ✕
              </button>
            </div>

            <div className="details-section">
              <h3>Informations générales</h3>
              <div className="info-row">
                <span className="label">Nom</span>
                <span className="value">{selectedTechnicien.nom}</span>
              </div>
              <div className="info-row">
                <span className="label">Département</span>
                <span className="value">{selectedTechnicien.departement}</span>
              </div>
              <div className="info-row">
                <span className="label">Email</span>
                <span className="value">{selectedTechnicien.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Téléphone</span>
                <span className="value">{selectedTechnicien.telephone}</span>
              </div>
              <div className="info-row">
                <span className="label">Utilisateur lié</span>
                <span className="value">#{selectedTechnicien.utilisateur_id}</span>
              </div>
            </div>

            <div className="details-section">
              <h3>Performance & Statistiques</h3>
              <div className="perf-stat">
                <span className="perf-label">Bilans traités</span>
                <span className="perf-value">{selectedTechnicien.bilansTraites}</span>
              </div>
              <div className="perf-stat">
                <span className="perf-label">Analyses IA déclenchées</span>
                <span className="perf-value">{selectedTechnicien.analysesIA}</span>
              </div>
              <div className="perf-stat">
                <span className="perf-label">Rapports créés</span>
                <span className="perf-value">{selectedTechnicien.rapportsCrees}</span>
              </div>
              <div className="perf-stat highlight">
                <span className="perf-label">⚡ Temps moyen traitement</span>
                <span className="perf-value">{selectedTechnicien.tempsTraitementMoyen}</span>
              </div>
              <div className={`perf-stat ${selectedTechnicien.bilansEnAttente > 10 ? 'warning-stat' : ''}`}>
                <span className="perf-label">Bilans en attente</span>
                <span className="perf-value">{selectedTechnicien.bilansEnAttente}</span>
              </div>
            </div>

            <div className="details-section">
              <h3>Activité</h3>
              <div className="perf-stat">
                <span className="perf-label">Dernière activité</span>
                <span className="perf-value">{selectedTechnicien.derniereActivite}</span>
              </div>
              <div className="perf-stat">
                <span className="perf-label">Date inscription</span>
                <span className="perf-value">{selectedTechnicien.date_generation}</span>
              </div>
            </div>

            <div className="details-section">
              <h3>Actions</h3>
              <div className="action-list">
                <button className="action-btn">Assigner permissions</button>
                <button className="action-btn action-outline">Voir statistiques détaillées</button>
                <button className="action-btn action-outline">Activité log</button>
                <button
                  className={`action-btn ${selectedTechnicien.statut === 'ACTIVE' ? 'action-warn' : 'action-ok'}`}
                  onClick={() =>
                    updateTechnicienStatut(
                      selectedTechnicien.technicien_id,
                      selectedTechnicien.statut === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                    )
                  }
                >
                  {selectedTechnicien.statut === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
