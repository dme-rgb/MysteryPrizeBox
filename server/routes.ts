import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create customer entry
  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get customer by ID
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update customer with prize
  app.patch("/api/customers/:id/prize", async (req, res) => {
    try {
      const { prizeId, prizeName, prizeRarity } = req.body;
      if (!prizeId || !prizeName || !prizeRarity) {
        return res.status(400).json({ error: "Missing prize data" });
      }
      const customer = await storage.updateCustomerPrize(
        req.params.id,
        prizeId,
        prizeName,
        prizeRarity
      );
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const totalWithPrizes = await storage.getTotalCustomersWithPrizes();
      res.json({ totalCustomersWithPrizes: totalWithPrizes });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
