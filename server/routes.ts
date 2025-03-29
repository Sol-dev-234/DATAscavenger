import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

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
      
      // Get group-specific answer for the final challenge (simulated)
      let correctAnswer = challenge.answer.toLowerCase();
      
      // For challenge 5 (FINAL_QUIZ), we use group-specific answers
      if (id === 5) {
        // Group-specific answers for the final quiz challenge
        const groupSpecificAnswers: Record<string, string> = {
          "1": "mainframe",
          "2": "database",
          "3": "security",
          "4": "networks"
        };
        
        // If we have a group-specific answer, use it
        const groupCode = user.groupCode?.toString() || "";
        if (groupCode && groupSpecificAnswers[groupCode]) {
          correctAnswer = groupSpecificAnswers[groupCode];
        }
      }
      
      const isCorrect = correctAnswer === answer.toLowerCase();
      
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
      res.json({
        progress: user.progress,
        currentChallenge: user.currentChallenge,
        completedChallenges: user.completedChallenges
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
