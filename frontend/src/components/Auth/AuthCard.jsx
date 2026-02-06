import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import logoLocal from '../../assets/logo bioscan1.png';
import logogoogle from '../../assets/google.png';

export default function AuthCard({ title, subtitle }) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Connexion réussie !");
  };

  const handleGoogleLogin = () => {
    alert("Connexion avec Google...");
  };

  const goToForgotPassword = () => navigate('/forgot-password');
  const goToSignUp = () => navigate('/signup');

  const onKeyPressNavigate = (e, fn) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* Logo */}
        <img src={logoLocal} alt="BioScan" className="logo-img"/>

        {title && <h2 className="auth-title">{title}</h2>}
        {subtitle && <p className="subtitle">{subtitle}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <input type="text" placeholder="Nom d'utilisateur" required/>
          </div>

          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
            />
            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁'}
            </span>
          </div>

          <p
            className="forgot-password"
            role="button"
            tabIndex={0}
            onClick={goToForgotPassword}
            onKeyDown={(e) => onKeyPressNavigate(e, goToForgotPassword)}
            aria-label="Mot de passe oublié"
          >
            Mot de passe oublié ?
          </p>

          <button className="btn-primary" type="submit">Se connecter</button>

          <div className="divider">OU</div>

          <button type="button" className="btn-google" onClick={handleGoogleLogin}>
            <img src={logogoogle} alt="Logo Google" className="google-icon"/>
            Se connecter avec Google
          </button>

        </form>

        <p className="signup-text">
          Pas encore de compte ?{' '}
          <span
            className="signup-link"
            role="button"
            tabIndex={0}
            onClick={goToSignUp}
            onKeyDown={(e) => onKeyPressNavigate(e, goToSignUp)}
            aria-label="S'inscrire"
          >
            S'inscrire
          </span>
        </p>

      </div>
    </div>
  );
}