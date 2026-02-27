import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Paper, Avatar, Typography, Stack, Button, Divider,
  Grid, Chip, LinearProgress, IconButton, Menu, MenuItem,
  ListItemIcon, ListItemText, Modal, TextField, Fade,
  Alert, CircularProgress, Snackbar, useTheme,
  Card, CardContent, Badge, Fab, Zoom, Input
} from "@mui/material";
import {
  Person, Edit, Email, Phone, Work, Key, Logout, Update,
  Security, Notifications, Download, TrendingUp, Verified, Upload
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getCurrentTechnicien, logout, isAuthenticated,
  getProfilTechnicien, updateProfilTechnicien, getStatsTechnicien
} from "../../services/Technicien/authService";

const COLORS = {
  primary: "#0f9acf",
  primaryDark: "#163554",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  glass: "rgba(255, 255, 255, 0.25)"
};

export default function ProfilTechnicien() {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // States
  const [technicien, setTechnicien] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const safeIdDisplay = (id) => String(id || '').slice(-6).padStart(6, '0');

  // 🔄 CHARGEMENT PROFIL + STATS API
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiData = await getProfilTechnicien();
      if (!apiData) throw new Error("Profil non trouvé");

      setTechnicien(apiData);
      setFormData({
        fullName: apiData.fullName || apiData.username,
        email: apiData.email,
        telephone: apiData.telephone || "",
      });
      setImagePreview(apiData.photo_url || null);

      const apiStats = await getStatsTechnicien();
      setStats({
        analyses: apiStats?.analyses || 0,
        services: apiStats?.services || 0,
        satisfaction: apiStats?.satisfaction || 0,
        derniereConnexion: apiStats?.derniere_connexion || new Date().toISOString()
      });
    } catch (err) {
      console.error("💥 Erreur chargement:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // 💾 SAUVEGARDE PROFIL
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const payload = { ...formData };
      if (imageFile) payload.avatarFile = imageFile; // envoyer le fichier si modifié
      await updateProfilTechnicien(payload);
      setSnackbar({ open: true, message: "Profil mis à jour ! ✅", severity: "success" });
      setEditModal(false);
      loadProfile();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // 💡 Changement image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 
      }}>
        <Stack spacing={4} alignItems="center">
          <Zoom in timeout={600}>
            <CircularProgress size={80} sx={{ color: COLORS.primary }} thickness={4} />
          </Zoom>
          <Stack alignItems="center">
            <Typography variant="h5" fontWeight={600} color="text.primary">
              Chargement du profil...
            </Typography>
            <LinearProgress sx={{ width: 200, mt: 1, borderRadius: 10 }} color="primary" />
          </Stack>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Paper sx={{ p: 6, maxWidth: 500, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" onClick={loadProfile} startIcon={<Update />}>
              Réessayer
            </Button>
            <Button variant="outlined" onClick={handleLogout}>
              Reconnexion
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (!technicien) return <Typography>Aucun profil trouvé</Typography>;

  return (
    <Box sx={{ minHeight: "100vh", background: `linear-gradient(135deg, ${COLORS.glass} 0%, rgba(255,255,255,0.1) 100%)`, py: 4, px: 2 }}>
      {/* 🏆 HEADER AVATAR + STATS */}
      <Paper sx={{ maxWidth: 1200, mx: "auto", borderRadius: "24px", p: { xs: 3, md: 5 }, mb: 5, backdropFilter: "blur(20px)", background: COLORS.glass, boxShadow: `0 25px 50px -12px rgba(0,0,0,0.25)` }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={5} alignItems="center">
          <Stack alignItems="center" spacing={2}>
            <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<Verified sx={{ color: COLORS.success, fontSize: 20 }} />}>
              <Avatar
                src={imagePreview || "/default-avatar.png"}
                sx={{
                  width: 140, height: 140,
                  border: `5px solid ${COLORS.primary}`,
                  boxShadow: `0 20px 40px rgba(15, 154, 207, 0.3)`,
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                  fontSize: "2.5rem", fontWeight: 700
                }}
              >
                {technicien.fullName?.charAt(0) || technicien.username?.charAt(0)}
              </Avatar>
            </Badge>
            <Chip label={`TECH-${safeIdDisplay(technicien.id || technicien.user_id)}`} color="primary" variant="filled" size="small" />
          </Stack>

          <Box flex={1} textAlign={{ xs: "center", lg: "left" }}>
            <Typography variant="h3" fontWeight={800} mb={1} sx={{ background: COLORS.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {technicien.fullName || technicien.username}
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={2}>
              Technicien Biologiste Certifié
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent={{ xs: "center", lg: "flex-start" }}>
              <Chip icon={<Email />} label={technicien.email} color="primary" variant="outlined" />
              {technicien.telephone && <Chip icon={<Phone />} label={technicien.telephone} color="success" />}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" startIcon={<Edit />} onClick={() => setEditModal(true)} size="large" sx={{ borderRadius: "20px", px: 4, background: COLORS.gradient, boxShadow: `0 10px 30px rgba(102, 126, 234, 0.4)` }}>
              Modifier
            </Button>
            <Fab color="primary" size="medium" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ boxShadow: 0 }}>
              <Key />
            </Fab>
          </Stack>
        </Stack>
      </Paper>

      {/* 📊 STATS CARDS */}
      <Grid container spacing={4} sx={{ maxWidth: 1200, mx: "auto", mb: 5 }}>
        {[
          { title: "Analyses", value: stats?.analyses || 0, color: COLORS.primary, icon: TrendingUp },
          { title: "Services", value: stats?.services || 0, color: COLORS.success, icon: Work },
          { title: "Satisfaction", value: `${stats?.satisfaction || 0}%`, color: COLORS.warning, icon: Verified }
        ].map(({ title, value, color, icon: Icon }, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card sx={{ height: "100%", backdropFilter: "blur(15px)", background: COLORS.glass, border: "1px solid rgba(255,255,255,0.2)", transition: "all 0.3s", "&:hover": { transform: "translateY(-10px)", boxShadow: `0 25px 50px -12px ${color}20` } }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Icon sx={{ fontSize: 40, color }} />
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
                    <Typography variant="h3" fontWeight={800} sx={{ color }}>{value}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 📋 INFOS DÉTAILLÉES */}
      <Paper sx={{ maxWidth: 1200, mx: "auto", borderRadius: "24px", p: 5, mb: 5, backdropFilter: "blur(20px)", background: COLORS.glass }}>
        <Typography variant="h4" fontWeight={700} mb={4}>Informations Complètes</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Email sx={{ fontSize: 28, color: COLORS.primary }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="h6">{technicien.email}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Person sx={{ fontSize: 28, color: COLORS.primary }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Nom d'utilisateur</Typography>
                  <Typography variant="h6">{technicien.username}</Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Update sx={{ fontSize: 28, color: COLORS.warning }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Dernière connexion</Typography>
                  <Typography variant="h6">
                    {stats?.derniereConnexion ? new Date(stats.derniereConnexion).toLocaleString('fr-FR') : "Non disponible"}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Download sx={{ fontSize: 28, color: COLORS.success }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Total documents</Typography>
                  <Typography variant="h6">{stats?.analyses || 0}</Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 🎚️ FOOTER ACTIONS */}
      <Paper sx={{ maxWidth: 1200, mx: "auto", borderRadius: "24px", p: 4, backdropFilter: "blur(15px)", background: COLORS.glass }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2}>
            <Notifications sx={{ fontSize: 28, color: COLORS.primary }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Statut activité</Typography>
              <Typography variant="h6" color="success.main">En ligne</Typography>
            </Box>
          </Stack>
          <Button variant="contained" color="error" startIcon={<Logout />} onClick={handleLogout} size="large" sx={{ borderRadius: "20px", px: 4 }}>
            Déconnexion
          </Button>
        </Stack>
      </Paper>

      {/* 📱 MENU SÉCURITÉ */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: "16px", mt: 1 } }}>
        <MenuItem onClick={() => navigate("/technicien/securite")}>
          <ListItemIcon><Key /></ListItemIcon>
          <ListItemText>Changer mot de passe</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText>Déconnexion</ListItemText>
        </MenuItem>
      </Menu>

      {/* ✏️ MODAL ÉDITION */}
      <Modal open={editModal} onClose={() => setEditModal(false)}>
        <Fade in={editModal}>
          <Paper sx={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: 500 },
            p: 4, borderRadius: "24px",
            backdropFilter: "blur(20px)",
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
          }}>
            <Typography variant="h5" fontWeight={700} mb={3}>
              Modifier Profil
            </Typography>
            <Stack spacing={3}>
              {/* Image */}
              <Box textAlign="center">
                <Avatar src={imagePreview || "/static/default-avatar.png"} sx={{ width: 100, height: 100, mx: "auto", mb: 2 }} />
                <Button variant="outlined" component="label" startIcon={<Upload />}>
                  Changer Photo
                  <input hidden type="file" accept="image/*" onChange={handleImageChange} />
                </Button>
              </Box>

              <TextField label="Nom complet" value={formData.fullName || ""} onChange={(e) => setFormData({...formData, fullName: e.target.value})} fullWidth />
              <TextField label="Téléphone" value={formData.telephone || ""} onChange={(e) => setFormData({...formData, telephone: e.target.value})} fullWidth />
              <TextField label="Email" value={formData.email || ""} disabled fullWidth />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => setEditModal(false)}>Annuler</Button>
                <Button variant="contained" onClick={handleSaveProfile} disabled={saving} startIcon={saving ? <CircularProgress size={20} /> : null}>
                  {saving ? "Sauvegarde..." : "Enregistrer"}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Fade>
      </Modal>

      {/* 📢 SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({...prev, open: false}))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}