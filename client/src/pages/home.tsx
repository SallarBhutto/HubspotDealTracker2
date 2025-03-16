import AppHeader from '@/components/AppHeader';
import KanbanBoard from '@/components/KanbanBoard';
import { useDealboard } from '@/hooks/useDealboard';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Paper,
  Container,
  Divider
} from '@mui/material';
import {
  ErrorOutlineRounded,
  RefreshRounded,
  FilterListRounded,
  Add as AddIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { AddDealForm } from '../components/AddDealForm';


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

  const [isAddDealOpen, setIsAddDealOpen] = useState(false);

  useEffect(() => {
    const handleOpenForm = () => setIsAddDealOpen(true);
    window.addEventListener('openAddDealForm', handleOpenForm);
    return () => window.removeEventListener('openAddDealForm', handleOpenForm);
  }, []);

  // Return loading state
  if (isLoading && !deals?.length && !stages?.length) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', color: 'text.secondary' }}>
        <AppHeader onSearch={handleSearch} />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <CircularProgress size={48} sx={{ color: 'primary.main' }} />
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>
            Loading deals...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Return error state
  if (isError) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', color: 'text.secondary' }}>
        <AppHeader onSearch={handleSearch} />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <ErrorOutlineRounded sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
            Failed to load deals
          </Typography>
          <Typography sx={{ mt: 1, color: 'text.disabled' }}>
            {error instanceof Error ? error.message : "Please check your connection and try again"}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshRounded />}
            onClick={refreshData}
            sx={{ mt: 3 }}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  // Find the currently selected pipeline name
  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);

  //Filter stages to only include those belonging to the selected pipeline (Assuming stages are associated with pipelines)

  const filteredStages = stages?.filter(stage => stage.pipelineId === selectedPipelineId) || [];


  // Return main UI
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', color: 'text.secondary' }}>
      <AppHeader onSearch={handleSearch} />

      {/* Pipeline selector */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
            Pipeline:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <Select
              value={selectedPipelineId || ''}
              onChange={(e) => handlePipelineChange(e.target.value as string)}
              displayEmpty
              sx={{
                bgcolor: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider'
                }
              }}
            >
              <MenuItem disabled value="">
                <Typography variant="body2">Select a pipeline</Typography>
              </MenuItem>
              {pipelines.map(pipeline => (
                <MenuItem key={pipeline.id} value={pipeline.id}>
                  <Typography variant="body2">{pipeline.name}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Display total deal count for selected pipeline */}
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
          <FilterListRounded sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="body2">
            {deals?.length || 0} deal{deals?.length !== 1 ? 's' : ''} in {selectedPipeline?.name || 'pipeline'}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDealOpen(true)}
        >
          Add Deal
        </Button>
      </Box>
      <AddDealForm
        open={isAddDealOpen}
        onClose={() => setIsAddDealOpen(false)}
        pipelines={pipelines}
        stages={filteredStages}
      />
      <KanbanBoard
        deals={deals || []}
        stages={stages || []}
        isLoading={isLoading}
        onRefresh={refreshData}
        lastUpdated={lastUpdated}
      />
    </Box>
  );
}