import React from 'react';
import { CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import './Historique.css';

export default function Historique() {
  return (
    <div className="historique">
      <div className="historique-welcome-card">
        <div className="historique-welcome-header">
          <h2 className="historique-welcome-title">Historique</h2>
          <span className="historique-welcome-emoji">📊</span>
        </div>
        <p className="historique-welcome-subtitle">Suivez l'évolution de vos résultats médicaux.</p>
      </div>

      <div className="historique-container">
        <div className="historique-card">
          <h3 className="historique-title">Historique complet de vos bilans</h3>
          
          <div className="historique-item">
            <div className="historique-item-header">
              <CheckCircle size={18} color="#10b981" />
              <h4 className="historique-item-title">Bilan sanguin complet</h4>
            </div>
            <p className="historique-item-date">15 Février 2026</p>
            <div className="historique-badges">
              <div className="historique-status-badge badge-valid">Validé</div>
              <span className="historique-meta">129s 820 mm</span>
            </div>
            <div className="historique-details">
              <div className="historique-detail-row">
                <span className="historique-detail-label">↑ Hémoglobine</span>
                <span className="historique-detail-value">12,1 g/dL</span>
              </div>
              <div className="historique-detail-row">
                <span className="historique-detail-label">🔶 Fer</span>
                <div className="historique-detail-value-group">
                  <span className="historique-detail-value">33 µg/dL</span>
                  <span className="historique-detail-status">→ Normal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="historique-item">
            <div className="historique-item-header">
              <Clock size={18} color="#f59e0b" />
              <h4 className="historique-item-title">Bilan urinaire</h4>
            </div>
            <p className="historique-item-date">02 Mars 2026</p>
            <div className="historique-status-badge badge-pending">En validation</div>
          </div>

          <div className="historique-item">
            <div className="historique-item-header">
              <AlertCircle size={18} color="#ef4444" />
              <h4 className="historique-item-title">Analyse hormonale</h4>
            </div>
            <p className="historique-item-date">20 Janvier 2026</p>
            <div className="historique-status-badge badge-rejected">Rejeté</div>
          </div>

          <div className="historique-item">
            <div className="historique-item-header">
              <CheckCircle size={18} color="#10b981" />
              <h4 className="historique-item-title">Bilan lipidique</h4>
              <ChevronRight size={16} color="#9ca3af" />
            </div>
            <p className="historique-item-date">10 Janvier 2026</p>
            <div className="historique-badges">
              <div className="historique-status-badge badge-valid">Validé</div>
            </div>
            <div className="historique-details">
              <div className="historique-detail-row">
                <span className="historique-detail-label">Cholestérol total</span>
                <span className="historique-detail-value">1,9 g/L</span>
              </div>
              <div className="historique-detail-row">
                <span className="historique-detail-label">Triglycérides</span>
                <div className="historique-detail-value-group">
                  <span className="historique-detail-value">0,85 g/L</span>
                  <span className="historique-detail-status">→ Normal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="historique-item">
            <div className="historique-item-header">
              <CheckCircle size={18} color="#10b981" />
              <h4 className="historique-item-title">Cholestérol</h4>
              <ChevronRight size={16} color="#9ca3af" />
            </div>
            <p className="historique-item-date">05 Janvier 2026</p>
            <p className="historique-metric-value">1,9 g/L</p>
            <div className="historique-metric-bar">
              <div className="historique-metric-fill" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="historique-item">
            <div className="historique-item-header">
              <CheckCircle size={18} color="#10b981" />
              <h4 className="historique-item-title">Glycémie</h4>
              <ChevronRight size={16} color="#9ca3af" />
            </div>
            <p className="historique-item-date">28 Décembre 2025</p>
            <p className="historique-metric-value">0,92 g/L</p>
            <div className="historique-metric-bar">
              <div className="historique-metric-fill" style={{ width: '80%' }}></div>
            </div>
          </div>

          <div className="historique-item">
            <div className="historique-item-header">
              <CheckCircle size={18} color="#10b981" />
              <h4 className="historique-item-title">Bilan sanguin complet</h4>
            </div>
            <p className="historique-item-date">15 Décembre 2025</p>
            <div className="historique-badges">
              <div className="historique-status-badge badge-valid">Validé</div>
            </div>
            <div className="historique-details">
              <div className="historique-detail-row">
                <span className="historique-detail-label">↑ Hémoglobine</span>
                <span className="historique-detail-value">12,8 g/dL</span>
              </div>
              <div className="historique-detail-row">
                <span className="historique-detail-label">🔶 Fer</span>
                <div className="historique-detail-value-group">
                  <span className="historique-detail-value">38 µg/dL</span>
                  <span className="historique-detail-status">→ Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}