import { 
  users, challenges, quizzes, groupProgress,
  type User, type InsertUser, type Challenge, type InsertChallenge, 
  type Quiz, type InsertQuiz, type GroupProgress, type InsertGroupProgress 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
        description: "The first challenge requires decoding the initial access sequence. Group members, coordinate to find the hidden message in your assigned area and enter the access code below.",
        answer: "cyberstart",
        codeName: "Challenge 01: INIT_SEQUENCE",
        order: 1
      },
      {
        title: "CIPHER_BREAK",
        description: "Decrypt the encoded message using Caesar Cipher to find the hidden password. Each group should focus on their assigned encryption key.",
        answer: "firewall",
        codeName: "Challenge 02: CIPHER_BREAK",
        order: 2
      },
      {
        title: "BINARY_DECODE",
        description: "Convert the binary code to find the hidden password. Group-specific binary sequences have been distributed around the area.",
        answer: "network",
        codeName: "Challenge 03: BINARY_DECODE",
        order: 3
      },
      {
        title: "NETWORK_BREACH",
        description: "Analyze the QR code to find the access credentials. Each group has a unique QR code in their designated area.",
        answer: "protocol",
        codeName: "Challenge 04: NETWORK_BREACH",
        order: 4
      },
      {
        title: "FINAL_QUIZ",
        description: "Complete the IT quiz to finalize your mission. Each group will receive questions specific to their assigned BSIT topics.",
        answer: "mainframe",
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

export const storage = new MemStorage();
