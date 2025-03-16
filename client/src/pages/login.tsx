import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth.tsx';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [, setLocation] = useLocation();
  const { login, isLoading, error, user, clearError } = useAuth();

  // Redirect to home if already logged in
  if (user) {
    setLocation('/');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      await login(username, password);
      setLocation('/');
    } catch (err) {
      // Error is handled in the login function
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 4,
        }}
      >
        <Grid container spacing={4} sx={{ boxShadow: 1, borderRadius: 2, overflow: 'hidden' }}>
          {/* Login Form */}
          <Grid item xs={12} md={5} component={Paper} square sx={{ p: 4 }}>
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h4" fontWeight={600} mb={4}>
                Welcome Back
              </Typography>

              {error && (
                <Alert severity="error" onClose={clearError} sx={{ mb: 3, width: '100%' }}>
                  {error.message}
                </Alert>
              )}

              <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, p: 1 }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Hero Section */}
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              background: 'linear-gradient(to right bottom, #1976d2, #42a5f5)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '500px',
                p: 3,
              }}
            >
              <Typography component="h1" variant="h3" fontWeight={700} mb={3}>
                HubSpot Deal Kanban Board
              </Typography>
              <Typography variant="h6" paragraph>
                Manage your HubSpot deals with an intuitive drag-and-drop interface
              </Typography>
              <Typography paragraph>
                Visualize your sales pipeline, track progress, and move deals through
                stages with a simple drag-and-drop interface.
              </Typography>
              <Typography paragraph>
                Gain insights into your pipeline health, identify bottlenecks, and take action
                to close deals faster.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}