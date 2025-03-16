import { users, type User, type InsertUser, type Deal, type Pipeline, type Stage } from "@shared/schema";

// Storage interface for all data operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // HubSpot deals operations
  getDealById(id: string): Promise<Deal | undefined>;
  getDeals(): Promise<Deal[]>;
  updateDealStage(id: string, stageId: string): Promise<Deal | undefined>;
  
  // HubSpot pipeline operations
  getPipelines(): Promise<Pipeline[]>;
  getPipelineById(id: string): Promise<Pipeline | undefined>;
  
  // HubSpot stage operations
  getStages(pipelineId: string): Promise<Stage[]>;
  getStageById(id: string): Promise<Stage | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private deals: Map<string, Deal>;
  private pipelines: Map<string, Pipeline>;
  private stages: Map<string, Stage>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.deals = new Map();
    this.pipelines = new Map();
    this.stages = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Deal methods
  async getDealById(id: string): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async getDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }

  async updateDealStage(id: string, stageId: string): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    
    const stage = this.stages.get(stageId);
    if (!stage) return undefined;
    
    const updatedDeal: Deal = {
      ...deal,
      stageId,
      stageName: stage.label,
      lastUpdated: new Date()
    };
    
    this.deals.set(id, updatedDeal);
    return updatedDeal;
  }

  // Pipeline methods
  async getPipelineById(id: string): Promise<Pipeline | undefined> {
    return this.pipelines.get(id);
  }

  async getPipelines(): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values());
  }

  // Stage methods
  async getStageById(id: string): Promise<Stage | undefined> {
    return this.stages.get(id);
  }

  async getStages(pipelineId: string): Promise<Stage[]> {
    return Array.from(this.stages.values())
      .filter(stage => stage.pipelineId === pipelineId)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  // Helper methods to set data from HubSpot
  setDeals(dealsData: Deal[]): void {
    this.deals.clear();
    dealsData.forEach(deal => {
      this.deals.set(deal.id, deal);
    });
  }

  setPipelines(pipelinesData: Pipeline[]): void {
    this.pipelines.clear();
    pipelinesData.forEach(pipeline => {
      this.pipelines.set(pipeline.id, pipeline);
    });
  }

  setStages(stagesData: Stage[]): void {
    this.stages.clear();
    stagesData.forEach(stage => {
      this.stages.set(stage.id, stage);
    });
  }
}

export const storage = new MemStorage();
