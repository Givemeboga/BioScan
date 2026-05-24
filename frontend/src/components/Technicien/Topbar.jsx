import React, { useRef, useCallback, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  IconButton,
  Box,
  Skeleton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from "@mui/icons-material";
import NotificationsPopover from "./NotificationsPopover";  // ← RELATIF
import {
  isAuthenticated,
  getProfilTechnicien,
} from "../../services/Technicien/authService";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification as deleteNotifAPI,
} from "../../services/Technicien/notificationService";

export default function Topbar({
  isSidebarOpen = true,
  onToggleSidebar = () => {},
  onUploadClick = () => {},
  onProfile = () => {},
  onLogout = () => {},
  pageTitle = "Espace Technicien",
  themeMode = "light",
  onToggleTheme = () => {},
}) {
  const navigate = useNavigate();
  const handleProfileClick = () => {
  closeProfile();
  navigate("/technicien/profil");
};
  const fileInputRef = useRef(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [currentTechnicien, setCurrentTechnicien] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ÉTAT NOTIFICATIONS (passé au composant)
  const [notificationsData, setNotificationsData] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState("");

  /* PROFIL */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated()) {
        setLoadingUser(false);
        return;
      }
      try {
        const data = await getProfilTechnicien();
        setCurrentTechnicien(data);
      } catch (e) {
        console.error("Erreur profil:", e);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchProfile();
  }, []);

  /* NOTIFICATIONS */
  const mapNotificationData = useCallback((n) => ({
    id: n.notification_id,
    title: n.titre,
    message: n.description,
    severity: n.statut === "UNREAD" ? "info" : "success",
    date: n.date_generation,
  }), []);

  const fetchNotifs = async () => {
    try {
      const rawData = await getNotifications();
      const countData = await getUnreadCount();
      const mapped = (rawData || []).map(mapNotificationData);
      setNotificationsData(mapped);
      setNotifCount(countData?.count || 0);
    } catch (err) {
      console.error("Erreur notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  /* ACTIONS NOTIFICATIONS */
  const handleMarkAsRead = async (id) => {
    setLoading(true);
    try {
      await markAsRead(id);
      setNotificationsData((prev) =>
        prev.map((n) => n.id === id ? { ...n, severity: "success" } : n)
      );
      setNotifCount((prev) => Math.max(0, prev - 1));
      setActionFeedback("Notification marquée comme lue ✅");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteNotifAPI(id);
      setNotificationsData((prev) => prev.filter((n) => n.id !== id));
      setActionFeedback("Notification supprimée 🗑️");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      await markAllAsRead();
      setNotificationsData((prev) =>
        prev.map((n) => ({ ...n, severity: "success" }))
      );
      setNotifCount(0);
      setActionFeedback("Toutes marquées comme lues ✅");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* USER */
  const displayUsername = useMemo(() =>
    currentTechnicien?.nom_utilisateur || currentTechnicien?.username || "Technicien",
  [currentTechnicien]);

  /* HANDLERS */
  const handleUploadBtnClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileSelected = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadClick(file);
      e.target.value = "";
    }
  }, [onUploadClick]);

  const openProfile = (e) => setProfileAnchor(e.currentTarget);
  const closeProfile = () => setProfileAnchor(null);

  return (
    <header className={`technicien-layout__topbar ${isSidebarOpen ? "technicien-layout__topbar--sidebar-open" : ""}`}>
      {/* LEFT */}
      <div className="technicien-layout__topbar-left">
        <IconButton onClick={onToggleSidebar}>
          <MenuIcon style={{ color: "white" }} />
        </IconButton>
        <h2 className="technicien-layout__topbar-page-title">{pageTitle}</h2>
      </div>

      {/* RIGHT */}
      <div className="technicien-layout__topbar-right">
        {/* UPLOAD */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFileSelected}
          style={{ display: "none" }}
        />
        <Tooltip title="Uploader">
          <Button startIcon={<CloudUploadIcon />} onClick={handleUploadBtnClick} sx={{ color: "white" }}>
            Upload
          </Button>
        </Tooltip>

        {/* NOTIFICATIONS ← COMPOSANT RÉUTILISABLE */}
        <NotificationsPopover
          notificationsData={notificationsData}
          notifCount={notifCount}
          loading={loading}
          actionFeedback={actionFeedback}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
          onMarkAllAsRead={handleMarkAll}
        />

        {/* THEME */}
        <IconButton onClick={onToggleTheme}>
          {themeMode === "dark" ? (
            <Brightness7Icon style={{ color: "white" }} />
          ) : (
            <Brightness4Icon style={{ color: "white" }} />
          )}
        </IconButton>

        {/* USER */}
        <div className="technicien-layout__topbar-user" onClick={openProfile}>
          {loadingUser ? (
            <Skeleton variant="circular" width={40} height={40} />
          ) : (
            <Avatar src={currentTechnicien?.photo_url || ""}>
              {displayUsername.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <Box>
            <Typography variant="body2">{displayUsername}</Typography>
            <Typography variant="caption" color="text.secondary">
              Technicien
            </Typography>
          </Box>
        </div>

        {/* PROFILE MENU */}
        <Menu
  anchorEl={profileAnchor}
  open={Boolean(profileAnchor)}
  onClose={closeProfile}
  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  transformOrigin={{ vertical: "top", horizontal: "right" }}
  PaperProps={{
    sx: {
      width: 240,
      mt: 1,
      borderRadius: 3,
      boxShadow: 6,
      overflow: "hidden",
    },
  }}
>

  {/* HEADER PROFIL */}
  <Box
    sx={{
      p: 2,
      textAlign: "center",
      background: "linear-gradient(135deg, #1976d2, #42a5f5)",
      color: "white",
    }}
  >
    <Avatar
      src={currentTechnicien?.photo_url || ""}
      sx={{
        width: 52,
        height: 52,
        margin: "0 auto 8px auto",
        border: "2px solid white",
        fontSize: 20,
        fontWeight: "bold"
      }}
    >
      {displayUsername?.charAt(0)?.toUpperCase()}
    </Avatar>

    <Typography variant="subtitle1" fontWeight="bold">
      {displayUsername}
    </Typography>

    <Typography variant="caption">
      Technicien
    </Typography>
  </Box>

  <Divider />

  {/* PROFIL */}
  <MenuItem
    onClick={() => {
      closeProfile();
      handleProfileClick();
    }}
    sx={{
      py: 1.2,
      px: 2,
      gap: 1,
      transition: "0.2s",
      "&:hover": {
        backgroundColor: "#e3f2fd",
        transform: "translateX(4px)",
      },
    }}
  >
    <ListItemIcon sx={{ minWidth: 30 }}>
      <PersonIcon color="primary" />
    </ListItemIcon>

    <Typography fontWeight={500}>
      Mon profil
    </Typography>
  </MenuItem>

  {/* LOGOUT */}
  <MenuItem
    onClick={() => {
      closeProfile();
      onLogout();
    }}
    sx={{
      py: 1.2,
      px: 2,
      gap: 1,
      transition: "0.2s",
      "&:hover": {
        backgroundColor: "#ffebee",
        transform: "translateX(4px)",
      },
    }}
  >
    <ListItemIcon sx={{ minWidth: 30 }}>
      <LogoutIcon color="error" />
    </ListItemIcon>

    <Typography color="error" fontWeight={500}>
      Déconnexion
    </Typography>
  </MenuItem>

</Menu>
      </div>
    </header>
  );
}

Topbar.propTypes = {
  isSidebarOpen: PropTypes.bool,
  onToggleSidebar: PropTypes.func,
  onUploadClick: PropTypes.func,
  onProfile: PropTypes.func,
  onLogout: PropTypes.func,
  pageTitle: PropTypes.string,
  themeMode: PropTypes.string,
  onToggleTheme: PropTypes.func,
};
