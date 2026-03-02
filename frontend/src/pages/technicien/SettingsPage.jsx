import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Paper, Typography, Switch, FormControlLabel,
  Grid, Divider, List, ListItem, ListItemText, ListItemButton,
  Button, Select, MenuItem, FormControl, InputLabel,
  Alert, Tab, Tabs, Badge, Fade, Zoom, Chip, CircularProgress,
  Snackbar, ListItemSecondaryAction, IconButton,
  useTheme, useMediaQuery
} from "@mui/material";
import {
  Settings, Security, Notifications, Backup, Info, Palette, Language,
  Save, AutoSave, DarkMode, LightMode, ArrowForwardIos
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SETTINGS_TABS = [
  { label: "Général", icon: <Settings />, key: "general" },
  { label: "Sécurité", icon: <Security />, key: "security" },
  { label: "Notifications", icon: <Notifications />, key: "notifications" },
  { label: "Données", icon: <Backup />, key: "data" },
  { label: "À propos", icon: <Info />, key: "about" }
];

export default function SettingsTechnicien() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // États identiques à Profil
  const [tabValue, setTabValue] = useState("general");
  const [settings, setSettings] = useState({
    theme: "light",
    language: "fr",
    notifications: true,
    emailNotifications: true,
    soundAlerts: true,
    autoSave: true
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // SNACKBAR - IDENTIQUE À PROFIL
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Helpers snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Persistance localStorage
  useEffect(() => {
    const saved = localStorage.getItem('technicienSettings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('technicienSettings', JSON.stringify(settings));
    setHasChanges(true);
  }, [settings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeChange = (newTheme) => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
    showSnackbar("Thème appliqué !", "success");
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Simulate API
      await new Promise(r => setTimeout(r, 1000));
      showSnackbar("Paramètres sauvegardés ✅", "success");
      setHasChanges(false);
    } catch (error) {
      showSnackbar("Erreur sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSecurityClick = () => {
    showSnackbar("Page Sécurité...", "info");
    // navigate("/settings/security");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
      
      {/* HEADER */}
      <Fade in timeout={600}>
        <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Settings color="primary" sx={{ mr: 2, fontSize: 32 }} />
            <Box>
              <Typography variant="h3">Paramètres</Typography>
              <Typography color="text.secondary">
                Personnalisez votre expérience
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={hasChanges ? "Modifications non sauvegardées" : "À jour"}
            color={hasChanges ? "warning" : "success"}
            size="small"
          />
        </Paper>
      </Fade>

      {/* TABS + CONTENU */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ backgroundColor: "grey.50" }}
        >
          {SETTINGS_TABS.map(tab => (
            <Tab key={tab.key} value={tab.key} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>

        {/* GÉNÉRAL */}
        {tabValue === "general" && (
          <Fade in={tabValue === "general"}>
            <Box sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                Apparence & Comportement
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Thème</Typography>
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      <Chip
                        icon={<LightMode />}
                        label="Clair"
                        onClick={() => handleThemeChange("light")}
                        color={settings.theme === "light" ? "primary" : "default"}
                        clickable
                      />
                      <Chip
                        icon={<DarkMode />}
                        label="Sombre"
                        onClick={() => handleThemeChange("dark")}
                        color={settings.theme === "dark" ? "primary" : "default"}
                        clickable
                      />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Langue</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={settings.language}
                        onChange={(e) => handleToggle("language")}
                        label="Langue"
                      >
                        <MenuItem value="fr">Français</MenuItem>
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="ar">العربية</MenuItem>
                      </Select>
                    </FormControl>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Préférences</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Sauvegarde automatique" />
                        <Switch 
                          checked={settings.autoSave} 
                          onChange={() => handleToggle("autoSave")} 
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

        {/* SÉCURITÉ */}
        {tabValue === "security" && (
          <Fade in={tabValue === "security"}>
            <Box sx={{ p: 4 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                🔐 Gestion complète de la sécurité
              </Alert>
              <ListItemButton 
                onClick={handleSecurityClick}
                sx={{ 
                  p: 3, borderRadius: 2, 
                  border: "2px dashed", borderColor: "primary.main"
                }}
              >
                <Security sx={{ mr: 2, color: "primary.main", fontSize: 28 }} />
                <ListItemText 
                  primary="Page Sécurité dédiée"
                  secondary="Mot de passe • 2FA • Sessions actives"
                />
                <ListItemSecondaryAction>
                  <ArrowForwardIos />
                </ListItemSecondaryAction>
              </ListItemButton>
            </Box>
          </Fade>
        )}

        {/* NOTIFICATIONS */}
        {tabValue === "notifications" && (
          <Fade in={tabValue === "notifications"}>
            <Box sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                Notifications
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={<Switch checked={settings.notifications} onChange={() => handleToggle("notifications")} />}
                    label="Système"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={<Switch checked={settings.emailNotifications} onChange={() => handleToggle("emailNotifications")} />}
                    label="Email"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={<Switch checked={settings.soundAlerts} onChange={() => handleToggle("soundAlerts")} />}
                    label="Sons"
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

        {/* DATA & ABOUT - SIMPLIFIÉS */}
        {tabValue === "data" && (
          <Fade in={tabValue === "data"}>
            <Box sx={{ p: 4 }}>
              <List>
                <ListItem button><ListItemText primary="Exporter données" /></ListItem>
                <ListItem button><ListItemText primary="Télécharger rapports" /></ListItem>
                <ListItem sx={{ color: "error.main" }}>
                  <ListItemText primary="Supprimer compte" />
                </ListItem>
              </List>
            </Box>
          </Fade>
        )}

        {tabValue === "about" && (
          <Fade in={tabValue === "about"}>
            <Box sx={{ p: 4 }}>
              <List>
                <ListItem>
                  <ListItemText primary="Version" secondary="2.1.3 (Mars 2026)" />
                </ListItem>
                <ListItem button><ListItemText primary="Logs système" /></ListItem>
                <ListItem button><ListItemText primary="Support" /></ListItem>
              </List>
            </Box>
          </Fade>
        )}
      </Paper>

      {/* BOUTON SAUVEGARDE */}
      <Zoom in={hasChanges}>
        <Box sx={{ mt: 4, textAlign: "right" }}>
          <Button 
            variant="contained" 
            onClick={handleSaveAll}
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            disabled={!hasChanges || saving}
            size="large"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder tout"}
          </Button>
        </Box>
      </Zoom>

      {/* SNACKBAR - IDENTIQUE À PROFIL */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
