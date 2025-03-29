import { 
  users, challenges, quizzes, groupProgress,
  type User, type InsertUser, type Challenge, type InsertChallenge, 
  type Quiz, type InsertQuiz, type GroupProgress, type InsertGroupProgress 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProgress(userId: number, progress: number): Promise<User | undefined>;
  updateUserChallenge(userId: number, challengeId: number): Promise<User | undefined>;
  addCompletedChallenge(userId: number, challengeId: number): Promise<User | undefined>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  getAllChallenges(): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  
  // Quiz related methods
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizzesByGroup(groupCode: string): Promise<Quiz[]>;
  getQuizByGroupAndIndex(groupCode: string, quizIndex: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateUserQuizProgress(userId: number, questionIndex: number, completed?: boolean): Promise<User | undefined>;
  
  // Group progress related methods
  getGroupProgress(groupCode: string): Promise<GroupProgress | undefined>;
  createOrUpdateGroupProgress(groupProgress: InsertGroupProgress): Promise<GroupProgress>;
  updateGroupCompletion(groupCode: string, completionTime: number): Promise<GroupProgress | undefined>;
  saveGroupPhoto(groupCode: string, photoData: string): Promise<GroupProgress | undefined>;
  
  // Admin methods
  updateChallenge(id: number, updateChallenge: Partial<InsertChallenge>): Promise<Challenge | undefined>;
  deleteChallenge(id: number): Promise<boolean>;
  updateQuiz(id: number, updateQuiz: Partial<InsertQuiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private challenges: Map<number, Challenge>;
  private quizzes: Map<number, Quiz>;
  private groupProgressMap: Map<string, GroupProgress>;
  sessionStore: session.Store;
  currentUserId: number;
  currentChallengeId: number;
  currentQuizId: number;

  constructor() {
    this.users = new Map();
    this.challenges = new Map();
    this.quizzes = new Map();
    this.groupProgressMap = new Map();
    this.currentUserId = 1;
    this.currentChallengeId = 1;
    this.currentQuizId = 1;
    
    // Initialize default challenges
    this.initializeChallenges();
    
    // Initialize quiz questions
    this.initializeQuizzes();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }
  
  private initializeQuizzes() {
    // Group 1 quizzes (Programming related)
    const quiz1_1: InsertQuiz = {
      groupCode: "1",
      question: "Which programming paradigm uses objects to model data and behavior?",
      options: ["Procedural Programming", "Object-Oriented Programming", "Functional Programming", "Event-Driven Programming"],
      correctOption: 1, // 0-indexed, so 1 = second option (OOP)
      quizIndex: 1
    };
    this.createQuiz(quiz1_1);
    
    const quiz1_2: InsertQuiz = {
      groupCode: "1",
      question: "Which data structure follows the Last In, First Out (LIFO) principle?",
      options: ["Queue", "Stack", "Linked List", "Binary Tree"],
      correctOption: 1, // Stack
      quizIndex: 2
    };
    this.createQuiz(quiz1_2);
    
    const quiz1_3: InsertQuiz = {
      groupCode: "1",
      question: "Which sorting algorithm has the best average-case time complexity?",
      options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"],
      correctOption: 2, // Merge Sort
      quizIndex: 3
    };
    this.createQuiz(quiz1_3);
    
    // Group 2 quizzes (Networking related)
    const quiz2_1: InsertQuiz = {
      groupCode: "2",
      question: "Which protocol is used for secure web browsing?",
      options: ["HTTP", "FTP", "HTTPS", "SMTP"],
      correctOption: 2, // HTTPS
      quizIndex: 1
    };
    this.createQuiz(quiz2_1);
    
    const quiz2_2: InsertQuiz = {
      groupCode: "2",
      question: "Which layer of the OSI model is responsible for routing?",
      options: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"],
      correctOption: 2, // Network Layer
      quizIndex: 2
    };
    this.createQuiz(quiz2_2);
    
    const quiz2_3: InsertQuiz = {
      groupCode: "2",
      question: "What device connects different networks together?",
      options: ["Hub", "Switch", "Router", "Modem"],
      correctOption: 2, // Router
      quizIndex: 3
    };
    this.createQuiz(quiz2_3);
    
    // Group 3 quizzes (Database related)
    const quiz3_1: InsertQuiz = {
      groupCode: "3",
      question: "Which SQL statement is used to retrieve data from a database?",
      options: ["INSERT", "UPDATE", "DELETE", "SELECT"],
      correctOption: 3, // SELECT
      quizIndex: 1
    };
    this.createQuiz(quiz3_1);
    
    const quiz3_2: InsertQuiz = {
      groupCode: "3",
      question: "What does ACID stand for in database transactions?",
      options: ["Atomicity, Consistency, Isolation, Durability", "Authorization, Consistency, Integrity, Dependability", "Adaptability, Consistency, Integration, Data", "Atomicity, Control, Isolation, Dependability"],
      correctOption: 0, // Atomicity, Consistency, Isolation, Durability
      quizIndex: 2
    };
    this.createQuiz(quiz3_2);
    
    const quiz3_3: InsertQuiz = {
      groupCode: "3",
      question: "Which is not a type of database relationship?",
      options: ["One-to-One", "One-to-Many", "Many-to-Many", "All-to-All"],
      correctOption: 3, // All-to-All
      quizIndex: 3
    };
    this.createQuiz(quiz3_3);
    
    // Group 4 quizzes (Cybersecurity related)
    const quiz4_1: InsertQuiz = {
      groupCode: "4",
      question: "Which attack aims to gain unauthorized access by impersonating a trusted entity?",
      options: ["DoS Attack", "SQL Injection", "Phishing", "Brute Force"],
      correctOption: 2, // Phishing
      quizIndex: 1
    };
    this.createQuiz(quiz4_1);
    
    const quiz4_2: InsertQuiz = {
      groupCode: "4",
      question: "Which encryption method uses the same key for encryption and decryption?",
      options: ["Symmetric Encryption", "Asymmetric Encryption", "Public Key Infrastructure", "Quantum Encryption"],
      correctOption: 0, // Symmetric Encryption
      quizIndex: 2
    };
    this.createQuiz(quiz4_2);
    
    const quiz4_3: InsertQuiz = {
      groupCode: "4",
      question: "What is the purpose of a firewall in network security?",
      options: ["To encrypt data transmissions", "To monitor system performance", "To filter network traffic", "To backup important data"],
      correctOption: 2, // To filter network traffic
      quizIndex: 3
    };
    this.createQuiz(quiz4_3);
  }

  private initializeChallenges() {
    const defaultChallenges: InsertChallenge[] = [
      {
        title: "INIT_SEQUENCE",
        description: "Decode the initial access sequence in your assigned area.",
        answer: "group_specific",
        codeName: "Challenge 01: INIT_SEQUENCE",
        order: 1
      },
      {
        title: "CIPHER_BREAK",
        description: "Decrypt the Caesar cipher message.",
        answer: "group_specific",
        codeName: "Challenge 02: CIPHER_BREAK",
        order: 2
      },
      {
        title: "BINARY_DECODE",
        description: "Convert the binary sequence.",
        answer: "group_specific",
        codeName: "Challenge 03: BINARY_DECODE",
        order: 3
      },
      {
        title: "NETWORK_BREACH",
        description: "Scan the QR code in your area.",
        answer: "group_specific",
        codeName: "Challenge 04: NETWORK_BREACH",
        order: 4
      },
      {
        title: "FINAL_QUIZ",
        description: "Complete your group's IT quiz.",
        answer: "group_specific",
        codeName: "Challenge 05: FINAL_QUIZ",
        order: 5
      }
    ];

    defaultChallenges.forEach(challenge => {
      const id = this.currentChallengeId++;
      this.challenges.set(id, { ...challenge, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      progress: 0, 
      currentChallenge: 1,
      completedChallenges: [],
      completedQuiz: false,
      lastQuizQuestion: 1,
      isAdmin: insertUser.isAdmin || false,
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProgress(userId: number, progress: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, progress };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserChallenge(userId: number, challengeId: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, currentChallenge: challengeId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async addCompletedChallenge(userId: number, challengeId: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    // Only add if not already completed
    if (!user.completedChallenges.includes(challengeId.toString())) {
      const completedChallenges = [...user.completedChallenges, challengeId.toString()];
      const progress = Math.min(100, completedChallenges.length * 20); // 20% per challenge, max 100%
      
      const updatedUser = { 
        ...user, 
        completedChallenges,
        progress,
        currentChallenge: Math.min(5, challengeId + 1) // Move to next challenge, max is 5
      };
      
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    
    return user;
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).sort((a, b) => a.order - b.order);
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.currentChallengeId++;
    const challenge: Challenge = { ...insertChallenge, id };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async updateChallenge(id: number, updateChallenge: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const challenge = this.challenges.get(id);
    if (!challenge) return undefined;
    
    const updatedChallenge = { ...challenge, ...updateChallenge };
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }

  async deleteChallenge(id: number): Promise<boolean> {
    return this.challenges.delete(id);
  }
  
  // Quiz related methods
  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }
  
  async getQuizzesByGroup(groupCode: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values())
      .filter(quiz => quiz.groupCode === groupCode)
      .sort((a, b) => a.quizIndex - b.quizIndex);
  }
  
  async getQuizByGroupAndIndex(groupCode: string, quizIndex: number): Promise<Quiz | undefined> {
    return Array.from(this.quizzes.values())
      .find(quiz => quiz.groupCode === groupCode && quiz.quizIndex === quizIndex);
  }
  
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentQuizId++;
    const newQuiz: Quiz = { ...quiz, id };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }
  
  async updateQuiz(id: number, updateQuiz: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;
    
    const updatedQuiz = { ...quiz, ...updateQuiz };
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }

  async deleteQuiz(id: number): Promise<boolean> {
    return this.quizzes.delete(id);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUserQuizProgress(userId: number, questionIndex: number, completed = false): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      lastQuizQuestion: questionIndex,
      completedQuiz: completed,
      updatedAt: new Date()
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Group progress related methods
  async getGroupProgress(groupCode: string): Promise<GroupProgress | undefined> {
    return this.groupProgressMap.get(groupCode);
  }
  
  async createOrUpdateGroupProgress(groupProgress: InsertGroupProgress): Promise<GroupProgress> {
    const existingProgress = this.groupProgressMap.get(groupProgress.groupCode);
    
    const progress: GroupProgress = {
      id: existingProgress?.id || this.groupProgressMap.size + 1,
      groupCode: groupProgress.groupCode,
      completedQuiz: groupProgress.completedQuiz ?? false,
      completionTime: groupProgress.completionTime ?? 0,
      groupPhoto: groupProgress.groupPhoto ?? null,
      updatedAt: new Date()
    };
    
    this.groupProgressMap.set(groupProgress.groupCode, progress);
    return progress;
  }
  
  async updateGroupCompletion(groupCode: string, completionTime: number): Promise<GroupProgress | undefined> {
    const groupProgress = this.groupProgressMap.get(groupCode);
    if (!groupProgress) {
      // Create a new group progress record
      return this.createOrUpdateGroupProgress({
        groupCode,
        completionTime,
        completedQuiz: true
      });
    }
    
    const updatedProgress = {
      ...groupProgress,
      completionTime,
      completedQuiz: true,
      updatedAt: new Date()
    };
    
    this.groupProgressMap.set(groupCode, updatedProgress);
    return updatedProgress;
  }
  
  async saveGroupPhoto(groupCode: string, photoData: string): Promise<GroupProgress | undefined> {
    const groupProgress = this.groupProgressMap.get(groupCode);
    if (!groupProgress) {
      // Create a new group progress record
      return this.createOrUpdateGroupProgress({
        groupCode,
        groupPhoto: photoData
      });
    }
    
    const updatedProgress = {
      ...groupProgress,
      groupPhoto: photoData,
      updatedAt: new Date()
    };
    
    this.groupProgressMap.set(groupCode, updatedProgress);
    return updatedProgress;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      isAdmin: insertUser.isAdmin || false,
      progress: 0,
      currentChallenge: 1,
      completedChallenges: [],
      completedQuiz: false,
      lastQuizQuestion: 1
    }).returning();
    
    return result[0];
  }

  async updateUserProgress(userId: number, progress: number): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ progress })
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }

  async updateUserChallenge(userId: number, challengeId: number): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ currentChallenge: challengeId })
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }

  async addCompletedChallenge(userId: number, challengeId: number): Promise<User | undefined> {
    // First get the user to check current challenges
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    const user = userResult[0];
    
    if (!user) return undefined;
    
    // Only add if not already completed
    if (!user.completedChallenges.includes(challengeId.toString())) {
      const completedChallenges = [...user.completedChallenges, challengeId.toString()];
      const progress = Math.min(100, completedChallenges.length * 20); // 20% per challenge, max 100%
      const nextChallenge = Math.min(5, challengeId + 1); // Move to next challenge, max is 5
      
      const result = await db.update(users)
        .set({ 
          completedChallenges,
          progress,
          currentChallenge: nextChallenge
        })
        .where(eq(users.id, userId))
        .returning();
      
      return result[0];
    }
    
    return user;
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const result = await db.select().from(challenges).where(eq(challenges.id, id));
    return result[0];
  }

  async getAllChallenges(): Promise<Challenge[]> {
    const result = await db.select().from(challenges).orderBy(challenges.order);
    return result;
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const result = await db.insert(challenges).values(insertChallenge).returning();
    return result[0];
  }

  async updateChallenge(id: number, updateChallenge: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const result = await db.update(challenges)
      .set(updateChallenge)
      .where(eq(challenges.id, id))
      .returning();
    
    return result[0];
  }

  async deleteChallenge(id: number): Promise<boolean> {
    const result = await db.delete(challenges).where(eq(challenges.id, id)).returning();
    return result.length > 0;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const result = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return result[0];
  }
  
  async getQuizzesByGroup(groupCode: string): Promise<Quiz[]> {
    const result = await db.select()
      .from(quizzes)
      .where(eq(quizzes.groupCode, groupCode))
      .orderBy(quizzes.quizIndex);
    
    return result;
  }
  
  async getQuizByGroupAndIndex(groupCode: string, quizIndex: number): Promise<Quiz | undefined> {
    const result = await db.select()
      .from(quizzes)
      .where(
        and(
          eq(quizzes.groupCode, groupCode),
          eq(quizzes.quizIndex, quizIndex)
        )
      );
    
    return result[0];
  }
  
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const result = await db.insert(quizzes).values(quiz).returning();
    return result[0];
  }

  async updateQuiz(id: number, updateQuiz: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const result = await db.update(quizzes)
      .set(updateQuiz)
      .where(eq(quizzes.id, id))
      .returning();
    
    return result[0];
  }

  async deleteQuiz(id: number): Promise<boolean> {
    const result = await db.delete(quizzes).where(eq(quizzes.id, id)).returning();
    return result.length > 0;
  }
  
  async updateUserQuizProgress(userId: number, questionIndex: number, completed = false): Promise<User | undefined> {
    const result = await db.update(users)
      .set({
        lastQuizQuestion: questionIndex,
        completedQuiz: completed
      })
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }
  
  async getGroupProgress(groupCode: string): Promise<GroupProgress | undefined> {
    const result = await db.select()
      .from(groupProgress)
      .where(eq(groupProgress.groupCode, groupCode));
    
    return result[0];
  }
  
  async createOrUpdateGroupProgress(insertGroupProgress: InsertGroupProgress): Promise<GroupProgress> {
    // Try to get existing group progress
    const existingProgress = await this.getGroupProgress(insertGroupProgress.groupCode);
    
    if (existingProgress) {
      // Update existing record
      const result = await db.update(groupProgress)
        .set({
          completedQuiz: insertGroupProgress.completedQuiz ?? existingProgress.completedQuiz,
          completionTime: insertGroupProgress.completionTime ?? existingProgress.completionTime,
          groupPhoto: insertGroupProgress.groupPhoto ?? existingProgress.groupPhoto
        })
        .where(eq(groupProgress.id, existingProgress.id))
        .returning();
      
      return result[0];
    } else {
      // Create new record
      const result = await db.insert(groupProgress)
        .values(insertGroupProgress)
        .returning();
      
      return result[0];
    }
  }
  
  async updateGroupCompletion(groupCode: string, completionTime: number): Promise<GroupProgress | undefined> {
    const existingProgress = await this.getGroupProgress(groupCode);
    
    if (!existingProgress) {
      // Create a new progress record
      return this.createOrUpdateGroupProgress({
        groupCode,
        completionTime,
        completedQuiz: true
      });
    }
    
    // Update existing record
    const result = await db.update(groupProgress)
      .set({
        completedQuiz: true,
        completionTime
      })
      .where(eq(groupProgress.id, existingProgress.id))
      .returning();
    
    return result[0];
  }
  
  async saveGroupPhoto(groupCode: string, photoData: string): Promise<GroupProgress | undefined> {
    const existingProgress = await this.getGroupProgress(groupCode);
    
    if (!existingProgress) {
      // Create a new progress record
      return this.createOrUpdateGroupProgress({
        groupCode,
        groupPhoto: photoData
      });
    }
    
    // Update existing record
    const result = await db.update(groupProgress)
      .set({
        groupPhoto: photoData
      })
      .where(eq(groupProgress.id, existingProgress.id))
      .returning();
    
    return result[0];
  }

  // Admin methods for users
  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result;
  }
}

// Use Database Storage
export const storage = new DatabaseStorage();
