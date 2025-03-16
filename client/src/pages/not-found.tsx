import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Stack 
} from '@mui/material';
import { ErrorOutlineRounded } from '@mui/icons-material';

export default function NotFound() {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: 'background.default' 
      }}
    >
      <Card 
        sx={{ 
          width: '100%', 
          maxWidth: 480, 
          mx: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: 2
        }}
      >
        <CardContent sx={{ pt: 3, pb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <ErrorOutlineRounded sx={{ fontSize: 32, color: 'error.main' }} />
            <Typography variant="h5" color="text.primary" fontWeight={600}>
              404 Page Not Found
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Did you forget to add the page to the router?
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
