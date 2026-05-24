// components/Technicien/TechnicienLayout.jsx - VERSION 100% FONCTIONNELLE
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box, Stack, Typography, Chip, Button, IconButton, Paper, Alert,
  Grid, LinearProgress, Fade, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Tooltip, Snackbar, CircularProgress
} from "@mui/material";
import {
  Search, Refresh, CloudUpload, ErrorOutline, CheckCircle,
  NotificationsActive, Dashboard, FilePresent, Schedule, BarChart,
  MoreVert, Visibility, Today, AccessTimeFilled, CalendarToday, FileDownload
} from "@mui/icons-material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// ✅ IMPORTS SERVICES ET COMPOSANTS LOCAUX
import { getAllBilans, updateBilan } from "../../services/Technicien/bilanService.js";
import StatCard from "./StatCard";
import UploadChart from "./UploadChart";
import UploadArea from "./UploadArea";
import FileDetailsModal from "./FilesDetailsModal";
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
  // États principaux
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [error, setError] = useState(null);

  // Chargement données avec service réel ✅
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const bilans = await getAllBilans();
      
      const uiFiles = bilans.map(bilan => ({
        id: bilan.bilan_id,
        filename: bilan.nom_fichier || `Bilan_${bilan.bilan_id}`,
        status: bilan.statut === "VALIDE" ? "Terminé" : 
                bilan.statut === "EN_COURS" ? "En cours" : "Erreur",
        type: bilan.type || "PDF",
        size: bilan.taille ? formatFileSize(bilan.taille) : "N/A",
        date: bilan.date_generation ? new Date(bilan.date_generation).toLocaleDateString('fr-FR') : "N/A",
        anomalies: bilan.anomaly_count || 0,
        progress: bilan.progress || 100,
        notes: bilan.notes || "",
        uploadedAt: bilan.date_generation,
        rawData: bilan
      }));

      setFiles(uiFiles);
    } catch (error) {
      setError(error.message);
      showSnackbar(`Erreur: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Chargement automatique au montage du composant
useEffect(() => {
  loadData();
}, [loadData]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  // Stats calculées
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
        title: "Aujourd'hui", value: todayCount, variant: "today",
        color: "#3B82F6", subtitle: `${todayCount} fichiers`,
        trend: todayCount >= yesterdayCount ? "up" : "down",
        icon: <Today />, trendValue: `vs ${yesterdayCount}`
      },
      { 
        title: "En cours", value: files.filter(f => f.status === "En cours").length, 
        variant: "pending", color: "#F59E0B", subtitle: "Traitement actif",
        icon: <AccessTimeFilled />
      },
      { 
        title: "Erreurs", value: files.filter(f => f.status === "Erreur").length, 
        variant: "error", color: "#EF4444", subtitle: "À corriger",
        icon: <ErrorOutline />
      },
      { 
        title: "Validées", value: files.filter(f => f.status === "Terminé").length, 
        variant: "success", color: "#10B981", subtitle: "Terminées",
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
      color: file.status === "Erreur" ? "#ef4444" : 
             file.status === "En cours" ? "#f59e0b" : "#10b981"
    })), [files]);

  const filteredFiles = useMemo(() => {
    const result = files.filter(f => 
      f.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.date.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return result.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [searchTerm, files]);

  // Export CSV
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
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredFiles]);

  // Mise à jour avec service réel ✅
  const handleUpdateFile = useCallback(async (updatedFile) => {
    try {
      await updateBilan(updatedFile.id, { notes: updatedFile.notes });
      setFiles(prev => prev.map(f => f.id === updatedFile.id ? { ...f, notes: updatedFile.notes } : f));
      showSnackbar("Notes mises à jour !", "success");
    } catch (error) {
      showSnackbar(`Erreur: ${error.message}`, "error");
    }
    setSelectedFile(null);
  }, []);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // Loading
  if (isLoading) {
    return (
      <Fade in>
        <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", p: 3 }}>
          <Stack spacing={3} alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
            <CircularProgress size={60} sx={{ color: "primary.main" }} />
            <Typography variant="h5" color="text.secondary">Chargement des bilans...</Typography>
            <LinearProgress sx={{ width: 300 }} />
          </Stack>
        </Box>
      </Fade>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", p: { xs: 2, md: 3 } }}>
      {/* HEADER */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Dashboard sx={{ fontSize: 48, color: "primary.main" }} />
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 900 }}>Dashboard Technicien</Typography>
              <Typography variant="h6" color="text.secondary">
                {files.length} bilans traités
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Exporter CSV">
              <Button variant="outlined" startIcon={<FileDownload />} onClick={exportToCSV}
                sx={{ textTransform: "none", borderRadius: 2, px: 3, borderColor: "success.main", color: "success.main",
                  "&:hover": { borderColor: "success.dark", bgcolor: "success.50" } }}>
                Exporter CSV
              </Button>
            </Tooltip>
            <Tooltip title="Actualiser">
              <IconButton sx={{ width: 56, height: 56, bgcolor: "primary.50", color: "primary.main",
                "&:hover": { bgcolor: "primary.200", transform: "rotate(90deg)", transition: "all 0.4s" } }}
                onClick={loadData}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* ERREUR */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>Erreur:</strong> {error}
          <Button size="small" onClick={loadData} sx={{ ml: 2 }}>Réessayer</Button>
        </Alert>
      )}

      {/* STATS */}
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 3, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, display: "flex", alignItems: "center" }}>
          <BarChart sx={{ mr: 2, fontSize: 36 }} />Statistiques
        </Typography>
        <StatCardsContainer>
          {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
        </StatCardsContainer>
      </Paper>

      {/* CALENDRIER + CHART */}
     <Stack 
    direction={{ xs: 'column', lg: 'row' }} 
    spacing={3} 
    sx={{ mb: 5 }}
    useFlexGap
  >
        <Box flex={{ xs: 1, lg: 0.5 }}>
          <Paper sx={{ p: 3, height: 500, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <CalendarToday sx={{ fontSize: 28, color: "primary.main" }} />
                <Typography variant="h4" fontWeight={800}>Planning</Typography>
              </Stack>
              <Chip label={calendarEvents.length} color="primary" size="small" />
            </Stack>
            <Box sx={{ flexGrow: 1 }}>
              <Calendar 
                localizer={localizer} 
                culture="fr-FR" events={calendarEvents}
                startAccessor="start" endAccessor="end"
                style={{ height: "100%" }}
                messages={{
                  next: "Suivant", previous: "Précédent", today: "Aujourd'hui",
                  month: "Mois", week: "Semaine", day: "Jour"
                }}
              />
            </Box>
          </Paper>
        </Box>
        <Box flex={{ xs: 1, lg: 0.5 }}>
          <Paper sx={{ p: 3, height: 500, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <BarChart sx={{ fontSize: 28, color: "primary.main" }} />
                <Typography variant="h4" fontWeight={800}>7 derniers jours</Typography>
              </Stack>
              <Chip label="Live" color="success" size="small" />
            </Stack>
             <Box sx={{ flexGrow: 1, height: 'calc(100% - 60px)', minHeight: 400 }}>
      <UploadChart files={files} />
    </Box>
          </Paper>
        </Box>
      </Stack>

 {/* 🚀 TABLE PLEINE LARGEUR - SANS COLONNE DROITE */}
      <Paper sx={{ 
        borderRadius: 3, 
        boxShadow: "0 20px 60px rgba(0,0,0,0.1)", 
        overflow: "hidden",
        width: "100%" // ✅ Pleine largeur
      }}>
        <Box sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <FilePresent sx={{ fontSize: 36, color: "primary.main" }} />
              <Typography variant="h3" sx={{ fontWeight: 900 }}>Bilans récents</Typography>
            </Stack>
            <Chip label={filteredFiles.length} color="primary" size="large" />
          </Stack>
          
          {/* Barre recherche + Upload - RESPONSIVE */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4, alignItems: "stretch" }}>
            <TextField
              size="small" 
              placeholder="Rechercher fichiers, statuts, dates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1, minWidth: { xs: "100%", sm: 350 } }}
              InputProps={{ startAdornment: <Search /> }}
            />
            <UploadArea onUploadComplete={loadData} />
          </Stack>
        </Box>

        {/* ✅ TABLE RESPONSIVE ADAPTATIVE */}
        <TableContainer sx={{ 
          maxHeight: { xs: 600, md: 650, lg: 700 }, // ✅ Hauteur adaptative
          width: "100%",
          // Responsive horizontal scroll sur mobile
          overflowX: { xs: "auto", md: "visible" }
        }}>
          <Table stickyHeader sx={{ minWidth: { xs: 800, md: 1200 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.50" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: "1.1rem", width: "35%" }}>Fichier</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "1.1rem", width: "20%" }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700, width: "15%" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, width: "15%" }}>Anomalies</TableCell>
                <TableCell sx={{ width: 120, minWidth: 120 }} align="right">Actions</TableCell>
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
                        <Box sx={{ minWidth: 0 }}> {/* ✅ Truncate long names */}
                          <Typography sx={{ fontWeight: 600 }} noWrap title={file.filename}>
                            {file.filename}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {file.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={file.status} 
                        size="small" 
                        color={file.status === "En cours" ? "warning" : 
                               file.status === "Erreur" ? "error" : "success"}
                        sx={{ fontWeight: 700, minWidth: 100, justifyContent: "center" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {file.date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {file.anomalies > 0 ? (
                        <Chip label={file.anomalies} color="warning" size="small" />
                      ) : (
                        <Chip label="✓" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Voir détails">
                        <IconButton size="small" onClick={() => setSelectedFile(file)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredFiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Stack spacing={2} alignItems="center">
                      <FilePresent sx={{ fontSize: 64, color: "grey.300" }} />
                      <Typography variant="h6" color="text.secondary">
                        Aucun bilan trouvé
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Essayez de modifier votre recherche ou uploadez un nouveau fichier
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination - TOUJOURS VISIBLE */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          count={filteredFiles.length}
          rowsPerPage={rowsPerPage} 
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(_, v) => { setRowsPerPage(v); setPage(0); }}
          sx={{ px: 4, py: 3, borderTop: 1, bgcolor: "grey.50" }}
          showFirstButton showLastButton
        />
      </Paper>

      {/* MODAL, SNACKBAR - IDENTIQUES */}
      <FileDetailsModal file={selectedFile} onClose={() => setSelectedFile(null)} onUpdate={handleUpdateFile} />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TechnicienLayout;



