import React, { useRef, useState, useCallback } from "react";
import { Box, Button, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function UploadArea({ onUploadComplete }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((file) => {
    if (!file) return;
    // minimal validation
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      alert("Format non supporté. Utilisez CSV/XLSX.");
      return;
    }
    // send minimal meta to parent
    onUploadComplete({ id: Date.now(), name: file.name, filename: file.name, type: file.name.endsWith(".csv") ? "CSV" : "XLSX", uploadedAt: new Date().toISOString(), status: "UPLOADED", source: "Upload area" });
  }, [onUploadComplete]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    handleFiles(f);
  }, [handleFiles]);

  return (
    <Box
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files?.[0])} />
      <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => inputRef.current.click()}>
        Upload
      </Button>

      <Box sx={{ ml: 1, px: 2, py: 1, borderRadius: 1, border: dragOver ? "1px dashed var(--primary)" : "1px dashed rgba(0,0,0,0.08)", cursor: "pointer" }}>
        <Typography variant="caption">Glisser-déposer ici</Typography>
      </Box>
    </Box>
  );
}