import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Chip,
  Box,
  Stack,
  Divider,
  LinearProgress  // ✅ CORRECT : Material Component
} from "@mui/material";
import { 
  FilePresent, Schedule, CheckCircle, ErrorOutline, CloudUpload  // ✅ SEULEMENT Icons
} from "@mui/icons-material";

export default function FileDetailsModal({
  file,
  onClose = () => {},
  onUpdate = () => {},
}) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (file) {
      setNotes(file.notes || "");
    }
  }, [file]);

  if (!file) return null;

  /* ---------------- Status Styling ---------------- */
  const getStatusConfig = (status) => {
    const s = status?.toString().toUpperCase() || "";
    
    // ✅ Adapté aux statuts du dashboard
    if (["TERMINE", "TERMINÉ"].includes(s)) 
      return { color: "#2E7D32", bg: "#E8F5E9", icon: <CheckCircle /> };
    if (["EN_COURS", "EN COURS"].includes(s)) 
      return { color: "#1565C0", bg: "#E3F2FD", icon: <Schedule /> };
    if (["ERREUR"].includes(s)) 
      return { color: "#C62828", bg: "#FDECEA", icon: <ErrorOutline /> };
    if (["UPLOADÉ", "UPLOADED"].includes(s))
      return { color: "#1976D2", bg: "#E3F2FD", icon: <CloudUpload /> };
      
    return { color: "#374151", bg: "#F3F4F6", icon: <FilePresent /> };
  };

  const statusConfig = getStatusConfig(file.status);

  return (
    <Dialog
      open={Boolean(file)}
      onClose={onClose}
      fullWidth
      maxWidth="md" // ✅ Plus large
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
          overflow: "hidden",
        },
      }}
    >
      {/* ================= Header ================= */}
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: "1.2rem",
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "grey.50",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 1
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ 
            bgcolor: "primary.50", 
            p: 1.5, 
            borderRadius: 2, 
            display: "flex", 
            alignItems: "center"
          }}>
            <FilePresent sx={{ fontSize: 32, color: "primary.main" }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Détails du fichier
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
              {file.filename}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      {/* ================= Content ================= */}
      <DialogContent sx={{ p: 4, maxHeight: "60vh", overflow: "auto" }}>
        <Stack spacing={4}>
          {/* ---- Métadonnées Principales ---- */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              📋 Informations générales
            </Typography>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                  ID :
                </Typography>
                <Chip 
                  label={`#${file.id}`} 
                  color="primary" 
                  size="small" 
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              
              <Stack direction="row" spacing={3} alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                  Type :
                </Typography>
                <Chip 
                  label={file.type} 
                  variant="outlined" 
                  color="info" 
                  size="small"
                />
              </Stack>

              <Stack direction="row" spacing={3} alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                  Statut :
                </Typography>
                <Chip
                  label={file.status}
                  size="small"
                  icon={statusConfig.icon}
                  sx={{
                    fontWeight: 700,
                    bgcolor: statusConfig.bg,
                    color: statusConfig.color,
                    "& .MuiChip-icon": { color: statusConfig.color, fontSize: "20px" }
                  }}
                />
              </Stack>

              <Stack direction="row" spacing={3}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                  Taille :
                </Typography>
                <Typography variant="body1" fontWeight={600}>{file.size}</Typography>
              </Stack>

              <Stack direction="row" spacing={3}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                  Source :
                </Typography>
                <Typography variant="body1" fontWeight={500}>{file.source}</Typography>
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

          {/* ---- Progression ---- */}
          {file.progress && file.progress < 100 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Progression : {file.progress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={file.progress} 
                sx={{ height: 8, borderRadius: 4 }}
                color="primary"
              />
            </Box>
          )}

          <Divider />

          {/* ---- Anomalies ---- */}
          {file.anomalies > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: "warning.main", fontWeight: 700 }}>
                ⚠️ {file.anomalies} anomalie(s) détectée(s)
              </Typography>
              <Chip
                label={`${file.anomalies} erreurs`}
                color="warning"
                icon={<ErrorOutline />}
                size="medium"
                sx={{ fontWeight: 700, height: 40 }}
              />
            </Box>
          )}

          {/* ---- Notes ---- */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              📝 Notes du technicien
            </Typography>
            <TextField
              multiline
              minRows={4}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez vos observations, commentaires sur les anomalies ou instructions pour le traitement..."
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      {/* ================= Actions ================= */}
      <DialogActions
        sx={{
          px: 4,
          py: 2.5,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 2,
          backgroundColor: "grey.50"
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ 
            textTransform: "none", 
            borderRadius: 2, 
            px: 4,
            flex: 1
          }}
        >
          Fermer
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={() => onUpdate({ ...file, notes })}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 4,
            flex: 1,
            boxShadow: "0 4px 20px rgba(25, 118, 210, 0.3)",
            "&:hover": {
              boxShadow: "0 6px 24px rgba(25, 118, 210, 0.4)"
            }
          }}
        >
          Enregistrer les modifications
        </Button>
      </DialogActions>
    </Dialog>
  );
}
