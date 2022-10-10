import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import Chart from './components/Chart';
import Deposits from './components/Deposits';
import Orders from './components/Orders';

export default function Dashboard() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Box sx={{ appBarSpacer: toolbar }} />
        <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
          <Grid container spacing={3}>
            {/* Chart */}
            <Grid item xs={12} md={8} lg={9}>
              <Paper
                sx={{
                  padding: 2,
                  display: 'flex',
                  overflow: 'auto',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Chart />
              </Paper>
            </Grid>
            {/* Recent Deposits */}
            <Grid item xs={12} md={4} lg={3}>
              <Paper
                sx={{
                  padding: 2,
                  display: 'flex',
                  overflow: 'auto',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Deposits />
              </Paper>
            </Grid>
            {/* Recent Orders */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  padding: 2,
                  display: 'flex',
                  overflow: 'auto',
                  flexDirection: 'column',
                }}
              >
                <Orders />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
