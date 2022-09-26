import { createTheme, Theme } from '@mui/material/styles';

declare module '@mui/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface (remove this line if you don't have the rule enabled)
  interface DefaultTheme extends Theme {}
}

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default theme;
