// src/pages/auth/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import logoLocal  from '../../assets/logo bioscan1.png';
import logogoogle from '../../assets/google.png';

// ✅ localhost (pas 127.0.0.1) pour éviter CORS
const API_BASE = 'http://localhost:8000';

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', dob: '', password: '', confirmPassword: '',
    acceptTerms: false, acceptPrivacy: false,
  });

  const [errors,               setErrors]               = useState({});
  const [showPassword,         setShowPassword]         = useState(false);
  const [showConfirmPassword,  setShowConfirmPassword]  = useState(false);
  const [submitting,           setSubmitting]           = useState(false);
  const [serverError,          setServerError]          = useState('');
  const [serverWarning,        setServerWarning]        = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validateForm = () => {
    const e = {};
    if (!formData.firstName.trim())  e.firstName = "Le prénom est requis";
    if (!formData.lastName.trim())   e.lastName  = "Le nom est requis";
    if (!formData.email)             e.email     = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Email invalide";

    const digits = (formData.phone || '').replace(/\D/g, '');
    if (!formData.phone)        e.phone = "Le téléphone est requis";
    else if (digits.length < 8) e.phone = "Numéro trop court";

    if (!formData.address.trim()) e.address = "L'adresse est requise";
    if (!formData.dob)            e.dob     = "La date de naissance est requise";

    if (!formData.password)              e.password = "Le mot de passe est requis";
    else if (formData.password.length < 8) e.password = "Minimum 8 caractères";

    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Les mots de passe ne correspondent pas";

    if (!formData.acceptTerms)   e.acceptTerms   = "Vous devez accepter les conditions";
    if (!formData.acceptPrivacy) e.acceptPrivacy = "Vous devez accepter la politique de confidentialité";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setServerError('');
    setServerWarning('');
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        nom:              `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email:            formData.email.trim(),
        telephone:        formData.phone,
        adresse:          formData.address,
        date_naissance:   formData.dob,
        password:         formData.password,
        confirm_password: formData.confirmPassword,
      };

      const res = await fetch(`${API_BASE}/api/profil1/register/patient`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Erreur ${res.status}`);

      if (data.warning) setServerWarning(data.warning);

      localStorage.setItem('email_register', formData.email.trim());
      navigate('/otp');

    } catch (err) {
      setServerError(err.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logoLocal} alt="BioScan" className="logo-img" />
        <h2 className="auth-title">Créer un compte</h2>
        <p className="subtitle">Rejoignez BioScan dès maintenant</p>

        {serverWarning && (
          <div className="warning-message" role="alert" style={{
            background: '#fff8e1', border: '1px solid #f9a825',
            color: '#7a5800', borderRadius: 6, padding: '10px 14px',
            marginBottom: 12, fontSize: 14
          }}>
            ⚠️ {serverWarning}
          </div>
        )}

        {serverError && (
          <div className="error-message" role="alert">
            <span className="error-icon">⚠️</span> {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className="form-row">
            <div className="form-group">
              <input type="text" name="firstName" placeholder="Prénom"
                value={formData.firstName} onChange={handleChange}
                className={`form-input ${errors.firstName ? 'input-error' : ''}`} />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <input type="text" name="lastName" placeholder="Nom"
                value={formData.lastName} onChange={handleChange}
                className={`form-input ${errors.lastName ? 'input-error' : ''}`} />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <input type="email" name="email" placeholder="Email"
              value={formData.email} onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <input type="tel" name="phone" placeholder="Téléphone"
                value={formData.phone} onChange={handleChange}
                className={`form-input ${errors.phone ? 'input-error' : ''}`} />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <input type="text" name="address" placeholder="Adresse"
                value={formData.address} onChange={handleChange}
                className={`form-input ${errors.address ? 'input-error' : ''}`} />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>

          <div className="form-group">
            <input type="date" name="dob" value={formData.dob} onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`form-input date-input ${errors.dob ? 'input-error' : ''}`} />
            {errors.dob && <span className="error-text">{errors.dob}</span>}
          </div>

          <div className="form-group password-group">
            <input type={showPassword ? 'text' : 'password'} name="password"
              placeholder="Mot de passe" value={formData.password} onChange={handleChange}
              className={`form-input ${errors.password ? 'input-error' : ''}`} />
            <span className="eye" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? '🙈' : '👁'}
            </span>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group password-group">
            <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
              placeholder="Confirmer le mot de passe" value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`} />
            <span className="eye" onClick={() => setShowConfirmPassword(v => !v)}>
              {showConfirmPassword ? '🙈' : '👁'}
            </span>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="checkboxes-group">
            <div className="checkbox-row">
              <label className="checkbox-label">
                <input type="checkbox" name="acceptTerms"
                  checked={formData.acceptTerms} onChange={handleChange} />
                <span>J'accepte les conditions d'utilisation.</span>
              </label>
              {errors.acceptTerms && <span className="error-text">{errors.acceptTerms}</span>}
            </div>
            <div className="checkbox-row">
              <label className="checkbox-label">
                <input type="checkbox" name="acceptPrivacy"
                  checked={formData.acceptPrivacy} onChange={handleChange} />
                <span>J'accepte la politique de confidentialité.</span>
              </label>
              {errors.acceptPrivacy && <span className="error-text">{errors.acceptPrivacy}</span>}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Inscription en cours...' : 'Continuer'}
          </button>

          <div className="divider">OU</div>

          <button type="button" className="btn-google"
            onClick={() => alert('Inscription avec Google bientôt disponible.')}>
            <img src={logogoogle} alt="Google" className="google-icon" />
            Continuer avec Google
          </button>
        </form>

        <p className="login-text">
          Déjà un compte ?{' '}
          <span className="login-link" onClick={() => navigate('/sign-in')} role="button">
            Se connecter
          </span>
        </p>
      </div>
    </div>
  );
}