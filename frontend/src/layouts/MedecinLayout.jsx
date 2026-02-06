// src/layouts/MedecinLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

// ────────────────────────────────────────────────
// Importer les composants SPÉCIFIQUES au médecin
// ────────────────────────────────────────────────
import Sidebar from '../components/Médecin/Sidebar';          // ← le bon Sidebar médecin
import Topbar from '../components/Médecin/Topbar';            // ← le bon Topbar médecin

import './MedecinLayout.css';

export default function MedecinLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Utilisateur actuel (à remplacer par ton système d'auth plus tard)
  const currentUser = {
    name: "Dr. Yosra",
    role: "Médecin",
    avatar: null, // ou une vraie URL d'avatar
  };

  return (
    <div className={`medecin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar spécifique au médecin */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onClose={toggleSidebar} 
      />

      <div className="main-content-area">
        {/* Topbar spécifique au médecin */}
        <Topbar
          onToggleSidebar={toggleSidebar}
          user={currentUser}
          sidebarOpen={!sidebarCollapsed}
          // Tu peux ajouter d'autres props si ton Topbar médecin en attend
          // pageTitle="Tableau de bord"   ← exemple si tu veux le passer dynamiquement
        />

        <main className="page-container">
          <Outlet />  {/* ← Les pages comme BilanBiologique, TableauDeBord, etc. s'affichent ici */}
        </main>
      </div>
    </div>
  );
}