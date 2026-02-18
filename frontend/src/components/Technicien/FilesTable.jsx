import React, { useMemo, useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  IconButton,
  Chip,
  Pagination,
  Stack,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplayIcon from "@mui/icons-material/Replay";
import DeleteIcon from "@mui/icons-material/Delete";

export default function FilesTable({
  files = [],
  onRelaunch = () => {},
  onDelete = () => {},
  onView = () => {},
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const perPage = 8;

  /* ---------------------------- Status Normalizer ---------------------------- */

  const normalizeStatus = (status = "") => status.toString().toUpperCase();

  const statusChipSx = (status) => {
    const s = normalizeStatus(status);

    if (["VALIDE", "VALIDATED"].includes(s))
      return {
        bgcolor: "#E8F5E9",
        color: "#2E7D32",
      };

    if (["EN_COURS", "PROCESSING"].includes(s))
      return {
        bgcolor: "#E3F2FD",
        color: "#1565C0",
      };

    if (["REJETE", "REJECTED", "ERROR"].includes(s))
      return {
        bgcolor: "#FDECEA",
        color: "#C62828",
      };

    return {
      bgcolor: "#F3F4F6",
      color: "#374151",
    };
  };

  /* ---------------------------- Status List ---------------------------- */

  const statuses = useMemo(() => {
    const s = new Set(files.map((f) => normalizeStatus(f.status)));
    return ["ALL", ...Array.from(s)];
  }, [files]);

  /* ---------------------------- Filtering ---------------------------- */

  const filtered = useMemo(() => {
    let result = files;

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (f) =>
          (f.filename || "").toLowerCase().includes(q) ||
          (f.source || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(
        (f) => normalizeStatus(f.status) === statusFilter
      );
    }

    return result;
  }, [files, query, statusFilter]);

  /* ---------------------------- Pagination ---------------------------- */

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  /* ---------------------------- Render ---------------------------- */

  return (
    <Box>
      {/* ================== Filters ================== */}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={3}
        justifyContent="space-between"
        alignItems="center"
      >
        <TextField
          size="small"
          placeholder="Rechercher fichier ou source..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 260 }}
        />

        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          SelectProps={{ native: true }}
          sx={{ minWidth: 160 }}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </TextField>
      </Stack>

      {/* ================== Table ================== */}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #EEF2F7",
          overflow: "hidden",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#F9FAFB",
                "& th": {
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "text.secondary",
                },
              }}
            >
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
            {paginated.map((file) => (
              <TableRow
                key={file.id}
                hover
                sx={{
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#F3F4F6",
                  },
                  "& td": {
                    fontSize: "0.85rem",
                    borderBottom: "1px solid #F1F5F9",
                  },
                }}
              >
                <TableCell>{file.id}</TableCell>

                <TableCell>
                  <Typography fontWeight={500}>
                    {file.filename}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={file.type}
                    size="small"
                    sx={{
                      bgcolor: "#F3F4F6",
                      fontWeight: 500,
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={file.status}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      ...statusChipSx(file.status),
                    }}
                  />
                </TableCell>

                <TableCell>
                  {file.uploadedAt
                    ? new Date(file.uploadedAt).toLocaleString()
                    : "-"}
                </TableCell>

                <TableCell>{file.source}</TableCell>

                <TableCell align="right">
                  <Tooltip title="Voir">
                    <IconButton
                      size="small"
                      onClick={() => onView(file)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Relancer">
                    <IconButton
                      size="small"
                      onClick={() => onRelaunch(file.id)}
                    >
                      <ReplayIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Supprimer">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(file.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    Aucun fichier correspondant.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ================== Footer ================== */}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={3}
      >
        <Typography variant="body2" color="text.secondary">
          {filtered.length} résultat(s)
        </Typography>

        <Pagination
          count={pageCount}
          page={page}
          onChange={(e, value) => setPage(value)}
          size="small"
        />
      </Box>
    </Box>
  );
}
