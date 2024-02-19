import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

import '../index.css';

const Layout: React.FC = () => {
  return (
    <>
      <Navigation />
      <Container maxWidth='xl' sx={{ mt: 5 }} className='content'>
        <Outlet />
      </Container>
      <Footer />
    </>
  );
};

export default Layout;
