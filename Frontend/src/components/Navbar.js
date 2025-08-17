import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout, isAuthenticated } from '../utils/auth';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cafe Management System
        </Typography>
        {isAuthenticated() && (
          <Box>
            <Button color="inherit" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button color="inherit" onClick={() => navigate('/categories')}>
              Categories
            </Button>
            <Button color="inherit" onClick={() => navigate('/products')}>
              Products
            </Button>
            <Button color="inherit" onClick={() => navigate('/bills')}>
              Bills
            </Button>
            <Button color="inherit" onClick={() => navigate('/users')}>
              Users
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;