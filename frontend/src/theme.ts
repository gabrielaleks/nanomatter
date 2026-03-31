import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#282a36',
      paper: '#2f3142',
    },
    primary: {
      main: '#bd93f9',
    },
    secondary: {
      main: '#ff79c6',
    },
    info: {
      main: '#50fa7b',
    },
    text: {
      primary: '#f8f8f2',
      secondary: '#6272a4',
    },
  },
})
