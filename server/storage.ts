import { type User, type InsertUser, type Customer, type InsertCustomer, type Employee, type InsertEmployee, type DoubleRewardRequest, type InsertDoubleRewardRequest } from "@shared/schema";
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
  
  setPaymentStatus(customerId: string, status: 'success' | 'failed', transactionId?: string): Promise<void>;
  getPaymentStatus(customerId: string): Promise<{ status: 'success' | 'failed' | null; transactionId: string | null }>;
  
  // Double Reward operations for truck drivers
  createDoubleRewardRequest(request: InsertDoubleRewardRequest): Promise<DoubleRewardRequest>;
  getDoubleRewardRequests(): Promise<DoubleRewardRequest[]>;
  getUnverifiedDoubleRewardRequests(): Promise<DoubleRewardRequest[]>;
  verifyDoubleRewardRequest(id: string, verifiedBy: string): Promise<DoubleRewardRequest>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private customers: Map<string, Customer>;
  private employees: Map<string, Employee>;
  private paymentStatus: Map<string, { status: 'success' | 'failed'; transactionId: string | null }>;
  private doubleRewardRequests: Map<string, DoubleRewardRequest>;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.employees = new Map();
    this.paymentStatus = new Map();
    this.doubleRewardRequests = new Map();
    
    this.initDefaultEmployee();
  }
  
  private initDefaultEmployee() {
    const employees: Employee[] = [
      {
        id: randomUUID(),
        username: "jhulesh",
        password: "Brcjhuleshwar1543",
        name: "JHULESH VERMA",
      },
      {
        id: randomUUID(),
        username: "dev kumar",
        password: "BRCdev6785",
        name: "DEV KUMAR",
      },
      {
        id: randomUUID(),
        username: "khilendra",
        password: "BRCkhilendra3316",
        name: "KHILENDRA VERMA",
      },
      {
        id: randomUUID(),
        username: "rajendra",
        password: "BRCrajendra2313",
        name: "RAJENDRA",
      },
      {
        id: randomUUID(),
        username: "yashwantsahu",
        password: "BRCyashwant23463",
        name: "YASHWANT SAHU",
      },
      {
        id: randomUUID(),
        username: "khileshwar",
        password: "BRCkhileshwar11233",
        name: "KHILESHWAR DEWANGAN",
      },
      {
        id: randomUUID(),
        username: "yashwant",
        password: "yashwant3492",
        name: "YASHWANT VERMA",
      },
      {
        id: randomUUID(),
        username: "khomlal",
        password: "khomlalsahu3492",
        name: "KHOMLAL SAHU",
      },
      {
        id: randomUUID(),
        username: "gaurav",
        password: "gaurav38792",
        name: "GOURAV MISHRA",
      },
      {
        id: randomUUID(),
        username: "jyoti",
        password: "BRCjyoti235",
        name: "JYOTI VERMA",
      },
    ];
    
    employees.forEach(emp => this.employees.set(emp.id, emp));
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
  
  async setPaymentStatus(customerId: string, status: 'success' | 'failed', transactionId?: string): Promise<void> {
    this.paymentStatus.set(customerId, { status, transactionId: transactionId || null });
  }
  
  async getPaymentStatus(customerId: string): Promise<{ status: 'success' | 'failed' | null; transactionId: string | null }> {
    const payment = this.paymentStatus.get(customerId);
    return payment || { status: null, transactionId: null };
  }
  
  // Double Reward operations for truck drivers
  async createDoubleRewardRequest(request: InsertDoubleRewardRequest): Promise<DoubleRewardRequest> {
    const id = randomUUID();
    const doubleRewardRequest: DoubleRewardRequest = {
      ...request,
      id,
      verified: false,
      verifiedAt: null,
      verifiedBy: null,
      createdAt: new Date(),
    };
    this.doubleRewardRequests.set(id, doubleRewardRequest);
    return doubleRewardRequest;
  }
  
  async getDoubleRewardRequests(): Promise<DoubleRewardRequest[]> {
    return Array.from(this.doubleRewardRequests.values());
  }
  
  async getUnverifiedDoubleRewardRequests(): Promise<DoubleRewardRequest[]> {
    return Array.from(this.doubleRewardRequests.values()).filter(
      (request) => request.verified === false
    );
  }
  
  async verifyDoubleRewardRequest(id: string, verifiedBy: string): Promise<DoubleRewardRequest> {
    const request = this.doubleRewardRequests.get(id);
    if (!request) {
      throw new Error("Double reward request not found");
    }
    const updated: DoubleRewardRequest = {
      ...request,
      verified: true,
      verifiedAt: new Date(),
      verifiedBy,
    };
    this.doubleRewardRequests.set(id, updated);
    return updated;
  }

  async deleteDoubleRewardRequest(id: string): Promise<void> {
    if (!this.doubleRewardRequests.has(id)) {
      throw new Error("Double reward request not found");
    }
    this.doubleRewardRequests.delete(id);
  }
}

export const storage = new MemStorage();
