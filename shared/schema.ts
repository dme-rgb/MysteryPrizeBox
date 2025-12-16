import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).pick({
  username: true,
  password: true,
  name: true,
});

export const employeeLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;
export type EmployeeLogin = z.infer<typeof employeeLoginSchema>;

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  vehicleNumber: text("vehicle_number").notNull(),
  rewardAmount: integer("reward_amount"),
  verified: boolean("verified").default(false),
  alreadyPlayedToday: boolean("already_played_today").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  phoneNumber: true,
  vehicleNumber: true,
}).extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  vehicleNumber: z.string().min(2, "Vehicle number is required"),
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Vehicle number normalization function
export function normalizeVehicleNumber(vehicleNumber: string): string {
  // Remove all spaces and convert to uppercase
  return vehicleNumber.replace(/\s+/g, '').toUpperCase();
}

// Validation function for vehicle number
export function validateVehicleNumber(vehicleNumber: string): { isValid: boolean; error?: string } {
  if (!vehicleNumber || typeof vehicleNumber !== 'string') {
    return { isValid: false, error: 'Vehicle number is required' };
  }

  const normalized = normalizeVehicleNumber(vehicleNumber);

  if (normalized.length > 10) {
    return { isValid: false, error: 'Vehicle number must not be more than 10 characters' };
  }

  if (normalized.length < 2) {
    return { isValid: false, error: 'Vehicle number must be at least 2 characters' };
  }

  if (/\s{2,}/.test(vehicleNumber)) {
    return { isValid: false, error: 'Vehicle number should not have wide spaces between characters' };
  }

  return { isValid: true };
}
