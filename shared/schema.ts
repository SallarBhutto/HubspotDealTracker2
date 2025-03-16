import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// HubSpot deal schema
export const deals = pgTable("deals", {
  id: text("id").primaryKey(), // HubSpot deal ID
  name: text("name").notNull(),
  amount: integer("amount"),
  probability: text("probability"),
  stageId: text("stage_id").notNull(),
  stageName: text("stage_name").notNull(),
  pipelineId: text("pipeline_id").notNull(),
  pipelineName: text("pipeline_name").notNull(),
  company: text("company"),
  contact: text("contact"),
  lastUpdated: timestamp("last_updated"),
  metadata: jsonb("metadata")
});

// HubSpot pipeline and stages schema
export const pipelines = pgTable("pipelines", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  displayOrder: integer("display_order"),
  active: boolean("active").default(true)
});

export const stages = pgTable("stages", {
  id: text("id").primaryKey(),
  pipelineId: text("pipeline_id").notNull(),
  label: text("label").notNull(),
  displayOrder: integer("display_order"),
  probability: text("probability"),
  isClosed: boolean("is_closed").default(false),
  metadata: jsonb("metadata")
});

// User authentication schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
});

// Schema types
export type Deal = typeof deals.$inferSelect;
export type Pipeline = typeof pipelines.$inferSelect;
export type Stage = typeof stages.$inferSelect;
export type User = typeof users.$inferSelect;

// Insert schema types
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
