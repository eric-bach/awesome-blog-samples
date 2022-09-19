import React from 'react';
import { Switch, Route, Router } from 'react-router-dom';

import SignIn from './components/Signin';
import SignUp from './components/Signup';
import Verify from './components/Verify';

export default ({ onSignIn, onSignUp, onVerify, history }: any) => {
  return (
    <div>
      <Router history={history}>
        <Switch>
          <Route path='/auth/signin'>
            <SignIn onSignIn={(user: string, password: string) => onSignIn(user, password)} />
          </Route>
          <Route path='/auth/signup'>
            <SignUp onSignUp={(user: string, password: string) => onSignUp(user, password)} />
          </Route>
          <Route path='/auth/verify'>
            <Verify onVerify={() => onVerify()} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};
