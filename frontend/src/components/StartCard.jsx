// src/components/StatCard.jsx
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const StatCard = ({ title, value, color, icon }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ mr: 2, fontSize: 30 }}>{icon}</Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
            <Typography variant="h5" color={color}>{value}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
