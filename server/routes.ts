import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";

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
      const nextIndex = isCorrect ? Math.min(3, index + 1) : index;
      const updatedUser = await storage.updateUserQuizProgress(user.id, nextIndex, completed);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update progress" });
      }
      
      // If the user completed the quiz, check if all users in the group have completed
      if (completed) {
        // Mark the group's quiz as completed
        await storage.updateGroupCompletion(user.groupCode, Date.now());
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
      
      if (!groupProgress) {
        return res.json({
          completedQuiz: false,
          completionTime: 0,
          hasPhoto: false
        });
      }
      
      return res.json({
        completedQuiz: groupProgress.completedQuiz,
        completionTime: groupProgress.completionTime,
        hasPhoto: !!groupProgress.groupPhoto
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
