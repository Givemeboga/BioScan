// src/pages/patient/DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Calendar, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import axios from 'axios';
import './DashboardHome.css';

const API_BASE = 'http://127.0.0.1:8000';

const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  sessionStorage.getItem('token') ||
  null;

// ── Horloge animée ──────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = time.getHours() % 12;
  const m = time.getMinutes();
  const s = time.getSeconds();

  return (
    <div className="wall-clock">
      <svg viewBox="0 0 100 100" className="clock-svg">
        <circle cx="50" cy="50" r="48" className="clock-bg" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) - 90;
          const rad   = (angle * Math.PI) / 180;
          return (
            <text key={i}
              x={50 + 38 * Math.cos(rad)} y={50 + 38 * Math.sin(rad)}
              className="clock-number" textAnchor="middle" dominantBaseline="middle">
              {i === 0 ? 12 : i}
            </text>
          );
        })}
        <line x1="50" y1="50" x2="50" y2="30" className="hand hour"
          transform={`rotate(${h * 30 + m * 0.5}, 50, 50)`} />
        <line x1="50" y1="50" x2="50" y2="18" className="hand minute"
          transform={`rotate(${m * 6 + s * 0.1}, 50, 50)`} />
        <line x1="50" y1="50" x2="50" y2="14" className="hand second"
          transform={`rotate(${s * 6}, 50, 50)`} />
        <circle cx="50" cy="50" r="3" className="center-dot" />
      </svg>
      <div className="clock-digital">
        {String(time.getHours()).padStart(2, '0')}:
        {String(m).padStart(2, '0')}:
        {String(s).padStart(2, '0')}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [stats,        setStats]        = useState({ total: 0, validés: 0, enAttente: 0, cetteAnnée: 0, ceMois: 0 });
  const [monthlyBilans, setMonthlyBilans] = useState([]);
  const [trendData,    setTrendData]    = useState([]);
  const [recentBilans, setRecentBilans] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [userName,     setUserName]     = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) { setError('Vous devez être connecté.'); setLoading(false); return; }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        // ✅ Utilise /me pour les deux endpoints — plus besoin d'extraire user_id
        const [profilRes, dashRes] = await Promise.all([
          axios.get(`${API_BASE}/api/patient/profil/me`,    { headers }),
          axios.get(`${API_BASE}/api/dashboard-patient/me`, { headers }),
        ]);

        // Nom depuis profil
        const nomComplet = profilRes.data?.nom_utilisateur || 'Patient';
        setUserName(nomComplet.split(' ')[0]);

        // Stats
        const d = dashRes.data;
        setStats({
          total:      d.stats?.total      ?? 0,
          validés:    d.stats?.validés    ?? 0,
          enAttente:  d.stats?.enAttente  ?? 0,
          cetteAnnée: d.stats?.cetteAnnée ?? 0,
          ceMois:     d.stats?.ceMois     ?? 0,
        });

        // Bilans récents
        setRecentBilans(
          (d.bilans_recents || []).map(item => ({
            id:      item.bilan_id,
            type:    item.type || 'Bilan biologique',
            date:    formatDate(item.date_generation),
            status:  mapStatus(item.statut),
            fichier: item.nom_fichier || null,
          }))
        );

        // Mensuel + tendance
        const monthly = (d.monthly || []);
        setMonthlyBilans(monthly);
        setTrendData(monthly.map(m => ({
          month:   m.month,
          validés: Math.round(m.count * 0.8),
          attente: Math.round(m.count * 0.2),
        })));

      } catch (err) {
        console.error('[Dashboard] erreur:', err);
        if      (err.response?.status === 401) setError('Session expirée. Veuillez vous reconnecter.');
        else if (err.response?.status === 404) setError('Données introuvables pour ce patient.');
        else setError('Impossible de charger le tableau de bord.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return '—'; }
  };

  const mapStatus = (statut) => {
    const s = (statut || '').toUpperCase();
    if (s === 'VALIDE')    return 'validé';
    if (s === 'EN_COURS')  return 'en cours';
    if (s === 'BROUILLON') return 'en attente';
    return 'autre';
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (loading) return (
    <div className="dashboard-loading">
      <div className="dashboard-loading-spinner" />
      <p>Chargement du tableau de bord…</p>
    </div>
  );

  if (error) return <div className="dashboard-error">⚠️ {error}</div>;

  return (
    <div className="patient-dashboard">

      <div className="dashboard-header">
        <div className="greeting">
          <h1>
            {getGreeting()}
            {userName && <span className="greeting-name"> {userName}</span>}
            <span className="wave"> 👋</span>
          </h1>
          <p className="greeting-sub">Vos analyses médicales – Laboratoire BioScan</p>
        </div>
        <LiveClock />
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon"><FileText size={28} /></div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Bilans totaux</div>
        </div>
        <div className="stat-card validated">
          <div className="stat-icon"><CheckCircle size={28} /></div>
          <div className="stat-value">{stats.validés}</div>
          <div className="stat-label">Bilans validés</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon"><Clock size={28} /></div>
          <div className="stat-value">{stats.enAttente}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card year">
          <div className="stat-icon"><Calendar size={28} /></div>
          <div className="stat-value">{stats.cetteAnnée}</div>
          <div className="stat-label">Cette année</div>
        </div>
        <div className="stat-card month">
          <div className="stat-icon"><BarChart3 size={28} /></div>
          <div className="stat-value">{stats.ceMois}</div>
          <div className="stat-label">Ce mois</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Évolution mensuelle de vos bilans</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyBilans.length > 0 ? monthlyBilans : [{ month: '—', count: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Bilans" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Tendance validés vs en attente</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData.length > 0 ? trendData : [{ month: '—', validés: 0, attente: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="validés" stroke="#10b981" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="attente" stroke="#f59e0b" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-bilans">
        <div className="recent-bilans-header">
          <h2>Vos derniers bilans</h2>
          <span className="recent-bilans-count">
            {recentBilans.length} résultat{recentBilans.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="bilans-list">
          {recentBilans.length === 0 ? (
            <div className="no-data">
              <FileText size={40} strokeWidth={1.2} />
              <p>Aucun bilan récent trouvé.</p>
            </div>
          ) : (
            recentBilans.map((bilan) => (
              <div key={bilan.id} className="bilan-item">
                <div className="bilan-info">
                  <div className="bilan-icon-bg"><FileText size={24} /></div>
                  <div>
                    <div className="bilan-type">{bilan.type}</div>
                    <div className="bilan-date">{bilan.date}</div>
                  </div>
                </div>
                <div className={`status-badge ${bilan.status}`}>
                  {bilan.status === 'validé' ? <CheckCircle size={16} /> : <Clock size={16} />}
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