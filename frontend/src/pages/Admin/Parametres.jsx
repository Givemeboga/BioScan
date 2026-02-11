import React, { useState } from 'react';
import './Parametres.css';

const roles = [
  { id: 1, nom: 'ADMIN', utilisateurs: 3, permissions: ['*'] },
  { id: 2, nom: 'MEDECIN', utilisateurs: 12, permissions: ['read_bilans', 'write_rapports', 'validate_results'] },
  { id: 3, nom: 'TECHNICIEN', utilisateurs: 8, permissions: ['read_bilans', 'upload_files', 'trigger_ai'] },
  { id: 4, nom: 'PATIENT', utilisateurs: 142, permissions: ['read_own_data'] },
];

const allPermissions = [
  { id: 'read_bilans', label: 'Lire les bilans' },
  { id: 'write_rapports', label: 'Écrire des rapports' },
  { id: 'validate_results', label: 'Valider les résultats' },
  { id: 'upload_files', label: 'Uploader des fichiers' },
  { id: 'trigger_ai', label: 'Déclencher IA' },
  { id: 'manage_users', label: 'Gérer les utilisateurs' },
  { id: 'read_own_data', label: 'Lire ses propres données' },
  { id: 'delete_data', label: 'Supprimer des données' },
];

export default function AdminParametres() {
  const [activeTab, setActiveTab] = useState('security');
  
  // Security settings
  const [otpExpiration, setOtpExpiration] = useState('5');
  const [passwordMinLength, setPasswordMinLength] = useState('12');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [failedLoginLimit, setFailedLoginLimit] = useState('5');
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecialChars, setRequireSpecialChars] = useState(true);

  // AI settings
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiVersion, setAiVersion] = useState('v2.1.4');
  const [analysisTypes, setAnalysisTypes] = useState({
    hemogramme: true,
    biochimie: true,
    microbiologie: true,
    immunologie: false,
  });

  // Notification settings
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState({
    criticalResults: true,
    systemErrors: true,
    securityEvents: true,
    backupStatus: false,
  });

  const renderSecurityTab = () => (
    <div className="tab-content">
      <div className="settings-section">
        <h3>Authentification</h3>
        <div className="setting-row">
          <div className="setting-info">
            <label>Durée d'expiration OTP</label>
            <p>Temps avant expiration du code OTP (en minutes)</p>
          </div>
          <input
            type="number"
            value={otpExpiration}
            onChange={(e) => setOtpExpiration(e.target.value)}
            className="input-short"
          />
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Limite de tentatives échouées</label>
            <p>Nombre de tentatives avant blocage du compte</p>
          </div>
          <input
            type="number"
            value={failedLoginLimit}
            onChange={(e) => setFailedLoginLimit(e.target.value)}
            className="input-short"
          />
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Timeout de session</label>
            <p>Durée d'inactivité avant déconnexion (minutes)</p>
          </div>
          <input
            type="number"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            className="input-short"
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Politique de mot de passe</h3>
        <div className="setting-row">
          <div className="setting-info">
            <label>Longueur minimale</label>
            <p>Nombre minimum de caractères</p>
          </div>
          <input
            type="number"
            value={passwordMinLength}
            onChange={(e) => setPasswordMinLength(e.target.value)}
            className="input-short"
          />
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Majuscules requises</label>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={requireUppercase}
              onChange={(e) => setRequireUppercase(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Chiffres requis</label>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={requireNumbers}
              onChange={(e) => setRequireNumbers(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Caractères spéciaux requis</label>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={requireSpecialChars}
              onChange={(e) => setRequireSpecialChars(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <button className="btn-save">Enregistrer les modifications</button>
    </div>
  );

  const renderRolesTab = () => (
    <div className="tab-content">
      <div className="roles-header">
        <h3>Rôles & Permissions</h3>
        <button className="btn-primary small">Créer nouveau rôle</button>
      </div>

      <div className="roles-grid">
        {roles.map((role) => (
          <div key={role.id} className="role-card">
            <div className="role-header">
              <h4>{role.nom}</h4>
              <span className="user-count">{role.utilisateurs} utilisateurs</span>
            </div>
            <div className="role-permissions">
              <strong>Permissions:</strong>
              {role.permissions.includes('*') ? (
                <span className="perm-badge all">Toutes</span>
              ) : (
                <div className="perm-list">
                  {role.permissions.map((perm) => (
                    <span key={perm} className="perm-badge">
                      {allPermissions.find((p) => p.id === perm)?.label || perm}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="role-actions">
              <button className="btn-action">Modifier</button>
              <button className="btn-action outline">Assigner permissions</button>
            </div>
          </div>
        ))}
      </div>

      <div className="permissions-section">
        <h3>Permissions disponibles</h3>
        <div className="permissions-grid">
          {allPermissions.map((perm) => (
            <div key={perm.id} className="permission-item">
              <span className="perm-icon">🔑</span>
              <span className="perm-label">{perm.label}</span>
              <span className="perm-id">{perm.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAiTab = () => (
    <div className="tab-content">
      <div className="settings-section">
        <h3>Configuration de l'analyseur IA</h3>
        
        <div className="setting-row">
          <div className="setting-info">
            <label>Activer l'analyseur IA</label>
            <p>Active ou désactive l'analyse automatique par IA</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Version de l'analyseur</label>
            <p>Version actuellement déployée</p>
          </div>
          <select
            value={aiVersion}
            onChange={(e) => setAiVersion(e.target.value)}
            className="input-medium"
          >
            <option value="v2.1.4">v2.1.4 (stable)</option>
            <option value="v2.2.0-beta">v2.2.0-beta (test)</option>
            <option value="v2.0.8">v2.0.8 (legacy)</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>Types d'analyses activés</h3>
        
        <div className="setting-row">
          <div className="setting-info">
            <label>Hémogramme</label>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={analysisTypes.hemogramme}
              onChange={(e) =>
                setAnalysisTypes({ ...analysisTypes, hemogramme: e.target.checked })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Biochimie</label>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={analysisTypes.biochimie}
              onChange={(e) =>
                setAnalysisTypes({ ...analysisTypes, biochimie: e.target.checked })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Microbiologie</label>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={analysisTypes.microbiologie}
              onChange={(e) =>
                setAnalysisTypes({ ...analysisTypes, microbiologie: e.target.checked })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Immunologie</label>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={analysisTypes.immunologie}
              onChange={(e) =>
                setAnalysisTypes({ ...analysisTypes, immunologie: e.target.checked })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <button className="btn-save">Enregistrer les modifications</button>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="tab-content">
      <div className="settings-section">
        <h3>Canaux de notification</h3>
        
        <div className="setting-row">
          <div className="setting-info">
            <label>Activer SMS</label>
            <p>Envoi des notifications critiques par SMS</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={smsEnabled}
              onChange={(e) => setSmsEnabled(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Activer Email</label>
            <p>Envoi des notifications par email</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Préférences d'alertes système</h3>
        
        <div className="setting-row">
          <div className="setting-info">
            <label>Résultats critiques</label>
            <p>Alerte pour valeurs hors normes critiques</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={systemAlerts.criticalResults}
              onChange={(e) =>
                setSystemAlerts({ ...systemAlerts, criticalResults: e.target.checked })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Erreurs système</label>
            <p>Alerte en cas d'erreur système</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={systemAlerts.systemErrors}
              onChange={(e) =>
                setSystemAlerts({ ...systemAlerts, systemErrors: e.target.checked })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Événements de sécurité</label>
            <p>Alerte pour tentatives de connexion suspectes</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={systemAlerts.securityEvents}
              onChange={(e) =>
                setSystemAlerts({ ...systemAlerts, securityEvents: e.target.checked })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <label>Statut de sauvegarde</label>
            <p>Notification après chaque sauvegarde</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={systemAlerts.backupStatus}
              onChange={(e) =>
                setSystemAlerts({ ...systemAlerts, backupStatus: e.target.checked })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <button className="btn-save">Enregistrer les modifications</button>
    </div>
  );

  return (
    <div className="admin-parametres-page">
      <header className="parametres-header">
        <div>
          <h1>Centre de contrôle système</h1>
          <p>Configuration avancée et gestion des paramètres globaux.</p>
        </div>
      </header>

      <div className="tabs-navigation">
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔐 Sécurité
        </button>
        <button
          className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          👤 Rôles & Permissions
        </button>
        <button
          className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          🤖 Analyseur IA
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          📢 Notifications
        </button>
      </div>

      <div className="tab-container">
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'roles' && renderRolesTab()}
        {activeTab === 'ai' && renderAiTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
      </div>
    </div>
  );
}
