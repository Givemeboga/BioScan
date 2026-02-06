import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Link } from 'react-router-dom';
import ColorModeIconDropdown from '../../../../theme/shared-theme/ColorModeIconDropdown';
import logo from '../../../../assets/logo.png';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}));

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => setOpen(newOpen);

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          {/* Logo + Menu Desktop */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            <img src={logo} alt="Logo" style={{ height: '70px', marginRight: '16px' }} />
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button variant="text" color="info" size="small">Fonctionnalités</Button>
              <Button variant="text" color="info" size="small">Témoignages</Button>
              <Button variant="text" color="info" size="small">Points forts</Button>
              <Button variant="text" color="info" size="small">Tarifs</Button>
              <Button variant="text" color="info" size="small" sx={{ minWidth: 0 }}>FAQ</Button>
              <Button variant="text" color="info" size="small" sx={{ minWidth: 0 }}>Blog</Button>
            </Box>
          </Box>

          {/* Boutons Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            <Button
              component={Link}
              to="/sign-in"
              color="primary"
              variant="text"
              size="small"
            >
              Se connecter
            </Button>
            <Button
              component={Link}
              to="/signup"
              color="primary"
              variant="contained"
              size="small"
            >
              S'inscrire
            </Button>
            <ColorModeIconDropdown />
          </Box>

          {/* Boutons Mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label="Bouton menu" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{ sx: { top: 'var(--template-frame-height, 0px)' } }}
            >
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>

                <MenuItem>Fonctionnalités</MenuItem>
                <MenuItem>Témoignages</MenuItem>
                <MenuItem>Points forts</MenuItem>
                <MenuItem>Tarifs</MenuItem>
                <MenuItem>FAQ</MenuItem>
                <MenuItem>Blog</MenuItem>
                <Divider sx={{ my: 3 }} />

                <MenuItem>
                  <Button
                    component={Link}
                    to="/signup"
                    color="primary"
                    variant="contained"
                    fullWidth
                  >
                    S'inscrire
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button
                    component={Link}
                    to="/sign-in"
                    color="primary"
                    variant="outlined"
                    fullWidth
                  >
                    Se connecter
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
