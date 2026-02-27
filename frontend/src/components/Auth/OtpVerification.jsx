// src/pages/auth/OtpVerification.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OtpVerification.css';
import logoLocal from '../../assets/logo bioscan1.png';

// ✅ URL correcte → /api (prefix main.py) + /auth (prefix router) + /send-otp ou /verify-otp
const API_BASE = 'http://localhost:8000/api/auth';

export default function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Récupération email depuis navigation ou localStorage
  const email =
    location.state?.email ||
    localStorage.getItem('email_register') ||
    '';

  const [otp,      setOtp]      = useState(new Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(120);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [sent,     setSent]     = useState(false);
  const inputRefs = useRef([]);

  // ── Timer countdown ──────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const focusInput = (i) => inputRefs.current[i]?.focus();

  // ── Envoyer OTP ──────────────────────────────────────────────
  const sendOtp = useCallback(async () => {
    if (!email) {
      setError("Email introuvable. Retournez à l'inscription.");
      return;
    }
    setLoading(true);
    setError('');
    setSent(false);
    try {
      const res = await fetch(`${API_BASE}/send-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, raison: 'Inscription' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Impossible d'envoyer le code OTP.");
      setTimeLeft(120);
      setSent(true);
    } catch (err) {
      // ✅ Gestion erreur réseau / CORS
      if (err instanceof TypeError) {
        setError('Erreur réseau. Vérifiez que le serveur backend est lancé sur le port 8000.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [email]);

  // ✅ Envoi automatique au montage du composant
  useEffect(() => { sendOtp(); }, [sendOtp]);

  // ── Gestion des inputs ───────────────────────────────────────
  const handleChange = (index, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    setOtp(prev => { const n = [...prev]; n[index] = char; return n; });
    if (char && index < 5) focusInput(index + 1);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        setOtp(prev => { const n = [...prev]; n[index] = ''; return n; });
      } else if (index > 0) {
        focusInput(index - 1);
        setOtp(prev => { const n = [...prev]; n[index - 1] = ''; return n; });
      }
      return;
    }
    if (e.key === 'ArrowLeft'  && index > 0) { e.preventDefault(); focusInput(index - 1); }
    if (e.key === 'ArrowRight' && index < 5) { e.preventDefault(); focusInput(index + 1); }
    // Bloquer les caractères non-numériques
    if (!/^\d$/.test(e.key) && e.key.length === 1) e.preventDefault();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData('text') || '')
      .replace(/\D/g, '').slice(0, 6).split('');
    if (!digits.length) return;
    setOtp(prev => {
      const n = [...prev];
      digits.forEach((d, i) => { n[i] = d; });
      return n;
    });
    focusInput(Math.min(digits.length, 5));
  };

  // ── Vérifier OTP ─────────────────────────────────────────────
  const verifyOtp = async (code) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ champ "otp" — correspond au modèle VerifyOtpRequest backend
        body:    JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Code OTP invalide.');

      // ✅ Nettoyage localStorage + redirection
      localStorage.removeItem('email_register');
      navigate('/sign-in', { replace: true });

    } catch (err) {
      // ✅ Gestion erreur réseau / CORS
      if (err instanceof TypeError) {
        setError('Erreur réseau ou CORS. Assurez-vous que le backend autorise localhost:3000.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Veuillez entrer les 6 chiffres.');
      return;
    }
    verifyOtp(code);
  };

  const handleResend = () => {
    setOtp(new Array(6).fill(''));
    setError('');
    setSent(false);
    sendOtp();
    setTimeout(() => focusInput(0), 100);
  };

  // ── Rendu ─────────────────────────────────────────────────────
  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logoLocal} alt="BioScan" className="logo-img" />
        <h2 className="auth-title">Vérification</h2>
        <p className="subtitle">
          Entrez le code à 6 chiffres envoyé à<br />
          <strong>{email || 'votre adresse'}</strong>
        </p>

        {/* ✅ Message succès envoi */}
        {sent && !error && (
          <p style={{ color: '#16a34a', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            ✅ Code envoyé à {email}
          </p>
        )}

        {/* ✅ Message d'erreur */}
        {error && (
          <p className="error-text" style={{ color: '#dc2626', marginBottom: '0.5rem' }}>
            ⚠️ {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="otp-container" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                autoFocus={i === 0}
                disabled={loading}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || otp.join('').length !== 6}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Vérification...' : 'Vérifier le code'}
          </button>
        </form>

        {/* ✅ Timer ou bouton renvoyer */}
        <div className="resend-section" style={{ marginTop: '1rem', textAlign: 'center' }}>
          {timeLeft > 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Renvoyer dans{' '}
              <strong>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </strong>
            </p>
          ) : (
            <button className="resend-btn" onClick={handleResend} disabled={loading}>
              {loading ? 'Envoi...' : 'Renvoyer le code'}
            </button>
          )}
        </div>

        <p
          style={{ cursor: 'pointer', marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}
          onClick={() => navigate(-1)}
        >
          ← Retour à l'inscription
        </p>
      </div>
    </div>
  );
}