import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import StatCard from "./StatCard";
import UploadArea from "./UploadArea";
import UploadChart from "./UploadChart";
import FilesTable from "./FilesTable";
import FileDetailsModal from "./FilesDetailsModal";
import "./TechnicienLayout.css";

const LOCAL_KEY = "bioscan_files";

export default function BaseDashboardTechnicien() {
  const [files, setFiles] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) {
      const seed = [
        { id: 1057, filename: "tests_covid_2026.csv", type: "CSV", uploadedAt: new Date().toISOString(), status: "REJETE", source: "Labo Ariana", anomalyCount: 2, notes: "Colonnes manquantes sur lignes 4..10" },
        { id: 1056, filename: "resultats_patient_b56.csv", type: "CSV", uploadedAt: new Date().toISOString(), status: "VALIDE", source: "Labo Tunis" },
        { id: 1055, filename: "etude_glucose_mod_01.xlsx", type: "XLSX", uploadedAt: new Date().toISOString(), status: "EN_COURS", source: "CHU" },
      ];
      localStorage.setItem(LOCAL_KEY, JSON.stringify(seed));
      setFiles(seed);
      return;
    }
    try {
      setFiles(JSON.parse(raw));
    } catch {
      setFiles([]);
    }
  }, []);

  useEffect(() => {
    const onChange = () => setFiles(JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"));
    window.addEventListener("bioscan_files_changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("bioscan_files_changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const kpis = useMemo(() => {
    if (!files) return { uploadedToday: 0, processing: 0, pending: 0, errors: 0 };
    const today = new Date().toISOString().slice(0, 10);
    return {
      uploadedToday: files.filter(f => f.uploadedAt?.startsWith(today)).length,
      processing: files.filter(f => ["EN_COURS"].includes(f.status)).length,
      pending: files.filter(f => ["uploaded", "BROUILLON", "EN_ATTENTE"].includes(f.status)).length,
      errors: files.filter(f => ["REJETE", "error"].includes(f.status)).length,
    };
  }, [files]);

  const onUploadComplete = useCallback((fileMeta) => {
    const normalized = {
      id: fileMeta.id || Date.now(),
      filename: fileMeta.filename || fileMeta.name,
      type: fileMeta.type || (fileMeta.name?.endsWith?.(".csv") ? "CSV" : "XLSX"),
      uploadedAt: fileMeta.uploadedAt || new Date().toISOString(),
      status: fileMeta.status || "UPLOADED",
      source: fileMeta.source || "Upload local",
      anomalyCount: fileMeta.anomalyCount || 0,
      notes: fileMeta.notes || "",
    };
    const updated = [normalized, ...(JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"))];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("bioscan_files_changed"));
    setFiles(updated);
  }, []);

  const handleExport = () => {
    if (!files || files.length === 0) return;
    const header = ["id", "filename", "type", "uploadedAt", "status", "source"];
    const rows = files.map(f => header.map(h => `"${(f[h] || "").toString().replace(/"/g, '""')}"`).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bioscan_files_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    const updated = (files || []).map(f => (f.status === "EN_COURS" ? { ...f, status: "VALIDE" } : f));
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("bioscan_files_changed"));
    setFiles(updated);
  };

  if (files === null) {
    return (
      <Box className="modern-root" sx={{ p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="modern-root" sx={{ p: { xs: 2, md: 4 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>Bonjour, Technicien 👋</Typography>
          <Typography variant="body2" color="text.secondary">Tableau de bord professionnel — BioScan</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <UploadArea onUploadComplete={onUploadComplete} />
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>Exporter</Button>
          <IconButton color="primary" onClick={handleRefresh}><RefreshIcon /></IconButton>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Upload aujourd'hui" value={kpis.uploadedToday} color="var(--primary)" icon={<CloudUploadIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Analyses en cours" value={kpis.processing} color="var(--success)" icon={<RefreshIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="En attente" value={kpis.pending} color="var(--navy)" icon={<CloudUploadIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Erreurs" value={kpis.errors} color="#D32F2F" icon={<RefreshIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper className="paper-card" sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>Activité d'upload</Typography>
            <UploadChart files={files} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="paper-card" sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>Notifications récentes</Typography>
            <Typography variant="body2" color="text.secondary">Aucune notification réelle pour l'instant.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className="paper-card" sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="h6">Fichiers biologiques</Typography>
              <Typography variant="caption" color="text.secondary">{files.length} fichiers</Typography>
            </Box>
            <FilesTable
              files={files}
              onRelaunch={(id) => {
                const updated = files.map(f => f.id === id ? { ...f, status: "EN_COURS" } : f);
                localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
                window.dispatchEvent(new Event("bioscan_files_changed"));
                setFiles(updated);
                setTimeout(() => {
                  const done = updated.map(f => f.id === id ? { ...f, status: "VALIDE" } : f);
                  localStorage.setItem(LOCAL_KEY, JSON.stringify(done));
                  window.dispatchEvent(new Event("bioscan_files_changed"));
                  setFiles(done);
                }, 900);
              }}
              onDelete={(id) => {
                const updated = files.filter(f => f.id !== id);
                localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
                window.dispatchEvent(new Event("bioscan_files_changed"));
                setFiles(updated);
              }}
              onView={(f) => setSelectedFile(f)}
            />
          </Paper>
        </Grid>
      </Grid>

      <FileDetailsModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onUpdate={(patch) => {
          if (!selectedFile) return;
          const updated = files.map(f => f.id === selectedFile.id ? { ...f, ...patch } : f);
          localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event("bioscan_files_changed"));
          setFiles(updated);
          setSelectedFile(null);
        }}
      />
    </Box>
  );
}
