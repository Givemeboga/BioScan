import React, { useCallback, useState, useRef, useEffect } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  LinearProgress,
  Alert,
  useTheme
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { createBilan } from "../../services/Technicien/mockApi"; 

// Couleurs BioScan
const COLORS = {
  primary: "#1E88E5",
};

export default function UploadFiles({ onUploadComplete }) {
  const theme = useTheme();
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messageTimeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // Cleanup
  useEffect(() => () => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const clearMessage = useCallback(() => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    setMessage({ text: "", severity: "info" });
  }, []);

  const showMessage = useCallback((text, severity = "info") => {
    clearMessage();
    setMessage({ text, severity });
    messageTimeoutRef.current = setTimeout(clearMessage, 5000);
  }, [clearMessage]);

  const validateFile = useCallback((file) => {
    return new Promise((resolve) => {
      // Validation sync d'abord
      const allowedTypes = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];
      const allowedExt = /\.(csv|xlsx|xls)$/i;
      
      if (!allowedTypes.includes(file.type) && !allowedExt.test(file.name)) {
        resolve("Format non supporté (autorisé : CSV, XLSX, XLS)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        resolve("Taille du fichier trop grande (max 10MB)");
        return;
      }

      // Validation anti-corruption
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        try {
          if (file.type === "text/csv") {
            if (typeof data === "string" && data.substring(0, 100).includes("\0")) {
              resolve("Fichier CSV corrompu détecté");
              return;
            }
          } else {
            const uint8 = new Uint8Array(data.slice(0, 4));
            const xlsxSig = [0x50, 0x4B, 0x03, 0x04];
            const xlsSig = [0xD0, 0xCF, 0x11, 0xE0];
            if (!xlsxSig.every((v, i) => v === uint8[i]) && !xlsSig.every((v, i) => v === uint8[i])) {
              resolve("Fichier Excel corrompu détecté");
              return;
            }
          }
          resolve(null);
        } catch (err) {
          resolve("Erreur de validation du fichier");
        }
      };
      if (file.type === "text/csv") {
        reader.readAsText(file, "utf-8");
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }, []);

  // 🔥 NOUVEAU : Sauvegarde en localStorage
  const saveToLocalStorage = useCallback(async (file) => {
    try {
      const bilanData = {
        nom_fichier: file.name,
        type: file.name.match(/\.csv$/i) ? "CSV" : "XLSX",
        technicien_id: 11,        // Mock technicien
        patient_id: null,
        anomaly_count: 0,
        notes: "",
        statut: "EN_COURS"        // Nouveau fichier = en cours
      };

      const savedBilan = await createBilan(bilanData);
      
      // ✅ Déclenche refresh automatique du dashboard
      window.dispatchEvent(new Event("bioscan_bilan_changed"));
      
      return savedBilan;
    } catch (error) {
      throw new Error("Erreur sauvegarde localStorage");
    }
  }, []);

  const handleFiles = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;

    const err = await validateFile(file);
    if (err) {
      showMessage(err, "error");
      return;
    }

    setSelectedFile({ name: file.name, size: file.size });
    showMessage("");
    setLoading(true);
    setProgress(0);

    // Progress simulé
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(intervalRef.current);
          return p;
        }
        return p + Math.random() * 10;
      });
    }, 100);

    try {
      // 🔥 1. Attend fin simulation
      setTimeout(async () => {
        clearInterval(intervalRef.current);
        setProgress(100);

        // 🔥 2. SAUVEGARDE LOCALSTORAGE
        const savedBilan = await saveToLocalStorage(file);
        
        // 🔥 3. Callback parent + données enrichies
        const processedFile = {
          id: savedBilan.bilan_id,
          filename: savedBilan.nom_fichier,
          type: savedBilan.type,
          size: file.size,
          uploadedAt: savedBilan.date_generation,
          status: "Uploadé",
          source: "Labo local",
          technicien_id: savedBilan.technicien_id
        };

        onUploadComplete?.(processedFile);
        showMessage(`"${file.name}" sauvegardé ! (ID: ${savedBilan.bilan_id})`, "success");
        
      }, 2000);
    } catch (error) {
      showMessage("Erreur sauvegarde", "error");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
      setProgress(0);
      setSelectedFile(null);
    }
  }, [onUploadComplete, validateFile, showMessage, saveToLocalStorage]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h6" mb={2} textAlign="center" color="primary">
        Upload fichiers biologiques
      </Typography>

      <Box
        role="region"
        aria-label="Zone de dépôt de fichiers CSV, XLSX ou XLS"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openFileDialog}
        tabIndex={0}
        sx={{
          border: `3px dashed ${dragOver ? COLORS.primary : "rgba(0,0,0,0.12)"}`,
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: dragOver 
            ? "rgba(30, 136, 229, 0.08)" 
            : loading 
            ? "rgba(30, 136, 229, 0.04)"
            : "transparent",
          cursor: loading ? "wait" : "pointer",
          position: "relative",
          "&:hover": { 
            borderColor: loading ? COLORS.primary : theme.palette.primary.main,
            backgroundColor: loading ? "rgba(30, 136, 229, 0.04)" : "rgba(30, 136, 229, 0.02)"
          },
          "&:focus-visible": {
            outline: `3px solid ${COLORS.primary}`,
            outlineOffset: 2
          }
        }}
      >
        <input
          ref={fileInputRef}
          id="upload-btn"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          aria-label="Sélectionner un fichier CSV, XLSX ou XLS"
          style={{ display: "none" }}
        />

        <CloudUploadIcon sx={{ fontSize: 56, color: COLORS.primary, mb: 2 }} />
        
        {selectedFile ? (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
            <Typography variant="body1" fontWeight={600} mb={0.5}>
              {selectedFile.name}
            </Typography>
            <Typography variant="caption" color="success.dark">
              {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h6" mb={1} color="text.primary">
              Glisser-déposer un fichier CSV / XLSX ici
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              ou cliquer pour parcourir
            </Typography>
          </>
        )}

        <label htmlFor="upload-btn">
          <Button 
            variant="outlined" 
            component="span" 
            size="large"
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? "Upload en cours..." : "Parcourir mes fichiers..."}
          </Button>
        </label>

        {loading && (
          <Box mt={4} sx={{ minHeight: 80 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mb: 2, borderRadius: 2, height: 8 }} 
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {progress === 100 ? "Finalisation..." : `${Math.round(progress)}%`}
            </Typography>
          </Box>
        )}

        {message.text && (
          <Alert
            severity={message.severity}
            sx={{ mt: 3, alignItems: 'center' }}
            icon={
              message.severity === "success" ? <CheckCircleIcon /> : <ErrorIcon />
            }
          >
            {message.text}
          </Alert>
        )}
      </Box>
    </Paper>
  );
}
