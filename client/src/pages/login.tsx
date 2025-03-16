import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Container,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/login', { username, password });
      
      toast({
        title: 'Login successful',
        description: 'Welcome to HubSpot Deal Pipeline',
      });
      
      // Redirect to dashboard
      setLocation('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password');
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f8fa'
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box 
              sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                bgcolor: 'primary.main', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
              }}
            >
              <LockOutlined sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" component="h1" fontWeight={600}>
              HubSpot Deal Pipeline
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Sign in to access your deal management dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Enter your username"
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={isLoading}
                sx={{ 
                  mt: 3,
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </form>
          
          <Box mt={3}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              Default credentials: username: admin, password: admin
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}