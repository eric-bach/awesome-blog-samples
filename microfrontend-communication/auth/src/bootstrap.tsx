import React from 'react';
import ReactDOM from 'react-dom';
import { createMemoryHistory, createBrowserHistory } from 'history';

import App from './App';

// Mount function to start up the app
const mount = (el: any, { onNavigate, onSignIn, onSignUp, defaultHistory, initialPath }: any) => {
  const history = defaultHistory || createMemoryHistory({ initialEntries: [initialPath] });

  // When navigation occurs, use the listen handler to call onNavigate()
  if (onNavigate) {
    history.listen(onNavigate);
  }

  ReactDOM.render(
    <App
      onSignIn={(user: string, password: string) => onSignIn(user, password)}
      onSignUp={(user: string, password: string) => onSignUp(user, password)}
      history={history}
    />,
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
  const devRoot = document.querySelector('#_auth-dev-root');

  if (devRoot) {
    mount(devRoot, { defaultHistory: createBrowserHistory() });
  }
}

// Assume, we are running through the container and we should export the mount function
export { mount };
