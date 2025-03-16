import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { Deal, Pipeline, Stage } from "@shared/schema";

// Configure axios instance for HubSpot API
const hubspotAPI = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to each request
hubspotAPI.interceptors.request.use(config => {
  const token = process.env.HUBSPOT_API_KEY;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    throw new Error('HUBSPOT_API_KEY is not configured');
  }
  return config;
});

interface HubSpotErrorResponse {
  status: string;
  message: string;
  correlationId?: string;
  category?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper to format HubSpot errors
  const handleHubSpotError = (error: any) => {
    if (error.response?.data) {
      const hubspotError = error.response.data as HubSpotErrorResponse;
      return {
        status: error.response.status,
        message: hubspotError.message || 'HubSpot API error',
        correlationId: hubspotError.correlationId
      };
    }
    return {
      status: 500,
      message: error.message || 'Unknown error occurred',
    };
  };

  // API routes
  app.get('/api/deals', async (req, res) => {
    try {
      const response = await hubspotAPI.get('/crm/v3/objects/deals', {
        params: {
          properties: ['dealname', 'amount', 'pipeline', 'dealstage', 'hubspot_owner_id', 'closedate', 'hs_lastmodifieddate', 'company', 'contact'],
          limit: 100
        }
      });
      
      // Transform HubSpot response to our schema
      const deals: Deal[] = response.data.results.map((deal: any) => ({
        id: deal.id,
        name: deal.properties.dealname,
        amount: deal.properties.amount ? parseInt(deal.properties.amount) : undefined,
        stageId: deal.properties.dealstage,
        stageName: '', // Will be filled after getting pipelines data
        pipelineId: deal.properties.pipeline,
        pipelineName: '', // Will be filled after getting pipelines data
        probability: '',
        company: deal.properties.company,
        contact: deal.properties.contact,
        lastUpdated: deal.properties.hs_lastmodifieddate ? new Date(deal.properties.hs_lastmodifieddate) : undefined,
        metadata: deal
      }));

      // Store in memory for quick access
      storage.setDeals(deals);
      
      res.json(deals);
    } catch (error) {
      const formattedError = handleHubSpotError(error);
      res.status(formattedError.status).json(formattedError);
    }
  });

  app.get('/api/pipelines', async (req, res) => {
    try {
      const response = await hubspotAPI.get('/crm/v3/pipelines/deals');
      
      // Transform pipelines and store all stages
      const allStages: Stage[] = [];
      
      const pipelines: Pipeline[] = response.data.results.map((pipeline: any) => {
        // Process all stages for this pipeline
        const pipelineStages = pipeline.stages.map((stage: any) => ({
          id: stage.id,
          pipelineId: pipeline.id,
          label: stage.label,
          displayOrder: stage.displayOrder,
          probability: stage.metadata?.probability || '0',
          isClosed: stage.metadata?.isClosed === 'true',
          metadata: stage
        }));
        
        // Add to all stages list
        allStages.push(...pipelineStages);
        
        return {
          id: pipeline.id,
          name: pipeline.label,
          displayOrder: pipeline.displayOrder,
          active: pipeline.active
        };
      });
      
      // Store in memory
      storage.setPipelines(pipelines);
      storage.setStages(allStages);
      
      // Update deal stage names now that we have the stages data
      const deals = await storage.getDeals();
      const updatedDeals = deals.map(deal => {
        const stage = allStages.find(s => s.id === deal.stageId);
        const pipeline = pipelines.find(p => p.id === deal.pipelineId);
        
        return {
          ...deal,
          stageName: stage?.label || 'Unknown Stage',
          pipelineName: pipeline?.name || 'Unknown Pipeline',
          probability: stage?.probability || '0'
        };
      });
      
      storage.setDeals(updatedDeals);

      res.json({
        pipelines,
        stages: allStages
      });
    } catch (error) {
      const formattedError = handleHubSpotError(error);
      res.status(formattedError.status).json(formattedError);
    }
  });

  app.patch('/api/deals/:id/stage', async (req, res) => {
    const { id } = req.params;
    const { stageId } = req.body;
    
    if (!stageId) {
      return res.status(400).json({ message: 'stageId is required' });
    }
    
    try {
      // Update in HubSpot
      await hubspotAPI.patch(`/crm/v3/objects/deals/${id}`, {
        properties: {
          dealstage: stageId
        }
      });
      
      // Update in local storage
      const updatedDeal = await storage.updateDealStage(id, stageId);
      
      if (!updatedDeal) {
        return res.status(404).json({ message: 'Deal not found' });
      }
      
      res.json(updatedDeal);
    } catch (error) {
      const formattedError = handleHubSpotError(error);
      res.status(formattedError.status).json(formattedError);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
