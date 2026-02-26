import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Bell, Shield, Save } from 'lucide-react';
import './Parametres.css';

export default function Parametres() {
  const [formData, setFormData] = useState({
    nom: 'Yosra',
    prenom: 'Ben Salem',
    email: 'yosra.bensalem@example.com',
    telephone: '+216 20 123 456',
    adresse: 'Tunis, Tunisie',
    notifications: true,
    newsletter: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Paramètres sauvegardés !');
  };

  return (
    <div className="parametres">
      <div className="parametres-welcome-card">
        <div className="parametres-welcome-header">
          <h2 className="parametres-welcome-title">Paramètres</h2>
          <span className="parametres-welcome-emoji">⚙️</span>
        </div>
        <p className="parametres-welcome-subtitle">Gérez vos informations personnelles et préférences.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="parametres-card">
          <h3 className="parametres-section-title">
            <User size={20} color="#3b82f6" />
            Informations personnelles
          </h3>
          
          <div className="parametres-form-grid">
            <div className="parametres-form-group">
              <label className="parametres-label">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="parametres-input"
              />
            </div>

            <div className="parametres-form-group">
              <label className="parametres-label">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="parametres-input"
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
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="parametres-card">
          <h3 className="parametres-section-title">
            <Shield size={20} color="#3b82f6" />
            Sécurité
          </h3>
          
          <div className="parametres-security-section">
            <label className="parametres-label">
              <Lock size={16} className="parametres-label-icon" />
              Changer le mot de passe
            </label>
            <button 
              type="button"
              className="parametres-btn-secondary"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Modifier le mot de passe
            </button>
          </div>
        </div>

        {/* Notifications */}
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

        {/* Save Button */}
        <div className="parametres-card">
          <button type="submit" className="parametres-btn-primary">
            <Save size={18} />
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}