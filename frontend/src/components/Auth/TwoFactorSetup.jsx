import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TwoFactorSetup.css';
import logoLocal from '../../assets/logo bioscan1.png';

export default function TwoFactorSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [step, setStep] = useState('offer'); // offer | auth-app | sms | done
  const [secret, setSecret] = useState('JBSWY3DPEHPK3PXP'); // placeholder secret (TOTP)
  const [totpCode, setTotpCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);

  // Simulate verifying TOTP or SMS
  const verifyTotp = (e) => {
    e.preventDefault();
    // TODO: verify with backend; here we accept any 6-digit
    if (/^\d{6}$/.test(totpCode)) {
      setStep('done');
      alert('2FA activé via application (simulation).');
      navigate('/'); // redirige vers dashboard
    } else {
      alert('Code invalide. Utilise un code à 6 chiffres.');
    }
  };

  const sendSms = () => {
    // TODO: appeler backend pour envoyer sms
    setSmsSent(true);
    alert('Code SMS envoyé (simulation).');
  };

  const verifySms = (e) => {
    e.preventDefault();
    if (/^\d{6}$/.test(smsCode)) {
      setStep('done');
      alert('2FA activé via SMS (simulation).');
      navigate('/');
    } else {
      alert('Code SMS invalide.');
    }
  };

  const skip2fa = () => {
    // L'utilisateur choisit de passer pour l'instant
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card twofa-card">
        <img src={logoLocal} alt="BioScan" className="logo-img" />
        {step === 'offer' && (
          <>
            <h2 className="auth-title">Activer la 2FA (optionnel)</h2>
            <p className="subtitle">
              Pour renforcer la sécurité de votre compte, vous pouvez activer la vérification en deux étapes.
              Vous pouvez utiliser une application d'authentification (recommandé) ou recevoir un code par SMS.
            </p>

            <div className="twofa-actions">
              <button className="btn-primary" onClick={() => setStep('auth-app')}>Activer via application d'authentification</button>
              <button className="btn-outline" onClick={() => { setStep('sms'); sendSms(); }}>Activer via SMS</button>
              <button className="btn-link" onClick={skip2fa}>Plus tard</button>
            </div>
          </>
        )}

        {step === 'auth-app' && (
          <>
            <h2 className="auth-title">Application d'authentification</h2>
            <p className="subtitle">Scannez le QR ou entrez la clé secrète dans votre application (Google Authenticator, Authy, etc.), puis saisissez le code à 6 chiffres généré.</p>

            <div className="qr-box">
              {/* Placeholder QR — remplace par un QR réel issu de ton backend */}
              <div className="qr-placeholder">QR CODE</div>
              <div className="secret">Clé secrète : <code>{secret}</code></div>
            </div>

            <form onSubmit={verifyTotp} className="verify-form">
              <input type="text" maxLength={6} placeholder="Code à 6 chiffres" value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g,''))} className="form-input"/>
              <div className="verify-actions">
                <button type="submit" className="btn-primary">Vérifier et activer</button>
                <button type="button" className="btn-outline" onClick={() => setStep('offer')}>Retour</button>
              </div>
            </form>
          </>
        )}

        {step === 'sms' && (
          <>
            <h2 className="auth-title">Activation par SMS</h2>
            <p className="subtitle">Nous avons envoyé un code par SMS au numéro lié à votre compte.</p>

            <form onSubmit={verifySms} className="verify-form">
              <input type="text" maxLength={6} placeholder="Code SMS" value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g,''))} className="form-input"/>
              <div className="verify-actions">
                <button type="submit" className="btn-primary">Vérifier et activer</button>
                <button type="button" className="btn-outline" onClick={() => { setSmsSent(false); setStep('offer'); }}>Retour</button>
              </div>
            </form>

            <div className="sms-resend">
              {!smsSent ? (
                <button className="btn-link" onClick={sendSms}>Renvoyer le SMS</button>
              ) : (
                <p className="small">Si vous n'avez pas reçu le SMS, réessayez.</p>
              )}
            </div>
          </>
        )}

        {step === 'done' && (
          <>
            <h2 className="auth-title">2FA activé</h2>
            <p className="subtitle">Votre compte est maintenant protégé par la vérification en deux étapes.</p>
            <div className="twofa-actions">
              <button className="btn-primary" onClick={() => navigate('/')}>Aller au tableau de bord</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}