import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import logoLocal from '../../assets/logo bioscan1.png';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [sending, setSending] = useState(false);

  const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!email) {
      setError("L'email est requis.");
      return;
    }
    if (!validateEmail(email)) {
      setError('Email invalide.');
      return;
    }

    setSending(true);
    try {
      // TODO: remplacer par appel API réel pour demander le reset
      // await api.requestPasswordReset({ email });
      await new Promise((r) => setTimeout(r, 900)); // simulation

      setStatusMessage(`Un e-mail de réinitialisation a été envoyé à ${email}.`);
    } catch (err) {
      setError('Impossible d\'envoyer l\'email pour le moment. Réessayez plus tard.');
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
          Entrez l'adresse email associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
                onChange={(e) => setEmail(e.target.value)}
                className={error ? 'input-error' : ''}
                disabled={sending}
              />
              {error && <span className="error-text">{error}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>

            <div className="divider">OU</div>

            <p className="login-text">
              Retour ? <span className="login-link" onClick={() => navigate('/sign-in')}>Se connecter</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}