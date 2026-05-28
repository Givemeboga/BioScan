import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

/* ── Icônes SVG (cohérentes avec le reste de l'admin) ─────────── */
function StatIcon({ name }) {
  const p = {
    width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (name) {
    case 'users':
      return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
    case 'check':
      return <svg {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
    case 'user-off':
      return <svg {...p}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="17" y1="8" x2="22" y2="13" /><line x1="22" y1="8" x2="17" y2="13" /></svg>;
    case 'report':
      return <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
    case 'patient':
      return <svg {...p}><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case 'doctor':
      return <svg {...p}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>;
    case 'tech':
      return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></svg>;
    case 'shield':
      return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case 'activity':
      return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    default:
      return null;
  }
}

function ActivityIcon({ severity }) {
  const p = {
    width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  if (severity === 'danger') {
    return <svg {...p}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>;
  }
  if (severity === 'warning') {
    return <svg {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" /></svg>;
  }
  if (severity === 'success') {
    return <svg {...p}><path d="M20 6L9 17l-5-5" /></svg>;
  }
  return <svg {...p}><path d="M15 3h6v6" /><path d="M10 14L21 3" /><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /></svg>;
}

const ACTIVITY_META = {
  Connexion: { label: 'Connexion', sev: 'info' },
  Deconnexion: { label: 'Déconnexion', sev: 'info' },
  Creation_utilisateur: { label: 'Nouvel utilisateur créé', sev: 'success' },
  Modification_utilisateur: { label: 'Utilisateur modifié', sev: 'warning' },
  Suppression_utilisateur: { label: 'Utilisateur supprimé', sev: 'danger' },
  Changement_statut: { label: 'Statut modifié', sev: 'warning' },
  Reinitialisation_motdepasse: { label: 'Mot de passe réinitialisé', sev: 'warning' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    utilisateurs: 0,
    comptesActifs: 0,
    comptesInactifs: 0,
    rapportsGeneres: 0,
    bilans: 0,
    evenements: 0,
    patients: 0,
    medecins: 0,
    techniciens: 0,
    administrateurs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState({});
  const [rolesBreakdown, setRolesBreakdown] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overview, monthly, status, roles, activities] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getAccountsMonthly(),
        dashboardService.getAccountStatus(),
        dashboardService.getRolesBreakdown(),
        dashboardService.getRecentActivities(8),
      ]);

      setStats({
        utilisateurs: overview.totalUsers || 0,
        comptesActifs: overview.activeAccounts || 0,
        comptesInactifs: overview.inactiveAccounts ?? Math.max(0, (overview.totalUsers || 0) - (overview.activeAccounts || 0)),
        rapportsGeneres: overview.rapportsGeneres || 0,
        bilans: overview.totalBilans || 0,
        evenements: overview.totalEvenements || 0,
        patients: overview.patients || 0,
        medecins: overview.medecins || 0,
        techniciens: overview.techniciens || 0,
        administrateurs: overview.administrateurs || 0,
      });

      setMonthlyData(monthly.monthly || []);
      setStatusBreakdown(status.statusBreakdown || {});
      setRolesBreakdown(roles.roles || []);
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

  const monthLabel = (m) => {
    const d = new Date(m);
    if (Number.isNaN(d.getTime())) return m;
    return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  };

  const barData = {
    labels: monthlyData.length ? monthlyData.map((d) => monthLabel(d.month)) : ['—'],
    datasets: [
      {
        label: 'Comptes créés',
        data: monthlyData.length ? monthlyData.map((d) => d.count) : [0],
        backgroundColor: '#2563eb',
        borderRadius: 6,
        maxBarThickness: 44,
      },
    ],
  };

  const donutLabels = Object.keys(statusBreakdown).length > 0
    ? Object.keys(statusBreakdown)
    : ['Aucune donnée'];

  const donutValues = Object.keys(statusBreakdown).length > 0
    ? Object.values(statusBreakdown)
    : [1];

  const donutData = {
    labels: donutLabels,
    datasets: [
      {
        data: donutValues,
        backgroundColor: ['#2563eb', '#0d9488', '#f59e0b', '#94a3b8', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  const rolesData = {
    labels: rolesBreakdown.length ? rolesBreakdown.map((r) => r.role) : ['Aucune donnée'],
    datasets: [
      {
        data: rolesBreakdown.length ? rolesBreakdown.map((r) => r.count) : [1],
        backgroundColor: ['#2563eb', '#0d9488', '#f59e0b', '#8b5cf6', '#94a3b8'],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    cutout: '65%',
  };

  const getActivityMeta = (activity) => {
    const meta = ACTIVITY_META[activity.type] || { label: activity.type || 'Événement', sev: 'info' };
    return meta;
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <div><h1>Tableau de bord admin</h1></div>
        </header>
        <p style={{ padding: '20px', color: '#64748b' }}>Chargement des données…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <div><h1>Tableau de bord admin</h1></div>
        </header>
        <p style={{ padding: '20px', color: '#dc2626' }}>Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Tableau de bord admin</h1>
          <p>Vue d'ensemble des opérations — {new Date().toLocaleDateString('fr-TN')}</p>
        </div>
        <button className="btn-refresh" onClick={loadDashboardData} disabled={loading}>
          {loading ? 'Chargement…' : 'Actualiser'}
        </button>
      </header>

      {/* ── Section : indicateurs clés ─────────────────────────── */}
      <section className="dash-section">
        <h2 className="section-title">Vue d'ensemble</h2>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon"><StatIcon name="users" /></div>
            <div className="stat-content">
              <h3>Utilisateurs totaux</h3>
              <div className="stat-value">{stats.utilisateurs}</div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon"><StatIcon name="check" /></div>
            <div className="stat-content">
              <h3>Comptes actifs</h3>
              <div className="stat-value">{stats.comptesActifs}</div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon"><StatIcon name="user-off" /></div>
            <div className="stat-content">
              <h3>Comptes inactifs</h3>
              <div className="stat-value">{stats.comptesInactifs}</div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon"><StatIcon name="activity" /></div>
            <div className="stat-content">
              <h3>Événements sécurité</h3>
              <div className="stat-value">{stats.evenements}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section : répartition par rôle ─────────────────────── */}
      <section className="dash-section">
        <h2 className="section-title">Utilisateurs par rôle</h2>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon"><StatIcon name="patient" /></div>
            <div className="stat-content">
              <h3>Patients</h3>
              <div className="stat-value">{stats.patients}</div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon"><StatIcon name="doctor" /></div>
            <div className="stat-content">
              <h3>Médecins</h3>
              <div className="stat-value">{stats.medecins}</div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon"><StatIcon name="tech" /></div>
            <div className="stat-content">
              <h3>Techniciens</h3>
              <div className="stat-value">{stats.techniciens}</div>
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon"><StatIcon name="shield" /></div>
            <div className="stat-content">
              <h3>Administrateurs</h3>
              <div className="stat-value">{stats.administrateurs}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section : statistiques ─────────────────────────────── */}
      <section className="dash-section">
        <h2 className="section-title">Statistiques</h2>
        <div className="chart-card chart-full">
          <h3>Évolution des comptes créés</h3>
          <div className="chart-wrapper">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="charts-duo">
          <div className="chart-card">
            <h3>Répartition des statuts</h3>
            <div className="chart-wrapper donut-wrapper">
              <Doughnut data={donutData} options={donutOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h3>Répartition par rôle</h3>
            <div className="chart-wrapper donut-wrapper">
              <Doughnut data={rolesData} options={donutOptions} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section : activité récente ─────────────────────────── */}
      <section className="dash-section">
        <div className="activity-card">
          <div className="card-head">
            <h3>Activité récente</h3>
            <button className="link-all" onClick={() => navigate('/admin/notifications')}>
              Voir tout
            </button>
          </div>
          {recentActivities && recentActivities.length > 0 ? (
            <ul className="activity-list">
              {recentActivities.map((activity) => {
                const meta = getActivityMeta(activity);
                return (
                  <li key={activity.id} className="activity-row">
                    <span className={`activity-chip sev-${meta.sev}`}>
                      <ActivityIcon severity={meta.sev} />
                    </span>
                    <div className="activity-text">
                      <span className="activity-label">{meta.label}</span>
                      {activity.username && (
                        <span className="activity-name">{activity.username}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="activity-empty">Aucune activité récente.</p>
          )}
        </div>
      </section>
    </div>
  );
}
