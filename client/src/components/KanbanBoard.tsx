import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Deal, Stage } from '@shared/schema';
import DealCard from './DealCard';
import { RefreshRounded, InboxRounded, AddRounded, MoreHorizRounded } from '@mui/icons-material';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  IconButton, 
  Paper, 
  Stack,
  CircularProgress
} from '@mui/material';

interface KanbanBoardProps {
  deals: Deal[];
  stages: Stage[];
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: string | null;
}

export default function KanbanBoard({ 
  deals, 
  stages, 
  isLoading, 
  onRefresh,
  lastUpdated
}: KanbanBoardProps) {
  const { toast } = useToast();
  const [groupedDeals, setGroupedDeals] = useState<Record<string, Deal[]>>({});
  
  // Group deals by stage
  useEffect(() => {
    const grouped: Record<string, Deal[]> = {};
    
    // Initialize all stages with empty arrays
    stages.forEach(stage => {
      grouped[stage.id] = [];
    });
    
    // Assign deals to their respective stages
    deals.forEach(deal => {
      if (grouped[deal.stageId]) {
        grouped[deal.stageId].push(deal);
      } else if (stages.length > 0) {
        // If the stage doesn't exist, put it in the first stage as fallback
        grouped[stages[0].id] = [...(grouped[stages[0].id] || []), deal];
      }
    });
    
    setGroupedDeals(grouped);
  }, [deals, stages]);

  // Handle dropping a deal into a new stage
  const handleDrop = async (dealId: string, targetStageId: string, currentStageId: string) => {
    // Do nothing if dropping in the same stage
    if (targetStageId === currentStageId) return;

    try {
      // Optimistically update UI
      setGroupedDeals(prev => {
        const newGrouped = { ...prev };
        const dealToMove = newGrouped[currentStageId].find(d => d.id === dealId);
        
        if (dealToMove) {
          // Remove from current stage
          newGrouped[currentStageId] = newGrouped[currentStageId].filter(d => d.id !== dealId);
          
          // Add to new stage
          const stage = stages.find(s => s.id === targetStageId);
          if (stage) {
            const updatedDeal = { 
              ...dealToMove, 
              stageId: targetStageId,
              stageName: stage.label,
              probability: stage.probability,
              lastUpdated: new Date() 
            };
            newGrouped[targetStageId] = [...newGrouped[targetStageId], updatedDeal];
          }
        }
        
        return newGrouped;
      });

      // Make API request to update deal stage
      await apiRequest('PATCH', `/api/deals/${dealId}/stage`, { stageId: targetStageId });
      
      toast({
        title: "Deal moved",
        description: "Deal has been moved to new stage successfully",
      });
    } catch (error) {
      // Revert optimization on failure
      onRefresh();
      
      toast({
        title: "Failed to move deal",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // StageColumn component to render each stage
  const StageColumn = ({ stage }: { stage: Stage }) => {
    const stageDeals = groupedDeals[stage.id] || [];
    
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'DEAL',
      drop: (item: { id: string, currentStageId: string }) => {
        handleDrop(item.id, stage.id, item.currentStageId);
      },
      collect: monitor => ({
        isOver: !!monitor.isOver(),
      }),
    }));
    
    return (
      <Paper 
        elevation={0}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          mx: 1, 
          '&:first-of-type': { ml: 3 },
          '&:last-of-type': { mr: 3 },
          width: 290,
          minWidth: 290,
          bgcolor: '#f5f5f5',
          borderRadius: '4px 4px 0 0',
          overflow: 'hidden',
          outline: isOver ? '2px solid #1976d2' : 'none',
          outlineOffset: -2
        }}
      >
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          bgcolor: 'white', 
          borderBottom: '1px solid #e0e0e0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              {stage.label}
            </Typography>
            <Chip 
              label={stageDeals.length} 
              size="small" 
              sx={{ ml: 1, bgcolor: '#e0e0e0', color: '#757575', height: 20, fontSize: 12 }} 
            />
          </Box>
          <IconButton size="small" sx={{ color: '#bdbdbd' }}>
            <MoreHorizRounded fontSize="small" />
          </IconButton>
        </Box>
        
        <Box 
          ref={drop} 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            p: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1
          }}
        >
          {stageDeals.length > 0 ? (
            stageDeals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              py: 4, 
              color: '#bdbdbd'
            }}>
              <InboxRounded sx={{ mb: 1, fontSize: 28 }} />
              <Typography variant="body2" sx={{ mb: 1 }}>
                No deals in this stage
              </Typography>
              <Button 
                startIcon={<AddRounded />} 
                size="small" 
                sx={{ 
                  color: '#1976d2', 
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                }}
              >
                Add deal
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Box 
      component="main" 
      id="kanban-board" 
      sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden' 
      }}
    >
      <Box sx={{ 
        px: 3, 
        py: 1.5, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        bgcolor: '#f5f5f5',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Deals
          </Typography>
          <Chip 
            label={deals.length} 
            size="small" 
            sx={{ ml: 1, bgcolor: '#9e9e9e', color: 'white', height: 20 }} 
          />
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            Last updated: {lastUpdated || 'Never'}
          </Typography>
          <Button
            variant="text"
            startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshRounded />}
            onClick={onRefresh}
            disabled={isLoading}
            sx={{ 
              color: '#1976d2', 
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
            }}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ flexGrow: 1, overflowX: 'auto', overflowY: 'hidden' }}>
        <Box sx={{ display: 'flex', height: '100%', minWidth: 'fit-content' }}>
          {stages.map(stage => (
            <StageColumn key={stage.id} stage={stage} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
