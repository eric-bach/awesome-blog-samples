import React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import StarIcon from '@mui/icons-material/StarBorder';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';

const tiers = [
  {
    title: 'Free',
    price: '0',
    description: ['10 users included', '2 GB of storage', 'Help center access', 'Email support'],
    buttonText: 'Sign up for free',
    buttonVariant: 'outlined',
  },
  {
    title: 'Pro',
    subheader: 'Most popular',
    price: '15',
    description: ['20 users included', '10 GB of storage', 'Help center access', 'Priority email support'],
    buttonText: 'Get started',
    buttonVariant: 'contained',
  },
  {
    title: 'Enterprise',
    price: '30',
    description: ['50 users included', '30 GB of storage', 'Help center access', 'Phone & email support'],
    buttonText: 'Contact us',
    buttonVariant: 'outlined',
  },
];

export default function Pricing() {
  return (
    <React.Fragment>
      {/* Hero unit */}
      <Container maxWidth='sm' component='main' sx={{ pt: 8, pb: 6 }}>
        <Typography component='h1' variant='h2' align='center' color='textPrimary' gutterBottom>
          Pricing
        </Typography>
        <Typography variant='h5' align='center' color='textSecondary' component='p'>
          Quickly build an effective pricing table for your potential customers with this layout. It&apos;s built with default Material-UI
          components with little customization.
        </Typography>
      </Container>
      {/* End hero unit */}
      <Container maxWidth='md' component='main'>
        <Grid container spacing={5} alignItems='flex-end'>
          {tiers.map((tier) => (
            // Enterprise card is full width at sm breakpoint
            <Grid item key={tier.title} xs={12} sm={tier.title === 'Enterprise' ? 12 : 6} md={4}>
              <Card>
                <CardHeader
                  title={tier.title}
                  subheader={tier.subheader}
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{ align: 'center' }}
                  action={tier.title === 'Pro' ? <StarIcon /> : null}
                  sx={{ bgcolor: 'grey[200]' }}
                />
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'baseline',
                      mb: 2,
                    }}
                  >
                    <Typography component='h2' variant='h3' color='textPrimary'>
                      ${tier.price}
                    </Typography>
                    <Typography variant='h6' color='textSecondary'>
                      /mo
                    </Typography>
                  </Box>
                  <ul>
                    {tier.description.map((line) => (
                      <Typography component='li' variant='subtitle1' align='center' key={line}>
                        {line}
                      </Typography>
                    ))}
                  </ul>
                </CardContent>
                <CardActions>
                  <Button component={RouterLink} to='/auth/signup' fullWidth color='primary'>
                    {tier.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </React.Fragment>
  );
}
