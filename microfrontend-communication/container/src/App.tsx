import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';
import { createBrowserHistory } from 'history';

import Progress from './components/Progress';
import Header from './components/Header';
import { AuthStatus } from './components/AuthApp';

const MarketingLazy = lazy(() => import('./components/MarketingApp'));
const AuthLazy = lazy(() => import('./components/AuthApp'));
const DashboardLazy = lazy(() => import('./components/DashboardApp'));

const generateClassName = createGenerateClassName({
  productionPrefix: 'co',
});

const history = createBrowserHistory();

const App = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.SignedOut);

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
      <StylesProvider generateClassName={generateClassName}>
        <div>
          <Header
            onSignOut={() => {
              setAuthStatus(AuthStatus.SignedOut);
            }}
            isSignedIn={authStatus === AuthStatus.SignedIn}
          />
          <Suspense fallback={<Progress />}>
            <Switch>
              <Route path='/auth'>
                <AuthLazy
                  onSignIn={(status: AuthStatus) => {
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
              <Route path='/home'>
                {authStatus !== AuthStatus.SignedIn && <Redirect to='/' />}
                <DashboardLazy />
              </Route>
              <Route path='/' component={MarketingLazy} />
            </Switch>
          </Suspense>
        </div>
      </StylesProvider>
    </Router>
  );
};

export default App;
