import { createTheme, Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface (remove this line if you don't have the rule enabled)
  interface DefaultTheme extends Theme {}
}

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        ul: {
          margin: 0,
          padding: 0,
          listStyle: 'none',
        },
        a:-webkit-any-link {
          text-decoration: none;
        }
      `,
    },
  },
});

export default theme;
