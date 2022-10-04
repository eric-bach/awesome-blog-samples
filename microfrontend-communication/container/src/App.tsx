import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import Progress from './components/Progress';
import Header from './components/Header';

const MarketingLazy = lazy(() => import('./components/MarketingApp'));
const AuthLazy = lazy(() => import('./components/AuthApp'));
const DashboardLazy = lazy(() => import('./components/DashboardApp'));

const history = createBrowserHistory();

const App = () => {
  const [isSignedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      history.push('/home');
    }
  });

  return (
    <Router history={history}>
      <div>
        <Header
          onSignOut={() => {
            setSignedIn(false);
          }}
          isSignedIn={isSignedIn}
        />
        <Suspense fallback={<Progress />}>
          <Switch>
            <Route path='/auth'>
              <AuthLazy
                onSignIn={() => {
                  setSignedIn(true);
                }}
                onSignUp={() => {}}
              />
            </Route>
            <Route path='/home'>
              {!isSignedIn && <Redirect to='/auth/signin' />}
              <DashboardLazy />
            </Route>
            <Route path='/' component={MarketingLazy} />
          </Switch>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
