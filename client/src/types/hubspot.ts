// HubSpot API response types

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    amount?: string;
    pipeline: string;
    dealstage: string;
    hubspot_owner_id?: string;
    closedate?: string;
    hs_lastmodifieddate?: string;
    company?: string;
    contact?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotPipeline {
  id: string;
  label: string;
  displayOrder: number;
  active: boolean;
  stages: HubSpotStage[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotStage {
  id: string;
  label: string;
  displayOrder: number;
  metadata: {
    isClosed: string;
    probability: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotPipelineResponse {
  results: HubSpotPipeline[];
}

export interface HubSpotDealsResponse {
  results: HubSpotDeal[];
  paging?: {
    next?: { link: string };
  };
}

export interface HubSpotErrorResponse {
  status: string;
  message: string;
  correlationId?: string;
  category?: string;
}
