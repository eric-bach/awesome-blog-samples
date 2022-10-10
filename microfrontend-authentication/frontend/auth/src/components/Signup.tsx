import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Box } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

export default function SignUp({ onSignUp }: any) {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
    validationSchema: yup.object({
      email: yup.string().email('Enter a valid email').required('Email is required'),
      password: yup
        .string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,64})/,
          'Password must contain at least one uppercase, one lowercase, one number and one special character'
        )
        .required('Password is required'),
      passwordConfirm: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Password is required'),
    }),
    onSubmit: (values) => {
      onSignUp(values.email, values.password);
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar
          sx={{
            margin: 1,
            backgroundColor: 'secondary.main',
          }}
        >
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box sx={{ width: '100%', mt: 3 }}>
          <form onSubmit={formik.handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="email"
                  name="email"
                  label="Email Address"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  variant="outlined"
                  required
                  fullWidth
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  variant="outlined"
                  required
                  fullWidth
                  autoComplete="password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="passwordConfirm"
                  name="passwordConfirm"
                  label="Confirm Password"
                  type="password"
                  value={formik.values.passwordConfirm}
                  onChange={formik.handleChange}
                  error={formik.touched.passwordConfirm && Boolean(formik.errors.passwordConfirm)}
                  helperText={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
                  variant="outlined"
                  required
                  fullWidth
                  autoComplete="confirm-password"
                />
              </Grid>
            </Grid>
            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }}>
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/auth/signin">Already have an account? Sign in</Link>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </Container>
  );
}
