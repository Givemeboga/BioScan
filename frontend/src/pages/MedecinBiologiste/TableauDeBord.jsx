// src/pages/medecin/TableauDeBord.jsx
import React from 'react';
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
import './TableauDeBord.css';

// Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function TableauDeBord() {
  // Données exemple – à remplacer par tes données réelles (API)
  const stats = {
    patients: 142,
    bilansEnAttente: 18,
    anomaliesRecentes: 7,
    rapportsGeneres: 89,
  };

  // Données pour le graphique barres (ex: bilans par mois)
  const barData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Bilans terminés',
        data: [45, 59, 80, 81, 56, 72],
        backgroundColor: '#0284c7',
        borderRadius: 6,
      },
      {
        label: 'Bilans en attente',
        data: [12, 18, 25, 14, 9, 22],
        backgroundColor: '#f59e0b',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  // Données pour le donut (statut des bilans)
  const donutData = {
    labels: ['Validés', 'En attente', 'En cours', 'Anomalies'],
    datasets: [
      {
        data: [65, 18, 10, 7],
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    cutout: '65%',
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Bienvenue, Dr. Yosra – Vue d’ensemble – {new Date().toLocaleDateString('fr-TN')}</p>
        </div>
        <button className="btn-refresh">Actualiser</button>
      </header>

      {/* Cartes statistiques */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Patients suivis</h3>
            <div className="stat-value">{stats.patients}</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🔬</div>
          <div className="stat-content">
            <h3>Bilans en attente</h3>
            <div className="stat-value">{stats.bilansEnAttente}</div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Anomalies récentes</h3>
            <div className="stat-value">{stats.anomaliesRecentes}</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Rapports générés</h3>
            <div className="stat-value">{stats.rapportsGeneres}</div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Bilans par mois</h3>
          <Bar data={barData} options={barOptions} />
        </div>

        <div className="chart-card">
          <h3>Répartition des statuts</h3>
          <Doughnut data={donutData} options={donutOptions} />
        </div>
      </div>

      {/* Activité récente + Alertes */}
      <div className="bottom-grid">
        <div className="recent-activity">
          <h3>Dernière activité</h3>
          <ul>
            <li><span className="time">10 min</span> Bilan biologique – Patient #47 terminé</li>
            <li><span className="time">42 min</span> Rapport anomalie validé – Patient #112</li>
            <li><span className="time">1 h 20</span> Nouveau patient ajouté – #189</li>
            <li><span className="time">2 h</span> Analyse rénale urgente lancée</li>
          </ul>
        </div>

        <div className="alertes-urgentes">
          <h3>Alertes urgentes</h3>
          <div className="alert-item danger">
            <span>Urgence haute</span> Patient #89 – Glycémie critique
          </div>
          <div className="alert-item warning">
            <span>À vérifier</span> Patient #56 – Anomalie dans NFS
          </div>
        </div>
      </div>
    </div>
  );
}