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
  Stack
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplayIcon from "@mui/icons-material/Replay";
import DeleteIcon from "@mui/icons-material/Delete";
import GetAppIcon from "@mui/icons-material/GetApp";

import {
  getAllBilans,
  createBilan,
  updateBilan,
  deleteBilan
} from "../../services/Technicien/bilanService";

import UploadFiles from "../../components/Technicien/UploadArea";
import FileDetailsModal from "../../components/Technicien/FilesDetailsModal";

export default function FilesList() {
  const [files, setFiles] = useState([]);        
  const [selectedFile, setSelectedFile] = useState(null); 

  // Charge les fichiers
  const loadFiles = () => {
    getAllBilans()
      .then((res) => setFiles(res || []))
      .catch((err) => console.error("Erreur lors du chargement des bilans:", err));
  };

  useEffect(() => {
    loadFiles();

    const onChange = () => loadFiles();
    window.addEventListener("bioscan_bilan_changed", onChange);
    window.addEventListener("storage", onChange);

    return () => {
      window.removeEventListener("bioscan_bilan_changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const handleUploadComplete = (file) => {
    createBilan({
      nom_fichier: file.name || file.filename,
      type: file.type || (file.name?.endsWith(".csv") ? "CSV" : "XLSX"),
      statut: "BROUILLON",
      technicien_id: 11
    }).then(loadFiles);
  };

  const handleRelaunch = (id) => {
    updateBilan(id, { statut: "EN_COURS" })
      .then(() => setTimeout(() => updateBilan(id, { statut: "VALIDE" }).then(loadFiles), 900))
      .catch((err) => console.error("Erreur relance:", err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Confirmer la suppression du fichier ?")) return;
    deleteBilan(id).then(loadFiles).catch((err) => console.error("Erreur suppression:", err));
  };

  const handleExport = () => {
    if (!files.length) return;

    const headers = ["bilan_id", "nom_fichier", "type", "statut", "date_generation", "patient_id"];
    const rows = files.map((f) =>
      headers.map((h) => `"${(f[h] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bilans_biologiques.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Fichiers biologiques</Typography>
        <Stack direction="row" spacing={1}>
          <UploadFiles onUploadComplete={handleUploadComplete} />
          <Button variant="outlined" startIcon={<GetAppIcon />} onClick={handleExport}>
            Exporter
          </Button>
        </Stack>
      </Box>

      {/* Table */}
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
            {files.length > 0 ? (
              files.map((f) => (
                <TableRow key={f.bilan_id}>
                  <TableCell>{f.bilan_id}</TableCell>
                  <TableCell>{f.nom_fichier || "—"}</TableCell>
                  <TableCell>
                    <Chip label={f.type || "—"} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={f.statut || "BROUILLON"}
                      color={
                        f.statut === "VALIDE"
                          ? "success"
                          : f.statut === "EN_COURS"
                          ? "primary"
                          : f.statut === "REJETE"
                          ? "error"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {f.date_generation ? new Date(f.date_generation).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton title="Voir" onClick={() => setSelectedFile(f)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton title="Relancer" onClick={() => handleRelaunch(f.bilan_id)}>
                        <ReplayIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        title="Supprimer"
                        color="error"
                        onClick={() => handleDelete(f.bilan_id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun fichier
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal détails */}
      {selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onUpdate={(updatedFile) => {
            updateBilan(updatedFile.bilan_id, updatedFile)
              .then(() => {
                setSelectedFile(null);
                loadFiles();
              })
              .catch((err) => console.error("Erreur mise à jour:", err));
          }}
        />
      )}
    </Box>
  );
}