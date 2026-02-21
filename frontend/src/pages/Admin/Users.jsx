import React, { useMemo, useState, useEffect } from 'react';
import { usersService } from '../../services/adminService';
import './Users.css';

const roles = ['TOUS', 'Administrateur', 'Medecin', 'Technicien biologiste', 'Patient'];
const statuses = ['TOUS', 'ACTIVE', 'INACTIVE'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('TOUS');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [loginHistory, setLoginHistory] = useState(null);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    nom: '',
    email: '',
    telephone: '',
    role: 'Medecin',
    status: 'ACTIVE',
    motDePasse: '',
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await usersService.getUsers();
        setUsers(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.nom?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (user.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false);
      const matchesRole = roleFilter === 'TOUS' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'TOUS' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const allFilteredSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((user) => selectedIds.has(user.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const next = new Set(selectedIds);
      filteredUsers.forEach((user) => next.delete(user.id));
      setSelectedIds(next);
      return;
    }

    const next = new Set(selectedIds);
    filteredUsers.forEach((user) => next.add(user.id));
    setSelectedIds(next);
  };

  const toggleSelectUser = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const updateUserStatus = async (id, status) => {
    try {
      await usersService.updateUserStatus(id, status);
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, status } : user)));
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(err.message);
    }
  };

  const applyBulkStatus = async (status) => {
    try {
      const selectedArray = Array.from(selectedIds);
      for (const userId of selectedArray) {
        await usersService.updateUserStatus(userId, status);
      }
      setUsers((prev) =>
        prev.map((user) => (selectedIds.has(user.id) ? { ...user, status } : user))
      );
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error applying bulk status:', err);
      setError(err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const createdUser = await usersService.createUser(newUser);
      // Ensure role and status are preserved from the form in case backend doesn't return them
      const userToAdd = {
        ...createdUser,
        role: createdUser.role || newUser.role,
        status: createdUser.status || newUser.status,
      };
      setUsers((prev) => [...prev, userToAdd]);
      setShowAddModal(false);
      setNewUser({
        nom: '',
        email: '',
        telephone: '',
        role: 'Medecin',
        status: 'ACTIVE',
        motDePasse: '',
      });
      setError(null);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await usersService.updateUser(editingUser.id, editingUser);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                nom: editingUser.nom,
                email: editingUser.email,
                telephone: editingUser.telephone,
                role: editingUser.role,
                status: editingUser.status,
              }
            : user
        )
      );
      setShowEditModal(false);
      setEditingUser(null);
      setError(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message);
    }
  };

  const handleResetPassword = async (userId, userName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir réinitialiser le mot de passe de ${userName} ?\nLe nouveau mot de passe sera: Password123!`)) {
      return;
    }
    try {
      const result = await usersService.resetUserPassword(userId);
      alert(`Mot de passe réinitialisé avec succès !\nNouveau mot de passe: ${result.default_password}`);
      setError(null);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message);
    }
  };

  const handleViewLoginHistory = async (userId, userName) => {
    try {
      setLoginHistoryLoading(true);
      const data = await usersService.getLoginHistory(userId);
      setLoginHistory({ ...data, user_name: userName });
      setShowLoginHistoryModal(true);
      setError(null);
    } catch (err) {
      console.error('Error fetching login history:', err);
      setError(err.message);
    } finally {
      setLoginHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-users-page">
        <header className="users-header">
          <h1>Gestion des utilisateurs</h1>
        </header>
        <p style={{ padding: '20px' }}>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users-page">
        <header className="users-header">
          <h1>Gestion des utilisateurs</h1>
        </header>
        <p style={{ padding: '20px', color: 'red' }}>Erreur: {error}</p>
      </div>
    );
  }

  const selectedCount = selectedIds.size;

  return (
    <div className="admin-users-page">
      <header className="users-header">
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p>Suivi des comptes, rôles et sécurité de la plateforme.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>Ajouter un utilisateur</button>
      </header>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un nouvel utilisateur</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  required
                  value={newUser.nom}
                  onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Ex: jean@example.com"
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={newUser.telephone}
                  onChange={(e) => setNewUser({ ...newUser, telephone: e.target.value })}
                  placeholder="Ex: +216 XX XXX XXX"
                />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  {roles.filter((r) => r !== 'TOUS').map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  required
                  value={newUser.motDePasse}
                  onChange={(e) => setNewUser({ ...newUser, motDePasse: e.target.value })}
                  placeholder="Saisir un mot de passe"
                />
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                >
                  {statuses.filter((s) => s !== 'TOUS').map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Créer l'utilisateur</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier l'utilisateur</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateUser} className="modal-form">
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  required
                  value={editingUser.nom}
                  onChange={(e) => setEditingUser({ ...editingUser, nom: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="Ex: jean@example.com"
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={editingUser.telephone}
                  onChange={(e) => setEditingUser({ ...editingUser, telephone: e.target.value })}
                  placeholder="Ex: +216 XX XXX XXX"
                />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  {roles.filter((r) => r !== 'TOUS').map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                >
                  {statuses.filter((s) => s !== 'TOUS').map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowEditModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Enregistrer les modifications</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLoginHistoryModal && loginHistory && (
        <div className="modal-overlay" onClick={() => setShowLoginHistoryModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>Historique de connexion - {loginHistory.user_name}</h2>
              <button className="modal-close" onClick={() => setShowLoginHistoryModal(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              {loginHistoryLoading ? (
                <p>Chargement...</p>
              ) : loginHistory.history && loginHistory.history.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>IP</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Navigateur</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.history.map((entry, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '10px' }}>{entry.type || 'LOGIN'}</td>
                        <td style={{ padding: '10px' }}>{entry.ip}</td>
                        <td style={{ padding: '10px', fontSize: '12px' }}>{entry.user_agent}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: entry.status === 'SUCCESS' ? '#d1fae5' : '#fee2e2',
                            color: entry.status === 'SUCCESS' ? '#065f46' : '#991b1b'
                          }}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucun historique de connexion disponible.</p>
              )}
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button className="btn-ghost" onClick={() => setShowLoginHistoryModal(false)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="filters-card">
        <div className="filters-row">
          <div className="field-group">
            <label htmlFor="search">Recherche</label>
            <input
              id="search"
              type="text"
              placeholder="Email ou nom"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="role">Rôle</label>
            <select id="role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="status">Statut</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bulk-row">
          <div className="bulk-info">
            <strong>{selectedCount}</strong> selectionne(s)
          </div>
          <div className="bulk-actions">
            <button className="btn-ghost" onClick={() => applyBulkStatus('ACTIVE')}>
              Activer
            </button>
            <button className="btn-ghost" onClick={() => applyBulkStatus('INACTIVE')}>
              Desactiver
            </button>
          </div>
        </div>
      </section>

      <section className="table-card">
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th className="check-col">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    aria-label="Selectionner tous les utilisateurs"
                  />
                </th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Statut (ACTIVE / INACTIVE)</th>
                <th>Date création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      aria-label={`Selectionner ${user.nom}`}
                    />
                  </td>
                  <td className="cell-strong">{user.nom}</td>
                  <td>{user.email}</td>
                  <td>{user.telephone}</td>
                  <td>
                    <span className={`pill pill-${(user.role || 'unknown').toLowerCase()}`}>{user.role || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={`status ${(user.status || '').toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                      {user.status || 'N/A'}
                    </span>
                  </td>
                  <td>{user.dateCreation}</td>
                  <td>
                    <div className="action-group">
                      <button className="action-btn" onClick={() => handleEditUser(user)}>Edit</button>
                      <button
                        className={`action-btn ${user.status === 'ACTIVE' ? 'action-warn' : 'action-ok'}`}
                        onClick={() =>
                          updateUserStatus(user.id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                        }
                      >
                        {user.status === 'ACTIVE' ? 'Disable' : 'Activate'}
                      </button>
                      <button 
                        className="action-btn action-outline"
                        onClick={() => handleResetPassword(user.id, user.nom)}
                      >
                        Reset password
                      </button>
                    </div>
                    <div className="action-group secondary">
                      <button className="action-btn action-danger" onClick={() => updateUserStatus(user.id, 'INACTIVE')}>
                        Lock account
                      </button>
                      <button 
                        className="action-btn action-outline"
                        onClick={() => handleViewLoginHistory(user.id, user.nom)}
                      >
                        Login history
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-state">
                    Aucun utilisateur ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
