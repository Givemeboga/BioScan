import React, { useMemo, useState } from 'react';
import './Users.css';

const initialUsers = [
  {
    id: 1,
    nom: 'Yosra Ben Ahmed',
    email: 'yosra.benahmed@bioscan.tn',
    telephone: '+216 20 123 456',
    role: 'ADMIN',
    status: 'ACTIVE',
    dateCreation: '2025-11-12',
  },
  {
    id: 2,
    nom: 'Ahmed Trabelsi',
    email: 'ahmed.trabelsi@bioscan.tn',
    telephone: '+216 22 654 321',
    role: 'MEDECIN',
    status: 'ACTIVE',
    dateCreation: '2025-12-04',
  },
  {
    id: 3,
    nom: 'Ines Gharbi',
    email: 'ines.gharbi@bioscan.tn',
    telephone: '+216 27 987 321',
    role: 'TECHNICIEN',
    status: 'INACTIVE',
    dateCreation: '2026-01-19',
  },
  {
    id: 4,
    nom: 'Sami Haddad',
    email: 'sami.haddad@bioscan.tn',
    telephone: '+216 24 456 778',
    role: 'MEDECIN',
    status: 'ACTIVE',
    dateCreation: '2025-10-28',
  },
  {
    id: 5,
    nom: 'Leila Mansour',
    email: 'leila.mansour@bioscan.tn',
    telephone: '+216 29 220 990',
    role: 'TECHNICIEN',
    status: 'ACTIVE',
    dateCreation: '2025-09-14',
  },
];

const roles = ['TOUS', 'ADMIN', 'MEDECIN', 'TECHNICIEN'];
const statuses = ['TOUS', 'ACTIVE', 'INACTIVE'];

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('TOUS');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkRole, setBulkRole] = useState('MEDECIN');

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
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

  const updateUserStatus = (id, status) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, status } : user)));
  };

  const applyBulkStatus = (status) => {
    setUsers((prev) =>
      prev.map((user) => (selectedIds.has(user.id) ? { ...user, status } : user))
    );
  };

  const applyBulkRole = () => {
    setUsers((prev) =>
      prev.map((user) => (selectedIds.has(user.id) ? { ...user, role: bulkRole } : user))
    );
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="admin-users-page">
      <header className="users-header">
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p>Suivi des comptes, rôles et sécurité de la plateforme.</p>
        </div>
        <button className="btn-primary">Ajouter un utilisateur</button>
      </header>

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
                    <span className={`pill pill-${user.role.toLowerCase()}`}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`status ${user.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                      {user.status}
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
