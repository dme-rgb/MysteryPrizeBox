import { type User, type InsertUser, type Customer, type InsertCustomer } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomer(id: string): Promise<Customer | undefined>;
  updateCustomerPrize(id: string, prizeId: string, prizeName: string, prizeRarity: string): Promise<Customer>;
  getTotalCustomersWithPrizes(): Promise<number>;
  getAllCustomers(): Promise<Customer[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private customers: Map<string, Customer>;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      prizeId: null,
      prizeName: null,
      prizeRarity: null,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async updateCustomerPrize(
    id: string,
    prizeId: string,
    prizeName: string,
    prizeRarity: string
  ): Promise<Customer> {
    const customer = this.customers.get(id);
    if (!customer) {
      throw new Error("Customer not found");
    }
    const updated = { ...customer, prizeId, prizeName, prizeRarity };
    this.customers.set(id, updated);
    return updated;
  }

  async getTotalCustomersWithPrizes(): Promise<number> {
    return Array.from(this.customers.values()).filter(
      (customer) => customer.prizeId !== null
    ).length;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }
}

export const storage = new MemStorage();
