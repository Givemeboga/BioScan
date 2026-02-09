import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Topbar from "../components/Technicien/Topbar";
import Sidebar from "../components/Technicien/Sidebar";
import useThemeMode from "../hooks/useThemeMode";
import { getCurrentUser } from "../services/Technicien/mockApi";
import "../components/Technicien/TechnicienLayout.css";

export default function TechnicienLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState({ username: "technicien" });
  const navigate = useNavigate();

  // Theme handling
  const { mode, toggle } = useThemeMode("light");

  // Récupération utilisateur (mock API)
  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((u) => {
        if (mounted && u) setUser(u);
      })
      .catch(() => {
        // keep default mock user
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Navigation / actions
  const handleUploadClick = () => navigate("/technicien/upload");
  const handleProfile = () => navigate("/technicien/profile");
  const handleLogout = () => {
    localStorage.removeItem("bioscan_user");
    navigate("/login", { replace: true });
  };

  // Shortcut clavier pour toggler sidebar (Ctrl+B)
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Nom affiché
  const username =
    user?.nom_utilisateur || user?.username || user?.email || "technicien";

  return (
   <div className={`technicien-layout theme-${mode}`}>
  <Topbar
    isSidebarOpen={isOpen}
    onToggleSidebar={() => setIsOpen((s) => !s)}
    username={username}
    notificationsCount={0}
    onUploadClick={handleUploadClick}
    onProfile={handleProfile}
    onLogout={handleLogout}
    pageTitle="Espace Technicien"
    themeMode={mode}
    onToggleTheme={toggle}
    className="technicien-layout__topbar"
  />

  <Sidebar isOpen={isOpen} className="technicien-layout__sidebar" />

  <main className={`technicien-layout__page-content ${isOpen ? "sidebar-open" : ""}`} role="main">
    <Outlet />
  </main>
</div>

  );
}
