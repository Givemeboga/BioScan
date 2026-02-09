import React, { useCallback, useState } from "react";
import { Box, Paper, Typography, Button, LinearProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Couleurs BioScan
const COLORS = {
  primary: "#1E88E5",
};

export default function UploadFiles({ onUploadComplete }) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const validateFile = (file) => {
    const allowed = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      return "Format non supporté (autorisé : CSV, XLSX)";
    }
    // taille max 10MB par défaut
    if (file.size > 10 * 1024 * 1024) return "Taille du fichier trop grande (max 10MB)";
    return null;
  };

  const handleFiles = useCallback(
    (files) => {
      const file = files[0];
      const err = validateFile(file);
      if (err) {
        setMessage(err);
        return;
      }
      setMessage("");
      setLoading(true);

      // Simuler upload -> remplacer par fileService.upload(file)
      setTimeout(() => {
        const newFile = {
          id: Date.now(),
          filename: file.name,
          type: file.name.endsWith(".csv") ? "CSV" : "XLSX",
          uploadedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          status: "uploaded",
          source: "Labo local",
        };
        onUploadComplete && onUploadComplete(newFile);
        setLoading(false);
        setMessage("Upload réussi");
      }, 900);
    },
    [onUploadComplete]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length) handleFiles(dt.files);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" mb={1}>
        Upload fichiers biologiques
      </Typography>

      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        sx={{
          border: `2px dashed ${dragOver ? COLORS.primary : "rgba(0,0,0,0.12)"}`,
          borderRadius: 1,
          p: 2,
          textAlign: "center",
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 40, color: COLORS.primary }} />
        <Typography variant="body2">Glisser-déposer un fichier CSV / XLSX ici</Typography>
        <input
          id="upload-btn"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          style={{ display: "none" }}
        />
        <Box mt={1}>
          <Button variant="outlined" onClick={() => document.getElementById("upload-btn")?.click()}>
            Parcourir...
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mt: 2 }} />}
        {message && (
          <Typography variant="caption" display="block" color={message.includes("réussi") ? "green" : "error"} mt={1}>
            {message}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}