import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import logoLocal from '../../assets/logo bioscan1.png';
import logogoogle from '../../assets/google.png';

export default function SignUp() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis";
    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalide";

    const digitsOnly = (formData.phone || '').replace(/\D/g, '');
    if (!formData.phone) newErrors.phone = "Le numéro de téléphone est requis";
    else if (digitsOnly.length < 8) newErrors.phone = "Numéro trop court";

    if (!formData.address.trim()) newErrors.address = "L'adresse est requise";

    if (!formData.dob) newErrors.dob = "La date de naissance est requise";

    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    else if (formData.password.length < 8) newErrors.password = "Minimum 8 caractères";

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";

    if (!formData.acceptTerms) newErrors.acceptTerms = "Vous devez accepter les conditions d'utilisation";
    if (!formData.acceptPrivacy) newErrors.acceptPrivacy = "Vous devez accepter la politique de confidentialité";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Appel API possible ici
      navigate('/otp', { state: { email: formData.email } });
    }
  };

  const handleGoogleSignUp = () => {
    alert("Inscription avec Google (à implémenter).");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logoLocal} alt="BioScan" className="logo-img" />
        <h2 className="auth-title">Créer un compte</h2>
        <p className="subtitle">Rejoignez BioScan dès maintenant</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="Prénom"
                value={formData.firstName}
                onChange={handleChange}
                className={`form-input input-firstname ${errors.firstName ? 'input-error' : ''}`}
                aria-label="Prénom"
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Nom"
                value={formData.lastName}
                onChange={handleChange}
                className={`form-input input-lastname ${errors.lastName ? 'input-error' : ''}`}
                aria-label="Nom"
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input input-email ${errors.email ? 'input-error' : ''}`}
              aria-label="Email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input input-phone ${errors.phone ? 'input-error' : ''}`}
                inputMode="tel"
                aria-label="Téléphone"
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="address"
                placeholder="Adresse"
                value={formData.address}
                onChange={handleChange}
                className={`form-input input-address ${errors.address ? 'input-error' : ''}`}
                aria-label="Adresse"
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="date-label">
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`form-input date-input ${errors.dob ? 'input-error' : ''}`}
                aria-label="Date de naissance"
                max={new Date().toISOString().split('T')[0]}
              />
            </label>
            {errors.dob && <span className="error-text">{errors.dob}</span>}
          </div>

          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              aria-label="Mot de passe"
            />
            <span className="eye" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '🙈' : '👁'}
            </span>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group password-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              aria-label="Confirmer le mot de passe"
            />
            <span className="eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? '🙈' : '👁'}
            </span>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <p className="forgot-password" onClick={() => navigate('/forgot-password')} role="button" tabIndex={0}>
            Mot de passe oublié ?
          </p>

          <div className="checkboxes-group">
            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                />
                <span>J'accepte les conditions d'utilisation.</span>
              </label>
              {errors.acceptTerms && <span className="error-text">{errors.acceptTerms}</span>}
            </div>

            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="acceptPrivacy"
                  checked={formData.acceptPrivacy}
                  onChange={handleChange}
                />
                <span>J'accepte la politique de confidentialité.</span>
              </label>
              {errors.acceptPrivacy && <span className="error-text">{errors.acceptPrivacy}</span>}
            </div>
          </div>

          <button type="submit" className="btn-primary">Continuer</button>

          <div className="divider">OU</div>

          <button type="button" className="btn-google" onClick={handleGoogleSignUp}>
            <img src={logogoogle} alt="Google" className="google-icon" />
            Continuer avec Google
          </button>
        </form>

        <p className="login-text">
          Déjà un compte ? <span className="login-link" onClick={() => navigate('/sign-in')}>Se connecter</span>
        </p>
      </div>
    </div>
  );
}