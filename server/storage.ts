import { users, challenges, type User, type InsertUser, type Challenge, type InsertChallenge } from "@shared/schema";
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
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private challenges: Map<number, Challenge>;
  sessionStore: session.Store;
  currentUserId: number;
  currentChallengeId: number;

  constructor() {
    this.users = new Map();
    this.challenges = new Map();
    this.currentUserId = 1;
    this.currentChallengeId = 1;
    
    // Initialize default challenges
    this.initializeChallenges();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
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
      completedChallenges: []
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
}

export const storage = new MemStorage();
