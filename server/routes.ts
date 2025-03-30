import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertChallengeSchema, insertQuizSchema } from "@shared/schema";

// Admin middleware
function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  
  const user = req.user as Express.User;
  if (!user.isAdmin || user.groupCode !== "admin") {
    return res.status(403).json({ message: "Administrator access required" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Define group passwords directly in the code
  const groupPasswords: Record<string, string[]> = {
    "group1": ["Alpha123", "Beta234", "Gamma345", "Delta456", "Epsilon567"],
    "group2": ["Eta789", "Theta890", "Iota901", "Kappa012", "Lambda123"],
    "group3": ["Nu345", "Xi456", "Omicron567", "Pi678", "Rho789"],
    "group4": ["Tau901", "Upsilon012", "Phi123", "Chi234", "Psi345"]
  };

  // Get all challenges
  app.get("/api/challenges", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const challenges = await storage.getAllChallenges();
      // Remove answers from the response
      const sanitizedChallenges = challenges.map(challenge => {
        const { answer, ...challengeWithoutAnswer } = challenge;
        return challengeWithoutAnswer;
      });
      
      res.json(sanitizedChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Get a specific challenge
  app.get("/api/challenges/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const challenge = await storage.getChallenge(id);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Remove answer from the response
      const { answer, ...challengeWithoutAnswer } = challenge;
      res.json(challengeWithoutAnswer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });

  // Verify a challenge answer
  app.post("/api/challenges/:id/verify", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const answerSchema = z.object({
        answer: z.string().min(1)
      });
      
      const result = answerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid answer format" });
      }
      
      const { answer } = result.data;
      const challenge = await storage.getChallenge(id);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      const user = req.user as Express.User;
      
      // Check if the challenge is already completed
      if (user.completedChallenges.includes(id.toString())) {
        return res.json({ 
          correct: true, 
          message: "Challenge already completed",
          alreadyCompleted: true
        });
      }
      
      // Get the user's group
      const groupNumber = user.groupCode?.toString() || "1";
      const groupKey = `group${groupNumber}`;
      
      // Get the correct password for this challenge based on group and challenge ID
      // Adjust challenge index for 0-based array (challenge IDs start at 1)
      const challengeIndex = id - 1;
      
      let isCorrect = false;
      
      // Check if we have passwords for this group and challenge
      if (groupPasswords[groupKey] && groupPasswords[groupKey][challengeIndex]) {
        const correctPassword = groupPasswords[groupKey][challengeIndex];
        // Compare case-sensitive password (as specified in passwords.json)
        isCorrect = correctPassword === answer;
      } else {
        // Fallback to original answer checking
        const correctAnswer = challenge.answer.toLowerCase();
        isCorrect = correctAnswer === answer.toLowerCase();
      }
      
      if (isCorrect) {
        // Update user progress
        const updatedUser = await storage.addCompletedChallenge(user.id, id);
        if (!updatedUser) {
          return res.status(500).json({ message: "Failed to update progress" });
        }
        
        return res.json({ 
          correct: true, 
          message: "Correct answer!",
          progress: updatedUser.progress,
          nextChallenge: updatedUser.currentChallenge
        });
      } else {
        return res.json({ 
          correct: false, 
          message: "Incorrect answer. Try again!" 
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to verify answer" });
    }
  });

  // Get current user's progress
  app.get("/api/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const user = req.user as Express.User;
      
      // Get the group progress info
      const groupProgress = await storage.getGroupProgress(user.groupCode);
      
      res.json({
        progress: user.progress,
        currentChallenge: user.currentChallenge,
        completedChallenges: user.completedChallenges,
        completedQuiz: user.completedQuiz,
        lastQuizQuestion: user.lastQuizQuestion,
        groupProgress: groupProgress || null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get quiz questions for the current user's group
  app.get("/api/quiz", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const user = req.user as Express.User;
      const quizzes = await storage.getQuizzesByGroup(user.groupCode);
      
      // Remove correct answers from the response
      const sanitizedQuizzes = quizzes.map(quiz => {
        const { correctOption, ...quizWithoutAnswer } = quiz;
        return quizWithoutAnswer;
      });
      
      res.json(sanitizedQuizzes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  // Get a specific quiz question
  app.get("/api/quiz/:index", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const index = parseInt(req.params.index);
      if (isNaN(index) || index < 1 || index > 3) {
        return res.status(400).json({ message: "Invalid quiz question index" });
      }
      
      const user = req.user as Express.User;
      const quiz = await storage.getQuizByGroupAndIndex(user.groupCode, index);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz question not found" });
      }
      
      // Remove correct answer from the response
      const { correctOption, ...quizWithoutAnswer } = quiz;
      res.json(quizWithoutAnswer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quiz question" });
    }
  });

  // Answer a quiz question
  app.post("/api/quiz/:index/answer", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const index = parseInt(req.params.index);
      if (isNaN(index) || index < 1 || index > 3) {
        return res.status(400).json({ message: "Invalid quiz question index" });
      }
      
      const answerSchema = z.object({
        selectedOption: z.number().min(0).max(3)
      });
      
      const result = answerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid answer format" });
      }
      
      const { selectedOption } = result.data;
      const user = req.user as Express.User;
      const quiz = await storage.getQuizByGroupAndIndex(user.groupCode, index);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz question not found" });
      }
      
      const isCorrect = selectedOption === quiz.correctOption;
      
      // If this is the last question and it's correct, mark the quiz as completed
      const isLastQuestion = index === 3;
      const completed = isLastQuestion && isCorrect;
      
      // Update the user's quiz progress
      let nextIndex = index;
      if (isCorrect) {
        nextIndex = Math.min(3, index + 1);
      }
      
      const updatedUser = await storage.updateUserQuizProgress(user.id, nextIndex, completed);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update progress" });
      }
      
      // If the user completed the quiz, update the group progress
      if (completed) {
        try {
          // Mark the group's quiz as completed with the current timestamp
          await storage.updateGroupCompletion(user.groupCode, Date.now());
        } catch (groupError) {
          console.error("Error updating group completion:", groupError);
          // Don't fail the entire request if group update fails
        }
      }
      
      return res.json({
        correct: isCorrect,
        message: isCorrect 
          ? "Correct answer!" 
          : "Incorrect answer. You lost a coin!",
        completed,
        nextIndex: updatedUser.lastQuizQuestion
      });
    } catch (error) {
      console.error("Quiz answer error:", error);
      res.status(500).json({ message: "Failed to verify answer" });
    }
  });

  // Save the group photo
  app.post("/api/group-photo", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const photoSchema = z.object({
        photoData: z.string().min(1)
      });
      
      const result = photoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid photo data" });
      }
      
      const { photoData } = result.data;
      const user = req.user as Express.User;
      
      // Save the group photo
      const updatedGroupProgress = await storage.saveGroupPhoto(user.groupCode, photoData);
      
      if (!updatedGroupProgress) {
        return res.status(500).json({ message: "Failed to save group photo" });
      }
      
      return res.json({
        success: true,
        message: "Group photo saved successfully"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to save group photo" });
    }
  });

  // Get group completion info
  app.get("/api/group-progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const user = req.user as Express.User;
      const groupProgress = await storage.getGroupProgress(user.groupCode);
      
      // Get all group members to check if everyone has completed the quiz
      const allGroupMembers = await storage.getAllUsers();
      const groupMembers = allGroupMembers.filter(member => member.groupCode === user.groupCode);
      const allMembersCompleted = groupMembers.length > 0 && groupMembers.every(member => member.completedQuiz);
      
      if (!groupProgress) {
        return res.json({
          completedQuiz: false,
          completionTime: 0,
          hasPhoto: false,
          allMembersCompleted
        });
      }
      
      // Read and get the gallery photos for the group
      return res.json({
        completedQuiz: groupProgress.completedQuiz,
        completionTime: groupProgress.completionTime,
        hasPhoto: !!groupProgress.groupPhoto,
        allMembersCompleted
      });
    } catch (error) {
      console.error("Error fetching group progress:", error);
      res.status(500).json({ message: "Failed to fetch group progress" });
    }
  });
  
  // Get group members progress
  app.get("/api/group-members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const user = req.user as Express.User;
      
      // Get all users in the same group
      const allUsers = await storage.getAllUsers();
      const groupMembers = allUsers.filter(member => member.groupCode === user.groupCode);
      
      // Remove sensitive information
      const sanitizedMembers = groupMembers.map(member => ({
        id: member.id,
        username: member.username,
        progress: member.progress,
        completedChallenges: member.completedChallenges,
        completedQuiz: member.completedQuiz,
        lastQuizQuestion: member.lastQuizQuestion
      }));
      
      return res.json(sanitizedMembers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group members" });
    }
  });
  
  // Get all groups progress for competition tracking
  app.get("/api/all-groups-progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get group progress for all groups
      const allGroups = await storage.getAllGroupsProgress();
      
      return res.json(allGroups);
    } catch (error) {
      console.error("Error fetching all groups progress:", error);
      res.status(500).json({ message: "Failed to fetch group progress data" });
    }
  });

  // ========== ADMIN API ROUTES ==========

  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Delete a user (admin only)
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get the user's group code before deleting them
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't allow admins to be deleted
      if (user.isAdmin) {
        return res.status(403).json({ message: "Cannot delete admin users" });
      }
      
      // Delete the user
      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete user" });
      }
      
      // Return success response with the deleted user's group code for cache invalidation
      res.json({ 
        success: true, 
        message: "User deleted successfully",
        groupCode: user.groupCode 
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Get all challenges with answers (admin only)
  app.get("/api/admin/challenges", isAdmin, async (req, res) => {
    try {
      const challenges = await storage.getAllChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Get a specific challenge with answers (admin only)
  app.get("/api/admin/challenges/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const challenge = await storage.getChallenge(id);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });

  // Create a new challenge (admin only)
  app.post("/api/admin/challenges", isAdmin, async (req, res) => {
    try {
      const result = insertChallengeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid challenge data", 
          errors: result.error.format() 
        });
      }
      
      const challenge = await storage.createChallenge(result.data);
      res.status(201).json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });

  // Update a challenge (admin only)
  app.put("/api/admin/challenges/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const result = insertChallengeSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid challenge data", 
          errors: result.error.format() 
        });
      }
      
      const challenge = await storage.updateChallenge(id, result.data);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to update challenge" });
    }
  });

  // Delete a challenge (admin only)
  app.delete("/api/admin/challenges/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const success = await storage.deleteChallenge(id);
      if (!success) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json({ message: "Challenge deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete challenge" });
    }
  });

  // Get all quizzes (admin only)
  app.get("/api/admin/quizzes", isAdmin, async (req, res) => {
    try {
      // Get quizzes for all groups
      const group1Quizzes = await storage.getQuizzesByGroup("1");
      const group2Quizzes = await storage.getQuizzesByGroup("2");
      const group3Quizzes = await storage.getQuizzesByGroup("3");
      const group4Quizzes = await storage.getQuizzesByGroup("4");
      
      res.json({
        group1: group1Quizzes,
        group2: group2Quizzes,
        group3: group3Quizzes,
        group4: group4Quizzes
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Get a specific quiz (admin only)
  app.get("/api/admin/quizzes/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const quiz = await storage.getQuiz(id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Create a new quiz (admin only)
  app.post("/api/admin/quizzes", isAdmin, async (req, res) => {
    try {
      const result = insertQuizSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid quiz data", 
          errors: result.error.format() 
        });
      }
      
      const quiz = await storage.createQuiz(result.data);
      res.status(201).json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // Update a quiz (admin only)
  app.put("/api/admin/quizzes/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const result = insertQuizSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid quiz data", 
          errors: result.error.format() 
        });
      }
      
      const quiz = await storage.updateQuiz(id, result.data);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  // Delete a quiz (admin only)
  app.delete("/api/admin/quizzes/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const success = await storage.deleteQuiz(id);
      if (!success) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });

  // Get all group progress (admin only)
  app.get("/api/admin/group-progress", isAdmin, async (req, res) => {
    try {
      const group1Progress = await storage.getGroupProgress("1");
      const group2Progress = await storage.getGroupProgress("2");
      const group3Progress = await storage.getGroupProgress("3");
      const group4Progress = await storage.getGroupProgress("4");
      
      res.json({
        group1: group1Progress || { groupCode: "1", completedQuiz: false, completionTime: 0, hasPhoto: false },
        group2: group2Progress || { groupCode: "2", completedQuiz: false, completionTime: 0, hasPhoto: false },
        group3: group3Progress || { groupCode: "3", completedQuiz: false, completionTime: 0, hasPhoto: false },
        group4: group4Progress || { groupCode: "4", completedQuiz: false, completionTime: 0, hasPhoto: false }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
