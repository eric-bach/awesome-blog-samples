import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import MuiAlert from '@mui/material/Alert';
import { createBrowserHistory } from 'history';

import Progress from './components/Progress';
import Header from './components/Header';

import AuthProvider from './contexts/authContext';
import { AuthStatus } from './components/AuthApp';

const MarketingLazy = lazy(() => import('./components/MarketingApp'));
const AuthLazy = lazy(() => import('./components/AuthApp'));
const DashboardLazy = lazy(() => import('./components/DashboardApp'));

const history = createBrowserHistory();

function Alert(props: any) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const App = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.SignedOut);
  const [displayError, setDisplayError] = useState<boolean>(false);

  useEffect(() => {
    if (authStatus === AuthStatus.SignedIn) {
      history.push('/home');
    }

    if (authStatus === AuthStatus.AccountCreated) {
      history.push('/auth/verify');
    }

    if (authStatus === AuthStatus.Verfied) {
      history.push('/auth/signin');
    }
  }, [authStatus]);

  return (
    <Router history={history}>
      <div>
        <AuthProvider>
          <Header
            onSignOut={() => {
              setAuthStatus(AuthStatus.SignedOut);
            }}
            isSignedIn={authStatus === AuthStatus.SignedIn}
          />
          <Suspense fallback={<Progress />}>
            <Switch>
              <Route path="/auth">
                {displayError && (
                  <Alert
                    sx={{
                      color: 'white',
                      backgroundColor: 'red',
                    }}
                    severity="error"
                    onClose={() => {
                      setDisplayError(false);
                    }}
                  >
                    {authStatus === AuthStatus.SignedOut
                      ? 'Sign in Failed! Email and/or password is incorrect.'
                      : 'Please verify account before signing in.'}
                  </Alert>
                )}
                <AuthLazy
                  onSignIn={(status: AuthStatus) => {
                    setDisplayError(status !== AuthStatus.SignedIn);
                    setAuthStatus(status);
                  }}
                  onSignUp={(status: AuthStatus) => {
                    setAuthStatus(status);
                  }}
                  onVerify={() => {
                    setAuthStatus(AuthStatus.Verfied);
                  }}
                />
              </Route>
              <Route path="/home">
                {authStatus !== AuthStatus.SignedIn && <Redirect to="/" />}
                <DashboardLazy />
              </Route>
              <Route path="/" component={MarketingLazy} />
            </Switch>
          </Suspense>
        </AuthProvider>
      </div>
    </Router>
  );
};

export default App;
