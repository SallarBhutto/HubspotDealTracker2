
import { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface AddDealFormProps {
  open: boolean;
  onClose: () => void;
  pipelines: { id: string; name: string; }[];
  stages: { id: string; label: string; pipelineId: string; }[];
}

export function AddDealForm({ open, onClose, pipelines, stages }: AddDealFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    pipelineId: '',
    stageId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedStage = stages.find(s => s.id === formData.stageId);
      const selectedPipeline = pipelines.find(p => p.id === formData.pipelineId);

      await api.post('/api/deals', {
        ...formData,
        amount: parseInt(formData.amount),
        stageName: selectedStage?.label,
        pipelineName: selectedPipeline?.name
      });

      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      onClose();
      setFormData({ name: '', amount: '', pipelineId: '', stageId: '' });
    } catch (error) {
      console.error('Failed to create deal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStages = stages.filter(stage => stage.pipelineId === formData.pipelineId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Deal</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Deal Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Pipeline</InputLabel>
              <Select
                value={formData.pipelineId}
                label="Pipeline"
                onChange={(e) => setFormData(prev => ({ ...prev, pipelineId: e.target.value, stageId: '' }))}
              >
                {pipelines.map(pipeline => (
                  <MenuItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required disabled={!formData.pipelineId}>
              <InputLabel>Stage</InputLabel>
              <Select
                value={formData.stageId}
                label="Stage"
                onChange={(e) => setFormData(prev => ({ ...prev, stageId: e.target.value }))}
              >
                {filteredStages.map(stage => (
                  <MenuItem key={stage.id} value={stage.id}>
                    {stage.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Create Deal
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
