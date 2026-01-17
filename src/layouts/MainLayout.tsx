import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

/**
 * Main Layout Component
 *
 * Wraps all pages with common header and footer.
 */
export const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={2} sx={{ background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)' }}>
        <Toolbar sx={{ py: 0.5 }}>
          <AdminPanelSettingsIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, letterSpacing: 0.3 }}>
            Internship Assignment
          </Typography>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flex: 1, py: 3 }} maxWidth="xl">
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          Admin Dashboard - Built with React, TypeScript, MUI & Material React Table
        </Typography>
      </Box>
    </Box>
  );
};
