import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SessionManager } from './components/SessionManager';
import { useSession } from './hooks/useSession';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const { session, startNewSession, endSession } = useSession();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionManager
        session={session}
        onStartSession={startNewSession}
        onEndSession={endSession}
      />
    </ThemeProvider>
  );
}

export default App; 