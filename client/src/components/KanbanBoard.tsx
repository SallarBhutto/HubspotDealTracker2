import { useState, useEffect, useRef } from 'react';
import { useDrop, useDrag, XYCoord } from 'react-dnd';
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
  CircularProgress,
  Divider
} from '@mui/material';

interface KanbanBoardProps {
  deals: Deal[];
  stages: Stage[];
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: string | null;
}

// Interface for the drop result
interface DropResult {
  dealId: string;
  targetStageId: string;
  currentStageId: string;
  index?: number;
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

  // Handle dropping a deal into a new stage or position
  const handleDrop = async (dealId: string, targetStageId: string, currentStageId: string, targetIndex?: number) => {
    // If it's the same stage and no index is specified, do nothing
    if (targetStageId === currentStageId && targetIndex === undefined) return;

    try {
      // Optimistically update UI
      setGroupedDeals(prev => {
        const newGrouped = { ...prev };
        // Find the current stage's deals and the deal we're moving
        const currentStageDeals = [...newGrouped[currentStageId]];
        const currentIndex = currentStageDeals.findIndex(d => d.id === dealId);
        
        if (currentIndex === -1) return prev; // Deal not found
        
        const dealToMove = currentStageDeals[currentIndex];
        
        // Remove from current stage
        currentStageDeals.splice(currentIndex, 1);
        newGrouped[currentStageId] = currentStageDeals;
        
        // If moving to a different stage
        if (targetStageId !== currentStageId) {
          const stage = stages.find(s => s.id === targetStageId);
          if (stage) {
            const updatedDeal = { 
              ...dealToMove, 
              stageId: targetStageId,
              stageName: stage.label,
              probability: stage.probability,
              lastUpdated: new Date() 
            };
            
            const targetStageDeals = [...newGrouped[targetStageId]];
            
            // Insert at specific position or end if no position specified
            if (targetIndex !== undefined) {
              targetStageDeals.splice(targetIndex, 0, updatedDeal);
            } else {
              targetStageDeals.push(updatedDeal);
            }
            
            newGrouped[targetStageId] = targetStageDeals;
          }
        } else {
          // Reordering within the same stage
          const targetStageDeals = [...newGrouped[targetStageId]];
          
          // Insert at new position
          if (targetIndex !== undefined) {
            targetStageDeals.splice(targetIndex, 0, dealToMove);
          } else {
            targetStageDeals.push(dealToMove);
          }
          
          newGrouped[targetStageId] = targetStageDeals;
        }
        
        return newGrouped;
      });

      // Only make API request if changing stages
      if (targetStageId !== currentStageId) {
        await apiRequest('PATCH', `/api/deals/${dealId}/stage`, { stageId: targetStageId });
        
        toast({
          title: "Deal moved",
          description: "Deal has been moved to new stage successfully",
        });
      }
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

  // Deal drag preview component
  const ItemDragPreview = ({ deal }: { deal: Deal }) => {
    return (
      <Box sx={{ 
        p: 1.5,
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        bgcolor: 'white',
        width: 280,
        opacity: 0.8,
        boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
      }}>
        <Typography variant="subtitle2" noWrap>
          {deal.name}
        </Typography>
      </Box>
    );
  };

  // StageColumn component to render each stage
  const StageColumn = ({ stage }: { stage: Stage }) => {
    const stageDeals = groupedDeals[stage.id] || [];
    
    // Drop handler for the column itself
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: 'DEAL',
      drop: (item: { id: string, currentStageId: string, originalIndex: number }, monitor) => {
        const didDrop = monitor.didDrop();
        if (didDrop) {
          return;
        }
        
        // If dropped directly on the column (not a card), add to the end
        handleDrop(item.id, stage.id, item.currentStageId);
      },
      collect: monitor => ({
        isOver: !!monitor.isOver({ shallow: true }),
        canDrop: !!monitor.canDrop(),
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
          outline: isOver && canDrop ? '2px solid #1976d2' : 'none',
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
            <>
              {stageDeals.map((deal, index) => (
                <DealItem 
                  key={deal.id}
                  deal={deal}
                  index={index}
                  stageId={stage.id}
                  moveCard={handleDrop}
                />
              ))}
              {/* Empty drop target at the end of the list */}
              <EmptyDropTarget 
                stageId={stage.id}
                index={stageDeals.length}
                onDrop={(dealId, sourceStageId) => 
                  handleDrop(dealId, stage.id, sourceStageId, stageDeals.length)
                }
              />
            </>
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

  // Component for individual deals with drop zones
  const DealItem = ({ 
    deal, 
    index, 
    stageId, 
    moveCard 
  }: { 
    deal: Deal; 
    index: number; 
    stageId: string;
    moveCard: (dealId: string, targetStageId: string, sourceStageId: string, targetIndex?: number) => void;
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: 'DEAL',
      canDrop: (item) => item.id !== deal.id,
      drop: (item: { id: string, currentStageId: string }) => {
        if (item.id !== deal.id) {
          moveCard(item.id, stageId, item.currentStageId, index);
        }
      },
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop() && monitor.getItem().id !== deal.id,
      }),
    });
    
    const [{ isDragging }, drag] = useDrag({
      type: 'DEAL',
      item: { id: deal.id, currentStageId: stageId, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    
    // Apply the drag and drop refs
    drop(drag(ref));
    
    return (
      <Box sx={{ position: 'relative' }}>
        {/* Drop indicator */}
        {isOver && canDrop && (
          <Box 
            sx={{
              position: 'absolute',
              top: -4,
              left: 0,
              right: 0,
              height: 4,
              bgcolor: 'primary.main',
              zIndex: 10,
              borderRadius: '2px',
            }} 
          />
        )}
        <Box ref={ref}>
          <DealCard deal={deal} />
        </Box>
      </Box>
    );
  };
  
  // Empty drop target component to handle drops between cards
  const EmptyDropTarget = ({ 
    stageId, 
    index, 
    onDrop 
  }: { 
    stageId: string; 
    index: number;
    onDrop: (dealId: string, sourceStageId: string) => void;
  }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: 'DEAL',
      drop: (item: { id: string, currentStageId: string }) => {
        onDrop(item.id, item.currentStageId);
        return { dropped: true };
      },
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    });
    
    return (
      <Box 
        ref={drop}
        sx={{ 
          height: isOver && canDrop ? 100 : 20, 
          transition: 'height 0.2s ease',
          border: isOver && canDrop ? '2px dashed #1976d2' : 'none',
          borderRadius: 1,
          mb: 1,
        }}
      />
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
