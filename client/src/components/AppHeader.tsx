import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  InputBase,
  IconButton,
  Avatar,
  Box,
  Stack,
  InputAdornment,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Notifications as BellIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';

interface AppHeaderProps {
  onSearch: (query: string) => void;
}

export default function AppHeader({ onSearch }: AppHeaderProps) {
  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0} 
      sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'divider', 
        bgcolor: 'white'
      }}
    >
      <Toolbar sx={{ px: 3, height: 64 }}>
        <Typography 
          variant="h6" 
          component="h1" 
          sx={{ 
            fontWeight: 600, 
            color: '#546e7a',
            flexGrow: 0
          }}
        >
          Deal Pipeline
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ ml: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            New Deal
          </Button>
          
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FilterIcon />}
            size="small"
            sx={{ 
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.secondary'
            }}
          >
            Filter
          </Button>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <TextField
          size="small"
          placeholder="Search deals..."
          onChange={(e) => onSearch(e.target.value)}
          sx={{ 
            mr: 3,
            width: 260,
            '& .MuiOutlinedInput-root': {
              borderColor: 'divider',
              fontSize: 14
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton size="small" sx={{ color: 'text.disabled' }}>
            <BellIcon />
          </IconButton>
          
          <IconButton size="small" sx={{ color: 'text.disabled' }}>
            <HelpIcon />
          </IconButton>
          
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: 'primary.main', 
              fontSize: 14,
              fontWeight: 500
            }}
          >
            JD
          </Avatar>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
