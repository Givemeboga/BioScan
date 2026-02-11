import React, { useMemo, useState } from 'react';
import './Medecins.css';

const initialMedecins = [
  {
    id: 1,
    nom: 'Dr. Ahmed Trabelsi',
    specialite: 'Biologiste',
    email: 'ahmed.trabelsi@bioscan.tn',
    telephone: '+216 22 654 321',
    utilisateurId: 2,
    rapportsValides: 284,
    status: 'ACTIVE',
    dateInscription: '2025-12-04',
    derniereActivite: '2026-02-10 14:32',
  },
  {
    id: 2,
    nom: 'Dr. Sami Haddad',
    specialite: 'Hematologie',
    email: 'sami.haddad@bioscan.tn',
    telephone: '+216 24 456 778',
    utilisateurId: 4,
    rapportsValides: 512,
    status: 'ACTIVE',
    dateInscription: '2025-10-28',
    derniereActivite: '2026-02-11 09:15',
  },
  {
    id: 3,
    nom: 'Dr. Leila Ben Youssef',
    specialite: 'Microbiologie',
    email: 'leila.benyoussef@bioscan.tn',
    telephone: '+216 29 876 543',
    utilisateurId: 7,
    rapportsValides: 198,
    status: 'SUSPENDED',
    dateInscription: '2025-11-20',
    derniereActivite: '2026-01-30 16:40',
  },
  {
    id: 4,
    nom: 'Dr. Karim Hamdi',
    specialite: 'Biochimie',
    email: 'karim.hamdi@bioscan.tn',
    telephone: '+216 27 345 678',
    utilisateurId: 9,
    rapportsValides: 421,
    status: 'ACTIVE',
    dateInscription: '2025-09-15',
    derniereActivite: '2026-02-10 18:20',
  },
];

const statuses = ['TOUS', 'ACTIVE', 'SUSPENDED'];

export default function AdminMedecins() {
  const [medecins, setMedecins] = useState(initialMedecins);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [selectedId, setSelectedId] = useState(null);

  const filteredMedecins = useMemo(() => {
    return medecins.filter((medecin) => {
      const matchesSearch =
        medecin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medecin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medecin.specialite.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'TOUS' || medecin.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [medecins, searchTerm, statusFilter]);

  const updateMedecinStatus = (id, status) => {
    setMedecins((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const selectedMedecin = selectedId ? medecins.find((m) => m.id === selectedId) : null;

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
                <label htmlFor="status">Statut</label>
                <select id="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="medecins-grid">
            {filteredMedecins.map((medecin) => (
              <div
                key={medecin.id}
                className={`medecin-card ${selectedId === medecin.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(medecin.id)}
              >
                <div className="medecin-header">
                  <div className="medecin-avatar">{medecin.nom[4]}</div>
                  <div className="medecin-info">
                    <h3>{medecin.nom}</h3>
                    <p className="specialite">{medecin.specialite}</p>
                  </div>
                  <span className={`status ${medecin.status === 'ACTIVE' ? 'active' : 'suspended'}`}>
                    {medecin.status}
                  </span>
                </div>

                <div className="medecin-stats">
                  <div className="stat-item">
                    <span className="stat-label">Rapports validés</span>
                    <span className="stat-value">{medecin.rapportsValides}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Utilisateur ID</span>
                    <span className="stat-value">#{medecin.utilisateurId}</span>
                  </div>
                </div>

                <div className="medecin-contact">
                  <div className="contact-item">📧 {medecin.email}</div>
                  <div className="contact-item">📞 {medecin.telephone}</div>
                </div>

                <div className="medecin-footer">
                  <span className="date-info">Inscrit le {medecin.dateInscription}</span>
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
                <span className="value">#{selectedMedecin.utilisateurId}</span>
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
                <span className="perf-value">{selectedMedecin.dateInscription}</span>
              </div>
            </div>

            <div className="details-section">
              <h3>Actions</h3>
              <div className="action-list">
                <button className="action-btn">Assigner permissions</button>
                <button className="action-btn action-outline">Voir statistiques</button>
                <button className="action-btn action-outline">Activité log</button>
                <button
                  className={`action-btn ${selectedMedecin.status === 'ACTIVE' ? 'action-warn' : 'action-ok'}`}
                  onClick={() =>
                    updateMedecinStatus(
                      selectedMedecin.id,
                      selectedMedecin.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                    )
                  }
                >
                  {selectedMedecin.status === 'ACTIVE' ? 'Suspendre' : 'Activer'}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
