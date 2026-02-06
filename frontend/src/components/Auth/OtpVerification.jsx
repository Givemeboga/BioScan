import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OtpVerification.css';
import logoLocal from '../../assets/logo bioscan1.png';

export default function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(120);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const focusInput = (index) => {
    const el = inputRefs.current[index];
    if (el && typeof el.focus === 'function') el.focus();
  };

  const handleChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    const char = cleaned.slice(-1);
    setOtp(prev => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    if (char !== '' && index < otp.length - 1) focusInput(index + 1);
  };

  const handleKeyDown = (e, index) => {
    const key = e.key;
    if (key === 'Backspace') {
      if (otp[index]) {
        setOtp(prev => { const n=[...prev]; n[index]=''; return n; });
      } else if (index > 0) {
        focusInput(index - 1);
        setOtp(prev => { const n=[...prev]; n[index - 1]=''; return n; });
      }
      return;
    }
    if (key === 'ArrowLeft' && index > 0) { e.preventDefault(); focusInput(index - 1); return; }
    if (key === 'ArrowRight' && index < otp.length - 1) { e.preventDefault(); focusInput(index + 1); return; }
    if (!/^\d$/.test(key) && key.length === 1) e.preventDefault();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text') || '';
    const digits = pasted.replace(/\D/g, '').slice(0, otp.length).split('');
    if (digits.length === 0) return;
    setOtp(prev => {
      const next = [...prev];
      for (let i = 0; i < digits.length; i++) next[i] = digits[i];
      return next;
    });
    const focusIndex = Math.min(digits.length, otp.length - 1);
    focusInput(focusIndex);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== otp.length) {
      alert('Veuillez entrer le code complet.');
      return;
    }
    // TODO: appeler API pour vérifier l'OTP réel
    // Si vérification OK → proposer 2FA (optionnel)
    navigate('/2fa-setup', { state: { email } });
  };

  const handleResend = () => {
    setOtp(new Array(6).fill(''));
    setTimeLeft(120);
    focusInput(0);
    // TODO: appeler endpoint pour renvoyer OTP
    alert('Nouveau code envoyé (simulation).');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logoLocal} alt="BioScan" className="logo-img" />
        <h2 className="auth-title">Vérification</h2>
        <p className="subtitle">
          Entrez le code à 6 chiffres envoyé à<br />
          <strong>{email || 'votre adresse'}</strong>
        </p>

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
              />
            ))}
          </div>

          <button type="submit" className="btn-primary" disabled={otp.join('').length !== otp.length}>
            Vérifier le code
          </button>
        </form>

        <div className="resend-section">
          {timeLeft > 0 ? (
            <p>Renvoyer le code dans <strong>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2,'0')}</strong></p>
          ) : (
            <button className="resend-btn" onClick={handleResend}>Renvoyer le code</button>
          )}
        </div>

        <p className="back-link" onClick={() => navigate(-1)}>← Retour à l'inscription</p>
      </div>
    </div>
  );
}