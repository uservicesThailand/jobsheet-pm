import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './fonts.css'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
// นำเข้า font CSS ที่เราสร้างไว้
import './fonts.css';
import './App.css';

createRoot(document.getElementById('root')).render(

  <StrictMode>

    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>

  </StrictMode>,
)
