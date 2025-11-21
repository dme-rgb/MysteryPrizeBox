import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema } from "@shared/schema";
import { googleSheetsService, GoogleSheetsNotConfiguredError } from "./googleSheets";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check for Google Sheets
  app.get("/api/health", async (req, res) => {
    try {
      const isConfigured = await googleSheetsService.healthCheck();
      res.json({ 
        googleSheets: isConfigured,
        message: isConfigured 
          ? "Google Sheets is configured and working" 
          : "Google Sheets is not configured. Please set up the Apps Script code."
      });
    } catch (error: any) {
      res.status(503).json({ 
        googleSheets: false,
        message: "Google Sheets health check failed",
        error: error.message 
      });
    }
  });

  // Validate customer registration
  app.post("/api/customers/validate", async (req, res) => {
    try {
      const { name, phoneNumber, vehicleNumber } = req.body;

      // Check if vehicle exists in Google Sheets
      const existingCustomer = await googleSheetsService.getCustomerByVehicle(vehicleNumber);

      if (existingCustomer) {
        // Vehicle exists - check if name and phone match
        const nameMatch = existingCustomer.name.toLowerCase() === name.toLowerCase();
        const phoneMatch = existingCustomer.number === phoneNumber;

        if (!nameMatch || !phoneMatch) {
          return res.status(400).json({
            error: "vehicle_exists",
            message: "This vehicle number is already registered with different details. Please use the same name and phone number, or use a different vehicle number.",
          });
        }

        // Check if customer already played today
        const todayEntry = await googleSheetsService.getTodaysCustomerByVehicle(vehicleNumber);
        if (todayEntry) {
          return res.status(400).json({
            error: "already_played_today",
            message: "You have already played today. Come back tomorrow!",
          });
        }
      }

      // Validation passed
      res.json({ valid: true });
    } catch (error: any) {
      console.error("Validation error:", error);
      
      if (error instanceof GoogleSheetsNotConfiguredError) {
        return res.status(503).json({ 
          error: "google_sheets_not_configured",
          message: "Google Sheets is not configured. Please complete the setup first." 
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  // Create customer entry
  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);

      // Validate against Google Sheets
      let alreadyPlayedToday = false;
      const existingCustomer = await googleSheetsService.getCustomerByVehicle(validatedData.vehicleNumber);
      if (existingCustomer) {
        // Normalize strings for comparison (trim whitespace, lowercase)
        const existingNameNormalized = existingCustomer.name.trim().toLowerCase();
        const incomingNameNormalized = validatedData.name.trim().toLowerCase();
        const existingPhoneNormalized = existingCustomer.number.trim();
        const incomingPhoneNormalized = validatedData.phoneNumber.trim();

        const nameMatch = existingNameNormalized === incomingNameNormalized;
        const phoneMatch = existingPhoneNormalized === incomingPhoneNormalized;

        if (!nameMatch || !phoneMatch) {
          return res.status(400).json({
            error: "This vehicle number is already registered with different details. Please use the same name and phone number, or use a different vehicle number.",
          });
        }

        // Same details - check if already played today
        const todayEntry = await googleSheetsService.getTodaysCustomerByVehicle(validatedData.vehicleNumber);
        if (todayEntry) {
          // Same vehicle, same details, but already played today - allow registration but mark as already played
          alreadyPlayedToday = true;
        }
      }

      // Create in local storage
      const customer = await storage.createCustomer(validatedData);
      
      // Mark as already played if applicable
      let finalCustomer = customer;
      if (alreadyPlayedToday) {
        finalCustomer = await storage.markAlreadyPlayedToday(customer.id);
      }

      // Add to Google Sheets
      await googleSheetsService.addCustomer({
        name: validatedData.name,
        number: validatedData.phoneNumber,
        prize: null,
        vehicleNumber: validatedData.vehicleNumber,
        timestamp: new Date().toISOString(),
        verified: false,
      });

      res.json(finalCustomer);
    } catch (error: any) {
      console.error("Create customer error:", error);
      
      if (error instanceof GoogleSheetsNotConfiguredError) {
        return res.status(503).json({ 
          error: "Google Sheets is not configured. Please complete the setup first." 
        });
      }
      
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

  // Update customer with reward (1-5 rupees)
  app.patch("/api/customers/:id/reward", async (req, res) => {
    try {
      const { rewardAmount } = req.body;
      
      if (!rewardAmount || rewardAmount < 1 || rewardAmount > 5) {
        return res.status(400).json({ error: "Reward amount must be between 1 and 5 rupees" });
      }

      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Update in local storage
      const updatedCustomer = await storage.updateCustomerReward(
        req.params.id,
        rewardAmount
      );

      // Update in Google Sheets
      await googleSheetsService.updateReward(customer.vehicleNumber, rewardAmount);

      res.json(updatedCustomer);
    } catch (error: any) {
      console.error("Update reward error:", error);
      
      if (error instanceof GoogleSheetsNotConfiguredError) {
        return res.status(503).json({ 
          error: "Google Sheets is not configured. Please complete the setup first." 
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  // Verify reward
  app.patch("/api/customers/:id/verify", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Update in local storage
      const updatedCustomer = await storage.verifyCustomerReward(req.params.id);

      // Update in Google Sheets
      await googleSheetsService.verifyReward(customer.vehicleNumber);

      res.json(updatedCustomer);
    } catch (error: any) {
      console.error("Verify reward error:", error);
      
      if (error instanceof GoogleSheetsNotConfiguredError) {
        return res.status(503).json({ 
          error: "Google Sheets is not configured. Please complete the setup first." 
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      // Get verified rewards count from Google Sheets
      const verifiedCount = await googleSheetsService.getVerifiedRewardsCount();
      res.json({ totalVerifiedRewards: verifiedCount });
    } catch (error: any) {
      console.error("Get stats error:", error);
      
      if (error instanceof GoogleSheetsNotConfiguredError) {
        // Return 0 when not configured (setup screen will be shown)
        return res.json({ totalVerifiedRewards: 0 });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
