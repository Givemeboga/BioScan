import React, { useMemo, useState, useEffect } from 'react';
import { usersService } from '../../services/adminService';
import './Users.css';

const roles = ['TOUS', 'ADMIN', 'MEDECIN', 'TECHNICIEN'];
const statuses = ['TOUS', 'ACTIVE', 'INACTIVE'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('TOUS');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkRole, setBulkRole] = useState('MEDECIN');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    nom: '',
    email: '',
    telephone: '',
    role: 'MEDECIN',
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

  const applyBulkRole = async () => {
    try {
      const selectedArray = Array.from(selectedIds);
      await usersService.bulkUpdateRole(selectedArray, bulkRole);
      setUsers((prev) =>
        prev.map((user) => (selectedIds.has(user.id) ? { ...user, role: bulkRole } : user))
      );
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error applying bulk role:', err);
      setError(err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const createdUser = await usersService.createUser(newUser);
      setUsers((prev) => [...prev, createdUser]);
      setShowAddModal(false);
      setNewUser({
        nom: '',
        email: '',
        telephone: '',
        role: 'MEDECIN',
        status: 'ACTIVE',
        motDePasse: '',
      });
      setError(null);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message);
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
            <div className="bulk-role">
              <select
                className="select-input"
                value={bulkRole}
                onChange={(event) => setBulkRole(event.target.value)}
              >
                {roles
                  .filter((role) => role !== 'TOUS')
                  .map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
              </select>
              <button className="btn-ghost" onClick={applyBulkRole}>
                Assigner role
              </button>
            </div>
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
                      <button className="action-btn">Edit</button>
                      <button
                        className={`action-btn ${user.status === 'ACTIVE' ? 'action-warn' : 'action-ok'}`}
                        onClick={() =>
                          updateUserStatus(user.id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                        }
                      >
                        {user.status === 'ACTIVE' ? 'Disable' : 'Activate'}
                      </button>
                      <button className="action-btn action-outline">Reset password</button>
                    </div>
                    <div className="action-group secondary">
                      <button className="action-btn action-outline">Force reset</button>
                      <button className="action-btn action-danger" onClick={() => updateUserStatus(user.id, 'INACTIVE')}>
                        Lock account
                      </button>
                      <button className="action-btn action-outline">Login history</button>
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
