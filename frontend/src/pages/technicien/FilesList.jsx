import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplayIcon from "@mui/icons-material/Replay";
import DeleteIcon from "@mui/icons-material/Delete";
import GetAppIcon from "@mui/icons-material/GetApp";
import { getAllBilans, createBilan, updateBilan, deleteBilan } from "../../services/Technicien/mockApi";
import UploadFiles from "./UploadFiles"; // ton composant d'upload existant

export default function FilesList() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener("bioscan_bilan_changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("bioscan_bilan_changed", onChange);
      window.removeEventListener("storage", onChange);
    };
    // eslint-disable-next-line
  }, []);

  function load() {
    getAllBilans().then(setFiles);
  }

  const handleUploadComplete = (file) => {
    // file: { name, type, ... } — adapte selon ton UploadFiles
    createBilan({
      nom_fichier: file.name || file.filename,
      type: file.type || (file.name && (file.name.endsWith(".csv") ? "CSV" : "XLSX")),
      statut: "BROUILLON",
      technicien_id: 11
    }).then(() => load());
  };

  const handleRelaunch = (id) => {
    updateBilan(id, { statut: "EN_COURS" }).then(() => {
      // simulate completion
      setTimeout(() => updateBilan(id, { statut: "VALIDE" }).then(load), 900);
      load();
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Confirmer la suppression du fichier ?")) return;
    deleteBilan(id).then(load);
  };

  const handleExport = () => {
    if (!files.length) return;
    const header = ["bilan_id", "nom_fichier", "type", "statut", "date_generation", "patient_id"];
    const rows = files.map((f) => header.map((h) => `"${(f[h] || "").toString().replace(/"/g,'""')}"`).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bilan_biologique_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Fichiers biologiques</Typography>
        <Stack direction="row" spacing={1}>
          <UploadFiles onUploadComplete={handleUploadComplete} />
          <Button variant="outlined" startIcon={<GetAppIcon />} onClick={handleExport}>Exporter</Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom fichier</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {files.map((f) => (
              <TableRow key={f.bilan_id}>
                <TableCell>{f.bilan_id}</TableCell>
                <TableCell>{f.nom_fichier}</TableCell>
                <TableCell><Chip label={f.type} size="small" /></TableCell>
                <TableCell>
                  <Chip
                    label={f.statut}
                    color={f.statut === "VALIDE" ? "success" : f.statut === "EN_COURS" ? "primary" : f.statut === "REJETE" ? "error" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(f.date_generation).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton title="Voir"><VisibilityIcon fontSize="small" /></IconButton>
                  <IconButton title="Relancer" onClick={() => handleRelaunch(f.bilan_id)}><ReplayIcon fontSize="small" /></IconButton>
                  <IconButton title="Supprimer" onClick={() => handleDelete(f.bilan_id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {files.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}><Typography variant="body2">Aucun fichier</Typography></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}