import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { dashboardService } from '../../services/adminService';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    utilisateurs: 0,
    comptesActifs: 0,
    signalements: 0,
    rapportsGeneres: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overview, monthly, status, activities] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getAccountsMonthly(),
        dashboardService.getAccountStatus(),
        dashboardService.getRecentActivities(10),
      ]);

      setStats({
        utilisateurs: overview.totalUsers || 0,
        comptesActifs: overview.activeAccounts || 0,
        signalements: overview.signalements || 0,
        rapportsGeneres: overview.rapportsGeneres || 0,
      });

      setMonthlyData(monthly.monthly || []);
      setStatusBreakdown(status.statusBreakdown || {});
      setRecentActivities(activities.activities || []);
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const barData = {
    labels: monthlyData.map(d => {
      const date = new Date(d.month);
      return `Semaine ${Math.ceil((date.getDate()) / 7)}`;
    }) || ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5', 'Semaine 6'],
    datasets: [
      {
        label: 'Comptes crees',
        data: monthlyData.map(d => d.count) || [35, 48, 62, 54, 70, 81],
        backgroundColor: '#2563eb',
        borderRadius: 6,
        maxBarThickness: 44,
      },
    ],
  };

  const donutLabels = Object.keys(statusBreakdown).length > 0 
    ? Object.keys(statusBreakdown)
    : ['Actifs', 'En attente', 'Suspendus', 'Supprimes'];
  
  const donutValues = Object.keys(statusBreakdown).length > 0
    ? Object.values(statusBreakdown)
    : [71, 14, 9, 6];

  const donutData = {
    labels: donutLabels,
    datasets: [
      {
        data: donutValues,
        backgroundColor: ['#2563eb', '#0d9488', '#f59e0b', '#94a3b8'],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  const donutOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    cutout: '65%',
  };

  // Helper function to format time difference
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Il y a peu';
    
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now - eventTime;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    if (diffHours < 24) return `${diffHours}h ${diffMinutes % 60}min`;
    return `${diffDays}j`;
  };

  // Helper function to get activity description
  const getActivityDescription = (activity) => {
    const types = {
      'Connexion': `Connexion - ${activity.username}`,
      'Deconnexion': `Déconnexion - ${activity.username}`,
      'Creation_utilisateur': `Nouvel utilisateur créé - ${activity.username}`,
      'Modification_utilisateur': `Utilisateur modifié - ${activity.username}`,
      'Suppression_utilisateur': `Utilisateur supprimé - ${activity.username}`,
    };
    return types[activity.type] || `${activity.type} - ${activity.username}`;
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <h1>Tableau de bord admin</h1>
        </header>
        <p style={{ padding: '20px' }}>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <h1>Tableau de bord admin</h1>
        </header>
        <p style={{ padding: '20px', color: 'red' }}>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Tableau de bord admin</h1>
          <p>Vue d'ensemble des operations - {new Date().toLocaleDateString('fr-TN')}</p>
        </div>
        <button className="btn-refresh" onClick={loadDashboardData} disabled={loading}>
          {loading ? 'Chargement...' : 'Actualiser'}
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Utilisateurs totaux</h3>
            <div className="stat-value">{stats.utilisateurs}</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Comptes actifs</h3>
            <div className="stat-value">{stats.comptesActifs}</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🚩</div>
          <div className="stat-content">
            <h3>Signalements</h3>
            <div className="stat-value">{stats.signalements}</div>
          </div>
        </div>

        <div className="stat-card primary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Rapports generes</h3>
            <div className="stat-value">{stats.rapportsGeneres}</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card bar-chart">
          <h3>Comptes par semaine</h3>
          <div className="chart-wrapper">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Statut des comptes</h3>
          <Doughnut data={donutData} options={donutOptions} />
        </div>
      </div>

      <div className="bottom-grid">
        <div className="recent-activity">
          <h3>Activite recente</h3>
          <ul>
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <li key={activity.id}>
                  <span className="time">{formatTimeAgo(activity.timestamp)}</span>
                  {getActivityDescription(activity)}
                </li>
              ))
            ) : (
              <li style={{ color: '#999', fontStyle: 'italic' }}>Aucune activité récente</li>
            )}
          </ul>
        </div>

        <div className="alertes-urgentes">
          <h3>Alertes</h3>
          <div className="alert-item danger">
            <span>Urgent</span> 3 comptes suspects a verifier
          </div>
          <div className="alert-item warning">
            <span>Info</span> 5 demandes en attente de validation
          </div>
        </div>
      </div>
    </div>
  );
}
