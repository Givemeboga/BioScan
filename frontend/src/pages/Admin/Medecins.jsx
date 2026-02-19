import React, { useMemo, useState } from 'react';
import './Medecins.css';

const initialMedecins = [
  {
    medecin_id: 1,
    nom: 'Dr. Ahmed Trabelsi',
    specialite: 'Biologiste',
    email: 'ahmed.trabelsi@bioscan.tn',
    telephone: '+216 22 654 321',
    utilisateur_id: 2,
    rapportsValides: 284,
    statut: 'ACTIVE',
    date_generation: '2025-12-04',
    derniereActivite: '2026-02-10 14:32',
  },
  {
    medecin_id: 2,
    nom: 'Dr. Sami Haddad',
    specialite: 'Hematologie',
    email: 'sami.haddad@bioscan.tn',
    telephone: '+216 24 456 778',
    utilisateur_id: 4,
    rapportsValides: 512,
    statut: 'ACTIVE',
    date_generation: '2025-10-28',
    derniereActivite: '2026-02-11 09:15',
  },
  {
    medecin_id: 3,
    nom: 'Dr. Leila Ben Youssef',
    specialite: 'Microbiologie',
    email: 'leila.benyoussef@bioscan.tn',
    telephone: '+216 29 876 543',
    utilisateur_id: 7,
    rapportsValides: 198,
    statut: 'INACTIVE',
    date_generation: '2025-11-20',
    derniereActivite: '2026-01-30 16:40',
  },
  {
    medecin_id: 4,
    nom: 'Dr. Karim Hamdi',
    specialite: 'Biochimie',
    email: 'karim.hamdi@bioscan.tn',
    telephone: '+216 27 345 678',
    utilisateur_id: 9,
    rapportsValides: 421,
    statut: 'ACTIVE',
    date_generation: '2025-09-15',
    derniereActivite: '2026-02-10 18:20',
  },
];

const statuts = ['TOUS', 'ACTIVE', 'INACTIVE'];

export default function AdminMedecins() {
  const [medecins, setMedecins] = useState(initialMedecins);
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('TOUS');
  const [selectedId, setSelectedId] = useState(null);

  const filteredMedecins = useMemo(() => {
    return medecins.filter((medecin) => {
      const matchesSearch =
        medecin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medecin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medecin.specialite.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatut = statutFilter === 'TOUS' || medecin.statut === statutFilter;
      return matchesSearch && matchesStatut;
    });
  }, [medecins, searchTerm, statutFilter]);

  const updateMedecinStatut = (medecin_id, statut) => {
    setMedecins((prev) => prev.map((m) => (m.medecin_id === medecin_id ? { ...m, statut } : m)));
  };

  const selectedMedecin = selectedId ? medecins.find((m) => m.medecin_id === selectedId) : null;

  return (
    <div className="admin-medecins-page">
      <header className="medecins-header">
        <div>
          <h1>Gestion des médecins</h1>
          <p>Suivi des médecins biologistes et de leur performance.</p>
        </div>
        <button className="btn-primary">Ajouter un médecin</button>
      </header>

      <div className="medecins-layout">
        <section className="medecins-main">
          <div className="filters-card">
            <div className="filters-row">
              <div className="field-group">
                <label htmlFor="search">Recherche</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Nom, email ou specialite"
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

          <div className="medecins-grid">
            {filteredMedecins.map((medecin) => (
              <div
                key={medecin.medecin_id}
                className={`medecin-card ${selectedId === medecin.medecin_id ? 'selected' : ''}`}
                onClick={() => setSelectedId(medecin.medecin_id)}
              >
                <div className="medecin-header">
                  <div className="medecin-avatar">{medecin.nom[4]}</div>
                  <div className="medecin-info">
                    <h3>{medecin.nom}</h3>
                    <p className="specialite">{medecin.specialite}</p>
                  </div>
                  <span className={`status ${medecin.statut === 'ACTIVE' ? 'active' : 'inactive'}`}>
                    {medecin.statut}
                  </span>
                </div>

                <div className="medecin-stats">
                  <div className="stat-item">
                    <span className="stat-label">Rapports validés</span>
                    <span className="stat-value">{medecin.rapportsValides}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Utilisateur ID</span>
                    <span className="stat-value">#{medecin.utilisateur_id}</span>
                  </div>
                </div>

                <div className="medecin-contact">
                  <div className="contact-item">📧 {medecin.email}</div>
                  <div className="contact-item">📞 {medecin.telephone}</div>
                </div>

                <div className="medecin-footer">
                  <span className="date-info">Inscrit le {medecin.date_generation}</span>
                </div>
              </div>
            ))}

            {filteredMedecins.length === 0 && (
              <div className="empty-state">Aucun médecin ne correspond aux filtres.</div>
            )}
          </div>
        </section>

        {selectedMedecin && (
          <aside className="medecin-details">
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
                <span className="value">{selectedMedecin.nom}</span>
              </div>
              <div className="info-row">
                <span className="label">Spécialité</span>
                <span className="value">{selectedMedecin.specialite}</span>
              </div>
              <div className="info-row">
                <span className="label">Email</span>
                <span className="value">{selectedMedecin.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Téléphone</span>
                <span className="value">{selectedMedecin.telephone}</span>
              </div>
              <div className="info-row">
                <span className="label">Utilisateur lié</span>
                <span className="value">#{selectedMedecin.utilisateur_id}</span>
              </div>
            </div>

            <div className="details-section">
              <h3>Performance</h3>
              <div className="perf-stat">
                <span className="perf-label">Rapports validés</span>
                <span className="perf-value">{selectedMedecin.rapportsValides}</span>
              </div>
              <div className="perf-stat">
                <span className="perf-label">Dernière activité</span>
                <span className="perf-value">{selectedMedecin.derniereActivite}</span>
              </div>
              <div className="perf-stat">
                <span className="perf-label">Date inscription</span>
                <span className="perf-value">{selectedMedecin.date_generation}</span>
              </div>
            </div>

            <div className="details-section">
              <h3>Actions</h3>
              <div className="action-list">
                <button className="action-btn">Assigner permissions</button>
                <button className="action-btn action-outline">Voir statistiques</button>
                <button className="action-btn action-outline">Activité log</button>
                <button
                  className={`action-btn ${selectedMedecin.statut === 'ACTIVE' ? 'action-warn' : 'action-ok'}`}
                  onClick={() =>
                    updateMedecinStatut(
                      selectedMedecin.medecin_id,
                      selectedMedecin.statut === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                    )
                  }
                >
                  {selectedMedecin.statut === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
