import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import BaseDashboardLayout from "./layouts/BaseDashboardLayout";
import MedecinLayout from "./layouts/MedecinLayout";

// Pages publiques / auth
import Welcome from "./pages/Welcome";
import AuthCard from "./components/Auth/AuthCard";
import SignUp from "./components/Auth/SignUp";
import OtpVerification from "./components/Auth/OtpVerification";
import ForgotPassword from "./components/Auth/ForgotPassword";
import TwoFactorSetup from "./components/Auth/TwoFactorSetup";

// Pages technicien
import TechnicienDashboard from "./pages/technicien/Dashboard";

// Pages médecin
import MedecinDashboard from "./components/Médecin/BaseDashboardMedecin";
import TableauDeBord from "./pages/MedecinBiologiste/TableauDeBord";
import BilanBiologique from "./pages/MedecinBiologiste/BilanBiologique";
import RapportAnomalie from "./pages/MedecinBiologiste/RapportAnomalie";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Routes publiques */}
        <Route path="/" element={<Welcome />} />
        <Route path="/sign-in" element={<AuthCard />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<OtpVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/2fa-setup" element={<TwoFactorSetup />} />

        {/* Routes technicien */}
        <Route element={<BaseDashboardLayout />}>
          <Route path="/technicien" element={<TechnicienDashboard />} />
        </Route>

        {/* Routes médecin – toutes imbriquées sous le layout */}
        <Route element={<MedecinLayout />}>
          {/* Le dashboard principal (tableau de bord) */}
          <Route path="/medecin-biologiste" element={<MedecinDashboard />} />

          {/* Sous-pages */}
          <Route path="/medecin-biologiste/tableau" element={<TableauDeBord />} />
          <Route path="/medecin-biologiste/bilan" element={<BilanBiologique />} />

      
          {<Route path="/medecin-biologiste/rapports" element={<RapportAnomalie />} /> }
          {/* <Route path="/medecin-biologiste/parametres" element={<Parametres />} /> */}
        </Route>

        {/* Fallbacks */}
        <Route path="/404" element={<div style={{ padding: 40, textAlign: "center" }}>
          <h1>404</h1>
          <p>Page non trouvée</p>
        </div>} />
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;