import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography, Box } from "@mui/material";

/**
 * StatCard — petite carte KPI pour TechnicienLayout
 *
 * Props:
 * - title: string
 * - value: string | number
 * - color: CSS color for value (optional)
 * - icon: React node (optional)
 * - subtitle: string (optional)
 * - small: boolean (taille réduite)
 */
export default function StatCard({ title, value, color, icon, subtitle, small = false }) {
  return (
    <Card
      className={`technicien-layout__stat-card ${small ? "technicien-layout__stat-card--small" : ""}`}
      elevation={2}
      sx={{
        height: small ? 84 : 110,
        display: "flex",
        alignItems: "center",
        borderRadius: 2,
      }}
    >
      <CardContent
        className="technicien-layout__stat-card-content"
        sx={{ display: "flex", alignItems: "center", p: small ? 1.25 : 2 }}
      >
        {icon && (
          <Box
            className="technicien-layout__stat-card-icon"
            sx={{ mr: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: small ? 20 : 28 }}
          >
            {icon}
          </Box>
        )}

        <Box className="technicien-layout__stat-card-text" sx={{ minWidth: 0 }}>
          <Typography
            className="technicien-layout__stat-card-title"
            variant={small ? "caption" : "subtitle2"}
            color="text.secondary"
            noWrap
          >
            {title}
          </Typography>

          <Typography
            className="technicien-layout__stat-card-value"
            variant={small ? "h6" : "h5"}
            sx={{ fontWeight: 700, color: color || "text.primary", mt: small ? 0.25 : 0.5 }}
            noWrap
          >
            {value ?? "—"}
          </Typography>

          {subtitle && (
            <Typography
              className="technicien-layout__stat-card-subtitle"
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  icon: PropTypes.node,
  subtitle: PropTypes.string,
  small: PropTypes.bool,
};
