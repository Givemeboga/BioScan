import React, { useMemo, useState, useEffect } from 'react';
import { medecinsService, usersService } from '../../services/adminService';
import './Medecins.css';

const statuses = ['TOUS', 'ACTIVE', 'INACTIVE'];

export default function AdminMedecins() {
  const [medecins, setMedecins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedecin, setNewMedecin] = useState({
    nom: '',
    email: '',
    telephone: '',
    specialite: '',
    motDePasse: '',
  });

  useEffect(() => {
    let isMounted = true;

    const loadMedecins = async () => {
      try {
        setLoading(true);
        const data = await medecinsService.getMedecins();
        if (isMounted) {
          setMedecins(data || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading medecins:', err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMedecins();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMedecins = useMemo(() => {
    return medecins.filter((medecin) => {
      const matchesSearch =
        (medecin.nom?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (medecin.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (medecin.specialite?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'TOUS' || medecin.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [medecins, searchTerm, statusFilter]);

  const updateMedecinStatus = async (id, status) => {
    try {
      await medecinsService.updateMedecinStatus(id, status);
      setMedecins((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    } catch (err) {
      console.error('Error updating medecin status:', err);
      setError(err.message);
    }
  };

  const handleCreateMedecin = async (e) => {
    e.preventDefault();
    try {
      // Create the user (medecin is automatically created in the backend)
      const userData = {
        nom: newMedecin.nom,
        email: newMedecin.email,
        telephone: newMedecin.telephone,
        role: 'Medecin',
        status: 'ACTIVE',
        motDePasse: newMedecin.motDePasse,
      };
      const createdUser = await usersService.createUser(userData);
      
      // Convert to medecin format for display
      const createdMedecin = {
        id: createdUser.id,
        nom: createdUser.nom,
        email: createdUser.email,
        telephone: createdUser.telephone,
        specialite: newMedecin.specialite,
        utilisateurId: createdUser.id,
        rapportsValides: 0,
        status: createdUser.status,
        dateInscription: createdUser.dateCreation,
        derniereActivite: null,
      };
      
      setMedecins((prev) => [...prev, createdMedecin]);
      setShowAddModal(false);
      setNewMedecin({ nom: '', email: '', telephone: '', specialite: '', motDePasse: '' });
      setError(null);
    } catch (err) {
      console.error('Error creating medecin:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-medecins-page">
        <header className="medecins-header">
          <h1>Gestion des médecins</h1>
        </header>
        <p style={{ padding: '20px' }}>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-medecins-page">
        <header className="medecins-header">
          <h1>Gestion des médecins</h1>
        </header>
        <p style={{ padding: '20px', color: 'red' }}>Erreur: {error}</p>
      </div>
    );
  }

  const selectedMedecin = selectedId ? medecins.find((m) => m.id === selectedId) : null;

  return (
    <div className="admin-medecins-page">
      <header className="medecins-header">
        <div>
          <h1>Gestion des médecins</h1>
          <p>Suivi des médecins biologistes et de leur performance.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>Ajouter un médecin</button>
      </header>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un nouveau médecin</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateMedecin} className="modal-form">
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  required
                  value={newMedecin.nom}
                  onChange={(e) => setNewMedecin({ ...newMedecin, nom: e.target.value })}
                  placeholder="Ex: Dr. Jean Dupont"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={newMedecin.email}
                  onChange={(e) => setNewMedecin({ ...newMedecin, email: e.target.value })}
                  placeholder="Ex: jean@example.com"
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={newMedecin.telephone}
                  onChange={(e) => setNewMedecin({ ...newMedecin, telephone: e.target.value })}
                  placeholder="Ex: +216 XX XXX XXX"
                />
              </div>
              <div className="form-group">
                <label>Spécialité</label>
                <input
                  type="text"
                  value={newMedecin.specialite}
                  onChange={(e) => setNewMedecin({ ...newMedecin, specialite: e.target.value })}
                  placeholder="Ex: Biologie Clinique"
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  required
                  value={newMedecin.motDePasse}
                  onChange={(e) => setNewMedecin({ ...newMedecin, motDePasse: e.target.value })}
                  placeholder="Saisir un mot de passe"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Créer le médecin</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <div className="medecin-avatar">{(medecin.nom || 'M')[0]}</div>
                  <div className="medecin-info">
                    <h3>{medecin.nom || 'Sans nom'}</h3>
                    <p className="specialite">{medecin.specialite || 'N/A'}</p>
                  </div>
                  <span className={`status ${(medecin.status || '').toLowerCase() === 'active' ? 'active' : 'suspended'}`}>
                    {medecin.status || 'N/A'}
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
