import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import './Topbar.css';
import './Sidebar.css';

export default function BaseDashboardMedecin() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(c => !c);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Topbar pageTitle="Tableau de bord - Médecin" onToggleSidebar={toggleSidebar} user={{ name: 'Dr. Nom' }} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar collapsed={collapsed} onClose={() => setCollapsed(true)} />

        <main style={{ flex: 1, padding: 20, background: '#f6f8fb' }}>
          {/* Contenu de la page rendu par les routes enfants */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}