// src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';
import logoLocal from '../../assets/logo bioscan1.png';

// ✅ Même origine que AuthCard — localhost pas 127.0.0.1
const API_BASE = 'http://localhost:8000';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email,         setEmail]         = useState('');
  const [error,         setError]         = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [sending,       setSending]       = useState(false);

  const validateEmail = (v) => /\S+@\S+\.\S+/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!email.trim())          { setError("L'email est requis.");  return; }
    if (!validateEmail(email))  { setError('Email invalide.');      return; }

    setSending(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/auth/forgot-password`,
        { email: email.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setStatusMessage(data.message);
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail;
        if      (status === 404) setError("Aucun compte associé à cet email.");
        else if (status === 500) setError(detail || "Erreur serveur. Réessayez plus tard.");
        else                     setError(detail || `Erreur inattendue (${status}).`);
      } else {
        setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logoLocal} alt="BioScan" className="logo-img" />

        <h2 className="auth-title">Mot de passe oublié</h2>
        <p className="subtitle">
          Entrez votre email. Nous vous enverrons un nouveau mot de passe temporaire.
        </p>

        {statusMessage ? (
          <div className="status-card">
            <p>{statusMessage}</p>
            <div className="status-actions">
              <button className="btn-primary" onClick={() => navigate('/sign-in')}>
                Retour à la connexion
              </button>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className={error ? 'input-error' : ''}
                disabled={sending}
                autoComplete="email"
              />
              {error && <span className="error-text">{error}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? 'Envoi en cours...' : 'Envoyer le nouveau mot de passe'}
            </button>

            <div className="divider">OU</div>

            <p className="login-text">
              Retour ?{' '}
              <span className="login-link" onClick={() => navigate('/sign-in')} role="button">
                Se connecter
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}