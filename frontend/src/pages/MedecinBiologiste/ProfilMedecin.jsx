// src/pages/MedecinBiologiste/ProfilMedecin.jsx
import React, { useState, useRef, useEffect } from 'react';
import medecinAvatar from '../../assets/médécin.png';
import './ProfilMedecin.css';

export default function ProfilMedecin() {
  const [editMode, setEditMode] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const userId = 1; // ID utilisateur connecté (à remplacer dynamiquement si tu as auth)

  // Données profil
  const [profil, setProfil] = useState(null);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  // 🔹 Charger le profil depuis l'API au montage
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/profil/${userId}`)
      .then(res => res.json())
      .then(data => {
        setProfil({
          nom_complet: data.nom_utilisateur,
          specialite: data.statut,
          telephone: data.telephone,
          email: data.email,
          date_inscription: data.date_generation,
        });
        setFormData({
          nom_complet: data.nom_utilisateur,
          specialite: data.statut,
          telephone: data.telephone,
          email: data.email,
        });
      })
      .catch(err => console.error('Erreur GET profil:', err));
  }, [userId]);

  // 🔹 Changement des champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔹 Changement mot de passe
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  // 🔹 Changement de l'image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert('Veuillez sélectionner une image valide (JPG, PNG, etc.)');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 🔹 Soumission du formulaire (PUT)
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation mot de passe
    if (passwordData.new || passwordData.confirm) {
      if (passwordData.new !== passwordData.confirm) {
        setPasswordError('Les nouveaux mots de passe ne correspondent pas');
        return;
      }
      if (passwordData.new.length < 8) {
        setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }
    }

    const payload = {
      nom_utilisateur: formData.nom_complet,
      email: formData.email,
      telephone: formData.telephone,
      statut: formData.specialite,
      ...(passwordData.new ? { mot_de_passe: passwordData.new } : {}),
    };

    fetch(`http://127.0.0.1:8000/api/profil/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors de la mise à jour du profil');
        return res.json();
      })
      .then(data => {
        alert('Profil mis à jour avec succès !');
        setProfil({
          nom_complet: data.nom_utilisateur,
          specialite: data.statut,
          telephone: data.telephone,
          email: data.email,
          date_inscription: data.date_generation,
        });
        setFormData({
          nom_complet: data.nom_utilisateur,
          specialite: data.statut,
          telephone: data.telephone,
          email: data.email,
        });
        setEditMode(false);
        setPreviewUrl(null);
        setPasswordData({ current: '', new: '', confirm: '' });
        setPasswordError('');
      })
      .catch(err => alert(err.message));
  };

  const handleCancel = () => {
    setFormData({ ...profil });
    setPreviewUrl(null);
    setPasswordData({ current: '', new: '', confirm: '' });
    setPasswordError('');
    setEditMode(false);
  };

  if (!profil) return <div>Chargement du profil...</div>;

  const displayedAvatar = previewUrl || medecinAvatar;

  return (
    <div className="profil-medecin-page">
      <div className="page-header">
        <h1>Mon Profil</h1>
        <p>Gestion de vos informations personnelles et de sécurité</p>
      </div>

      <div className="profil-container">
        <div className="profil-card">
          {/* Avatar */}
          <div className="profil-avatar">
            <img src={displayedAvatar} alt="Photo de profil" className="avatar-img" />
            {editMode && (
              <>
                <button type="button" className="btn-change-photo" onClick={triggerFileInput}>
                  Changer la photo
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </>
            )}
          </div>

          {/* Infos profil */}
          <div className="profil-info">
            {editMode ? (
              <form onSubmit={handleSubmit} className="profil-form">
                <div className="form-section">
                  <h3>Informations personnelles</h3>

                  <div className="form-group">
                    <label>Nom complet</label>
                    <input type="text" name="nom_complet" value={formData.nom_complet || ''} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>Spécialité</label>
                    <input type="text" name="specialite" value={formData.specialite || ''} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="tel" name="telephone" value={formData.telephone || ''} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-section password-section">
                  <h3>Changer le mot de passe</h3>
                  <p className="help-text">(Laissez vide si vous ne souhaitez pas modifier le mot de passe)</p>

                  <div className="form-group">
                    <label>Mot de passe actuel</label>
                    <input type="password" name="current" value={passwordData.current} onChange={handlePasswordChange} autoComplete="current-password" />
                  </div>

                  <div className="form-group">
                    <label>Nouveau mot de passe</label>
                    <input type="password" name="new" value={passwordData.new} onChange={handlePasswordChange} autoComplete="new-password" />
                  </div>

                  <div className="form-group">
                    <label>Confirmer le nouveau mot de passe</label>
                    <input type="password" name="confirm" value={passwordData.confirm} onChange={handlePasswordChange} autoComplete="new-password" />
                  </div>

                  {passwordError && <div className="error-message">{passwordError}</div>}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Enregistrer</button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>Annuler</button>
                </div>
              </form>
            ) : (
              <>
                <h2>Dr. {profil.nom_complet}</h2>
                <p className="specialite">{profil.specialite}</p>

                <div className="info-grid">
                  <div className="info-item"><span className="label">Email :</span> <span>{profil.email}</span></div>
                  <div className="info-item"><span className="label">Téléphone :</span> <span>{profil.telephone}</span></div>
                  <div className="info-item"><span className="label">Inscription :</span> <span>{new Date(profil.date_inscription).toLocaleDateString('fr-TN')}</span></div>
                </div>

                <div className="profil-actions">
                  <button className="btn btn-edit" onClick={() => setEditMode(true)}>Modifier mon profil</button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="stats-card">
          <h3>Activité récente</h3>
          <ul className="stats-list">
            <li><strong>12</strong> bilans validés ce mois</li>
            <li><strong>5</strong> rapports d'anomalie créés</li>
            <li><strong>98%</strong> de satisfaction patient</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
