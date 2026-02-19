import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css';
import logoLocal from '../../assets/logo bioscan1.png';
import logogoogle from '../../assets/google.png';

export default function AuthCard({ title, subtitle }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("LOGIN CLICKED");
  console.log("EMAIL:", email);
  console.log("PASSWORD:", password);

  setError('');
  setLoading(true);

  try {

    const res = await axios.post(
      "http://127.0.0.1:8000/auth/auth/login",
      {
        email: email.trim(),
        password: password.trim()
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    console.log("SERVER RESPONSE:", res.data);

    if (!res.data.access_token) {
      throw new Error("Token absent dans la réponse");
    }

    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("user_id", res.data.user_id);

    console.log("TOKEN STORED:", localStorage.getItem("token"));

    const role = res.data.role;

    if (role === "Medecin" || role === "Medecin biologiste") {
      navigate("/medecin-biologiste/tableau");
    } else if (role === "Technicien" || role === "Technicien biologiste") {
      navigate("/technicien");
    } else if (role === "Administrateur") {
      navigate("/admin");
    } else if (role === "Patient") {
      navigate("/patient");
    } else {
      navigate("/");
    }

  } catch (err) {

    console.error("LOGIN ERROR FULL:", err);

    if (err.response) {
      console.error("SERVER ERROR DATA:", err.response.data);
      console.error("STATUS:", err.response.status);

      setError(err.response.data?.detail || "Erreur serveur");
    } else if (err.request) {
      console.error("NO RESPONSE FROM SERVER");
      setError("Serveur inaccessible");
    } else {
      console.error("AXIOS ERROR:", err.message);
      setError(err.message);
    }

  } finally {
    setLoading(false);
  }
};


  const handleGoogleLogin = () => {
    alert("Connexion avec Google...");
  };

  const goToForgotPassword = () => navigate('/forgot-password');
  const goToSignUp = () => navigate('/signup');

  return (
    <div className="auth-container">
      <div className="auth-card">

        <img src={logoLocal} alt="BioScan" className="logo-img" />

        {title && <h2 className="auth-title">{title}</h2>}
        {subtitle && <p className="subtitle">{subtitle}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
            />
            <span
              className="eye"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁'}
            </span>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <p className="forgot-password" onClick={goToForgotPassword}>
            Mot de passe oublié ?
          </p>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="divider">OU</div>

          <button type="button" className="btn-google" onClick={handleGoogleLogin}>
            <img src={logogoogle} alt="Logo Google" className="google-icon" />
            Se connecter avec Google
          </button>

        </form>

        <p className="signup-text">
          Pas encore de compte ?{' '}
          <span className="signup-link" onClick={goToSignUp}>
            S'inscrire
          </span>
        </p>

      </div>
    </div>
  );
}
