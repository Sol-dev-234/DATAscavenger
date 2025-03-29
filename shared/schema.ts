import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  groupCode: text("group_code").notNull(),
  progress: integer("progress").notNull().default(0),
  currentChallenge: integer("current_challenge").notNull().default(1),
  completedChallenges: text("completed_challenges").array().notNull().default([]),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  answer: text("answer").notNull(),
  codeName: text("code_name").notNull(),
  order: integer("order").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  groupCode: true,
});

export const loginUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChallengeSchema = createInsertSchema(challenges);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
