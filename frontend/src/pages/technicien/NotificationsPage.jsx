import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  IconButton,
  Skeleton,
  TablePagination,
  Fab,
  Alert,
  Snackbar,
  Tooltip,
} from "@mui/material";

import {
  Email,
  CheckCircle,
  Error,
  CloudUpload,
  Delete,
  Visibility,
  Refresh,
} from "@mui/icons-material";

import {
  getNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
} from "../../services/Technicien/notificationService";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Mapper les données API
  const mapNotificationData = useCallback((n) => ({
    id: n.notification_id,
    title: n.titre,
    description: n.description,
    type: n.statut === "UNREAD" ? "info" : "success",
    date: new Date(n.date_generation).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }),
    raw: n,
  }), []);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      const mapped = (data || []).map(mapNotificationData);
      setNotifications(mapped);
    } catch (err) {
      console.error("Erreur notifications:", err);
      setSnackbar({
        open: true,
        message: "Erreur de chargement",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 🔥 unreadCount corrigé
  const unreadCount = notifications.filter(
    (n) => n.type === "info"
  ).length;

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle />;
      case "info":
        return <CloudUpload />;
      case "error":
        return <Error />;
      default:
        return <CloudUpload />;
    }
  };

  const getChipColor = (type) => {
    switch (type) {
      case "success":
        return "success";
      case "info":
        return "primary";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, type: "success" } : n
        )
      );
      setSnackbar({
        open: true,
        message: "Notification marquée comme lue",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );
      setSnackbar({
        open: true,
        message: "Notification supprimée",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, type: "success" }))
      );
      setSnackbar({
        open: true,
        message: "Toutes les notifications marquées comme lues",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendEmail = (notif) => {
    console.log("Envoyer email pour :", notif);
    setSnackbar({
      open: true,
      message: "Email envoyé !",
      severity: "success",
    });
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  const paginatedNotifications = notifications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && notifications.length === 0) {
    return (
      <Box p={4}>
        <Stack spacing={2}>
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={80}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box p={4}>
      {/* HEADER */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          🔔 Notifications
        </Typography>

        <Stack direction="row" spacing={1}>
          <Chip
            label={`${notifications.length} total`}
            size="small"
            variant="outlined"
            color="primary"
          />
          <Chip
            label={`${unreadCount} non lues`}
            size="small"
            color="error"
          />
          <Fab
            color="primary"
            size="small"
            onClick={handleRefresh}
          >
            <Refresh />
          </Fab>
        </Stack>
      </Stack>

      {notifications.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            🎉 Aucune notification
          </Typography>
        </Paper>
      ) : (
        <>
          {/* ACTION BAR */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">
                {notifications.length} notification
                {notifications.length > 1 ? "s" : ""}
              </Typography>

              <Button
                variant="contained"
                startIcon={<Visibility />}
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                Tout marquer comme lu
              </Button>
            </Stack>
          </Paper>

          {/* LIST */}
          <Stack spacing={2}>
            {paginatedNotifications.map((notif) => (
              <Paper
                key={notif.id}
                elevation={1}
                sx={{
                  p: 3,
                  borderLeft: "5px solid",
                  borderColor:
                    notif.type === "success"
                      ? "success.main"
                      : notif.type === "info"
                      ? "primary.main"
                      : "error.main",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={2}>
                    <IconButton
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: `${getChipColor(notif.type)}.main`,
                        color: "white",
                      }}
                    >
                      {getIcon(notif.type)}
                    </IconButton>

                    <Box>
                      <Typography fontWeight={700}>
                        {notif.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {notif.description}
                      </Typography>
                      <Typography variant="caption">
                        {notif.date}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* ACTIONS */}
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Envoyer par email">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          handleSendEmail(notif)
                        }
                      >
                        <Email />
                      </IconButton>
                    </Tooltip>

                    {notif.type === "info" && (
                      <Tooltip title="Marquer comme lu">
                        <IconButton
                          color="success"
                          onClick={() =>
                            handleMarkAsRead(notif.id)
                          }
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Supprimer">
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDelete(notif.id)
                        }
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>

          {/* PAGINATION */}
          {notifications.length > rowsPerPage && (
            <Paper sx={{ mt: 3 }}>
              <TablePagination
                component="div"
                count={notifications.length}
                page={page}
                onPageChange={(e, newPage) =>
                  setPage(newPage)
                }
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(
                    parseInt(e.target.value, 10)
                  );
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Paper>
          )}
        </>
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar({ ...snackbar, open: false })
        }
      >
        <Alert
          severity={snackbar.severity}
          onClose={() =>
            setSnackbar({ ...snackbar, open: false })
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationsPage;