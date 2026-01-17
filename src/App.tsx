import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { ErrorBoundary } from './components';
import { router } from './routes';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Create MUI theme (palette, typography, and component polish)
const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    secondary: { main: '#7b1fa2' },
    background: { default: '#f7f9fc', paper: '#ffffff' },
  },
  shape: { borderRadius: 10 },
  spacing: 8,
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(', '),
    h4: { fontWeight: 700, letterSpacing: 0.25 },
    body2: { color: '#5f6b7a' },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 12 } },
      defaultProps: { elevation: 1 },
    },
    MuiChip: {
      defaultProps: { size: 'small' },
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f0f3f7',
          fontWeight: 600,
          borderBottom: '1px solid #e5eaf2',
        },
      },
    },
    MuiIconButton: { defaultProps: { size: 'small' } },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <RouterProvider router={router} />
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
