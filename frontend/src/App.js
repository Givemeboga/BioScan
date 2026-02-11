import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import BaseDashboardLayout from "./layouts/BaseDashboardLayout";
import MedecinLayout from "./layouts/MedecinLayout";
import TechnicienLayout from "./layouts/TechnicienLayout";
import AdminLayout from "./layouts/AdminLayout";

// Pages publiques / auth
import Welcome from "./pages/Welcome";
import AuthCard from "./components/Auth/AuthCard";
import SignUp from "./components/Auth/SignUp";
import OtpVerification from "./components/Auth/OtpVerification";
import ForgotPassword from "./components/Auth/ForgotPassword";
import TwoFactorSetup from "./components/Auth/TwoFactorSetup";

// Pages technicien
import TechnicienDashboard from "./pages/technicien/Dashboard";
import UploadFiles from "./pages/technicien/UploadFiles";
import FilesList from "./pages/technicien/FilesList"; // si existant

// Pages médecin
import MedecinDashboard from "./components/Médecin/BaseDashboardMedecin";
import TableauDeBord from "./pages/MedecinBiologiste/TableauDeBord";
import BilanBiologique from "./pages/MedecinBiologiste/BilanBiologique";
import RapportAnomalie from "./pages/MedecinBiologiste/RapportAnomalie";
import RapportMedicale from "./pages/MedecinBiologiste/RapportMedical";
import  Parametres from "./pages/MedecinBiologiste/Parametres";
import ProfilMedecin from "./pages/MedecinBiologiste/ProfilMedecin";
import NotificationMedecin from "./pages/MedecinBiologiste/Notification";

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

        {/* === Routes médecin (layout parent) === */}
        <Route element={<MedecinLayout />}>
          <Route path="/medecin-biologiste/tableau" element={<TableauDeBord />} />
          <Route path="/medecin-biologiste/bilan" element={<BilanBiologique />} />
          <Route path="/medecin-biologiste/rapports" element={<RapportAnomalie />} />
          <Route path="/medecin-biologiste/rapportAnomalie" element={<RapportAnomalie />} /> 
          <Route path="/medecin-biologiste/parametres" element={<Parametres />} /> 
          <Route path="/medecin-biologiste/profil" element={<ProfilMedecin />} /> 
          <Route path="/medecin-biologiste/notifications" element={<NotificationMedecin/>} /> 
              <Route path="/medecin-biologiste/rapportMédicale" element={<      RapportMedicale
/>} /> 
        </Route>

        {/* === Routes admin (layout parent) === */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<div style={{ padding: 40 }}><h2>Admin Dashboard</h2><p>Page à créer</p></div>} />
          <Route path="users" element={<div style={{ padding: 40 }}><h2>Gestion Utilisateurs</h2><p>Page à créer</p></div>} />
          <Route path="medecins" element={<div style={{ padding: 40 }}><h2>Gestion Médecins</h2><p>Page à créer</p></div>} />
          <Route path="techniciens" element={<div style={{ padding: 40 }}><h2>Gestion Techniciens</h2><p>Page à créer</p></div>} />
          <Route path="reports" element={<div style={{ padding: 40 }}><h2>Rapports</h2><p>Page à créer</p></div>} />
          <Route path="settings" element={<div style={{ padding: 40 }}><h2>Paramètres</h2><p>Page à créer</p></div>} />
          <Route path="profile" element={<div style={{ padding: 40 }}><h2>Profil Admin</h2><p>Page à créer</p></div>} />
          <Route path="notifications" element={<div style={{ padding: 40 }}><h2>Notifications</h2><p>Page à créer</p></div>} />
        </Route>

        {/* === Routes technicien (layout parent) : garder UNE seule déclaration === */}
        <Route path="/technicien" element={<TechnicienLayout />}>
          <Route index element={<TechnicienDashboard />} />
          <Route path="tableau" element={<TechnicienDashboard />} />
          <Route path="upload" element={<UploadFiles />} />
          <Route path="files" element={<FilesList />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/404" element={<div style={{ padding: 40, textAlign: "center" }}><h1>404</h1><p>Page non trouvée</p></div>} />
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;