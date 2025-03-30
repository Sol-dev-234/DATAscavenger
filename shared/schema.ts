import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
  completedQuiz: boolean("completed_quiz").default(false),
  lastQuizQuestion: integer("last_quiz_question").default(1),
  isAdmin: boolean("is_admin").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  answer: text("answer").notNull(),
  codeName: text("code_name").notNull(),
  order: integer("order").notNull(),
});

export const groupProgress = pgTable("group_progress", {
  id: serial("id").primaryKey(),
  groupCode: text("group_code").notNull().unique(),
  completedQuiz: boolean("completed_quiz").default(false),
  completionTime: integer("completion_time").default(0),
  groupPhoto: text("group_photo"), // Base64 encoded photo
  hasPhoto: boolean("has_photo").default(false),
  allMembersCompleted: boolean("all_members_completed").default(false),
  totalMembers: integer("total_members").default(0),
  completedMembers: integer("completed_members").default(0),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  groupCode: text("group_code").notNull(),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  correctOption: integer("correct_option").notNull(),
  quizIndex: integer("quiz_index").notNull(), // 1, 2, or 3 - for the three questions
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  groupCode: true,
  isAdmin: true,
}).extend({
  groupCode: z.enum(["1", "2", "3", "4", "admin"], {
    errorMap: () => ({ message: "Group code must be 1, 2, 3, 4, or admin" }),
  }),
  adminCode: z.string().optional(),
});

export const loginUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChallengeSchema = createInsertSchema(challenges);
export const insertQuizSchema = createInsertSchema(quizzes);
export const insertGroupProgressSchema = createInsertSchema(groupProgress);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type GroupProgress = typeof groupProgress.$inferSelect;
export type InsertGroupProgress = z.infer<typeof insertGroupProgressSchema>;
