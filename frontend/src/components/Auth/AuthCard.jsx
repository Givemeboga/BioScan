// src/pages/auth/AuthCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css';
import logoLocal  from '../../assets/logo bioscan1.png';
import logogoogle from '../../assets/google.png';

const API_BASE = 'http://localhost:8000';

// ── Correspondance rôle → route ────────────────────────────────
// Correspond exactement aux noms dans la table role :
// Administrateur, Patient, Technicien biologiste, Medecin
const ROLE_ROUTES = {
  'patient':               '/patient',
  'administrateur':        '/admin',
  'medecin':               '/medecin-biologiste/tableau',
  'medecin biologiste':    '/medecin-biologiste/tableau',
  'technicien biologiste': '/technicien',
  'technicien':            '/technicien',
};

function getRouteForRole(role = '') {
  const key = role.trim().toLowerCase();
  console.log('[AuthCard] role reçu =', JSON.stringify(role), '| key =', key);
  return ROLE_ROUTES[key] ?? '/';
}

export default function AuthCard({ title, subtitle }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/auth/login`,
        { email: email.trim(), password: password.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { access_token, role, user_id } = data;

      console.log('[AuthCard] login OK → role=', role, 'user_id=', user_id);

      localStorage.setItem('token',           access_token);
      localStorage.setItem('access_token',    access_token);
      localStorage.setItem('role',            role);
      localStorage.setItem('user_id',         String(user_id));

      // Récupérer le nom (optionnel)
      try {
        const profilRes = await axios.get(
          `${API_BASE}/api/patient/profil/me`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        const nom = profilRes.data?.nom_utilisateur || email.split('@')[0];
        localStorage.setItem('nom_utilisateur', nom);
      } catch {
        localStorage.setItem('nom_utilisateur', email.split('@')[0]);
      }

      navigate(getRouteForRole(role));

    } catch (err) {
      console.error('LOGIN ERROR:', err);
      if (err.response) {
        const { status, data: d } = err.response;
        if      (status === 401) setError(d?.detail || 'Email ou mot de passe incorrect.');
        else if (status === 403) setError(d?.detail || 'Compte inactif.');
        else if (status === 500) setError('Erreur serveur. Réessayez plus tard.');
        else                     setError(d?.detail || `Erreur (${status}).`);
      } else {
        setError('Impossible de contacter le serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logoLocal} alt="BioScan" className="logo-img" />
        {title    && <h2 className="auth-title">{title}</h2>}
        {subtitle && <p className="subtitle">{subtitle}</p>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className="form-group">
            <input type="email" placeholder="Email" required autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }} />
          </div>

          <div className="form-group password-group">
            <input type={showPassword ? 'text' : 'password'} placeholder="Mot de passe"
              required autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }} />
            <span className="eye" role="button"
              onClick={() => setShowPassword(v => !v)}>
              {showPassword ? '🙈' : '👁'}
            </span>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠️</span> {error}
            </div>
          )}

          <p className="forgot-password" role="button"
            onClick={() => navigate('/forgot-password')}>
            Mot de passe oublié ?
          </p>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>

          <div className="divider">OU</div>

          <button type="button" className="btn-google"
            onClick={() => alert('Connexion avec Google bientôt disponible…')}>
            <img src={logogoogle} alt="Google" className="google-icon" />
            Se connecter avec Google
          </button>
        </form>

        <p className="signup-text">
          Pas encore de compte ?{' '}
          <span className="signup-link" role="button" onClick={() => navigate('/signup')}>
            S'inscrire
          </span>
        </p>
      </div>
    </div>
  );
}