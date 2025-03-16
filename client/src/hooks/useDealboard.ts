import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Deal, Stage, Pipeline } from '@shared/schema';
import { format } from 'date-fns';

export function useDealboard() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Fetch deals
  const { 
    data: deals,
    isLoading: isLoadingDeals,
    isError: isErrorDeals,
    error: dealsError,
    refetch: refetchDeals
  } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
  });
  
  // Fetch pipelines and stages
  const {
    data: pipelineData,
    isLoading: isLoadingPipelines,
    isError: isErrorPipelines,
    error: pipelinesError,
    refetch: refetchPipelines
  } = useQuery<{pipelines: Pipeline[], stages: Stage[]}>({
    queryKey: ['/api/pipelines'],
  });
  
  // Combined loading state
  const isLoading = isLoadingDeals || isLoadingPipelines;
  const isError = isErrorDeals || isErrorPipelines;
  const error = dealsError || pipelinesError;
  
  // Filter deals based on search query
  useEffect(() => {
    if (!deals) {
      setFilteredDeals([]);
      return;
    }
    
    if (!searchQuery) {
      setFilteredDeals(deals);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = deals.filter(deal => 
      deal.name.toLowerCase().includes(lowercaseQuery) ||
      (deal.company && deal.company.toLowerCase().includes(lowercaseQuery)) ||
      (deal.contact && deal.contact.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredDeals(filtered);
  }, [deals, searchQuery]);
  
  // Sort stages by display order
  const stages = pipelineData?.stages.slice().sort((a, b) => 
    (a.displayOrder || 0) - (b.displayOrder || 0)
  ) || [];
  
  // Handle search input changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  // Refresh data
  const refreshData = useCallback(async () => {
    await Promise.all([
      refetchDeals(),
      refetchPipelines()
    ]);
    
    setLastUpdated(format(new Date(), 'MMM d, yyyy h:mm a'));
    
    // Update last updated timestamp
    queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
    queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
  }, [queryClient, refetchDeals, refetchPipelines]);
  
  // Set initial last updated time
  useEffect(() => {
    if (deals && !lastUpdated) {
      setLastUpdated(format(new Date(), 'MMM d, yyyy h:mm a'));
    }
  }, [deals, lastUpdated]);
  
  return {
    deals: filteredDeals,
    stages,
    pipelines: pipelineData?.pipelines || [],
    isLoading,
    isError,
    error,
    handleSearch,
    refreshData,
    lastUpdated
  };
}
