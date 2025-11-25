import { type User, type InsertUser, type Customer, type InsertCustomer, type Employee, type InsertEmployee } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomer(id: string): Promise<Customer | undefined>;
  updateCustomerReward(id: string, rewardAmount: number): Promise<Customer>;
  verifyCustomerReward(id: string): Promise<Customer>;
  markAlreadyPlayedToday(id: string): Promise<Customer>;
  getTotalVerifiedRewards(): Promise<number>;
  getAllCustomers(): Promise<Customer[]>;
  getUnverifiedCustomers(): Promise<Customer[]>;
  
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByUsername(username: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private customers: Map<string, Customer>;
  private employees: Map<string, Employee>;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.employees = new Map();
    
    this.initDefaultEmployee();
  }
  
  private initDefaultEmployee() {
    const defaultEmployee: Employee = {
      id: randomUUID(),
      username: "employee",
      password: "employee123",
      name: "Default Employee",
    };
    this.employees.set(defaultEmployee.id, defaultEmployee);
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
      rewardAmount: null,
      verified: false,
      alreadyPlayedToday: false,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async updateCustomerReward(id: string, rewardAmount: number): Promise<Customer> {
    const customer = this.customers.get(id);
    if (!customer) {
      throw new Error("Customer not found");
    }
    const updated = { ...customer, rewardAmount };
    this.customers.set(id, updated);
    return updated;
  }

  async verifyCustomerReward(id: string): Promise<Customer> {
    const customer = this.customers.get(id);
    if (!customer) {
      throw new Error("Customer not found");
    }
    const updated = { ...customer, verified: true };
    this.customers.set(id, updated);
    return updated;
  }

  async markAlreadyPlayedToday(id: string): Promise<Customer> {
    const customer = this.customers.get(id);
    if (!customer) {
      throw new Error("Customer not found");
    }
    const updated = { ...customer, alreadyPlayedToday: true };
    this.customers.set(id, updated);
    return updated;
  }

  async getTotalVerifiedRewards(): Promise<number> {
    return Array.from(this.customers.values()).filter(
      (customer) => customer.verified === true && customer.rewardAmount !== null
    ).length;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }
  
  async getUnverifiedCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(
      (customer) => customer.verified === false && customer.rewardAmount !== null
    );
  }
  
  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }
  
  async getEmployeeByUsername(username: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(
      (employee) => employee.username === username,
    );
  }
  
  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = { ...insertEmployee, id };
    this.employees.set(id, employee);
    return employee;
  }
}

export const storage = new MemStorage();
