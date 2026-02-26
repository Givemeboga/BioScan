// src/pages/patient/Parametres.jsx
import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin,
  Lock, Bell, Shield, Save,
  Eye, EyeOff, CheckCircle, AlertCircle,
} from 'lucide-react';
import './Parametres.css';

const API_BASE = 'http://127.0.0.1:8000';

// ── Helpers auth ──────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  sessionStorage.getItem('token') ||
  sessionStorage.getItem('access_token') ||
  null;

const getHeaders = (json = true) => {
  const h = { Authorization: `Bearer ${getToken()}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

export default function Parametres() {
  // ── State ─────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    email:           '',
    telephone:       '',
    adresse:         '',
    notifications:   true,
    newsletter:      false,
  });

  const [passwords, setPasswords] = useState({
    ancien_mot_de_passe:    '',
    nouveau_mot_de_passe:   '',
    confirmer_mot_de_passe: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    ancien:    false,
    nouveau:   false,
    confirmer: false,
  });

  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [savingPwd,    setSavingPwd]    = useState(false);
  const [error,        setError]        = useState(null);
  const [success,      setSuccess]      = useState(null);
  const [errorPwd,     setErrorPwd]     = useState(null);
  const [successPwd,   setSuccessPwd]   = useState(null);
  const [showPwdForm,  setShowPwdForm]  = useState(false);

  // ── Chargement initial ────────────────────────────────────
  useEffect(() => {
    const fetchParametres = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/patient/parametres/me`, {
          headers: getHeaders(),
        });
        if (res.status === 401) throw new Error('Session expirée. Veuillez vous reconnecter.');
        if (res.status === 404) throw new Error('Profil introuvable.');
        if (!res.ok) throw new Error('Impossible de charger les paramètres.');

        const data = await res.json();
        setFormData({
          nom_utilisateur: data.nom_utilisateur || '',
          email:           data.email           || '',
          telephone:       data.telephone       || '',
          adresse:         data.adresse         || '',
          notifications:   data.notifications   ?? true,
          newsletter:      data.newsletter      ?? false,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchParametres();
  }, []);

  // ── Handlers infos perso ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/api/patient/parametres/me`, {
        method:  'PUT',
        headers: getHeaders(),
        body:    JSON.stringify({
          nom_utilisateur: formData.nom_utilisateur || null,
          email:           formData.email           || null,
          telephone:       formData.telephone       || null,
          adresse:         formData.adresse         || null,
          notifications:   formData.notifications,
          newsletter:      formData.newsletter,
        }),
      });

      if (res.status === 401) throw new Error('Session expirée. Veuillez vous reconnecter.');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || 'Erreur lors de la sauvegarde.');
      }

      const updated = await res.json();
      setFormData({
        nom_utilisateur: updated.nom_utilisateur || '',
        email:           updated.email           || '',
        telephone:       updated.telephone       || '',
        adresse:         updated.adresse         || '',
        notifications:   updated.notifications   ?? true,
        newsletter:      updated.newsletter      ?? false,
      });
      setSuccess('Paramètres enregistrés avec succès !');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Handlers mot de passe ─────────────────────────────────
  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorPwd(null);
    setSuccessPwd(null);

    if (passwords.nouveau_mot_de_passe !== passwords.confirmer_mot_de_passe) {
      setErrorPwd('Les mots de passe ne correspondent pas.');
      return;
    }
    if (passwords.nouveau_mot_de_passe.length < 6) {
      setErrorPwd('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setSavingPwd(true);
    try {
      const res = await fetch(`${API_BASE}/api/patient/parametres/password`, {
        method:  'PUT',
        headers: getHeaders(),
        body:    JSON.stringify({
          ancien_mot_de_passe:  passwords.ancien_mot_de_passe,
          nouveau_mot_de_passe: passwords.nouveau_mot_de_passe,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || 'Erreur lors du changement de mot de passe.');
      }

      setSuccessPwd('Mot de passe modifié avec succès !');
      setPasswords({
        ancien_mot_de_passe:    '',
        nouveau_mot_de_passe:   '',
        confirmer_mot_de_passe: '',
      });
      setShowPwdForm(false);
    } catch (err) {
      setErrorPwd(err.message);
    } finally {
      setSavingPwd(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="parametres">
      <div className="parametres-loading">Chargement des paramètres...</div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="parametres">

      {/* Header card */}
      <div className="parametres-welcome-card">
        <div className="parametres-welcome-header">
          <h2 className="parametres-welcome-title">Paramètres</h2>
          <span className="parametres-welcome-emoji">⚙️</span>
        </div>
        <p className="parametres-welcome-subtitle">
          Gérez vos informations personnelles et préférences.
        </p>
      </div>

      {/* Messages globaux */}
      {error   && (
        <div className="parametres-message error">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="parametres-message success">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ── Informations personnelles ── */}
        <div className="parametres-card">
          <h3 className="parametres-section-title">
            <User size={20} color="#3b82f6" />
            Informations personnelles
          </h3>

          <div className="parametres-form-grid">

            <div className="parametres-form-group full-width">
              <label className="parametres-label">
                <User size={16} className="parametres-label-icon" />
                Nom complet
              </label>
              <input
                type="text"
                name="nom_utilisateur"
                value={formData.nom_utilisateur}
                onChange={handleChange}
                className="parametres-input"
                placeholder="Votre nom complet"
              />
            </div>

            <div className="parametres-form-group">
              <label className="parametres-label">
                <Mail size={16} className="parametres-label-icon" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="parametres-input"
                placeholder="votre@email.com"
              />
            </div>

            <div className="parametres-form-group">
              <label className="parametres-label">
                <Phone size={16} className="parametres-label-icon" />
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="parametres-input"
                placeholder="+216 XX XXX XXX"
              />
            </div>

            <div className="parametres-form-group full-width">
              <label className="parametres-label">
                <MapPin size={16} className="parametres-label-icon" />
                Adresse
              </label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className="parametres-input"
                placeholder="Votre adresse"
              />
            </div>

          </div>
        </div>

        {/* ── Notifications ── */}
        <div className="parametres-card">
          <h3 className="parametres-section-title">
            <Bell size={20} color="#3b82f6" />
            Notifications
          </h3>

          <div className="parametres-checkboxes">
            <label className="parametres-checkbox-label">
              <input
                type="checkbox"
                name="notifications"
                checked={formData.notifications}
                onChange={handleChange}
                className="parametres-checkbox"
              />
              <span>Recevoir des notifications pour les nouveaux résultats</span>
            </label>

            <label className="parametres-checkbox-label">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="parametres-checkbox"
              />
              <span>S'abonner à la newsletter médicale</span>
            </label>
          </div>
        </div>

        {/* ── Bouton Enregistrer ── */}
        <div className="parametres-card">
          <button type="submit" className="parametres-btn-primary" disabled={saving}>
            <Save size={18} />
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>

      </form>

      {/* ── Sécurité / Mot de passe (form séparé) ── */}
      <div className="parametres-card">
        <h3 className="parametres-section-title">
          <Shield size={20} color="#3b82f6" />
          Sécurité
        </h3>

        {successPwd && (
          <div className="parametres-message success">
            <CheckCircle size={16} /> {successPwd}
          </div>
        )}
        {errorPwd && (
          <div className="parametres-message error">
            <AlertCircle size={16} /> {errorPwd}
          </div>
        )}

        {!showPwdForm ? (
          <div className="parametres-security-section">
            <label className="parametres-label">
              <Lock size={16} className="parametres-label-icon" />
              Mot de passe
            </label>
            <button
              type="button"
              className="parametres-btn-secondary"
              onClick={() => { setShowPwdForm(true); setErrorPwd(null); setSuccessPwd(null); }}
            >
              Modifier le mot de passe
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="parametres-form-grid">

              {/* Ancien mot de passe */}
              <div className="parametres-form-group full-width">
                <label className="parametres-label">
                  <Lock size={16} className="parametres-label-icon" />
                  Ancien mot de passe
                </label>
                <div className="parametres-input-wrap">
                  <input
                    type={showPasswords.ancien ? 'text' : 'password'}
                    name="ancien_mot_de_passe"
                    value={passwords.ancien_mot_de_passe}
                    onChange={handlePwdChange}
                    className="parametres-input"
                    required
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="parametres-eye-btn"
                    onClick={() => setShowPasswords(p => ({ ...p, ancien: !p.ancien }))}
                  >
                    {showPasswords.ancien ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div className="parametres-form-group">
                <label className="parametres-label">
                  <Lock size={16} className="parametres-label-icon" />
                  Nouveau mot de passe
                </label>
                <div className="parametres-input-wrap">
                  <input
                    type={showPasswords.nouveau ? 'text' : 'password'}
                    name="nouveau_mot_de_passe"
                    value={passwords.nouveau_mot_de_passe}
                    onChange={handlePwdChange}
                    className="parametres-input"
                    required
                    minLength={6}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="parametres-eye-btn"
                    onClick={() => setShowPasswords(p => ({ ...p, nouveau: !p.nouveau }))}
                  >
                    {showPasswords.nouveau ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirmer mot de passe */}
              <div className="parametres-form-group">
                <label className="parametres-label">
                  <Lock size={16} className="parametres-label-icon" />
                  Confirmer le mot de passe
                </label>
                <div className="parametres-input-wrap">
                  <input
                    type={showPasswords.confirmer ? 'text' : 'password'}
                    name="confirmer_mot_de_passe"
                    value={passwords.confirmer_mot_de_passe}
                    onChange={handlePwdChange}
                    className="parametres-input"
                    required
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="parametres-eye-btn"
                    onClick={() => setShowPasswords(p => ({ ...p, confirmer: !p.confirmer }))}
                  >
                    {showPasswords.confirmer ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

            </div>

            <div className="parametres-actions">
              <button
                type="button"
                className="parametres-btn-cancel"
                onClick={() => {
                  setShowPwdForm(false);
                  setErrorPwd(null);
                  setPasswords({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmer_mot_de_passe: '' });
                }}
              >
                Annuler
              </button>
              <button type="submit" className="parametres-btn-primary" disabled={savingPwd}>
                <Save size={16} />
                {savingPwd ? 'Enregistrement...' : 'Confirmer le changement'}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}