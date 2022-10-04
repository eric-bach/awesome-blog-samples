import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import './MuiClassNameSetup';
import App from './App';
import theme from './theme';

const mount = (el: any) => {
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>,
    el
  );
};

// Scenario #1
// We are running this file in development in isolation
// We are using our local index.html file
// Which DEFINITELY has an element with an ide of 'dev-products'
// We want to immediately render our app into that element
if (process.env.NODE_ENV === 'development') {
  const el = document.querySelector('#_dashboard-dev-root');

  // Assuming our container doesn't have an element with id 'dev-products'
  if (el) {
    // We are probably running in isolation (Scenario #1)
    mount(el);
  }
}

// Scenario #2
// We are running this file in development or production through the CONTAINER app
// NO GUARANTEE that an element with an id of 'dev-products' exists
// WE DO NOT WANT to try to immediately render the app

export { mount };
