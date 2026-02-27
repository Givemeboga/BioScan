// src/pages/patient/Profil.jsx
import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, AlertCircle } from 'lucide-react';
import './Profil.css';

const API_BASE       = 'http://127.0.0.1:8000';
const FALLBACK_PHOTO = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback';

// ── Construit l'URL complète de la photo ──────────────────────
const buildPhotoUrl = (photoUrl) => {
  if (!photoUrl) return FALLBACK_PHOTO;
  if (photoUrl.startsWith('http')) return photoUrl;
  // "/media/photos/abc.jpg"  ou  "abc.jpg"
  const path = photoUrl.startsWith('/') ? photoUrl : `/media/photos/${photoUrl}`;
  return `${API_BASE}${path}`;
};

// ── Récupère le token JWT ─────────────────────────────────────
const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  localStorage.getItem('jwt') ||
  sessionStorage.getItem('token') ||
  sessionStorage.getItem('access_token') ||
  null;

export default function Profil() {
  const [isEditing,       setIsEditing]       = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [fetching,        setFetching]        = useState(true);
  const [error,           setError]           = useState(null);
  const [success,         setSuccess]         = useState(null);
  const [patientId,       setPatientId]       = useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(FALLBACK_PHOTO);
  const [profilePhoto,    setProfilePhoto]    = useState(null);
  const [previewUrl,      setPreviewUrl]      = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    email:           '',
    telephone:       '',
    adresse:         '',
    date_naissance:  '',
  });

  // ── Chargement du profil ──────────────────────────────────
  useEffect(() => {
    const fetchProfil = async () => {
      setFetching(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError('Vous devez être connecté pour voir votre profil.');
        setFetching(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/patient/profil/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (res.status === 401) throw new Error('Session expirée. Veuillez vous reconnecter.');
          if (res.status === 404) throw new Error(body.detail || 'Profil introuvable.');
          throw new Error(body.detail || `Erreur ${res.status}`);
        }

        const data = await res.json();

        setPatientId(data.patient_id);
        setFormData({
          nom_utilisateur: data.nom_utilisateur || '',
          email:           data.email           || '',
          telephone:       data.telephone       || '',
          adresse:         data.adresse         || '',
          date_naissance:  data.date_naissance  || '',
        });
        setCurrentPhotoUrl(buildPhotoUrl(data.photo_url));

      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchProfil();
  }, []);

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La photo ne doit pas dépasser 5 Mo.');
      return;
    }
    setProfilePhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    setProfilePhoto(null);
    setError(null);
    setSuccess(null);
  };

  // ── Soumission ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) { setError('ID patient introuvable.'); return; }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = getToken();

    try {
      const body = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value && value.trim() !== '') body.append(key, value.trim());
      });

      // ✅ Photo ajoutée avec son vrai nom
      if (profilePhoto) {
        body.append('photo', profilePhoto, profilePhoto.name);
      }

      const res = await fetch(`${API_BASE}/api/patient/profil/${patientId}`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}` },
        // ⚠️ PAS de Content-Type manuel avec FormData
        body,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Erreur ${res.status}`);
      }

      const result = await res.json();

      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
      setCurrentPhotoUrl(buildPhotoUrl(result.photo_url));
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
      setProfilePhoto(null);
      setFormData({
        nom_utilisateur: result.nom_utilisateur || '',
        email:           result.email           || '',
        telephone:       result.telephone       || '',
        adresse:         result.adresse         || '',
        date_naissance:  result.date_naissance  || '',
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────
  if (fetching) return (
    <div className="profil">
      <div className="profil-loading">Chargement du profil...</div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="profil">

      <div className="profil-welcome-card">
        <div className="profil-welcome-header">
          <h2 className="profil-welcome-title">Mon Profil</h2>
          <span className="profil-welcome-emoji">👤</span>
        </div>
        <p className="profil-welcome-subtitle">Gérez vos informations personnelles</p>
      </div>

      {error   && <div className="profil-message error"><AlertCircle size={18} /> {error}</div>}
      {success && <div className="profil-message success">{success}</div>}

      <div className="profil-container">

        {/* ── Photo ── */}
        <div className="profil-card profil-photo-card">
          <div className="profil-photo-section">
            <div className="profil-photo-container">
              <img
                src={previewUrl || currentPhotoUrl}
                alt="Profil"
                className="profil-photo"
                onError={(e) => { e.target.src = FALLBACK_PHOTO; }}
              />
              <button
                className="profil-photo-button"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Changer la photo"
              >
                <Camera size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
            </div>

            <div className="profil-photo-info">
              <h3 className="profil-user-name">{formData.nom_utilisateur || '—'}</h3>
              <p className="profil-user-role">Patient</p>
              {patientId && <p className="profil-user-id">ID : P-{patientId}</p>}
              {previewUrl && (
                <p className="profil-photo-hint">
                  📸 Nouvelle photo — cliquez sur Enregistrer pour sauvegarder
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Formulaire ── */}
        <div className="profil-card">
          <div className="profil-card-header">
            <h3 className="profil-section-title">
              <User size={20} color="#3b82f6" /> Informations personnelles
            </h3>
            {!isEditing && (
              <button
                className="profil-btn-edit"
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                Modifier
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="profil-form-grid">

              <div className="profil-form-group full-width">
                <label className="profil-label">
                  <User size={16} className="profil-label-icon" /> Nom complet
                </label>
                <input type="text" name="nom_utilisateur"
                  value={formData.nom_utilisateur} onChange={handleChange}
                  disabled={!isEditing || loading} className="profil-input" />
              </div>

              <div className="profil-form-group">
                <label className="profil-label">
                  <Mail size={16} className="profil-label-icon" /> Email
                </label>
                <input type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  disabled={!isEditing || loading} className="profil-input" />
              </div>

              <div className="profil-form-group">
                <label className="profil-label">
                  <Phone size={16} className="profil-label-icon" /> Téléphone
                </label>
                <input type="tel" name="telephone"
                  value={formData.telephone} onChange={handleChange}
                  disabled={!isEditing || loading} className="profil-input" />
              </div>

              <div className="profil-form-group full-width">
                <label className="profil-label">
                  <MapPin size={16} className="profil-label-icon" /> Adresse
                </label>
                <input type="text" name="adresse"
                  value={formData.adresse} onChange={handleChange}
                  disabled={!isEditing || loading} className="profil-input" />
              </div>

              <div className="profil-form-group">
                <label className="profil-label">
                  <Calendar size={16} className="profil-label-icon" /> Date de naissance
                </label>
                <input type="date" name="date_naissance"
                  value={formData.date_naissance} onChange={handleChange}
                  disabled={!isEditing || loading} className="profil-input" />
              </div>

            </div>

            {isEditing && (
              <div className="profil-actions">
                <button type="button" className="profil-btn-cancel"
                  onClick={handleCancel} disabled={loading}>
                  Annuler
                </button>
                <button type="submit" className="profil-btn-primary" disabled={loading}>
                  {loading ? 'Enregistrement...' : <><Save size={18} /> Enregistrer</>}
                </button>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}