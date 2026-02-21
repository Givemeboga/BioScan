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

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [overview, monthly, status] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getAccountsMonthly(),
          dashboardService.getAccountStatus(),
        ]);

        setStats({
          utilisateurs: overview.totalUsers || 0,
          comptesActifs: overview.activeAccounts || 0,
          signalements: overview.signalements || 0,
          rapportsGeneres: overview.rapportsGeneres || 0,
        });

        setMonthlyData(monthly.monthly || []);
        setStatusBreakdown(status.statusBreakdown || {});
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const barData = {
    labels: monthlyData.map(d => {
      const date = new Date(d.month);
      return date.toLocaleDateString('fr-TN', { month: 'short' });
    }) || ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Comptes crees',
        data: monthlyData.map(d => d.count) || [35, 48, 62, 54, 70, 81],
        backgroundColor: '#0ea5e9',
        borderRadius: 6,
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
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
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
        <button className="btn-refresh">Actualiser</button>
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
          <h3>Comptes par mois</h3>
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
            <li><span className="time">12 min</span> Nouveau medecin ajoute - ID #218</li>
            <li><span className="time">36 min</span> Acces technicien approuve - ID #74</li>
            <li><span className="time">1 h 10</span> Rapport mensuel exporte</li>
            <li><span className="time">2 h</span> Parametres globaux mis a jour</li>
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
