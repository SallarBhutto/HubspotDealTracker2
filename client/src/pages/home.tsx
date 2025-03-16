import AppHeader from '@/components/AppHeader';
import KanbanBoard from '@/components/KanbanBoard';
import { useDealboard } from '@/hooks/useDealboard';
import { AlertCircle, FilterIcon, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const {
    deals,
    stages,
    pipelines,
    selectedPipelineId,
    isLoading,
    isError,
    error,
    handleSearch,
    handlePipelineChange,
    refreshData,
    lastUpdated
  } = useDealboard();

  // Return loading state
  if (isLoading && !deals?.length && !stages?.length) {
    return (
      <div className="text-neutral-400 h-screen flex flex-col overflow-hidden">
        <AppHeader onSearch={handleSearch} />
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-neutral-400">Loading deals...</p>
        </div>
      </div>
    );
  }

  // Return error state
  if (isError) {
    return (
      <div className="text-neutral-400 h-screen flex flex-col overflow-hidden">
        <AppHeader onSearch={handleSearch} />
        <div className="flex flex-col items-center justify-center flex-grow">
          <AlertCircle className="h-12 w-12 text-status-error" />
          <p className="mt-4 text-neutral-400 font-medium">Failed to load deals</p>
          <p className="text-neutral-300 mt-2">
            {error instanceof Error ? error.message : "Please check your connection and try again"}
          </p>
          <Button 
            className="mt-4 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={refreshData}
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  // Find the currently selected pipeline name
  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);

  // Return main UI
  return (
    <div className="text-neutral-400 h-screen flex flex-col overflow-hidden">
      <AppHeader onSearch={handleSearch} />
      
      {/* Pipeline selector */}
      <div className="bg-white border-b border-neutral-200 px-6 py-2 flex items-center">
        <div className="flex items-center mr-8">
          <span className="text-neutral-400 text-sm mr-3">Pipeline:</span>
          <Select 
            value={selectedPipelineId || ''} 
            onValueChange={handlePipelineChange}
          >
            <SelectTrigger className="w-[250px] border-neutral-200 bg-white">
              <SelectValue placeholder="Select a pipeline" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map(pipeline => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Display total deal count for selected pipeline */}
        <div className="flex items-center text-sm text-neutral-400">
          <FilterIcon className="h-4 w-4 mr-2" />
          <span>
            {deals?.length || 0} deal{deals?.length !== 1 ? 's' : ''} in {selectedPipeline?.name || 'pipeline'}
          </span>
        </div>
      </div>
      
      <KanbanBoard 
        deals={deals || []} 
        stages={stages || []} 
        isLoading={isLoading}
        onRefresh={refreshData}
        lastUpdated={lastUpdated}
      />
    </div>
  );
}
