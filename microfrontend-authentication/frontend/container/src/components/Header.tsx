import React from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

export default function Header({ isSignedIn, onSignOut }: any) {
  const onClick = () => {
    if (isSignedIn && onSignOut) {
      onSignOut();
    }
  };

  return (
    <React.Fragment>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{
          borderBottom: '1px solid divider',
        }}
      >
        <Toolbar
          sx={{
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" color="inherit" noWrap component={RouterLink} to="/">
            App
          </Typography>
          <Button
            color="primary"
            variant="outlined"
            sx={{
              mt: 1,
              mb: 1,
              ml: 1.5,
              mr: 1.5,
            }}
            component={RouterLink}
            to={isSignedIn ? '/' : '/auth/signin'}
            onClick={onClick}
          >
            {isSignedIn ? 'Logout' : 'Login'}
          </Button>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}
