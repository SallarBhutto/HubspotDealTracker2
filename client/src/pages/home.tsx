import { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import KanbanBoard from '@/components/KanbanBoard';
import { useDealboard } from '@/hooks/useDealboard';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const {
    deals,
    stages,
    isLoading,
    isError,
    error,
    handleSearch,
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

  // Return main UI
  return (
    <div className="text-neutral-400 h-screen flex flex-col overflow-hidden">
      <AppHeader onSearch={handleSearch} />
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
