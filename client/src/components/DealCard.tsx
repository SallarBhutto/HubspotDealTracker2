import { useDrag } from 'react-dnd';
import { Deal } from '@shared/schema';
import { Building2, User, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const probabilityPercentage = deal.probability ? parseFloat(deal.probability) * 100 : 0;
  const formattedProbability = `${probabilityPercentage}%`;
  
  const probabilityColor = () => {
    if (probabilityPercentage >= 90) return 'bg-purple-100 text-purple-800';
    if (probabilityPercentage >= 75) return 'bg-green-100 text-green-800';
    if (probabilityPercentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-primary';
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

  return (
    <div 
      ref={drag}
      className={`deal-card bg-white rounded border border-neutral-200 p-3 hover:shadow-md cursor-grab transition-all
                  ${isDragging ? 'opacity-60 rotate-2 shadow-lg' : ''}`}
      data-deal-id={deal.id}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm">{deal.name}</h4>
        <span className={`text-xs ${probabilityColor()} px-1.5 py-0.5 rounded`}>
          {formattedProbability}
        </span>
      </div>
      <div className="mt-2 text-xs text-neutral-300">
        <div className="flex items-center">
          <Building2 className="h-3 w-3 mr-1" />
          <span>{deal.company || 'No company'}</span>
        </div>
        <div className="flex items-center mt-1">
          <User className="h-3 w-3 mr-1" />
          <span>{deal.contact || 'No contact'}</span>
        </div>
        <div className="flex items-center mt-1">
          <DollarSign className="h-3 w-3 mr-1" />
          <span>{deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount'}</span>
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center text-xs">
        <span className="text-neutral-300">Updated: {formattedDate}</span>
        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-xs">
          {getInitials()}
        </div>
      </div>
    </div>
  );
}
