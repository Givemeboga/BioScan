// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import './HomePage.css';
import logo from '../../assets/logo biosacn fin.png';
import labVideo from '../../assets/vidéos/Video Project 4.mp4';

// Images pour les 3 espaces (à remplacer par tes vraies captures d'écran)
import technicianSpace from '../../assets/espace administrateur.png';
import doctorSpace from '../../assets/espace administrateur.png';
import patientSpace from '../../assets/espace administrateur.png';
import rapportDetude from'../../assets/rapport-detude-removebg-preview.png';
import securite from '../../assets/sécurité médicale.png';
import horloge from '../../assets/horloge.png';
import ia from '../../assets/ia.png';
import logoFonce from '../../assets/logo foncé.png';

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const sendEmail = (e) => {
    e.preventDefault();
    // Ici tu peux intégrer ton backend EmailJS ou autre service
    alert("Message envoyé ! (Intègre EmailJS ici)");
  };

  return (
    <div className="home-page">

      {/* Navbar */}
      <nav className={`main-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-brand">
            <img src={logo} alt="BioScan - Comprendre sa santé simplement" className="logo" />
          </div>

          <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
            <button onClick={() => scrollTo('accueil')}>Accueil</button>
            <button onClick={() => scrollTo('apropos')}>À propos</button>
            <button onClick={() => scrollTo('espaces')}>Nos espaces</button>
            <button onClick={() => scrollTo('services')}>Services</button>
            <button onClick={() => scrollTo('contact')}>Contact</button>
          </div>

          <div className="navbar-auth">
            <a href="/sign-in" className="auth-btn login">Se connecter</a>
            <a href="/signup" className="auth-btn signup">S'inscrire</a>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section id="accueil" className="hero">
        <video
          className="hero-video-bg"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={logo}
        >
          <source src={labVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1>Vos résultats d'analyses<br />clairs en un coup d'œil</h1>
          <p className="hero-subtitle">
            BioScan rend vos bilans biologiques compréhensibles, visuels et expliqués simplement.
          </p>
          <div className="hero-actions">
            <button className="btn primary">voir un exemple</button>
            <button className="btn outline">Comment ça marche ?</button>
          </div>
        </div>
      </section>

      {/* Pourquoi BioScan – Timeline horizontale */}
      <section className="why-bioscan-modern section-padding">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge">AVANTAGES BIOSCAN</span>
            <h2 className="hero-title">Faites un impact immédiat</h2>
            <p className="hero-subtitle">
              Transformez vos analyses médicales en expériences visuelles percutantes pour 
              tous vos utilisateurs - laboratoires, médecins et patients.
            </p>
          </div>

          <div className="why-container">
            <div className="why-timeline">
              <div className="why-step active" style={{ '--color': '#00a8b5' }}>
                <div className="step-number">01</div>
              <div className="step-icon">
  <img src={rapportDetude} alt="Chart Icon" />
</div>
                <div className="step-content">
                  <h3>Rapports visuels IA</h3>
                  <p>Graphiques automatiques + explications simples en 3 secondes</p>
                </div>
                <div className="step-arrow"></div>
              </div>

              <div className="why-step" style={{ '--color': '#ec4899' }}>
                <div className="step-number">02</div>
   <div className="step-icon">
  <img src={horloge} alt="Clock Icon" />
</div>                <div className="step-content">
                  <h3>Accès 24/7 mobile</h3>
                  <p>Résultats instantanés sur tous appareils, partout</p>
                </div>
                <div className="step-arrow"></div>
              </div>

              <div className="why-step" style={{ '--color': '#f59e0b' }}>
                <div className="step-number">03</div>
         <div className="step-icon">
  <img src={securite} alt="Security Icon" />
</div>                <div className="step-content">
                  <h3>Sécurité médicale</h3>
                  <p>Chiffrement AES-256 + RGPD + conformité CNIL</p>
                </div>
                <div className="step-arrow"></div>
              </div>

              <div className="why-step" style={{ '--color': '#1e293b' }}>
                <div className="step-number">04</div>
                   <div className="step-icon">
  <img src={ia} alt="AI Icon" />
</div>   
                <div className="step-content">
                  <h3>analyse des bilans avec ia</h3>
                  <p>Tendances automatiques + alertes prédictives</p>
                </div>
              </div>
            </div>
          </div>

          <div className="why-cta">
            <button className="btn primary large">
              Commencer avec BioScan
            </button>
          </div>
        </div>
      </section>

      {/* À propos */}
      <section id="apropos" className="about-modern section-padding">
        <div className="container">
          <div className="about-content-grid">
            <div className="about-text animate-fade-left">
              <span className="about-label">À PROPOS DE BIOSCAN</span>
              <h4>
                Rendre les bilans biologiques <span className="highlight">compréhensibles</span><br />
                et <span className="highlight">utiles</span> pour tous.
              </h4>
              <p className="about-description">
                BioScan est la plateforme tunisienne qui transforme vos résultats d'analyses en rapports clairs, visuels et expliqués en langage simple — même sans aucune formation médicale.
              </p>
              <p>
                Laboratoires, médecins et patients : chacun dispose d'un espace sécurisé, intuitif et adapté à ses besoins. Nous utilisons l'intelligence artificielle et une pédagogie validée pour vous aider à mieux comprendre et suivre votre santé au quotidien.
              </p>
              <div className="about-tags">
                <span>Sécurité renforcée</span>
                <span>IA pédagogique</span>
                <span>Made in Tunisia</span>
              </div>
            </div>

            <div className="about-image-side animate-fade-right">
              <div className="image-wrapper">
                <img 
                  src={logo}
                  alt="BioScan en action" 
                  className="about-main-image"
                />
              </div>
              <div className="organic-blob"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Espaces */}
      <section id="espaces" className="spaces-section section-padding">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">POUR CHAQUE ACTEUR DE VOTRE ÉCOSYSTÈME</span>
            <h2>Une expérience sur mesure pour chacun</h2>
            <p className="section-lead">
              BioScan propose trois espaces distincts, sécurisés et optimisés selon le rôle de chaque utilisateur.
            </p>
          </div>

          <div className="spaces-list">
            {/* Espace Technicien */}
            <div className="space-row animate-from-left">
              <div className="space-image-side">
                <img src={technicianSpace} alt="Interface Technicien BioScan" className="space-img" />
              </div>
              <div className="space-text-side">
                <div className="space-header">
                  <span className="space-icon">🧪</span>
                  <h3>Espace Technicien / Secrétaire</h3>
                </div>
                <p className="space-description">
                  Saisie ultra-rapide des résultats, reconnaissance automatique des tubes, validation en un clic et envoi instantané. <strong>Moins d'erreurs, traçabilité complète.</strong>
                </p>
              </div>
            </div>

            {/* Espace Médecin */}
            <div className="space-row animate-from-right">
              <div className="space-image-side">
                <img src={doctorSpace} alt="Interface Médecin BioScan" className="space-img" />
              </div>
              <div className="space-text-side">
                <div className="space-header">
                  <span className="space-icon">👨‍⚕️</span>
                  <h3>Espace Médecin / Prescripteur</h3>
                </div>
                <p className="space-description">
                  Accès immédiat aux bilans, courbes d'évolution, comparaisons et rapports pédagogiques. <strong>Meilleure prise en charge, gain de temps.</strong>
                </p>
              </div>
            </div>

            {/* Espace Patient */}
            <div className="space-row animate-from-left">
              <div className="space-image-side">
                <img src={patientSpace} alt="Interface Patient BioScan" className="space-img" />
              </div>
              <div className="space-text-side">
                <div className="space-header">
                  <span className="space-icon">🧍</span>
                  <h3>Espace Patient</h3>
                </div>
                <p className="space-description">
                  Résultats expliqués simplement avec graphiques, repères visuels et suivi dans le temps. <strong>Moins d'angoisse, meilleure compréhension.</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="spaces-cta text-center">
            <p className="cta-text">
              Prêt à équiper votre laboratoire ou cabinet avec ces trois espaces connectés ?
            </p>
            <a href="/inscription" className="btn primary large">Créer mon compte</a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="services-section">
        <div className="container">
          <h2 className="services-title">Nos Services</h2>
          <div className="services-timeline">
            <div className="timeline-item" style={{ '--color': '#00abab', '--delay': '0.1s' }}>
              <div className="timeline-circle">01</div>
              <h3>Analyse automatique</h3>
              <p>Rapport clair et illustré en quelques secondes grâce à l'IA</p>
            </div>
            <div className="timeline-item" style={{ '--color': '#00d4c8', '--delay': '0.2s' }}>
              <div className="timeline-circle">02</div>
              <h3>Suivi longitudinal</h3>
              <p>Historique complet avec courbes et comparaisons</p>
            </div>
            <div className="timeline-item" style={{ '--color': '#2d3e50', '--delay': '0.3s' }}>
              <div className="timeline-circle">03</div>
              <h3>Alertes intelligentes</h3>
              <p>Notifications quand un paramètre sort des normes</p>
            </div>
            <div className="timeline-item" style={{ '--color': '#00abab', '--delay': '0.4s' }}>
              <div className="timeline-circle">04</div>
              <h3>Explications pédagogiques</h3>
              <p>Chaque valeur expliquée simplement, sans jargon</p>
            </div>
            <div className="timeline-item" style={{ '--color': '#00d4c8', '--delay': '0.5s' }}>
              <div className="timeline-circle">05</div>
              <h3>Sécurité maximale</h3>
              <p>Chiffrement AES-256 – conforme RGPD</p>
            </div>
          </div>
        </div>
      </section>

      {/* NOUVEAU : ESPACE CONTACT */}
      <section id="contact" className="contact-section section-padding">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">CONTACT</span>
            <h2>Discutons de votre projet</h2>
            <p className="section-lead">
              Vous êtes un laboratoire, médecin ou cabinet ? Contactez-nous pour une démo personnalisée.
            </p>
          </div>

          <div className="contact-layout">
            {/* Infos de contact */}
            <div className="contact-info">
              <h3>Nos coordonnées</h3>
              
              <div className="info-item">
                <span className="icon">📍</span>
                <div>
                  <h4>Sousse, Tunisie</h4>
                  <p>Laboratoire BioScan</p>
                </div>
              </div>

              <div className="info-item">
                <span className="icon">📞</span>
                <div>
                  <h4>+216 98 765 432</h4>
                  <p>Lundi - Vendredi 8h-18h</p>
                </div>
              </div>

              <div className="info-item">
                <span className="icon">✉️</span>
                <div>
                  <h4>contact@bioscan.tn</h4>
                  <p>Réponse sous 24h</p>
                </div>
              </div>

              <div className="info-item">
                <span className="icon">🕒</span>
                <div>
                  <h4>Démo gratuite</h4>
                  <p>30min en visio</p>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <form className="contact-form" onSubmit={sendEmail}>
              <div className="form-group">
                <input type="text" name="name" placeholder="Votre nom *" required />
                <input type="email" name="email" placeholder="Votre email *" required />
              </div>
              
              <div className="form-group">
                <input type="text" name="company" placeholder="Laboratoire / Cabinet" />
                <input type="tel" name="phone" placeholder="Téléphone" />
              </div>

              <div className="form-group full">
                <textarea 
                  name="message" 
                  rows="5" 
                  placeholder="Votre message ou demande de démo *" 
                  required
                ></textarea>
              </div>

              <div className="form-group full">
                <label>
                  <input type="checkbox" name="demo" />
                  <span>Je souhaite une démo gratuite</span>
                </label>
              </div>

              <button type="submit" className="btn primary large">
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src={logoFonce} alt="BioScan" className="footer-logo" />
              <p>Comprendre sa santé simplement</p>
            </div>

            <div>
              <h4>Liens rapides</h4>
              <ul>
                <li><button onClick={() => scrollTo('accueil')}>Accueil</button></li>
                <li><button onClick={() => scrollTo('apropos')}>À propos</button></li>
                <li><button onClick={() => scrollTo('espaces')}>Nos espaces</button></li>
                <li><button onClick={() => scrollTo('services')}>Services</button></li>
                <li><button onClick={() => scrollTo('contact')}>Contact</button></li>
              </ul>
            </div>

            <div>
              <h4>Support</h4>
              <ul>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Confidentialité</a></li>
                <li><a href="#">Conditions</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} BioScan – Tous droits réservés</p>
            <p>Conçu et développé avec soin en Tunisie</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
