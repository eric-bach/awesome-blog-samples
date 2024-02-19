import { Amplify } from 'aws-amplify';
import { Authenticator, Theme, ThemeProvider, View } from '@aws-amplify/ui-react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Layout from './routes/Layout';
import Chat from './routes/Chat';

import './index.css';

Amplify.configure({
  Auth: {
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    region: import.meta.env.VITE_REGION,
  },
});

const theme: Theme = {
  name: 'Theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          '10': '#1976d2',
          '20': '#1976d2',
          '40': '#1976d2',
          '60': '#1976d2',
          '80': '#1976d2',
          '90': '#1976d2',
          '100': '#1976d2',
        },
      },
    },
  },
};

const formFields = {
  signIn: {
    username: {
      label: 'Email',
      placeholder: 'Enter your email',
    },
  },
  signUp: {
    username: {
      label: 'Email',
      placeholder: 'Enter your email',
      order: 1,
    },
    password: {
      order: 2,
    },
    confirm_password: {
      order: 3,
    },
  },
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        Component: Chat,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <View paddingTop='6em'>
        <Authenticator formFields={formFields}>
          <RouterProvider router={router} />
        </Authenticator>
      </View>
    </ThemeProvider>
  );
}

export default App;
