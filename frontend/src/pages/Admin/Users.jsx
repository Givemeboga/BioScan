import React, { useMemo, useState } from 'react';
import './Users.css';

const initialUsers = [
  {
    utilisateur_id: 1,
    nom_utilisateur: 'Yosra Ben Ahmed',
    email: 'yosra.benahmed@bioscan.tn',
    telephone: '+216 20 123 456',
    role: 'ADMIN',
    statut: 'ACTIVE',
    date_generation: '2025-11-12',
  },
  {
    utilisateur_id: 2,
    nom_utilisateur: 'Ahmed Trabelsi',
    email: 'ahmed.trabelsi@bioscan.tn',
    telephone: '+216 22 654 321',
    role: 'MEDECIN',
    statut: 'ACTIVE',
    date_generation: '2025-12-04',
  },
  {
    utilisateur_id: 3,
    nom_utilisateur: 'Ines Gharbi',
    email: 'ines.gharbi@bioscan.tn',
    telephone: '+216 27 987 321',
    role: 'TECHNICIEN',
    statut: 'INACTIVE',
    date_generation: '2026-01-19',
  },
  {
    utilisateur_id: 4,
    nom_utilisateur: 'Sami Haddad',
    email: 'sami.haddad@bioscan.tn',
    telephone: '+216 24 456 778',
    role: 'MEDECIN',
    statut: 'ACTIVE',
    date_generation: '2025-10-28',
  },
  {
    utilisateur_id: 5,
    nom_utilisateur: 'Leila Mansour',
    email: 'leila.mansour@bioscan.tn',
    telephone: '+216 29 220 990',
    role: 'TECHNICIEN',
    statut: 'ACTIVE',
    date_generation: '2025-09-14',
  },
];

const roles = ['TOUS', 'ADMIN', 'MEDECIN', 'TECHNICIEN'];
const statuts = ['TOUS', 'ACTIVE', 'INACTIVE'];

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('TOUS');
  const [statutFilter, setStatutFilter] = useState('TOUS');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkRole, setBulkRole] = useState('MEDECIN');

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.nom_utilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'TOUS' || user.role === roleFilter;
      const matchesStatut = statutFilter === 'TOUS' || user.statut === statutFilter;
      return matchesSearch && matchesRole && matchesStatut;
    });
  }, [users, searchTerm, roleFilter, statutFilter]);

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

  const updateUserStatut = (utilisateur_id, statut) => {
    setUsers((prev) => prev.map((user) => (user.utilisateur_id === utilisateur_id ? { ...user, statut } : user)));
  };

  const applyBulkStatut = (statut) => {
    setUsers((prev) =>
      prev.map((user) => (selectedIds.has(user.utilisateur_id) ? { ...user, statut } : user))
    );
  };

  const applyBulkRole = () => {
    setUsers((prev) =>
      prev.map((user) => (selectedIds.has(user.utilisateur_id) ? { ...user, role: bulkRole } : user))
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
            <label htmlFor="statut">Statut</label>
            <select
              id="statut"
              value={statutFilter}
              onChange={(event) => setStatutFilter(event.target.value)}
            >
              {statuts.map((statut) => (
                <option key={statut} value={statut}>
                  {statut}
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
            <button className="btn-ghost" onClick={() => applyBulkStatut('ACTIVE')}>
              Activer
            </button>
            <button className="btn-ghost" onClick={() => applyBulkStatut('INACTIVE')}>
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
                <th>Date génération</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.utilisateur_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user.utilisateur_id)}
                      onChange={() => toggleSelectUser(user.utilisateur_id)}
                      aria-label={`Selectionner ${user.nom_utilisateur}`}
                    />
                  </td>
                  <td className="cell-strong">{user.nom_utilisateur}</td>
                  <td>{user.email}</td>
                  <td>{user.telephone}</td>
                  <td>
                    <span className={`pill pill-${user.role.toLowerCase()}`}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`status ${user.statut === 'ACTIVE' ? 'active' : 'inactive'}`}>
                      {user.statut}
                    </span>
                  </td>
                  <td>{user.date_generation}</td>
                  <td>
                    <div className="action-group">
                      <button className="action-btn">Edit</button>
                      <button
                        className={`action-btn ${user.statut === 'ACTIVE' ? 'action-warn' : 'action-ok'}`}
                        onClick={() =>
                          updateUserStatut(user.utilisateur_id, user.statut === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                        }
                      >
                        {user.statut === 'ACTIVE' ? 'Disable' : 'Activate'}
                      </button>
                      <button className="action-btn action-outline">Reset password</button>
                    </div>
                    <div className="action-group secondary">
                      <button className="action-btn action-outline">Force reset</button>
                      <button className="action-btn action-danger" onClick={() => updateUserStatut(user.utilisateur_id, 'INACTIVE')}>
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
