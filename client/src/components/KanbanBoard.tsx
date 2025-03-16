import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Deal, Stage } from '@shared/schema';
import DealCard from './DealCard';
import { RefreshCcwIcon, InboxIcon, PlusIcon, MoreHorizontalIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
      <div className={`board-column flex flex-col mx-2 first:ml-6 last:mr-6 w-72 min-w-72 
                      bg-neutral-100 rounded-t overflow-hidden 
                      ${isOver ? 'ring-2 ring-primary ring-inset' : ''}`}>
        <div className="px-4 py-3 bg-white border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="font-medium text-sm">{stage.label}</h3>
            <span className="ml-2 bg-neutral-200 text-neutral-400 text-xs px-2 py-0.5 rounded-full">
              {stageDeals.length}
            </span>
          </div>
          <div className="flex items-center">
            <MoreHorizontalIcon className="text-neutral-300 h-4 w-4" />
          </div>
        </div>
        <div ref={drop} className="flex-grow overflow-y-auto p-2 space-y-2">
          {stageDeals.length > 0 ? (
            stageDeals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-neutral-300">
              <InboxIcon className="h-6 w-6 mb-2" />
              <p className="text-sm">No deals in this stage</p>
              <button className="mt-2 text-primary text-sm hover:underline flex items-center">
                <PlusIcon className="h-4 w-4 mr-1" /> Add deal
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main id="kanban-board" className="flex-grow flex flex-col overflow-hidden">
      <div className="px-6 py-3 flex items-center justify-between bg-neutral-100">
        <div className="flex items-center">
          <h2 className="font-medium">Deals</h2>
          <span className="ml-2 bg-neutral-300 text-white text-xs px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-neutral-300">
            Last updated: {lastUpdated || 'Never'}
          </span>
          <button 
            className="ml-4 text-primary flex items-center text-sm hover:underline"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCcwIcon className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> 
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-x-auto overflow-y-hidden">
        <div className="flex h-full" style={{ minWidth: 'fit-content' }}>
          {stages.map(stage => (
            <StageColumn key={stage.id} stage={stage} />
          ))}
        </div>
      </div>
    </main>
  );
}
