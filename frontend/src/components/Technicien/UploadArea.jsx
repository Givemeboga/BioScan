import React, { useRef, useState, useCallback, useEffect } from "react";
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  LinearProgress, 
  CircularProgress,
  Fade,
  useTheme 
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { createBilan } from "../../services/Technicien/mockApi"; // ✅ Import mock API

export default function UploadArea({ onUploadComplete }) {
  const theme = useTheme();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const messageTimeoutRef = useRef(null);

  // Cleanup timeouts
  useEffect(() => () => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
  }, []);

  const clearMessage = useCallback(() => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    setMessage(null);
  }, []);

  const showMessage = useCallback((text, severity = "info") => {
    clearMessage();
    setMessage({ text, severity });
    messageTimeoutRef.current = setTimeout(clearMessage, 5000);
  }, [clearMessage]);

  const validateFile = useCallback((file) => {
    if (!file) return "Aucun fichier";
    
    const maxSize = 15 * 1024 * 1024; // 15MB
    const allowed = /\.(csv|xlsx|xls)$/i;
    
    if (!allowed.test(file.name)) 
      return "Format: CSV, XLSX, XLS uniquement";
    if (file.size > maxSize) 
      return `Taille max: 15MB (${Math.round(maxSize/1024/1024)}MB)`;
    
    return null;
  }, []);

  const simulateUpload = useCallback((file) => {
    return new Promise((resolve) => {
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 15;
        if (p > 95) {
          clearInterval(interval);
          setTimeout(resolve, 500);
        } else {
          setProgress(p);
        }
      }, 150);
    });
  }, []);

  const processFile = useCallback(async (file) => {
    const error = validateFile(file);
    if (error) {
      showMessage(error, "error");
      return false;
    }
  
    setUploading(true);
    setProgress(0);
    
    try {
      await simulateUpload(file);
      
      // 🔥 1. Prépare les données pour localStorage (format mockApi)
      const bilanData = {
        nom_fichier: file.name,
        type: file.name.match(/\.csv$/i) ? "CSV" : "XLSX",
        technicien_id: 11,        // Mock technicien courant
        patient_id: null,         // À remplir plus tard
        anomaly_count: 0,         // Calculé après analyse
        notes: "",                // Notes technicien
        statut: "EN_COURS"        // Workflow: EN_COURS → VALIDE/REJETE
      };
  
      // 🔥 2. SAUVEGARDE en localStorage via mockApi
      const savedBilan = await createBilan(bilanData);
      
      // 🔥 3. Retourne données enrichies avec ID localStorage
      const processedFile = {
        id: savedBilan.bilan_id,        // ✅ ID unique localStorage
        filename: savedBilan.nom_fichier,
        type: savedBilan.type,
        size: file.size,
        uploadedAt: savedBilan.date_generation,  // ✅ Timestamp API
        status: "Uploadé",                    // UI friendly
        source: "Upload area",
        technicien_id: savedBilan.technicien_id
      };
  
      // 🔥 4. Callback parent (dashboard)
      onUploadComplete?.(processedFile);
      
      // 🔥 5. DÉCLENCHE refresh automatique dashboard
      window.dispatchEvent(new Event("bioscan_bilan_changed"));
      
      showMessage(`"${file.name}" sauvegardé ! (ID: ${savedBilan.bilan_id})`, "success");
      return true;
      
    } catch (error) {
      showMessage("Erreur sauvegarde", "error");
      return false;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onUploadComplete, validateFile, simulateUpload, showMessage]);
  

  const handleFiles = useCallback(async (files) => {
    if (!files?.length) return;
    
    // Process first file only (single file mode)
    await processFile(files[0]);
    
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [processFile]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFileDialog();
    }
  }, [openFileDialog]);

  return (
    <Box
      role="group"
      aria-label="Zone d'upload de fichiers CSV/XLSX"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        position: "relative",
        p: 0.5,
      }}
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
        aria-hidden="true"
      />

      {/* Upload Button */}
      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onClick={openFileDialog}
        disabled={uploading}
        size="medium"
        sx={{ minWidth: 100, flexShrink: 0 }}
      >
        {uploading ? <CircularProgress size={20} color="inherit" /> : "Upload"}
      </Button>

      {/* Drag & Drop Area */}
      <Box
        role="button"
        tabIndex={0}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        sx={{
          px: 3,
          py: 1.5,
          borderRadius: 2,
          border: `2px dashed ${
            dragOver 
              ? theme.palette.primary.main 
              : uploading 
              ? theme.palette.action.disabledBackground 
              : "rgba(0,0,0,0.23)"
          }`,
          backgroundColor: dragOver 
            ? `${theme.palette.primary.main}08` 
            : uploading 
            ? `${theme.palette.primary.main}04`
            : "transparent",
          cursor: uploading ? "wait" : "pointer",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          minWidth: 140,
          textAlign: "center",
          position: "relative",
          flex: 1,
          maxWidth: 200,
          "&:hover": !uploading && !dragOver && {
            borderColor: theme.palette.primary.main,
            backgroundColor: `${theme.palette.primary.main}04`,
          },
          "&:focus-visible": {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
            borderColor: theme.palette.primary.main,
          },
        }}
        aria-label={`Glisser-déposer ou cliquer pour uploader. ${uploading ? 'Upload en cours...' : 'Prêt'}`}
      >
        {uploading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
            <CircularProgress size={20} />
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ width: "100%", borderRadius: 1, mt: 0.5 }} 
            />
            <Typography variant="caption" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          </Box>
        ) : dragOver ? (
          <>
            <CloudUploadIcon sx={{ fontSize: 24, color: "primary.main", mb: 0.5 }} />
            <Typography variant="caption" color="primary.main" fontWeight={600}>
              Déposez !
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="caption" color="text.primary" fontWeight={500}>
              Glisser-déposer
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              ou cliquer
            </Typography>
          </>
        )}
      </Box>

      {/* Messages */}
      {message && (
        <Fade in={!!message} timeout={300}>
          <Alert
            severity={message.severity}
            onClose={clearMessage}
            icon={
              message.severity === "success" ? <CheckCircleIcon /> : <ErrorIcon />
            }
            sx={{ 
              ml: 1, 
              alignSelf: "flex-start", 
              fontSize: "0.8rem",
              minWidth: 0,
              flexShrink: 0,
              '& .MuiAlert-icon': { fontSize: 18 }
            }}
          >
            {message.text}
          </Alert>
        </Fade>
      )}
    </Box>
  );
}
