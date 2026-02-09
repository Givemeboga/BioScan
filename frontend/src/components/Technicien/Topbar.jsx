import React, { useRef, useCallback, useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  IconButton,
  Divider,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export default function Topbar({
  isSidebarOpen = true,
  onToggleSidebar = () => {},
  username = "tech.local",
  notifications = null,
  notificationsCount = undefined,
  onNotificationsOpen = () => {},
  onUploadClick = () => {},
  onProfile = () => {},
  onLogout = () => {},
  pageTitle = "Espace Technicien",
  themeMode = "light",
  onToggleTheme = () => {},
}) {
  const fileInputRef = useRef(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const defaultNotifs = useMemo(
    () => [
      { id: 1, title: "Upload réussi", message: "patient_2026-02-05.csv", time: "10:02", severity: "info" },
      { id: 2, title: "Erreur format", message: "bulk_2026-02.xlsx - colonnes manquantes", time: "09:54", severity: "error" },
      { id: 3, title: "Analyse terminée", message: "hemoglobine_anomalie.csv", time: "08:33", severity: "success" },
    ],
    []
  );

  const effectiveNotifs = notifications || defaultNotifs;
  const badgeCount = typeof notificationsCount === "number" ? notificationsCount : effectiveNotifs.length;

  const handleUploadBtnClick = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.click();
    else onUploadClick();
  }, [onUploadClick]);

  const onFileSelected = useCallback(
    (e) => {
      const f = e.target.files?.[0];
      if (f) {
        onUploadClick(f);
        e.target.value = "";
      }
    },
    [onUploadClick]
  );

  const openNotifs = (e) => {
    setNotifAnchor(e.currentTarget);
    onNotificationsOpen();
  };
  const closeNotifs = () => setNotifAnchor(null);

  const openProfile = (e) => setProfileAnchor(e.currentTarget);
  const closeProfile = () => setProfileAnchor(null);

  const handleProfile = () => {
    closeProfile();
    onProfile();
  };

  const handleLogout = () => {
    closeProfile();
    onLogout();
  };

  return (
    <header
      className={`technicien-layout__topbar ${isSidebarOpen ? "technicien-layout__topbar--sidebar-open" : ""}`}
      role="banner"
      aria-label="Topbar technicien"
    >
      {/* Left section */}
      <div className="technicien-layout__topbar-left">
        <button
          className="technicien-layout__topbar-btn-menu"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <MenuIcon style={{ color: "white" }} />
        </button>

        <h2 className="technicien-layout__topbar-page-title" aria-live="polite">
          {pageTitle}
        </h2>
      </div>

      {/* Right section */}
      <div className="technicien-layout__topbar-right">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFileSelected}
          style={{ display: "none" }}
        />

        <Tooltip title="Uploader un fichier">
          <Button
            className="technicien-layout__topbar-upload-btn"
            startIcon={<CloudUploadIcon />}
            onClick={handleUploadBtnClick}
            sx={{ color: "white" }}
          >
            Upload
          </Button>
        </Tooltip>

        {/* Notifications */}
        <button
          className="technicien-layout__topbar-btn-notif"
          title="Notifications"
          onClick={openNotifs}
          aria-haspopup="true"
          aria-controls={notifAnchor ? "technicien-topbar-notifs" : undefined}
        >
          <Badge badgeContent={badgeCount} color="error">
            <NotificationsIcon style={{ color: "white" }} />
          </Badge>
        </button>

        <Menu
          id="technicien-topbar-notifs"
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={closeNotifs}
          PaperProps={{ sx: { width: 360 } }}
        >
          <MenuItem disabled dense>
            <ListItemText
              primary="Notifications récentes"
              secondary={`${effectiveNotifs.length} éléments`}
            />
          </MenuItem>
          <Divider />
          {effectiveNotifs.length === 0 && (
            <MenuItem disabled>
              <ListItemText primary="Aucune notification" />
            </MenuItem>
          )}
          {effectiveNotifs.map((n) => (
            <MenuItem
              key={n.id}
              onClick={closeNotifs}
              sx={{ alignItems: "flex-start", whiteSpace: "normal" }}
            >
              <ListItemText
                primary={n.title}
                secondary={
                  <Box component="span" sx={{ display: "block", fontSize: 12, color: "text.secondary" }}>
                    {n.message}
                    <Box component="span" sx={{ display: "block", fontSize: 11, color: "text.disabled" }}>
                      {n.time}
                    </Box>
                  </Box>
                }
              />
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={closeNotifs} sx={{ justifyContent: "center", opacity: 0.85 }}>
            Voir toutes les notifications
          </MenuItem>
        </Menu>

        {/* Theme toggle */}
        <IconButton
          className="technicien-layout__topbar-theme-toggle"
          onClick={onToggleTheme}
          aria-label="Basculer thème"
          size="small"
        >
          {themeMode === "dark" ? <Brightness7Icon style={{ color: "white" }} /> : <Brightness4Icon style={{ color: "white" }} />}
        </IconButton>

        {/* Profile */}
        <div
          className="technicien-layout__topbar-user"
          title="Profil technicien"
          onClick={openProfile}
          onKeyDown={(e) => e.key === "Enter" && openProfile(e)}
          role="button"
          tabIndex={0}
          aria-haspopup="true"
          aria-controls={profileAnchor ? "technicien-topbar-profile" : undefined}
        >
          <Avatar className="technicien-layout__topbar-user-avatar" alt={username}>
            {username ? username.charAt(0).toUpperCase() : "T"}
          </Avatar>
          <Box className="technicien-layout__topbar-user-info">
            <Box className="technicien-layout__topbar-user-name">{username}</Box>
            <Box className="technicien-layout__topbar-user-role">Technicien</Box>
          </Box>
        </div>

        <Menu
          id="technicien-topbar-profile"
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={closeProfile}
        >
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profil</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Se déconnecter</ListItemText>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}

Topbar.propTypes = {
  isSidebarOpen: PropTypes.bool,
  onToggleSidebar: PropTypes.func,
  username: PropTypes.string,
  notifications: PropTypes.array,
  notificationsCount: PropTypes.number,
  onNotificationsOpen: PropTypes.func,
  onUploadClick: PropTypes.func,
  onProfile: PropTypes.func,
  onLogout: PropTypes.func,
  pageTitle: PropTypes.string,
  themeMode: PropTypes.string,
  onToggleTheme: PropTypes.func,
};
