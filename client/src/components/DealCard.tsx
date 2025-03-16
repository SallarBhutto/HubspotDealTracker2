import { useDrag } from 'react-dnd';
import { Deal } from '@shared/schema';
import { format } from 'date-fns';
import { 
  Paper, 
  Box, 
  Typography, 
  Chip, 
  Stack, 
  Avatar 
} from '@mui/material';
import { 
  BusinessRounded, 
  PersonRounded, 
  AttachMoneyRounded 
} from '@mui/icons-material';

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const probabilityPercentage = deal.probability ? parseFloat(deal.probability) * 100 : 0;
  const formattedProbability = `${probabilityPercentage}%`;
  
  const getProbabilityColor = () => {
    if (probabilityPercentage >= 90) return { bg: '#f3e5f5', text: '#6a1b9a' };
    if (probabilityPercentage >= 75) return { bg: '#e8f5e9', text: '#2e7d32' };
    if (probabilityPercentage >= 50) return { bg: '#fff8e1', text: '#ff8f00' };
    return { bg: '#e3f2fd', text: '#1976d2' };
  };
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'DEAL',
    item: { id: deal.id, currentStageId: deal.stageId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Format lastUpdated date
  const formattedDate = deal.lastUpdated 
    ? format(new Date(deal.lastUpdated), 'MMM d, yyyy') 
    : 'No date';

  // Get initials from company name if available
  const getInitials = () => {
    if (!deal.company) return 'NN';
    return deal.company
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const probabilityStyle = getProbabilityColor();

  return (
    <Paper
      ref={drag}
      elevation={isDragging ? 4 : 0}
      sx={{
        p: 1.5,
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        cursor: 'grab',
        transition: 'all 0.2s ease',
        '&:hover': { 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        },
        opacity: isDragging ? 0.6 : 1,
        transform: isDragging ? 'rotate(2deg)' : 'none',
        bgcolor: 'white'
      }}
      data-deal-id={deal.id}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: 14 }}>
          {deal.name}
        </Typography>
        <Chip 
          label={formattedProbability}
          size="small"
          sx={{ 
            height: 20, 
            fontSize: 10, 
            bgcolor: probabilityStyle.bg, 
            color: probabilityStyle.text,
            fontWeight: 500
          }}
        />
      </Box>
      
      <Stack spacing={0.5} sx={{ mt: 1, color: '#9e9e9e', fontSize: 12 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessRounded sx={{ fontSize: 14, mr: 0.5 }} />
          <Typography variant="caption">{deal.company || 'No company'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonRounded sx={{ fontSize: 14, mr: 0.5 }} />
          <Typography variant="caption">{deal.contact || 'No contact'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AttachMoneyRounded sx={{ fontSize: 14, mr: 0.5 }} />
          <Typography variant="caption">
            {deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount'}
          </Typography>
        </Box>
      </Stack>
      
      <Box sx={{ 
        mt: 1.5, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: 11
      }}>
        <Typography variant="caption" color="#9e9e9e">Updated: {formattedDate}</Typography>
        <Avatar 
          sx={{ 
            width: 24, 
            height: 24, 
            fontSize: 11, 
            bgcolor: '#5c6bc0' 
          }}
        >
          {getInitials()}
        </Avatar>
      </Box>
    </Paper>
  );
}
