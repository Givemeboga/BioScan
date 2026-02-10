// src/pages/medecin/Parametres.jsx
import React, { useState } from 'react';
import './Parametres.css';

export default function Parametres() {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', title: '1. Paramètres généraux' },
    { id: 'compte', title: '2. Gestion du compte' },
    { id: 'securite', title: '3. Sécurité' },
    { id: 'roles', title: '4. Gestion des rôles et permissions' },
    { id: 'bioscan', title: '5. Paramètres liés à BioScan' },
    { id: 'notifications', title: '6. Notifications' },
    { id: 'sauvegarde', title: '7. Sauvegarde & données' },
    { id: 'apparence', title: '8. Apparence' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="settings-content">
            <h2>1. Paramètres généraux de la plateforme</h2>
            <div className="form-group">
              <label>Nom de la plateforme</label>
              <input type="text" defaultValue="BioScan" />
            </div>
            <div className="form-group">
              <label>Description courte</label>
              <textarea defaultValue="Plateforme de gestion et d'analyse des bilans biologiques" rows="3" />
            </div>
            <div className="form-group">
              <label>Langue par défaut</label>
              <select defaultValue="fr">
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fuseau horaire</label>
              <select defaultValue="Africa/Tunis">
                <option value="Africa/Tunis">Africa/Tunis (CET)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="form-group">
              <label>Format de date</label>
              <select defaultValue="dd/MM/yyyy">
                <option value="dd/MM/yyyy">05/02/2026</option>
                <option value="yyyy-MM-dd">2026-02-05</option>
              </select>
            </div>
            <button className="btn btn-primary">Enregistrer</button>
          </div>
        );

      case 'compte':
        return (
          <div className="settings-content">
            <h2>2. Gestion du compte</h2>
            <div className="form-group">
              <label>Modifier l'email</label>
              <input type="email" defaultValue="yosra.benahmed@bioscan.tn" />
            </div>
            <div className="form-group">
              <label>Changer le mot de passe</label>
              <input type="password" placeholder="Nouveau mot de passe" />
              <input type="password" placeholder="Confirmer" style={{ marginTop: '10px' }} />
            </div>
            <div className="form-group">
              <label>Informations personnelles</label>
              <textarea placeholder="Spécialité, adresse cabinet, etc..." rows="4" />
            </div>
            <button className="btn btn-primary">Mettre à jour le compte</button>
          </div>
        );

      case 'securite':
        return (
          <div className="settings-content">
            <h2>3. Sécurité</h2>
            <div className="security-option">
              <div>
                <h3>Authentification à deux facteurs (2FA)</h3>
                <p>Renforcez la sécurité de votre compte</p>
              </div>
              <button className="btn btn-primary">Activer 2FA</button>
            </div>
            <div className="security-option">
              <div>
                <h3>Gestion des sessions</h3>
                <p>3 sessions actives actuellement</p>
              </div>
              <button className="btn btn-outline">Voir les sessions</button>
            </div>
            <div className="security-option">
              <div>
                <h3>Historique de connexion</h3>
                <p>Dernière connexion : 06/02/2026 10:30</p>
              </div>
              <button className="btn btn-outline">Voir l'historique</button>
            </div>
            <div className="security-option">
              <div>
                <h3>Politique de mot de passe</h3>
                <p>Minimum 12 caractères, majuscules, chiffres, caractères spéciaux</p>
              </div>
              <button className="btn btn-outline">Modifier la politique</button>
            </div>
          </div>
        );

      case 'roles':
        return (
          <div className="settings-content">
            <h2>4. Gestion des rôles et permissions (RBAC)</h2>
            <table className="roles-table">
              <thead>
                <tr>
                  <th>Rôle</th>
                  <th>Lecture</th>
                  <th>Écriture</th>
                  <th>Suppression</th>
                  <th>Export</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Admin</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
                <tr><td>Technicien</td><td>✔</td><td>✔</td><td>—</td><td>✔</td></tr>
                <tr><td>Médecin</td><td>✔</td><td>✔</td><td>—</td><td>✔</td></tr>
                <tr><td>Patient</td><td>✔ (ses données)</td><td>—</td><td>—</td><td>—</td></tr>
              </tbody>
            </table>
            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              Modifier les permissions
            </button>
          </div>
        );

      case 'bioscan':
        return (
          <div className="settings-content">
            <h2>5. Paramètres liés à BioScan</h2>
            <div className="form-group">
              <label>Types d’analyses disponibles</label>
              <textarea defaultValue="Hémogramme, Bilan lipidique, Glycémie, Thyroïde, Rénal, Hépatique..." rows="4" />
            </div>
            <div className="form-group">
              <label>Seuils d’alerte (exemple)</label>
              <input type="text" placeholder="Glycémie > 7 mmol/L = alerte" />
            </div>
            <div className="form-group">
              <label>Format des rapports</label>
              <select defaultValue="pdf">
                <option value="pdf">PDF</option>
                <option value="html">HTML + PDF</option>
              </select>
            </div>
            <div className="form-group">
              <label>Archivage automatique</label>
              <select defaultValue="after-12-months">
                <option value="after-12-months">Après 12 mois</option>
                <option value="after-24-months">Après 24 mois</option>
              </select>
            </div>
            <button className="btn btn-primary">Sauvegarder</button>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-content">
            <h2>6. Notifications</h2>
            <div className="checkbox-group">
              <input type="checkbox" id="email" defaultChecked />
              <label htmlFor="email">Email (résultats, alertes)</label>
            </div>
            <div className="checkbox-group">
              <input type="checkbox" id="sms" />
              <label htmlFor="sms">SMS pour résultats critiques</label>
            </div>
            <div className="checkbox-group">
              <input type="checkbox" id="push" defaultChecked />
              <label htmlFor="push">Notifications push navigateur</label>
            </div>
            <button className="btn btn-primary">Enregistrer</button>
          </div>
        );

      case 'sauvegarde':
        return (
          <div className="settings-content">
            <h2>7. Sauvegarde & Données</h2>
            <div className="form-group">
              <label>Fréquence des sauvegardes automatiques</label>
              <select defaultValue="daily">
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dernière sauvegarde</label>
              <p>06/02/2026 à 02:00 (automatique)</p>
            </div>
            <div className="form-group">
              <label>Exporter toutes les données</label>
              <button className="btn btn-outline">Exporter (CSV + PDF)</button>
            </div>
            <button className="btn btn-primary">Sauvegarder maintenant</button>
          </div>
        );

      case 'apparence':
        return (
          <div className="settings-content">
            <h2>8. Apparence</h2>
            <div className="form-group">
              <label>Thème</label>
              <select defaultValue="clair">
                <option value="clair">Clair</option>
                <option value="sombre">Sombre</option>
                <option value="auto">Automatique (système)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Accessibilité</label>
              <div className="checkbox-group">
                <input type="checkbox" id="high-contrast" />
                <label htmlFor="high-contrast">Mode haut contraste</label>
              </div>
            </div>
            <button className="btn btn-primary">Appliquer les changements</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="parametres-page">
      <div className="page-header">
        <h1>Paramètres</h1>
        <p>Personnalisation et gestion de votre espace BioScan</p>
      </div>

      <div className="parametres-layout">
        {/* Menu latéral – liste des choix */}
        <div className="sections-list">
          {sections.map(section => (
            <button
              key={section.id}
              className={`section-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="section-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}