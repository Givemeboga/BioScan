import React, { useMemo, useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { reportsService } from '../../services/adminService';
import './Reports.css';

const statusOptions = ['TOUS', 'VALIDE', 'EN_COURS', 'REJETE'];
const typeOptions = ['TOUS', 'MEDICAL', 'ANOMALIE'];

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [typeFilter, setTypeFilter] = useState('TOUS');
  const [medecinFilter, setMedecinFilter] = useState('TOUS');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const data = await reportsService.getReports();
        setReports(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading reports:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  // Get unique medecins for filter
  const medecins = useMemo(() => {
    const uniqueMedecins = new Set(['TOUS']);
    reports.forEach((r) => {
      if (r.medecin) uniqueMedecins.add(r.medecin);
    });
    return Array.from(uniqueMedecins);
  }, [reports]);

  const stats = useMemo(() => {
    const totalMedical = reports.filter((r) => r.type === 'MEDICAL').length;
    const totalAnomalie = reports.filter((r) => r.type === 'ANOMALIE').length;
    const valides = reports.filter((r) => r.status === 'VALIDE').length;
    const enCours = reports.filter((r) => r.status === 'EN_COURS').length;
    const rejetes = reports.filter((r) => r.status === 'REJETE').length;

    return { totalMedical, totalAnomalie, valides, enCours, rejetes };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        (report.titre?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (report.patient?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (report.medecin?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'TOUS' || report.status === statusFilter;
      const matchesType = typeFilter === 'TOUS' || report.type === typeFilter;
      const matchesMedecin = medecinFilter === 'TOUS' || report.medecin === medecinFilter;
      const matchesDate = !dateFilter || report.dateCreation === dateFilter;

      return matchesSearch && matchesStatus && matchesType && matchesMedecin && matchesDate;
    });
  }, [reports, searchTerm, statusFilter, typeFilter, medecinFilter, dateFilter]);

  const barData = {
    labels: ['Validés', 'En cours', 'Rejetés'],
    datasets: [
      {
        label: 'Nombre de rapports',
        data: [stats.valides, stats.enCours, stats.rejetes],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  const downloadAuditTrail = () => {
    const auditData = filteredReports.map((r) => ({
      ID: r.id,
      Type: r.type,
      Titre: r.titre,
      Medecin: r.medecin,
      Patient: r.patient,
      Status: r.status,
      'Date Creation': r.dateCreation,
      'Date Validation': r.dateValidation || 'N/A',
    }));

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      Object.keys(auditData[0]).join(',') +
      '\n' +
      auditData.map((row) => Object.values(row).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="admin-reports-page">
        <header className="reports-header">
          <h1>Rapports système</h1>
        </header>
        <p style={{ padding: '20px' }}>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-reports-page">
        <header className="reports-header">
          <h1>Rapports système</h1>
        </header>
        <p style={{ padding: '20px', color: 'red' }}>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="admin-reports-page">
      <header className="reports-header">
        <div>
          <h1>Rapports système</h1>
          <p>Vue d'ensemble et audit des rapports de la plateforme.</p>
        </div>
        <button className="btn-primary" onClick={downloadAuditTrail}>
          📥 Télécharger audit trail
        </button>
      </header>

      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Rapports médicaux</h3>
            <div className="stat-value">{stats.totalMedical}</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Rapports anomalies</h3>
            <div className="stat-value">{stats.totalAnomalie}</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Validés</h3>
            <div className="stat-value">{stats.valides}</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>En cours</h3>
            <div className="stat-value">{stats.enCours}</div>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-card">
          <h3>Distribution des statuts</h3>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <section className="filters-card">
        <div className="filters-row">
          <div className="field-group">
            <label htmlFor="search">Recherche</label>
            <input
              id="search"
              type="text"
              placeholder="Titre, patient ou médecin"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="type">Type</label>
            <select id="type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="status">Statut</label>
            <select id="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="medecin">Médecin</label>
            <select id="medecin" value={medecinFilter} onChange={(e) => setMedecinFilter(e.target.value)}>
              {medecins.map((medecin) => (
                <option key={medecin} value={medecin}>
                  {medecin}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="table-card">
        <div className="table-header">
          <h3>Liste des rapports ({filteredReports.length})</h3>
        </div>
        <div className="table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Titre</th>
                <th>Médecin</th>
                <th>Patient</th>
                <th>Statut</th>
                <th>Date création</th>
                <th>Date validation</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td className="cell-strong">#{report.id}</td>
                  <td>
                    <span className={`pill pill-${(report.type || 'unknown').toLowerCase()}`}>{report.type || 'N/A'}</span>
                  </td>
                  <td>{report.titre || 'N/A'}</td>
                  <td>{report.medecin || 'N/A'}</td>
                  <td>
                    {report.patient || 'N/A'} <span className="patient-id">#{report.patientId || '—'}</span>
                  </td>
                  <td>
                    <span
                      className={`status ${
                        (report.status || '').toUpperCase() === 'VALIDE'
                          ? 'valide'
                          : (report.status || '').toUpperCase() === 'EN_COURS'
                          ? 'en-cours'
                          : 'rejete'
                      }`}
                    >
                      {report.status || 'N/A'}
                    </span>
                  </td>
                  <td>{report.dateCreation || '—'}</td>
                  <td>{report.dateValidation || '—'}</td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-state">
                    Aucun rapport ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
