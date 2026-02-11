import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import '../Médecin/Topbar.css';
import '../Médecin/Sidebar.css';

export default function BaseDashboardAdmin() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(c => !c);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Topbar pageTitle="Administration" onToggleSidebar={toggleSidebar} sidebarOpen={!collapsed} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar collapsed={collapsed} onClose={() => setCollapsed(true)} />

        <main style={{ 
          flex: 1, 
          marginLeft: collapsed ? '76px' : '240px',
          marginTop: '64px',
          padding: '20px', 
          background: '#f6f8fb',
          transition: 'margin-left 0.28s ease'
        }}>
          {/* Contenu de la page rendu par les routes enfants */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
