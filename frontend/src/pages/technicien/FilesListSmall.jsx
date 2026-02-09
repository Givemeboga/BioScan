import React from "react";
import { List, ListItem, ListItemText, Chip } from "@mui/material";

export default function FilesListSmall({ files = [] }) {
  if (!files || files.length === 0) return <div>Aucun fichier récent</div>;
  return (
    <List dense>
      {files.map((f) => (
        <ListItem key={f.bilan_id} divider secondaryAction={<Chip label={f.statut} size="small" />}>
          <ListItemText primary={f.nom_fichier} secondary={new Date(f.date_generation).toLocaleString()} />
        </ListItem>
      ))}
    </List>
  );
}