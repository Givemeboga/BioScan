// src/pages/patient/DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import axios from 'axios';
import './DashboardHome.css';

const API_BASE = 'http://localhost:8000';
const PATIENT_ID = 1; // ← À remplacer par l'ID du patient connecté (via auth/context)

export default function DashboardHome() {
  const [stats, setStats] = useState({
    total: 0,
    valides: 0,
    enAttente: 0,
    cetteAnnee: 0,
    ceMois: 0,
  });
  const [monthlyBilans, setMonthlyBilans] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [recentBilans, setRecentBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Statistiques globales (dashboard-stats)
        const statsRes = await axios.get(
          `${API_BASE}/api/bilans-biologiques/patient/dashboard-stats?patient_id=${PATIENT_ID}`
        );
        setStats(statsRes.data);

        // 2. Bilans du patient connecté (limite 20 derniers)
        const bilansRes = await axios.get(
          `${API_BASE}/api/bilans-biologiques/patient/?patient_id=${PATIENT_ID}&limit=20&offset=0`
        );
        const bilans = bilansRes.data || [];

        // ─── Formatage des bilans récents ────────────────────────
        const formattedRecent = bilans.slice(0, 5).map(item => ({
          id: item.bilan_id,
          type: item.type || 'Bilan biologique',
          date: formatDate(item.date_generation),
          status: mapStatus(item.statut),
        }));
        setRecentBilans(formattedRecent);

        // ─── Préparation données mensuelles (simplifiée pour l'exemple) ───
        // Idéalement : un endpoint dédié qui renvoie agrégats mensuels
        // Ici on simule à partir des bilans récents (à améliorer backend)
        const monthly = aggregateMonthly(bilans);
        setMonthlyBilans(monthly);

        // Tendance validés / attente (simplifiée)
        const trend = generateTrendData(monthly);
        setTrendData(trend);

      } catch (err) {
        console.error('Erreur dashboard patient:', err);
        setError('Impossible de charger les données du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helpers
  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const mapStatus = (statut) => {
    const s = (statut || '').toUpperCase();
    if (s === 'VALIDE') return 'validé';
    if (s === 'EN_COURS') return 'en cours';
    if (s === 'BROUILLON') return 'en attente';
    return 'autre';
  };

  // Agrégation mensuelle simple (à déplacer en backend idéalement)
  const aggregateMonthly = (bilans) => {
    const counts = {};
    bilans.forEach(b => {
      if (!b.date_generation) return;
      const date = new Date(b.date_generation);
      const key = date.toLocaleDateString('fr-TN', { month: 'short' });
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(`2026-${a.month}-01`) - new Date(`2026-${b.month}-01`));
  };

  const generateTrendData = (monthly) => {
    // Simulation – à remplacer par vraies données agrégées si endpoint existe
    return monthly.map(m => ({
      month: m.month,
      valides: Math.floor(m.count * 0.8),
      attente: Math.floor(m.count * 0.2),
    }));
  };

  if (loading) return <div className="loading">Chargement du tableau de bord...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="patient-dashboard">

      {/* En-tête */}
      <div className="dashboard-header">
        <div className="greeting">
          <h1>Bonjour Yosra <span className="wave">👋</span></h1>
          <p>Vos analyses médicales – Laboratoire BioScan</p>
        </div>

        {/* Horloge conservée */}
        <div className="wall-clock">
          <svg viewBox="0 0 100 100" className="clock-svg">
            <circle cx="50" cy="50" r="48" className="clock-bg" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30) - 90;
              const x = 50 + 38 * Math.cos((angle * Math.PI) / 180);
              const y = 50 + 38 * Math.sin((angle * Math.PI) / 180);
              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  className="clock-number"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {i === 0 ? 12 : i}
                </text>
              );
            })}
            <line
              x1="50" y1="50" x2="50" y2="26"
              className="hand hour"
              transform={`rotate(${new Date().getHours() * 30 + new Date().getMinutes() * 0.5}, 50, 50)`}
            />
            <line
              x1="50" y1="50" x2="78" y2="50"
              className="hand minute"
              transform={`rotate(${new Date().getMinutes() * 6 + new Date().getSeconds() * 0.1}, 50, 50)`}
            />
            <circle cx="50" cy="50" r="4" className="center-dot" />
          </svg>
        </div>
      </div>

      {/* Cartes stats */}
      <div className="stats-grid">
        <div className="stat-card total">
          <FileText size={32} />
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Bilans totaux</div>
        </div>

        <div className="stat-card validated">
          <CheckCircle size={32} />
          <div className="stat-value">{stats.valides}</div>
          <div className="stat-label">Bilans validés</div>
        </div>

        <div className="stat-card pending">
          <Clock size={32} />
          <div className="stat-value">{stats.enAttente}</div>
          <div className="stat-label">En attente</div>
        </div>

        <div className="stat-card year">
          <Calendar size={32} />
          <div className="stat-value">{stats.cetteAnnee}</div>
          <div className="stat-label">Cette année</div>
        </div>

        <div className="stat-card month">
          <BarChart3 size={32} />
          <div className="stat-value">{stats.ceMois}</div>
          <div className="stat-label">Ce mois</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Évolution du nombre de vos bilans</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={monthlyBilans.length > 0 ? monthlyBilans : [{ month: 'Aucun', count: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Tendance validés vs en attente</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={trendData.length > 0 ? trendData : [{ month: 'Aucun', valides: 0, attente: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="valides" stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="attente" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bilans récents */}
      <div className="recent-bilans">
        <h2>Vos derniers bilans</h2>
        <div className="bilans-list">
          {recentBilans.length === 0 ? (
            <p className="no-data">Aucun bilan récent trouvé.</p>
          ) : (
            recentBilans.map((bilan) => (
              <div key={bilan.id} className="bilan-item">
                <div className="bilan-info">
                  <div className="bilan-icon-bg">
                    <FileText size={28} />
                  </div>
                  <div>
                    <div className="bilan-type">{bilan.type}</div>
                    <div className="bilan-date">{bilan.date}</div>
                  </div>
                </div>

                <div className={`status-badge ${bilan.status}`}>
                  {bilan.status === 'validé' ? <CheckCircle size={20} /> : <Clock size={20} />}
                  <span>{bilan.status}</span>
                </div>

                <button className="view-report-btn">Voir le rapport</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}