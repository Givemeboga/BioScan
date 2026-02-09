import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Chip } from "@mui/material";

export default function FileDetailsModal({ file, onClose = () => {}, onUpdate = () => {} }) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (file) setNotes(file.notes || "");
  }, [file]);

  if (!file) return null;

  return (
    <Dialog open={Boolean(file)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Détails — {file.filename}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" color="text.secondary">Métadonnées</Typography>
        <Typography>ID: {file.id}</Typography>
        <Typography>Type: {file.type}</Typography>
        <Typography>Status: <Chip label={file.status} size="small" /></Typography>
        <Typography>Source: {file.source}</Typography>
        <Typography>Upload: {new Date(file.uploadedAt).toLocaleString()}</Typography>

        <Typography variant="subtitle2" sx={{ mt: 2 }}>Notes / Erreurs</Typography>
        <TextField multiline minRows={4} fullWidth value={notes} onChange={(e) => setNotes(e.target.value)} />
        {file.anomalyCount ? <Typography variant="body2" color="error" sx={{ mt: 1 }}>Anomalies détectées: {file.anomalyCount}</Typography> : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={() => { onUpdate({ notes }); }} variant="contained">Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
}