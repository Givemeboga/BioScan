// 1️⃣ React + Améliorations UX/UI
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  Button,
  IconButton,
  Paper,
  Alert,
  Grid,
  LinearProgress,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip
} from "@mui/material";
import {
  Search,
  Refresh,
  CloudUpload,
  ErrorOutline,
  CheckCircle,
  NotificationsActive,
  Dashboard,
  FilePresent,
  Storage,
  Schedule,
  BarChart,
  MoreVert,
  Visibility,
  Today,
  AccessTimeFilled,
  CalendarToday,
   FileDownload
} from "@mui/icons-material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import UploadChart from "./UploadChart";
import StatCard from "./StatCard";
import UploadArea from "./UploadArea";
import { getAllBilans, getNotifications } from "../../services/Technicien/mockApi";

const localizer = momentLocalizer(moment);

const StatCardsContainer = ({ children }) => (
  <Box sx={{
    display: "grid",
    gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
    gap: { xs: 2, md: 3 },
    alignItems: "stretch"
  }}>
    {children}
  </Box>
);

const TechnicienLayout = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bilans, notifs] = await Promise.all([getAllBilans(), getNotifications()]);
      const uiFiles = bilans.map(bilan => ({
        id: bilan.bilan_id,
        filename: bilan.nom_fichier,
        status: bilan.statut === "VALIDE" ? "Terminé" : 
                bilan.statut === "EN_COURS" ? "En cours" : "Erreur",
        type: bilan.type || "PDF",
        size: bilan.taille || "2.4 Mo",
        source: bilan.source || "Scanner",
        date: new Date(bilan.date_generation).toLocaleDateString('fr-FR'),
        anomalies: bilan.anomaly_count || 0,
        progress: bilan.progress || 100,
        notes: bilan.notes || "",
        uploadedAt: bilan.date_generation
      })).slice(0, 100);

      setFiles(uiFiles);
      setNotifications(notifs);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleChange = () => loadData();
    window.addEventListener("bioscan_bilan_changed", handleChange);
    return () => window.removeEventListener("bioscan_bilan_changed", handleChange);
  }, [loadData]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const todayCount = files.filter(f => {
      const fileDate = new Date(f.uploadedAt);
      return fileDate.toDateString() === today.toDateString();
    }).length;
    
    const yesterdayCount = files.filter(f => {
      const fileDate = new Date(f.uploadedAt);
      return fileDate.toDateString() === yesterday.toDateString();
    }).length;

    return [
      { 
        title: "Aujourd'hui", 
        value: todayCount, 
        variant: "today",
        color: "#3B82F6",
        subtitle: `${todayCount} fichiers`,
        trend: todayCount >= yesterdayCount ? "up" : "down",
        icon: <Today />,
        trendValue: `vs ${yesterdayCount}`
      },
      { 
        title: "En cours", 
        value: files.filter(f => f.status === "En cours").length, 
        variant: "pending",
        color: "#F59E0B",
        subtitle: "Traitement actif",
        icon: <AccessTimeFilled />
      },
      { 
        title: "Erreurs", 
        value: files.filter(f => f.status === "Erreur").length, 
        variant: "error",
        color: "#EF4444",
        subtitle: "À corriger",
        icon: <ErrorOutline />
      },
      { 
        title: "Validées", 
        value: files.filter(f => f.status === "Terminé").length, 
        variant: "success",
        color: "#10B981",
        subtitle: "Terminées",
        icon: <CheckCircle />
      }
    ];
  }, [files]);

  const calendarEvents = useMemo(() => 
    files.map(file => ({
      id: file.id,
      title: `${file.status === "Erreur" ? "❌" : "✅"} ${file.filename.substring(0, 20)}...`,
      start: new Date(file.uploadedAt),
      end: new Date(new Date(file.uploadedAt).getTime() + 60 * 60 * 1000),
      status: file.status,
      anomalies: file.anomalies,
      allDay: false,
      color: file.status === "Erreur" ? "#ef4444" : file.status === "En cours" ? "#f59e0b" : "#10b981"
    })), [files]);

  const filteredFiles = useMemo(() => {
    const result = files.filter(f => 
      f.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.date.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return result.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [searchTerm, files]);

  const exportToCSV = useCallback(() => {
    const headers = ['ID', 'Fichier', 'Statut', 'Date', 'Anomalies', 'Taille', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredFiles.map(f => [
        f.id,
        `"${f.filename.replace(/"/g, '""')}"`,
        f.status,
        f.date,
        f.anomalies,
        f.size,
        `"${f.notes.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bilans_technicien_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredFiles]);

  const statusColors = { "En cours": "warning", "Erreur": "error", "Terminé": "success" };
  const statusIcons = {
    "En cours": <Schedule fontSize="small" />,
    "Erreur": <ErrorOutline fontSize="small" />,
    "Terminé": <CheckCircle fontSize="small" />
  };

  const FileDetailsModal = React.memo(({ file, onClose, onUpdate }) => {
    const [notes, setNotes] = useState("");
    
    useEffect(() => { 
      if (file) setNotes(file.notes || ""); 
    }, [file]);

    if (!file) return null;

    const getStatusConfig = (status) => {
      const s = status?.toString().toUpperCase() || "";
      if (["VALIDE", "TERMINE", "TERMINÉ"].includes(s)) 
        return { color: "#2E7D32", bg: "#E8F5E9", icon: <CheckCircle /> };
      if (["EN_COURS", "EN COURS"].includes(s)) 
        return { color: "#1565C0", bg: "#E3F2FD", icon: <Schedule /> };
      if (["ERREUR"].includes(s)) 
        return { color: "#C62828", bg: "#FDECEA", icon: <ErrorOutline /> };
      return { color: "#374151", bg: "#F3F4F6", icon: <CloudUpload /> };
    };

    const statusConfig = getStatusConfig(file.status);

    return (
      <Dialog open={Boolean(file)} onClose={onClose} fullWidth maxWidth="md" 
        PaperProps={{ sx: { borderRadius: 3, maxHeight: "90vh" } }}>
        <DialogTitle sx={{ 
          fontWeight: 700, fontSize: "1.2rem", borderBottom: "1px solid", 
          borderColor: "divider", backgroundColor: "grey.50", p: 3 
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ bgcolor: "primary.50", p: 1.5, borderRadius: 2 }}>
              <FilePresent sx={{ fontSize: 32, color: "primary.main" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800}>Détails du fichier</Typography>
              <Typography variant="h6" color="text.secondary">{file.filename}</Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4, maxHeight: "60vh", overflow: "auto" }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                📋 Informations générales
              </Typography>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    ID :
                  </Typography>
                  <Chip label={`#${file.id}`} color="primary" size="small" sx={{ fontWeight: 700 }} />
                </Stack>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    Statut :
                  </Typography>
                  <Chip label={file.status} size="small" icon={statusConfig.icon} sx={{
                    fontWeight: 700, bgcolor: statusConfig.bg, color: statusConfig.color
                  }} />
                </Stack>
                <Stack direction="row" spacing={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    Taille :
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>{file.size}</Typography>
                </Stack>
                <Stack direction="row" spacing={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    Uploadé :
                  </Typography>
                  <Typography variant="body2">
                    {file.uploadedAt ? new Date(file.uploadedAt).toLocaleString('fr-FR') : "-"}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {file.anomalies > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: "warning.main", fontWeight: 700 }}>
                  ⚠️ {file.anomalies} anomalie(s) détectée(s)
                </Typography>
                <Chip label={`${file.anomalies} erreurs`} color="warning" icon={<ErrorOutline />} 
                  size="medium" sx={{ fontWeight: 700, height: 40 }} />
              </Box>
            )}

            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>📝 Notes</Typography>
              <TextField 
                multiline minRows={4} fullWidth 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez vos observations..." 
                variant="outlined" 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 4, py: 2.5, borderTop: "1px solid", borderColor: "divider", gap: 2 }}>
          <Button onClick={onClose} variant="outlined" size="large" 
            sx={{ textTransform: "none", borderRadius: 2, px: 4, flex: 1 }}>
            Fermer
          </Button>
          <Button variant="contained" size="large" 
            onClick={() => onUpdate({ ...file, notes })} 
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, px: 4, flex: 1 }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    );
  });

  const handleFileClick = useCallback((file) => setSelectedFile(file), []);
  const handleUpdateFile = useCallback((updatedFile) => {
    setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
    setSelectedFile(null);
  }, []);

  if (isLoading) {
    return (
      <Fade in>
        <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", p: 3 }}>
          <Stack spacing={3} alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
            <Refresh sx={{ fontSize: 60, color: "primary.main", animation: 'spin 1s linear infinite' }} />
            <Typography variant="h5" color="text.secondary">Actualisation des données...</Typography>
            <LinearProgress sx={{ width: 300 }} />
          </Stack>
        </Box>
      </Fade>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", p: { xs: 2, md: 3 } }}>
      {/* HEADER PRINCIPAL */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Dashboard sx={{ fontSize: 48, color: "primary.main" }} />
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 900 }}>Dashboard Technicien</Typography>
              <Typography variant="h6" color="text.secondary">
                {files.length} fichiers | {notifications.filter(n => n.statut === "UNREAD").length} notifications
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Exporter tous les fichiers en CSV">
              <Button 
                variant="outlined" 
                startIcon={<FileDownload />}
                onClick={exportToCSV}
                sx={{ 
                  textTransform: "none", 
                  borderRadius: 2, 
                  px: 3,
                  borderColor: "success.main",
                  color: "success.main",
                  "&:hover": { borderColor: "success.dark", bgcolor: "success.50" }
                }}
              >
                Exporter CSV
              </Button>
            </Tooltip>
            <Tooltip title="Actualiser les données">
              <IconButton 
                sx={{ 
                  width: 56, height: 56, bgcolor: "primary.50",
                  color: "primary.main",
                  "&:hover": { 
                    bgcolor: "primary.200",
                    transform: "rotate(90deg)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  }
                }} 
                onClick={loadData}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* STATS - HIÉRARCHIE AMÉLIORÉE */}
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 3, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, display: "flex", alignItems: "center" }}>
          <BarChart sx={{ mr: 2, fontSize: 36 }} />Statistiques du jour
        </Typography>
        <StatCardsContainer>
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </StatCardsContainer>
      </Paper>

      {/* CALENDRIER + CHART - CONTRASTE ET ALIGNEMENT PARFAITS */}
      <Grid container spacing={0} sx={{ mb: 5 }}>
        {/* CALENDRIER - CONTRASTE AMÉLIORÉ */}
        <Grid item xs={12} lg={6} sx={{ px: { lg: 2 } }}>
          <Paper sx={{
            p: 3, height: "100%", borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column",
            // ✅ CONTRASTE CALENDRIER CORRIGÉ
            "& .rbc-month-view, & .rbc-day-bg": {
              backgroundColor: "#ffffff !important",
              color: "#1e293b !important",
              border: "1px solid #e2e8f0"
            },
            "& .rbc-selected": {
              backgroundColor: "#3b82f6 !important",
              color: "white !important",
              fontWeight: 700,
              borderRadius: "8px"
            },
            "& .rbc-today": {
              backgroundColor: "#eff6ff !important",
              fontWeight: 600
            },
            "& .rbc-event": {
              backgroundColor: "#3b82f6 !important",
              border: "none !important",
              color: "white !important",
              fontWeight: 600,
              borderRadius: "6px !important",
              fontSize: "0.85rem"
            },
            "& .rbc-toolbar button:active, & .rbc-toolbar button.rbc-active": {
              backgroundColor: "#3b82f6 !important",
              color: "white !important",
              borderRadius: "8px"
            },
            "& .rbc-toolbar button": {
              color: "#374151",
              fontWeight: 500,
              borderRadius: "8px",
              padding: "8px 16px"
            }
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <CalendarToday sx={{ fontSize: 28, color: "primary.main" }} />
                <Typography variant="h4" fontWeight={800} sx={{ color: "text.primary" }}>
                  Planning des uploads
                </Typography>
              </Stack>
              <Chip label={`${calendarEvents.length}`} 
                    size="small" 
                    color="primary" 
                    sx={{ fontSize: '0.75rem', height: 24 }} />
            </Stack>
            <Box sx={{ flexGrow: 1 }}>
              <Calendar 
                localizer={localizer} 
                culture="fr-FR"
                events={calendarEvents}
                startAccessor="start" 
                endAccessor="end" 
                style={{ height: "100%" }}
                messages={{
                  next: "Suivant",
                  previous: "Précédent", 
                  today: "Aujourd'hui",
                  month: "Mois",
                  week: "Semaine",
                  day: "Jour",
                  agenda: "Agenda"
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* CHART - PLEIN ÉCRAN */}
        <Grid item xs={12} lg={6} sx={{ px: { lg: 2 } }}>
          <Paper sx={{
            p: 3, height: "100%", borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column"
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <BarChart sx={{ fontSize: 28, color: "primary.main" }} />
                <Typography variant="h4" fontWeight={800} sx={{ color: "text.primary" }}>
                  7 derniers jours
                </Typography>
              </Stack>
              <Chip label="En direct" color="success" size="small" sx={{ height: 24 }} />
            </Stack>
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <UploadChart files={files} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* PRINCIPAL LAYOUT - TABLE + NOTIFICATIONS */}
      <Grid container spacing={4}>
        <Grid item xs={12} lg={9}>
          <Paper sx={{ 
            borderRadius: 3, 
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)", 
            overflow: "hidden",
            border: "1px solid #e5e7eb"
          }}>
            <Box sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Storage sx={{ fontSize: 36, color: "primary.main" }} />
                  <Typography variant="h3" sx={{ fontWeight: 900 }}>Fichiers récents</Typography>
                </Stack>
                <Chip label={`${filteredFiles.length}`} color="primary" size="large" />
              </Stack>
              
              <Stack direction="row" spacing={2} sx={{ mb: 4, alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                  size="small" 
                  placeholder="Rechercher fichiers, statuts, dates..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flex: 1, minWidth: 350 }} 
                  InputProps={{ startAdornment: <Search /> }}
                />
                <UploadArea onUploadComplete={f => console.log("Uploadé:", f)} />
              </Stack>
            </Box>

            <TableContainer sx={{ maxHeight: 650 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.50" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1.1rem" }}>Fichier</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1.1rem" }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Anomalies</TableCell>
                    <TableCell sx={{ width: 120 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFiles
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(file => (
                    <TableRow key={file.id} hover sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ bgcolor: "primary.50", p: 1, borderRadius: 2 }}>
                            <FilePresent sx={{ fontSize: 20, color: "primary.main" }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 600 }} noWrap>{file.filename}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {file.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={file.status} 
                          icon={statusIcons[file.status]} 
                          color={statusColors[file.status]} 
                          size="small" 
                          sx={{ fontWeight: 700 }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{file.date}</Typography>
                      </TableCell>
                      <TableCell>
                        {file.anomalies > 0 ? (
                          <Chip label={file.anomalies} color="warning" size="small" />
                        ) : (
                          <Chip label="✓ Parfait" color="success" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir les détails">
                          <IconButton 
                            size="small" 
                            onClick={() => handleFileClick(file)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Actions">
                          <IconButton size="small">
                            <MoreVert />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]} 
              count={filteredFiles.length}
              rowsPerPage={rowsPerPage} 
              page={page}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(_, v) => { setRowsPerPage(v); setPage(0); }}
              sx={{ px: 4, py: 3, borderTop: 1, bgcolor: "grey.50" }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} lg={3}>
          <Paper sx={{ 
            p: 3, 
            height: "100%", 
            borderRadius: 3, 
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
            display: "flex", 
            flexDirection: "column" 
          }}>
            <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
              <NotificationsActive sx={{ fontSize: 28, color: "warning.main" }} />
              <Typography variant="h5" sx={{ fontWeight: 800, flex: 1 }}>Notifications</Typography>
              <Chip 
                label={notifications.filter(n => n.statut === "UNREAD").length} 
                color="warning" 
                size="small" 
              />
            </Stack>
            <Stack spacing={2} sx={{ flex: 1 }}>
              {notifications.slice(0, 5).map(notif => (
                <Alert key={notif.notification_id} 
                  severity={notif.titre.includes("Erreur") ? "warning" : "info"}
                >
                  <strong>{notif.titre}</strong>: {notif.description}
                </Alert>
              ))}
              {notifications.length === 0 && (
                <Alert severity="info">Aucune notification pour le moment</Alert>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <FileDetailsModal 
        file={selectedFile} 
        onClose={() => setSelectedFile(null)}
        onUpdate={handleUpdateFile}
        key={selectedFile?.id}
      />

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default TechnicienLayout;
