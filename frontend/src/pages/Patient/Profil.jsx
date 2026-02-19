// src/pages/patient/Profil.jsx
import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save } from 'lucide-react';
import './Profil.css';

const API_BASE   = 'http://127.0.0.1:8000';
const PATIENT_ID = 1;
const FALLBACK_PHOTO = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback';

// ✅ Construit l'URL complète de la photo
const buildPhotoUrl = (photoUrl) => {
  if (!photoUrl) return FALLBACK_PHOTO;
  if (photoUrl.startsWith('http')) return photoUrl;   // déjà absolue
  return `${API_BASE}${photoUrl}`;                    // relative → absolue
};

export default function Profil() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(null);

  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    email:           '',
    telephone:       '',
    adresse:         '',
    date_naissance:  '',
  });

  const [profilePhoto,    setProfilePhoto]    = useState(null);
  const [previewUrl,      setPreviewUrl]      = useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(FALLBACK_PHOTO);
  const fileInputRef = useRef(null);

  // ── GET au montage ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfil = async () => {
      setFetching(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/patient/profil/${PATIENT_ID}`);
        if (!res.ok) throw new Error('Impossible de charger le profil');
        const data = await res.json();
        setFormData({
          nom_utilisateur: data.nom_utilisateur || '',
          email:           data.email           || '',
          telephone:       data.telephone       || '',
          adresse:         data.adresse         || '',
          date_naissance:  data.date_naissance  || '',
        });
        // ✅ photo_url vient maintenant du backend
        setCurrentPhotoUrl(buildPhotoUrl(data.photo_url));
      } catch (err) {
        setError(err.message || 'Erreur de chargement');
      } finally {
        setFetching(false);
      }
    };
    fetchProfil();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Veuillez sélectionner une image'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('La photo ne doit pas dépasser 5 Mo'); return; }
    setProfilePhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    setProfilePhoto(null);
    setError(null);
  };

  // ── PUT sauvegarde ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') body.append(key, value);
      });
      if (profilePhoto) body.append('photo', profilePhoto);

      const res = await fetch(`${API_BASE}/api/patient/profil/${PATIENT_ID}`, {
        method: 'PUT',
        body,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Erreur lors de la sauvegarde');
      }
      const result = await res.json();
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
      // ✅ Met à jour la photo affichée avec la nouvelle URL
      setCurrentPhotoUrl(buildPhotoUrl(result.photo_url));
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
      setProfilePhoto(null);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="profil"><div className="profil-loading">Chargement du profil...</div></div>;
  }

  return (
    <div className="profil">
      <div className="profil-welcome-card">
        <div className="profil-welcome-header">
          <h2 className="profil-welcome-title">Mon Profil</h2>
          <span className="profil-welcome-emoji">👤</span>
        </div>
        <p className="profil-welcome-subtitle">
          Gérez vos informations personnelles et votre photo de profil.
        </p>
      </div>

      {error   && <div className="profil-message error">{error}</div>}
      {success && <div className="profil-message success">{success}</div>}

      <div className="profil-container">

        {/* ── Photo ── */}
        <div className="profil-card profil-photo-card">
          <div className="profil-photo-section">
            <div className="profil-photo-container">
              <img
                src={previewUrl || currentPhotoUrl}
                alt="Photo de profil"
                className="profil-photo"
                onError={(e) => { e.target.src = FALLBACK_PHOTO; }}
              />
              <button
                className="profil-photo-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                type="button"
              >
                <Camera size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
            </div>
            <div className="profil-photo-info">
              <h3 className="profil-user-name">{formData.nom_utilisateur || '—'}</h3>
              <p className="profil-user-role">Patient</p>
              <p className="profil-user-id">ID: P-{PATIENT_ID}</p>
            </div>
          </div>
        </div>

        {/* ── Formulaire ── */}
        <div className="profil-card">
          <div className="profil-card-header">
            <h3 className="profil-section-title">
              <User size={20} color="#3b82f6" />
              Informations personnelles
            </h3>
            {!isEditing && (
              <button className="profil-btn-edit" onClick={() => setIsEditing(true)} disabled={loading} type="button">
                Modifier
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="profil-form-grid">

              <div className="profil-form-group full-width">
                <label className="profil-label"><User size={16} className="profil-label-icon" /> Nom complet</label>
                <input type="text" name="nom_utilisateur" value={formData.nom_utilisateur}
                  onChange={handleChange} disabled={!isEditing || loading} className="profil-input" />
              </div>

              <div className="profil-form-group">
                <label className="profil-label"><Mail size={16} className="profil-label-icon" /> Email</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} disabled={!isEditing || loading} className="profil-input" />
              </div>

              <div className="profil-form-group">
                <label className="profil-label"><Phone size={16} className="profil-label-icon" /> Téléphone</label>
                <input type="tel" name="telephone" value={formData.telephone}
                  onChange={handleChange} disabled={!isEditing || loading} className="profil-input" />
              </div>

              <div className="profil-form-group full-width">
                <label className="profil-label"><MapPin size={16} className="profil-label-icon" /> Adresse</label>
                <input type="text" name="adresse" value={formData.adresse}
                  onChange={handleChange} disabled={!isEditing || loading} className="profil-input" />
              </div>

              <div className="profil-form-group">
                <label className="profil-label"><Calendar size={16} className="profil-label-icon" /> Date de naissance</label>
                <input type="date" name="date_naissance" value={formData.date_naissance}
                  onChange={handleChange} disabled={!isEditing || loading} className="profil-input" />
              </div>

            </div>

            {isEditing && (
              <div className="profil-actions">
                <button type="button" className="profil-btn-cancel" onClick={handleCancel} disabled={loading}>
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