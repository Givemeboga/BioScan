import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import SecurityIcon from "@mui/icons-material/Security";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import logo from "../../assets/logo.png";
import './TechnicienLayout.css'; // CSS spécifique

export default function Sidebar({ isOpen = true }) {
  const navigate = useNavigate();

  const menu = [
    { label: "Tableau de bord", icon: <DashboardIcon />, to: "/technicien" },
    { label: "Uploader", icon: <CloudUploadIcon />, to: "/technicien/upload" },
    { label: "Gestion fichiers", icon: <DescriptionIcon />, to: "/technicien/files" },
    { label: "Notifications", icon: <NotificationsIcon />, to: "/technicien/notifications" },
    { label: "Historique", icon: <HistoryIcon />, to: "/technicien/history" },
    { label: "Sécurité", icon: <SecurityIcon />, to: "/technicien/security" },
    { label: "Paramètres", icon: <SettingsIcon />, to: "/technicien/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("bioscan_user");
    navigate("/login");
  };

  return (
    <aside
      className={`technicien-layout__sidebar ${isOpen ? "technicien-layout__sidebar--open" : ""}`}
      aria-label="Sidebar technicien"
    >
      {/* Logo */}
      <div className="technicien-layout__sidebar-logo-wrap">
        <button
          className="technicien-layout__sidebar-logo-circle"
          onClick={() => navigate("/technicien")}
          aria-label="Retour au tableau de bord"
        >
          <img
            src={logo}
            alt="BioScan"
            width={72}
            height={72}
            className="technicien-layout__sidebar-logo-img"
          />
        </button>
      </div>

      <div className="technicien-layout__sidebar-divider" />

      {/* Menu */}
      <nav className="technicien-layout__sidebar-menu" aria-label="Menu technicien">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `technicien-layout__sidebar-menu-item ${isActive ? "technicien-layout__sidebar-menu-item--active" : ""}`
            }
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
          >
            <span className="technicien-layout__sidebar-menu-item-icon">{item.icon}</span>
            {isOpen && <span className="technicien-layout__sidebar-menu-item-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="technicien-layout__sidebar-divider" />

      {/* Footer */}
      <div className="technicien-layout__sidebar-footer">
        {isOpen && (
          <div className="technicien-layout__sidebar-footer-info">
            BioScan • SkySec
          </div>
        )}

        <button
          className="technicien-layout__sidebar-logout-btn"
          onClick={handleLogout}
          aria-label="Se déconnecter"
        >
          <span className="technicien-layout__sidebar-logout-icon">
            <ExitToAppIcon />
          </span>
          {isOpen && <span className="technicien-layout__sidebar-logout-label">Se déconnecter</span>}
        </button>
      </div>
    </aside>
  );
}
