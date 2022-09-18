import { mount } from 'auth/AuthApp';
import React, { useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

export default ({ onSignIn, onSignUp }: any) => {
  const ref = useRef(null);
  const history = useHistory();

  useEffect(() => {
    const { onParentNavigate } = mount(ref.current, {
      initialPath: history.location.pathname,

      // Callback to update BrowserHistory when Auth app navigates
      onNavigate: ({ pathname: nextPathname }: { pathname: string }) => {
        const { pathname } = history.location;

        if (pathname !== nextPathname) {
          history.push(nextPathname);
        }
      },

      // Callback for Auth SignIn button
      onSignIn: async (user: string, password: string) => {
        console.log('SIGNED IN: ', user);
        onSignIn();
      },

      onSignUp: async (user: string, password: string) => {
        console.log('SIGNED UP: ', user);
        onSignUp();
      },
    });

    // Update Marketing app when Container app navigates
    history.listen(onParentNavigate);
  }, []);

  return <div ref={ref} />;
};
