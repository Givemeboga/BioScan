import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import Topbar from '../components/Topbar';

export default function BaseDashboardLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Topbar />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}