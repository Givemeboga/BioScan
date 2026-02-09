import React, { useMemo, useState } from "react";
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TextField, IconButton, Chip, Box, Pagination, Stack, Tooltip
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplayIcon from "@mui/icons-material/Replay";
import DeleteIcon from "@mui/icons-material/Delete";

export default function FilesTable({ files = [], onRelaunch = () => {}, onDelete = () => {}, onView = () => {} }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const statuses = useMemo(() => {
    const s = new Set(files.map((f) => (f.status || "").toString()));
    return ["ALL", ...Array.from(s)];
  }, [files]);

  const filtered = useMemo(() => {
    let res = files;
    if (query) {
      const q = query.toLowerCase();
      res = res.filter((f) => (f.filename || "").toLowerCase().includes(q) || (f.source || "").toLowerCase().includes(q));
    }
    if (statusFilter !== "ALL") {
      res = res.filter((f) => (f.status || "") === statusFilter);
    }
    return res;
  }, [files, query, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const statusColor = (s) => {
    if (!s) return "default";
    if (["VALIDE", "validated", "VALIDATED"].includes(s)) return "success";
    if (["EN_COURS", "ENCOUR", "EN_COURS"].includes(s)) return "primary";
    if (["REJETE", "REJECTED", "error"].includes(s)) return "error";
    return "default";
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={2} alignItems="center" justifyContent="space-between">
        <TextField size="small" placeholder="Recherche fichier ou source..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} sx={{ minWidth: 240 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            SelectProps={{ native: true }}
            sx={{ minWidth: 140 }}
          >
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </TextField>
        </Stack>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fichier</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Upload</TableCell>
              <TableCell>Source</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map((f) => (
              <TableRow key={f.id} hover>
                <TableCell sx={{ width: 80 }}>{f.id}</TableCell>
                <TableCell>{f.filename}</TableCell>
                <TableCell><Chip label={f.type} size="small" /></TableCell>
                <TableCell>
                  <Chip label={f.status} color={statusColor(f.status)} size="small" />
                </TableCell>
                <TableCell>{new Date(f.uploadedAt).toLocaleString()}</TableCell>
                <TableCell>{f.source}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Voir"><IconButton size="small" onClick={() => onView(f)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Relancer"><IconButton size="small" onClick={() => onRelaunch(f.id)}><ReplayIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Supprimer"><IconButton size="small" onClick={() => onDelete(f.id)} color="error"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                  Aucun fichier correspondant.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Box component="span" color="text.secondary">{filtered.length} résultat(s)</Box>
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} size="small" />
      </Box>
    </Box>
  );
}