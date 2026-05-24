import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
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
import LoginBioScan from "./pages/technicien/Login";

// Pages technicien
import TechnicienDashboard from "./pages/technicien/Dashboard";
import UploadFiles from "./pages/technicien/UploadFiles";
import FilesList from "./pages/technicien/FilesList";
import BilanDetails from "./components/Technicien/FilesDetailsModal";
import ProfilTechnicien from "./pages/technicien/Profil";
import NotificationsPage from "./pages/technicien/NotificationsPage";
import SettingsPage from "./pages/technicien/SettingsPage";
import ProtectedTechnicienRoute from "./routes/ProtectedTechnicienRoute";

// Pages médecin
import MedecinDashboard from "./components/Médecin/BaseDashboardMedecin";
import TableauDeBord from "./pages/MedecinBiologiste/TableauDeBord";
import BilanBiologique from "./pages/MedecinBiologiste/BilanBiologique";
import RapportAnomalie from "./pages/MedecinBiologiste/RapportAnomalie";
import RapportMedicale from "./pages/MedecinBiologiste/RapportMedical";
import ParametresMedecin from "./pages/MedecinBiologiste/Parametres";
import ProfilMedecin from "./pages/MedecinBiologiste/ProfilMedecin";
import NotificationMedecin from "./pages/MedecinBiologiste/NotificationsMedecin";

// Pages patient
import VisiteurPage from "./pages/Patient/HomePage";
import PatientDashboard from "./pages/Patient/PatientDashboard";
import PatientLayout from "./pages/Patient/PatientLayout";
import DashboardHome from "./pages/Patient/DashboardHome";
import MesBilans from "./pages/Patient/MesBilans";
import Rapport from "./pages/Patient/MesRapports";
import Parametres from "./pages/Patient/Parametres";
import Profil from "./pages/Patient/Profil";
import Notifications from "./pages/Patient/Notifications";

// Admin pages
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/Users";
import AdminMedecins from "./pages/Admin/Medecins";
import AdminTechniciens from "./pages/Admin/Techniciens";
import AdminReports from "./pages/Admin/Reports";
import AdminParametres from "./pages/Admin/Parametres";
import AdminProfile from "./pages/Admin/AdminProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Welcome />} />
        <Route path="/f" element={<Welcome />} />
        <Route path="/sign-in" element={<AuthCard />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<OtpVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/2fa-setup" element={<TwoFactorSetup />} />
        <Route path="/login-technicien" element={<LoginBioScan />} />

        {/* === Routes médecin (layout parent) === */}
        <Route element={<MedecinLayout />}>
          <Route path="/medecin-biologiste" element={<MedecinDashboard />} />
          <Route path="/medecin-biologiste/tableau" element={<TableauDeBord />} />
          <Route path="/medecin-biologiste/bilan" element={<BilanBiologique />} />
          <Route path="/medecin-biologiste/rapports" element={<RapportAnomalie />} />
          <Route path="/medecin-biologiste/rapportAnomalie" element={<RapportAnomalie />} />
          <Route path="/medecin-biologiste/parametres" element={<ParametresMedecin />} />
          <Route path="/medecin-biologiste/profil" element={<ProfilMedecin />} />
          <Route path="/medecin-biologiste/notifications" element={<NotificationMedecin />} />
          <Route path="/medecin-biologiste/rapportMédicale" element={<RapportMedicale />} />
        </Route>

        {/* === Routes admin (layout parent) === */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="medecins" element={<AdminMedecins />} />
          <Route path="techniciens" element={<AdminTechniciens />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="parametres" element={<AdminParametres />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route
            path="notifications"
            element={<div style={{ padding: 40 }}><h2>Notifications</h2><p>Page à créer</p></div>}
          />
        </Route>

        {/* === Routes technicien (layout parent) === */}
        <Route
          path="/technicien"
          element={
            <ProtectedTechnicienRoute>
              <TechnicienLayout />
            </ProtectedTechnicienRoute>
          }
        >
          <Route index element={<TechnicienDashboard />} />
          <Route path="tableau" element={<TechnicienDashboard />} />
          <Route path="upload" element={<UploadFiles />} />
          <Route path="files" element={<FilesList />} />
          <Route path="bilans/:bilanId" element={<BilanDetails />} />
          <Route path="profil" element={<ProfilTechnicien />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* === Routes patient standalone === */}
        <Route path="/patient/Home" element={<PatientDashboard />} />

        {/* === Routes patient avec layout === */}
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="mes-bilans" element={<MesBilans />} />
          <Route path="rapport" element={<Rapport />} />
          <Route path="parametres" element={<Parametres />} />
          <Route path="profil" element={<Profil />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Fallbacks */}
        <Route
          path="/404"
          element={<div style={{ padding: 40, textAlign: "center" }}><h1>404</h1><p>Page non trouvée</p></div>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;