import React, { useMemo, useState, useEffect } from 'react';
import { techniciensService, usersService } from '../../services/adminService';
import './Techniciens.css';

const statuses = ['TOUS', 'ACTIVE', 'SUSPENDED'];

export default function AdminTechniciens() {
  const [techniciens, setTechniciens] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTechnicien, setNewTechnicien] = useState({
    nom: '',
    email: '',
    telephone: '',
    departement: '',
  });

  useEffect(() => {
    const loadTechniciens = async () => {
      try {
        setLoading(true);
        const data = await techniciensService.getTechniciens();
        setTechniciens(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading techniciens:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTechniciens();
  }, []);

  const filteredTechniciens = useMemo(() => {
    return techniciens.filter((tech) => {
      const matchesSearch =
        (tech.nom?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (tech.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (tech.departement?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'TOUS' || tech.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [techniciens, searchTerm, statusFilter]);

  const updateTechnicienStatus = async (id, status) => {
    try {
      await techniciensService.updateTechnicienStatus(id, status);
      setTechniciens((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (err) {
      console.error('Error updating technicien status:', err);
      setError(err.message);
    }
  };

  const handleCreateTechnicien = async (e) => {
    e.preventDefault();
    try {
      // First create the user
      const userData = {
        nom: newTechnicien.nom,
        email: newTechnicien.email,
        telephone: newTechnicien.telephone,
        role: 'TECHNICIEN',
      };
      const createdUser = await usersService.createUser(userData);
      
      // Then create the technicien with the user ID
      const technicienData = {
        utilisateurId: createdUser.id,
        nom: newTechnicien.nom,
        email: newTechnicien.email,
        telephone: newTechnicien.telephone,
        departement: newTechnicien.departement,
      };
      const createdTechnicien = await techniciensService.createTechnicien(technicienData);
      setTechniciens((prev) => [...prev, createdTechnicien]);
      setShowAddModal(false);
      setNewTechnicien({ nom: '', email: '', telephone: '', departement: '' });
      setError(null);
    } catch (err) {
      console.error('Error creating technicien:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-techniciens-page">
        <header className="techniciens-header">
          <h1>Gestion des techniciens</h1>
        </header>
        <p style={{ padding: '20px' }}>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-techniciens-page">
        <header className="techniciens-header">
          <h1>Gestion des techniciens</h1>
        </header>
        <p style={{ padding: '20px', color: 'red' }}>Erreur: {error}</p>
      </div>
    );
  }

  const selectedTechnicien = selectedId ? techniciens.find((t) => t.id === selectedId) : null;

  return (
    <div className="admin-techniciens-page">
      <header className="techniciens-header">
        <div>
          <h1>Gestion des techniciens</h1>
          <p>Suivi des techniciens de laboratoire et de leur performance.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>Ajouter un technicien</button>
      </header>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un nouveau technicien</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTechnicien} className="modal-form">
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  required
                  value={newTechnicien.nom}
                  onChange={(e) => setNewTechnicien({ ...newTechnicien, nom: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={newTechnicien.email}
                  onChange={(e) => setNewTechnicien({ ...newTechnicien, email: e.target.value })}
                  placeholder="Ex: jean@example.com"
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={newTechnicien.telephone}
                  onChange={(e) => setNewTechnicien({ ...newTechnicien, telephone: e.target.value })}
                  placeholder="Ex: +216 XX XXX XXX"
                />
              </div>
              <div className="form-group">
                <label>Département</label>
                <input
                  type="text"
                  value={newTechnicien.departement}
                  onChange={(e) => setNewTechnicien({ ...newTechnicien, departement: e.target.value })}
                  placeholder="Ex: Laboratoire Central"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Créer le technicien</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

          <div className="techniciens-grid">
            {filteredTechniciens.map((tech) => (
              <div
                key={tech.id}
                className={`technicien-card ${selectedId === tech.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(tech.id)}
              >
                <div className="technicien-header">
                  <div className="technicien-avatar">{(tech.nom || 'T')[0]}</div>
                  <div className="technicien-info">
                    <h3>{tech.nom || 'Sans nom'}</h3>
                    <p className="departement">{tech.departement || 'N/A'}</p>
                  </div>
                  <span className={`status ${(tech.status || '').toLowerCase() === 'active' ? 'active' : 'suspended'}`}>
                    {tech.status || 'N/A'}
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
                  <span className="date-info">Inscrit le {tech.dateInscription}</span>
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
                <span className="value">#{selectedTechnicien.utilisateurId}</span>
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
                <span className="perf-value">{selectedTechnicien.dateInscription}</span>
              </div>
            </div>

            <div className="details-section">
              <h3>Actions</h3>
              <div className="action-list">
                <button className="action-btn">Assigner permissions</button>
                <button className="action-btn action-outline">Voir statistiques détaillées</button>
                <button className="action-btn action-outline">Activité log</button>
                <button
                  className={`action-btn ${selectedTechnicien.status === 'ACTIVE' ? 'action-warn' : 'action-ok'}`}
                  onClick={() =>
                    updateTechnicienStatus(
                      selectedTechnicien.id,
                      selectedTechnicien.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                    )
                  }
                >
                  {selectedTechnicien.status === 'ACTIVE' ? 'Suspendre' : 'Activer'}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
