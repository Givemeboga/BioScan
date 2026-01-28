import React from "react";
import { Box, Typography } from "@mui/material";

const BaseDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Hello, Team SkyTech 👋
      </Typography>
      
      <Typography variant="body1" color="textSecondary">
        Welcome to BioScan
      </Typography>
    </Box>
  );
};

export default BaseDashboard;