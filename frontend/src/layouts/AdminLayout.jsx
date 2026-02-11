// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

// ────────────────────────────────────────────────
// Importer les composants SPÉCIFIQUES à l'admin
// ────────────────────────────────────────────────
import Sidebar from '../components/Admin/Sidebar';          // ← le bon Sidebar admin
import Topbar from '../components/Admin/Topbar';            // ← le bon Topbar admin

import './AdminLayout.css';

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Utilisateur actuel (à remplacer par ton système d'auth plus tard)
  const currentUser = {
    name: "Administrateur",
    role: "Admin",
    avatar: null, // ou une vraie URL d'avatar
  };

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar spécifique à l'admin */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onClose={toggleSidebar} 
      />

      <div className="main-content-area">
        {/* Topbar spécifique à l'admin */}
        <Topbar
          onToggleSidebar={toggleSidebar}
          user={currentUser}
          sidebarOpen={!sidebarCollapsed}
          // Tu peux ajouter d'autres props si ton Topbar admin en attend
          // pageTitle="Administration"   ← exemple si tu veux le passer dynamiquement
        />

        <main className="page-container">
          <Outlet />  {/* ← Les pages admin s'affichent ici */}
        </main>
      </div>
    </div>
  );
}
