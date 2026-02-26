// src/pages/MedecinBiologiste/ProfilMedecin.jsx
import React, { useState, useRef, useEffect } from 'react';
import './ProfilMedecin.css';

const API = 'http://127.0.0.1:8000';

// ── Construit l'URL complète de la photo ──────────────────────
const buildPhotoUrl = (photoUrl) => {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http')) return photoUrl;
  const path = photoUrl.startsWith('/') ? photoUrl : `/media/avatars/${photoUrl}`;
  return `${API}${path}`;
};

// ── Token ─────────────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  sessionStorage.getItem('token') ||
  null;

function DefaultAvatar() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="pm-default-svg">
      <circle cx="50" cy="50" r="50" fill="#dbeafe"/>
      <circle cx="50" cy="36" r="16" fill="#93c5fd"/>
      <path d="M15 85c0-19.33 15.67-35 35-35s35 15.67 35 35" fill="#93c5fd"/>
    </svg>
  );
}

export default function ProfilMedecin() {
  const [previewUrl,      setPreviewUrl]      = useState(null);
  const [avatarUrl,       setAvatarUrl]       = useState(null);
  const [saving,          setSaving]          = useState(false);
  const [uploadingPhoto,  setUploadingPhoto]  = useState(false);
  const [toast,           setToast]           = useState(null);
  const [passwordError,   setPasswordError]   = useState('');
  const [fetchError,      setFetchError]      = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    prenom:           '',
    nom:              '',
    specialite:       '',
    telephone:        '',
    email:            '',
    current_password: '',
    new_password:     '',
    confirm_password: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── GET profil au montage ────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setFetchError('Vous devez être connecté.');
      return;
    }

    fetch(`${API}/api/profil/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json();
      })
      .then(data => {
        const parts = (data.nom_utilisateur || '').trim().split(' ');
        setFormData(prev => ({
          ...prev,
          prenom:    parts[0] || '',
          nom:       parts.slice(1).join(' ') || '',
          specialite: data.statut    || '',
          telephone:  data.telephone || '',
          email:      data.email     || '',
        }));
        // ✅ Utilise buildPhotoUrl pour reconstruire l'URL correcte
        setAvatarUrl(buildPhotoUrl(data.photo_url));
      })
      .catch(err => {
        console.error('[ProfilMedecin] Erreur chargement :', err);
        setFetchError('Impossible de charger le profil.');
        showToast('Impossible de charger le profil.', 'error');
      });
  }, []);

  // ── Handlers formulaire ──────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (['new_password', 'confirm_password'].includes(name)) setPasswordError('');
  };

  // ── Upload photo → POST /api/profil/me/photo ─────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Image invalide (JPG, PNG, WEBP…)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('La photo ne doit pas dépasser 5 Mo.', 'error');
      return;
    }

    // Aperçu local immédiat
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploadingPhoto(true);

    const form = new FormData();
    form.append('file', file, file.name);

    try {
      const token = getToken();
      const res = await fetch(`${API}/api/profil/me/photo`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    form,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || 'Erreur upload photo');
      }

      const data = await res.json();
      // ✅ Reconstruit l'URL depuis la réponse backend
      const newUrl = buildPhotoUrl(data.photo_url);
      setAvatarUrl(newUrl);
      // Libère le blob local car on a maintenant l'URL serveur
      URL.revokeObjectURL(localUrl);
      setPreviewUrl(null);
      showToast('Photo mise à jour !');
    } catch (err) {
      console.error('[ProfilMedecin] Erreur upload :', err);
      showToast(err.message, 'error');
      // Annule l'aperçu en cas d'erreur
      URL.revokeObjectURL(localUrl);
      setPreviewUrl(null);
    } finally {
      setUploadingPhoto(false);
      // Reset input pour permettre de re-sélectionner le même fichier
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Soumission formulaire → PUT /api/profil/me ───────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (formData.new_password || formData.confirm_password) {
      if (formData.new_password !== formData.confirm_password) {
        setPasswordError('Les mots de passe ne correspondent pas.');
        return;
      }
      if (formData.new_password.length < 8) {
        setPasswordError('Minimum 8 caractères requis.');
        return;
      }
    }

    setSaving(true);

    const payload = {
      nom_utilisateur: `${formData.prenom} ${formData.nom}`.trim(),
      email:     formData.email     || null,
      telephone: formData.telephone || null,
      statut:    formData.specialite || null,
      ...(formData.new_password ? { mot_de_passe: formData.new_password } : {}),
    };

    try {
      const token = getToken();
      const res = await fetch(`${API}/api/profil/me`, {
        method:  'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Erreur ${res.status}`);
      }

      const data = await res.json();
      // Mise à jour de l'affichage avec les données fraîches du serveur
      const parts = (data.nom_utilisateur || '').trim().split(' ');
      setFormData(prev => ({
        ...prev,
        prenom:           parts[0] || '',
        nom:              parts.slice(1).join(' ') || '',
        specialite:       data.statut    || '',
        telephone:        data.telephone || '',
        email:            data.email     || '',
        current_password: '',
        new_password:     '',
        confirm_password: '',
      }));
      if (data.photo_url) setAvatarUrl(buildPhotoUrl(data.photo_url));
      showToast('Profil mis à jour avec succès !');

    } catch (err) {
      console.error('[ProfilMedecin] Erreur PUT :', err);
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Avatar affiché : prévisualisation > URL serveur > défaut
  const displaySrc = previewUrl || avatarUrl;

  return (
    <div className="pm-page">

      {/* ── Toast ── */}
      {toast && (
        <div className={`pm-toast pm-toast--${toast.type}`}>
          {toast.type === 'success'
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* ── Erreur chargement ── */}
      {fetchError && (
        <div className="pm-fetch-error">{fetchError}</div>
      )}

      <div className="pm-card">

        {/* ════ COLONNE GAUCHE ════ */}
        <div className="pm-left">
          <div className="pm-left-top" />

          <div className="pm-avatar-section">
            <div
              className="pm-avatar-wrap"
              onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
              title="Changer la photo"
            >
              {displaySrc
                ? <img
                    src={displaySrc}
                    alt="avatar"
                    className="pm-avatar-img"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                : <DefaultAvatar />
              }
              <div className="pm-avatar-overlay">
                {uploadingPhoto
                  ? <span className="pm-spinner-sm" />
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                }
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <p className="pm-left-name">
              Dr. {formData.prenom} {formData.nom}
            </p>
            <p className="pm-left-role">
              {formData.specialite || 'Médecin Biologiste'}
            </p>

            <button
              type="button"
              className="pm-photo-btn"
              onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              {uploadingPhoto ? 'Upload…' : 'Changer la photo'}
            </button>
          </div>

          {/* Infos rapides */}
          <div className="pm-left-info">
            {formData.email && (
              <div className="pm-info-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{formData.email}</span>
              </div>
            )}
            {formData.telephone && (
              <div className="pm-info-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.17 6.17l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                <span>{formData.telephone}</span>
              </div>
            )}
          </div>
        </div>

        {/* ════ COLONNE DROITE ════ */}
        <div className="pm-right">
          <h2 className="pm-title">Mon Profil</h2>
          <p className="pm-subtitle">Gérez vos informations personnelles et votre sécurité</p>

          <form onSubmit={handleSubmit}>

            {/* ── Informations personnelles ── */}
            <div className="pm-section-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Informations personnelles
            </div>

            <div className="pm-row">
              <div className="pm-field">
                <label>PRÉNOM</label>
                <input type="text" name="prenom"
                  value={formData.prenom} onChange={handleChange}
                  placeholder="Prénom" />
              </div>
              <div className="pm-field">
                <label>NOM</label>
                <input type="text" name="nom"
                  value={formData.nom} onChange={handleChange}
                  placeholder="Nom" />
              </div>
            </div>

            <div className="pm-row">
              <div className="pm-field">
                <label>SPÉCIALITÉ</label>
                <input type="text" name="specialite"
                  value={formData.specialite} onChange={handleChange}
                  placeholder="Ex : Médecin Biologiste" />
              </div>
              <div className="pm-field">
                <label>TÉLÉPHONE</label>
                <input type="tel" name="telephone"
                  value={formData.telephone} onChange={handleChange}
                  placeholder="+216 XX XXX XXX" />
              </div>
            </div>

            <div className="pm-row pm-row--full">
              <div className="pm-field">
                <label>ADRESSE EMAIL</label>
                <input type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="votre@email.com" required />
              </div>
            </div>

            {/* ── Sécurité ── */}
            <div className="pm-section-label pm-section-label--mt">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Sécurité
            </div>
            <p className="pm-hint">Laissez vide si vous ne souhaitez pas modifier le mot de passe.</p>

            <div className="pm-row">
              <div className="pm-field">
                <label>MOT DE PASSE ACTUEL</label>
                <input type="password" name="current_password"
                  value={formData.current_password} onChange={handleChange}
                  placeholder="••••••••" autoComplete="current-password" />
              </div>
              <div className="pm-field">
                <label>NOUVEAU MOT DE PASSE</label>
                <input type="password" name="new_password"
                  value={formData.new_password} onChange={handleChange}
                  placeholder="Min. 8 caractères" autoComplete="new-password" />
              </div>
            </div>

            <div className="pm-row pm-row--full">
              <div className="pm-field">
                <label>CONFIRMER LE MOT DE PASSE</label>
                <input type="password" name="confirm_password"
                  value={formData.confirm_password} onChange={handleChange}
                  placeholder="••••••••" autoComplete="new-password" />
              </div>
            </div>

            {passwordError && (
              <div className="pm-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {passwordError}
              </div>
            )}

            <div className="pm-actions">
              <button
                type="button"
                className="pm-btn-cancel"
                onClick={() => window.history.back()}
              >
                Annuler
              </button>
              <button type="submit" className="pm-btn-save" disabled={saving}>
                {saving && <span className="pm-spinner-sm" />}
                {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}