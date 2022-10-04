import React from 'react';
import ReactDOM from 'react-dom';
import { createMemoryHistory, createBrowserHistory } from 'history';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import './MuiClassNameSetup';
import App from './App';
import theme from './theme';

// Mount function to start up the app
const mount = (el: any, { onNavigate, defaultHistory, initialPath }: any) => {
  const history = defaultHistory || createMemoryHistory({ initialEntries: [initialPath] });

  // When navigation occurs, use the listen handler to call onNavigate()
  if (onNavigate) {
    history.listen(onNavigate);
  }

  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App history={history} />
    </ThemeProvider>,
    el
  );

  return {
    onParentNavigate({ pathname: nextPathname }: { pathname: string }) {
      const { pathname } = history.location;

      if (pathname !== nextPathname) {
        history.push(nextPathname);
      }
    },
  };
};

// If we are in development and in isolation, call mount immediately
if (process.env.NODE_ENV === 'development') {
  const devRoot = document.querySelector('#_marketing-dev-root');

  if (devRoot) {
    mount(devRoot, { defaultHistory: createBrowserHistory() });
  }
}

// Assume, we are running through the container and we should export the mount function
export { mount };
