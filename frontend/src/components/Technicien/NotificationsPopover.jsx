import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  MenuItem,
  ListItemIcon,
  IconButton,
  CircularProgress,
  Alert,
  Popover,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const NotificationsPopover = ({
  notificationsData = [],
  notifCount = 0,
  loading = false,
  actionFeedback = "",
  onMarkAsRead = () => {},
  onDelete = () => {},
  onMarkAllAsRead = () => {},
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const unreadCount = notificationsData?.filter(
    (n) => n.severity === "info"
  ).length || 0;

  const openNotifs = (e) => setAnchorEl(e.currentTarget);
  const closeNotifs = () => setAnchorEl(null);

  const getColor = (severity) => {
    switch (severity) {
      case "info":
        return "#e3f2fd";
      case "success":
        return "#e8f5e9";
      default:
        return "#f5f5f5";
    }
  };

  const getIcon = (severity) => {
    switch (severity) {
      case "info":
        return <ScheduleIcon color="primary" fontSize="small" />;
      case "success":
        return <CheckCircleIcon color="success" fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  return (
    <>
      {/* ICON + BADGE */}
      <Tooltip
        title={`${notifCount} notification${notifCount > 1 ? "s" : ""}`}
      >
        <IconButton
          onClick={openNotifs}
          size="small"
          className="technicien-layout__topbar-btn-notif"
          sx={{ position: "relative" }}
        >
          <NotificationsIcon sx={{ color: "white" }} />

          {notifCount > 0 && (
            <div className="technicien-layout__notification-badge">
              {notifCount}
            </div>
          )}
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closeNotifs}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 450,
            mt: 1,
            borderRadius: 2,
            boxShadow: 24,
          },
        }}
      >
        {/* HEADER */}
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              🔔 Notifications ({notifCount})
            </Typography>

            <Chip
              label={`${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`}
              size="small"
              color={unreadCount > 0 ? "primary" : "default"}
            />
          </Box>

          {notificationsData.length > 0 && (
            <Button
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => {
                onMarkAllAsRead();
              }}
              disabled={loading || unreadCount === 0}
              variant="outlined"
              fullWidth
            >
              Tout marquer comme lu
            </Button>
          )}
        </Box>

        {/* FEEDBACK */}
        {actionFeedback && (
          <Alert severity="success" sx={{ mx: 2, mt: 1 }}>
            {actionFeedback}
          </Alert>
        )}

        {/* LOADING */}
        {loading && (
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={20} />
          </Box>
        )}

        {/* LIST */}
        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          {notificationsData.length === 0 ? (
            <MenuItem disabled sx={{ justifyContent: "center" }}>
              <Typography>🎉 Aucune notification</Typography>
            </MenuItem>
          ) : (
            notificationsData.map((n) => (
              <MenuItem
                key={n.id}
                sx={{
                  py: 1.5,
                  px: 2,
                  m: 0.5,
                  borderRadius: 2,
                  backgroundColor: getColor(n.severity),
                  border:
                    n.severity === "info"
                      ? "2px solid"
                      : "1px solid",
                  borderColor:
                    n.severity === "info"
                      ? "primary.main"
                      : "divider",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateX(4px)",
                    boxShadow: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    width: "100%",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    {getIcon(n.severity)}
                  </ListItemIcon>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      noWrap
                    >
                      {n.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {n.message}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.disabled"
                    >
                      {new Date(n.date).toLocaleString("fr-FR")}
                    </Typography>
                  </Box>

                  {/* ACTIONS */}
                  <Box sx={{ ml: 1, display: "flex", gap: 0.5 }}>
                    {n.severity === "info" && (
                      <Tooltip title="Marquer comme lu">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(n.id);
                          }}
                          sx={{ color: "primary.main" }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(n.id);
                        }}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </MenuItem>
            ))
          )}
        </Box>

        <Divider />

        {/* FOOTER */}
        <MenuItem
          onClick={closeNotifs}
          sx={{ justifyContent: "center" }}
        >
          <Typography variant="body2">
            ✕ Fermer
          </Typography>
        </MenuItem>
      </Popover>
    </>
  );
};

NotificationsPopover.propTypes = {
  notificationsData: PropTypes.array,
  notifCount: PropTypes.number,
  loading: PropTypes.bool,
  actionFeedback: PropTypes.string,
  onMarkAsRead: PropTypes.func,
  onDelete: PropTypes.func,
  onMarkAllAsRead: PropTypes.func,
};

export default NotificationsPopover;