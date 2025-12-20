import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, employeeLoginSchema, normalizeVehicleNumber, validateVehicleNumber } from "@shared/schema";
import { googleSheetsService, GoogleSheetsNotConfiguredError, type TransactionLog } from "./googleSheets";
import { getBulkPEService } from "./bulkpe";

export async function registerRoutes(app: Express): Promise<Server> {
  // Fetch transaction details (VPA message and beneficiary name)
  app.get("/api/transaction-details", async (req, res) => {
    try {
      const phone = req.query.phone as string;
      if (!phone) {
        return res.status(400).json({ error: "Phone number required" });
      }

      const txnData = await googleSheetsService.getTransactionByPhone(phone);
      
      if (txnData && txnData.found) {
        return res.json({
          vpaMessage: txnData.vpaMessage || null,
          beneficiaryName: txnData.beneficiaryName || null,
          vpa: txnData.vpa || null,
        });
      }
      
      res.json({
        vpaMessage: null,
        beneficiaryName: null,
        vpa: null,
      });
    } catch (error: any) {
      console.error("Failed to fetch transaction details:", error);
      res.status(500).json({ error: "Failed to fetch transaction details" });
    }
  });

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
      const { phoneNumber, vehicleNumber } = req.body;

      // Normalize and validate vehicle number
      const normalized = normalizeVehicleNumber(vehicleNumber);
      const validation = validateVehicleNumber(normalized);
      
      if (!validation.isValid) {
        return res.status(400).json({
          error: "invalid_vehicle_number",
          message: validation.error,
        });
      }

      // Check if vehicle exists in Google Sheets
      const existingCustomer = await googleSheetsService.getCustomerByVehicle(normalized);

      if (existingCustomer) {
        // Vehicle exists - check if phone matches
        const phoneMatch = existingCustomer.number === phoneNumber;

        if (!phoneMatch) {
          return res.status(400).json({
            error: "vehicle_exists",
            message: "This vehicle number is already registered with a different phone number. Please use the same phone number, or use a different vehicle number.",
          });
        }

        // Check if customer already played today
        const todayEntry = await googleSheetsService.getTodaysCustomerByVehicle(normalized);
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

      // Normalize and validate vehicle number
      const normalized = normalizeVehicleNumber(validatedData.vehicleNumber);
      const validation = validateVehicleNumber(normalized);
      
      if (!validation.isValid) {
        return res.status(400).json({
          error: "invalid_vehicle_number",
          message: validation.error,
        });
      }

      // Validate against Google Sheets
      let alreadyPlayedToday = false;
      const existingCustomer = await googleSheetsService.getCustomerByVehicle(normalized);
      if (existingCustomer) {
        // Normalize strings for comparison (trim whitespace, handle null/undefined)
        const existingPhoneNormalized = String(existingCustomer.number || '').trim();
        const incomingPhoneNormalized = String(validatedData.phoneNumber || '').trim();

        const phoneMatch = existingPhoneNormalized === incomingPhoneNormalized;

        if (!phoneMatch) {
          return res.status(400).json({
            error: "This vehicle number is already registered with a different phone number. Please use the same phone number, or use a different vehicle number.",
          });
        }

        // Same details - check if already played today
        const todayEntry = await googleSheetsService.getTodaysCustomerByVehicle(normalized);
        if (todayEntry) {
          // Same vehicle, same details, but already played today - allow registration but mark as already played
          alreadyPlayedToday = true;
        }
      }

      // Create in local storage with normalized vehicle number
      const customer = await storage.createCustomer({
        ...validatedData,
        vehicleNumber: normalized,
        vehicleType: validatedData.vehicleType,
      });
      
      // Mark as already played if applicable
      let finalCustomer = customer;
      if (alreadyPlayedToday) {
        finalCustomer = await storage.markAlreadyPlayedToday(customer.id);
      }

      // NOTE: Do NOT add to Google Sheets yet - will be added when reward is set (after box opens)
      // This prevents entries with null/0 prizes from appearing

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

  // Get total verified amount for a customer by vehicle number
  app.get("/api/vehicles/:vehicleNumber/total-verified-amount", async (req, res) => {
    try {
      const totalAmount = await googleSheetsService.getTotalVerifiedAmountByVehicle(req.params.vehicleNumber);
      res.json({ totalAmount });
    } catch (error: any) {
      console.error("Get total verified amount error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update customer with reward (1-20 rupees)
  app.patch("/api/customers/:id/reward", async (req, res) => {
    try {
      const { rewardAmount } = req.body;
      
      if (!rewardAmount || rewardAmount < 1 || rewardAmount > 20) {
        return res.status(400).json({ error: "Reward amount must be between 1 and 20 rupees" });
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

      // First time adding to Google Sheets - add complete entry with reward
      const existingEntry = await googleSheetsService.getCustomerByVehicle(customer.vehicleNumber);
      if (!existingEntry) {
        // Entry doesn't exist yet, add it with the reward and vehicle type
        await googleSheetsService.addCustomer({
          name: customer.name,
          number: customer.phoneNumber,
          prize: rewardAmount,
          vehicleNumber: customer.vehicleNumber,
          vehicleType: customer.vehicleType || undefined, // Send vehicle type (bike, car, truck) to Google Sheets
          timestamp: new Date().toISOString(),
          verified: false,
        });
      } else {
        // Entry already exists, just update the reward
        await googleSheetsService.updateReward(customer.vehicleNumber, rewardAmount);
      }

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

  // Employee login
  app.post("/api/employee/login", async (req, res) => {
    try {
      const { username, password } = employeeLoginSchema.parse(req.body);
      
      const employee = await storage.getEmployeeByUsername(username);
      
      if (!employee || employee.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      res.json({ 
        id: employee.id, 
        username: employee.username, 
        name: employee.name 
      });
    } catch (error: any) {
      console.error("Employee login error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get today's unverified customers from Google Sheets
  app.get("/api/employee/unverified-customers", async (req, res) => {
    try {
      const allCustomers = await googleSheetsService.getAllCustomers();
      
      // Filter for today's date
      const today = new Date().toISOString().split('T')[0];
      const todaysCustomers = allCustomers.filter((customer) => {
        const customerDate = customer.timestamp.split('T')[0];
        return customerDate === today;
      });
      
      // Get all vehicles that have at least one verified entry today
      const verifiedVehicles = new Set(
        todaysCustomers
          .filter(c => c.verified === true)
          .map(c => c.vehicleNumber)
      );
      
      // Get all vehicles with unverified 2x double reward requests
      const unverifiedDoubleRewardRequests = await storage.getUnverifiedDoubleRewardRequests();
      const vehiclesWithUnverified2x = new Set(
        unverifiedDoubleRewardRequests.map(req => req.vehicleNumber)
      );
      
      // Get all double reward requests (to check which trucks have been verified through 2x)
      const allDoubleRewardRequests = await storage.getDoubleRewardRequests();
      const truckVehiclesWithVerified2x = new Set(
        allDoubleRewardRequests
          .filter(req => req.verified === true)
          .map(req => req.vehicleNumber)
      );
      
      // Get trucks that chose "Proceed for Verification" (standard path without 2x)
      const trucksProceedingForVerification = await storage.getTrucksProceedingForVerification();
      
      // Filter for unverified customers with valid prizes, excluding vehicles that are already verified or have unverified 2x requests
      const unverifiedCustomers = todaysCustomers
        .filter((customer) => {
          const prize = Number(customer.prize);
          const hasValidPrize = !isNaN(prize) && prize > 0;
          
          // Exclude if: verified, invalid prize, already verified for this vehicle, or has unverified 2x request
          const basicExclusions = customer.verified !== true && 
                                 hasValidPrize &&
                                 !verifiedVehicles.has(customer.vehicleNumber) &&
                                 !vehiclesWithUnverified2x.has(customer.vehicleNumber);
          
          // For truck customers: ONLY show if they have a verified 2x request OR clicked "Proceed for Verification"
          if (customer.vehicleType === 'truck') {
            const hasVerified2x = truckVehiclesWithVerified2x.has(customer.vehicleNumber);
            const isProceedingNormally = trucksProceedingForVerification.has(customer.vehicleNumber.toUpperCase());
            return basicExclusions && (hasVerified2x || isProceedingNormally);
          }
          
          // For non-truck customers: show normally
          return basicExclusions;
        })
        .sort((a, b) => {
          // Sort by timestamp, most recent first (for same vehicle)
          const aTime = new Date(a.timestamp).getTime();
          const bTime = new Date(b.timestamp).getTime();
          return bTime - aTime;
        })
        // Keep only the most recent entry per vehicle
        .reduce((unique, customer) => {
          const exists = unique.some(c => c.vehicleNumber === customer.vehicleNumber);
          if (!exists) {
            unique.push(customer);
          }
          return unique;
        }, [] as typeof todaysCustomers)
        .reverse(); // Reverse to show most recent first overall
      
      res.json({ customers: unverifiedCustomers });
    } catch (error: any) {
      console.error("Get unverified customers error:", error);
      
      if (error instanceof GoogleSheetsNotConfiguredError) {
        return res.status(503).json({ 
          error: "Google Sheets is not configured. Please complete the setup first." 
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  // Get today's verified customers from Google Sheets with VPA info
  app.get("/api/employee/verified-customers", async (req, res) => {
    try {
      const allCustomers = await googleSheetsService.getAllCustomers();
      
      // Filter for today's verified customers
      const today = new Date().toISOString().split('T')[0];
      const verifiedCustomers = allCustomers
        .filter((customer) => {
          const customerDate = customer.timestamp.split('T')[0];
          return customerDate === today && customer.verified === true;
        })
        .sort((a, b) => {
          // Sort by timestamp, most recent first
          const aTime = new Date(a.timestamp).getTime();
          const bTime = new Date(b.timestamp).getTime();
          return bTime - aTime;
        });
      
      // For each verified customer, fetch VPA data from transactions
      const customersWithVPA = await Promise.all(
        verifiedCustomers.map(async (customer) => {
          try {
            // Try to get VPA data from phone number lookup in transactions
            const response = await fetch(
              `${process.env.GOOGLE_SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbzXq3up_wE6fjX2goRcPBfWqdWkYLIBFxoDhzREVuvJHivBmp2hLDvqPRXSQcvQUq4/exec"}?action=getTransactionByPhone&phone=${encodeURIComponent(customer.number)}`,
              { method: 'GET' }
            );
            const text = await response.text();
            const data = JSON.parse(text);
            
            console.log(`[VPA Lookup] Phone: ${customer.number}, Found: ${data.found}, VPA: ${data.vpa}, Message: ${data.vpaMessage}`);
            
            return {
              ...customer,
              vpa: data.vpa || null,
              vpaAccountHolderName: data.accountHolderName || null,
              vpaMessage: data.vpaMessage || null,
              transactionTimestamp: data.timestamp || customer.timestamp,
            };
          } catch (error) {
            console.error(`[VPA Lookup Error] Phone: ${customer.number}, Error: ${error}`);
            // Return customer without VPA if lookup fails
            return customer;
          }
        })
      );
      
      res.json({ customers: customersWithVPA });
    } catch (error: any) {
      console.error("Get verified customers error:", error);
      
      if (error instanceof GoogleSheetsNotConfiguredError) {
        return res.status(503).json({ 
          error: "Google Sheets is not configured. Please complete the setup first." 
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  // Employee verify a customer by vehicle number
  app.post("/api/employee/verify/:vehicleNumber", async (req, res) => {
    try {
      const { vehicleNumber } = req.params;
      const { amount, verifierName } = req.body;
      
      // Normalize vehicle number
      const normalized = normalizeVehicleNumber(vehicleNumber);
      
      // Get customer details from Google Sheets before verifying
      const customerEntry = await googleSheetsService.getTodaysCustomerByVehicle(normalized);
      
      if (!customerEntry) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      // Verify in Google Sheets with verifier name and verification timestamp
      await googleSheetsService.verifyReward(normalized, amount, verifierName, new Date().toISOString());
      
      // Also update in local storage if exists
      const allCustomers = await storage.getAllCustomers();
      const customer = allCustomers.find(c => normalizeVehicleNumber(c.vehicleNumber) === normalized);
      if (customer) {
        await storage.verifyCustomerReward(customer.id);
      }
      
      // Initiate payout via BulkPE
      let payoutResult = null;
      let payoutError = null;
      const bulkpe = getBulkPEService();
      // Always use actual prize/reward amount for BulkPE payout (this is the actual winning amount)
      // The employee-entered amount is just for tracking/recording
      const prizeAmount = Number(customerEntry.prize);
      const referenceId = `FUELRUSH-${normalized}-${Date.now()}`;
      
      if (bulkpe && Number.isFinite(prizeAmount) && prizeAmount > 0 && customerEntry.number) {
        try {
          const phoneStr = String(customerEntry.number).trim();
          
          // Step 1: Check if VPA exists in Transactions sheet from previous transaction
          console.log(`[PAYOUT] Step 1: Checking Transactions sheet for cached VPA for ${phoneStr}`);
          let cachedVPA = null;
          try {
            cachedVPA = await googleSheetsService.getTransactionByPhone(phoneStr);
            if (cachedVPA) {
              console.log(`[PAYOUT] Found cached VPA: ${cachedVPA.vpa}, Account Holder: ${cachedVPA.accountHolderName}`);
            } else {
              console.log(`[PAYOUT] No cached VPA found, will call getVPA API`);
            }
          } catch (cacheErr: any) {
            console.log(`[PAYOUT] Error checking Transactions sheet:`, cacheErr.message);
          }
          
          payoutResult = await bulkpe.initiatePayout({
            amount: prizeAmount,
            phoneNumber: phoneStr,
            beneficiaryName: customerEntry.name || `Customer-${phoneStr.slice(-4)}`,
            referenceId,
            note: `FUEL RUSH Cashback - Rs.${prizeAmount}`,
            cachedVPA: (cachedVPA && cachedVPA.vpa) ? { vpa: cachedVPA.vpa, accountHolderName: cachedVPA.accountHolderName || undefined } : undefined
          });
          console.log("Payout initiated successfully:", JSON.stringify(payoutResult, null, 2));
          
          // Log successful transaction to Google Sheets
          // Extract all VPA response fields
          const responseUpi = (payoutResult as any).vpaUsed || 'N/A';
          const finalBeneficiaryName = (payoutResult as any).accountHolderNameFromVpa || customerEntry.name || `Customer-${phoneStr.slice(-4)}`;
          const txnId = payoutResult.data?.transaction_id || (payoutResult.data as any)?.transcation_id || 'N/A';
          
          const transaction: TransactionLog = {
            vehicleNumber: normalized,
            customerName: customerEntry.name || 'N/A',
            phoneNumber: customerEntry.number,
            amount: prizeAmount,
            transactionId: txnId,
            referenceId,
            upi: responseUpi,
            paymentMode: 'UPI',
            beneficiaryName: finalBeneficiaryName,
            bulkpeStatus: payoutResult.data?.status || 'SUCCESS',
            bulkpeMessage: payoutResult.data?.message || 'Transaction Success',
            status: 'success',
            timestamp: new Date().toISOString(),
            // Store all VPA response fields separately
            vpaAddress: (payoutResult as any).vpaUsed || 'N/A',
            vpaAccountHolderName: (payoutResult as any).accountHolderNameFromVpa || 'N/A',
            vpaTransactionId: payoutResult.data?.transaction_id || (payoutResult.data as any)?.transcation_id || 'N/A',
            vpaReferenceId: payoutResult.data?.reference_id || 'N/A',
            vpaStatus: payoutResult.data?.status || 'SUCCESS',
            vpaMessage: payoutResult.data?.message || 'Transaction Success',
          };
          
          try {
            console.log("[TRANSACTION LOG] Attempting to log successful transaction:", JSON.stringify(transaction, null, 2));
            await googleSheetsService.logTransaction(transaction);
            console.log("[TRANSACTION LOG] Successfully logged transaction to Google Sheets");
            // Store in local storage too
            await storage.setPaymentStatus(customerEntry.number, 'success', transaction.transactionId);
          } catch (sheetErr: any) {
            console.error("[TRANSACTION LOG ERROR] Failed to log transaction to Google Sheets:", sheetErr);
          }
        } catch (err: any) {
          payoutError = err.message;
          console.error(`[PAYOUT FAILED] Vehicle: ${vehicleNumber}, Phone: ${customerEntry.number}, Amount: ${prizeAmount}, Error: ${err.message}`);
          
          // Log failed transaction to Google Sheets
          const finalBeneficiaryNameFailed = customerEntry.name || `Customer-${customerEntry.number.slice(-4)}`;
          const transaction: TransactionLog = {
            vehicleNumber: normalized,
            customerName: customerEntry.name || 'N/A',
            phoneNumber: customerEntry.number,
            amount: prizeAmount,
            transactionId: 'FAILED',
            referenceId,
            paymentMode: 'UPI',
            beneficiaryName: finalBeneficiaryNameFailed,
            bulkpeStatus: 'FAILED',
            status: 'failed',
            errorMessage: payoutError,
            bulkpeMessage: payoutError,
            timestamp: new Date().toISOString(),
            // Store empty/N/A for VPA fields when transaction fails
            vpaAddress: 'N/A',
            vpaAccountHolderName: 'N/A',
            vpaTransactionId: 'N/A',
            vpaReferenceId: 'N/A',
            vpaStatus: 'FAILED',
            vpaMessage: payoutError,
          };
          
          try {
            console.log("[TRANSACTION LOG] Attempting to log failed transaction:", JSON.stringify(transaction, null, 2));
            await googleSheetsService.logTransaction(transaction);
            console.log("[TRANSACTION LOG] Successfully logged failed transaction to Google Sheets");
            // Store in local storage too
            await storage.setPaymentStatus(customerEntry.number, 'failed', 'FAILED');
          } catch (sheetErr: any) {
            console.error("[TRANSACTION LOG ERROR] Failed to log failed transaction to Google Sheets:", sheetErr);
          }
        }
      } else if (!bulkpe) {
        console.warn("[PAYOUT SKIPPED] BulkPE service not configured");
      } else {
        console.warn(`[PAYOUT SKIPPED] Invalid data - Prize: ${customerEntry.prize}, Phone: ${customerEntry.number}`);
      }
      
      res.json({ 
        success: true, 
        vehicleNumber: normalized, 
        payout: payoutResult,
        paymentStatus: payoutResult ? 'success' : 'no_payout',
        errorMessage: payoutError 
      });
    } catch (error: any) {
      console.error("Employee verify error:", error);
      
      if (error instanceof GoogleSheetsNotConfiguredError) {
        return res.status(503).json({ 
          error: "Google Sheets is not configured. Please complete the setup first." 
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  // Employee remove a customer from verification list (without verifying)
  app.post("/api/employee/remove/:vehicleNumber", async (req, res) => {
    try {
      const { vehicleNumber } = req.params;
      
      // Normalize vehicle number
      const normalized = normalizeVehicleNumber(vehicleNumber);
      
      // Remove from verification list in Google Sheets
      await googleSheetsService.removeFromVerification(normalized);
      
      res.json({ success: true, vehicleNumber: normalized });
    } catch (error: any) {
      console.error("Employee remove error:", error);
      
      if (error instanceof GoogleSheetsNotConfiguredError) {
        return res.status(503).json({ 
          error: "Google Sheets is not configured. Please complete the setup first." 
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  // Mark truck as proceeding for verification (standard path without 2x)
  app.post("/api/truck/proceed-verification/:vehicleNumber", async (req, res) => {
    try {
      const { vehicleNumber } = req.params;
      const normalized = normalizeVehicleNumber(vehicleNumber);
      
      await storage.markTruckProceedForVerification(normalized);
      
      res.json({ success: true, vehicleNumber: normalized });
    } catch (error: any) {
      console.error("Mark truck proceed verification error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Check verification status for a customer by vehicle number
  app.get("/api/customers/verification-status/:vehicleNumber", async (req, res) => {
    try {
      const { vehicleNumber } = req.params;
      
      // Normalize vehicle number
      const normalized = normalizeVehicleNumber(vehicleNumber);
      
      const todayEntry = await googleSheetsService.getTodaysCustomerByVehicle(normalized);
      
      if (!todayEntry) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      res.json({ 
        verified: todayEntry.verified === true,
        vehicleNumber: normalized,
        prize: todayEntry.prize
      });
    } catch (error: any) {
      console.error("Check verification status error:", error);
      
      if (error instanceof GoogleSheetsNotConfiguredError) {
        return res.status(503).json({ 
          error: "Google Sheets is not configured. Please complete the setup first." 
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  // Get payment status for a customer
  app.get("/api/customers/:customerId/payment-status", async (req, res) => {
    try {
      const { customerId } = req.params;
      const paymentStatus = await storage.getPaymentStatus(customerId);
      res.json({ 
        paymentStatus: paymentStatus.status,
        transactionId: paymentStatus.transactionId
      });
    } catch (error: any) {
      console.error("Get payment status error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Helper function to escape HTML special characters
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Share endpoint with OG meta tags for WhatsApp rich preview
  app.get("/share", (req, res) => {
    try {
      const prize = req.query.prize as string || "0";
      const total = req.query.total as string;
      const location = "https://maps.app.goo.gl/a4Zv8jNbYTpub6A5A";
      
      const totalWinnings = total && parseInt(total) > parseInt(prize) ? ` Total winnings so far: ₹${total}` : '';
      const descriptionText = `⛽ Just fuelled up at JioBP Siltara and played their Mystery Box game. Got ₹${prize} back instantly! 🎁 Try your luck here & let me know!${totalWinnings} Get directions: ${location}`;
      const shortDescription = descriptionText.substring(0, 160);
      
      const appUrl = req.get('host') || 'localhost:5000';
      const protocol = req.protocol || 'http';
      // Use proper URL encoding for the screenshot filename with spaces
      const imageUrl = `${protocol}://${appUrl}/Screenshot%202025-12-19%20164618.png`;
      
      const escapedTitle = escapeHtml(`🎁 I Won ₹${prize} Cashback - JioBP Siltara Mystery Box!`);
      const escapedDesc = escapeHtml(shortDescription);
      
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapedTitle}</title>
  
  <!-- Open Graph Meta Tags for WhatsApp Rich Preview -->
  <meta property="og:title" content="${escapedTitle}" />
  <meta property="og:description" content="${escapedDesc}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="628" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${protocol}://${appUrl}/share?prize=${prize}" />
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapedTitle}" />
  <meta name="twitter:description" content="${escapedDesc}" />
  <meta name="twitter:image" content="${imageUrl}" />
  
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    
    .container {
      max-width: 600px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    h1 {
      font-size: 28px;
      margin: 0 0 20px 0;
      background: linear-gradient(135deg, #FFD700, #FFA500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .prize-box {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: #1a1a2e;
      padding: 30px;
      border-radius: 12px;
      margin: 20px 0;
      font-size: 48px;
      font-weight: bold;
    }
    
    .message {
      font-size: 16px;
      line-height: 1.6;
      margin: 20px 0;
      color: #e0e0e0;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: #1a1a2e;
      padding: 12px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 20px;
      cursor: pointer;
      border: none;
      font-size: 16px;
    }
    
    .button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Mystery Box Win! 🎉</h1>
    <img src="/Screenshot%202025-12-19%20164618.png" alt="Mystery Box Win" style="width: 100%; max-width: 400px; border-radius: 8px; margin: 20px 0;">
    <div class="prize-box">₹${prize}</div>
    <p class="message">${descriptionText}</p>
    <button class="button" onclick="window.location.href='https://maps.app.goo.gl/a4Zv8jNbYTpub6A5A'">Get Directions</button>
  </div>
</body>
</html>
      `;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error: any) {
      console.error("Share page error:", error);
      res.status(500).send('<h1>Error</h1><p>Failed to generate share page</p>');
    }
  });

  // === DOUBLE REWARD ENDPOINTS FOR TRUCK DRIVERS ===
  
  // Create a double reward request (when truck driver clicks "Double Your Reward")
  app.post("/api/double-reward/request", async (req, res) => {
    try {
      const { customerId, customerName, phoneNumber, vehicleNumber, originalReward } = req.body;
      
      if (!customerId || !customerName || !phoneNumber || !vehicleNumber || !originalReward) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const request = await storage.createDoubleRewardRequest({
        customerId,
        customerName,
        phoneNumber,
        vehicleNumber,
        originalReward,
      });
      
      res.json({ success: true, request });
    } catch (error: any) {
      console.error("Create double reward request error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Check if customer has a recent 2x request (within 7 days)
  app.get("/api/double-reward/recent/:vehicleNumber", async (req, res) => {
    try {
      const { vehicleNumber } = req.params;
      const normalized = normalizeVehicleNumber(vehicleNumber);
      
      const allRequests = await storage.getDoubleRewardRequests();
      const customerRequests = allRequests.filter(req => normalizeVehicleNumber(req.vehicleNumber) === normalized);
      
      if (customerRequests.length === 0) {
        return res.json({ hasRecentRequest: false, daysUntilAvailable: 0 });
      }
      
      // Check the most recent request
      const mostRecent = customerRequests.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      const now = new Date();
      const createdDate = new Date(mostRecent.createdAt);
      const daysSince = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSince < 7) {
        const daysUntilAvailable = Math.ceil(7 - daysSince);
        return res.json({ hasRecentRequest: true, daysUntilAvailable });
      }
      
      res.json({ hasRecentRequest: false, daysUntilAvailable: 0 });
    } catch (error: any) {
      console.error("Check recent double reward request error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Mark a truck as pending for verification (when on 2x cooldown)
  app.post("/api/truck/mark-pending-from-cooldown", async (req, res) => {
    try {
      const { vehicleNumber } = req.body;
      if (!vehicleNumber) {
        return res.status(400).json({ error: "Vehicle number is required" });
      }
      
      const normalized = normalizeVehicleNumber(vehicleNumber);
      await storage.markTruckProceedForVerification(normalized);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Mark truck pending error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get all unverified double reward requests (for employee dashboard)
  app.get("/api/double-reward/unverified", async (req, res) => {
    try {
      const requests = await storage.getUnverifiedDoubleRewardRequests();
      res.json({ requests });
    } catch (error: any) {
      console.error("Get unverified double reward requests error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete a double reward request
  app.delete("/api/double-reward/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDoubleRewardRequest(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete double reward request error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Verify a double reward request (updates existing customer with doubled reward)
  app.post("/api/double-reward/verify/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { verifierName } = req.body;
      
      if (!verifierName) {
        return res.status(400).json({ error: "Verifier name is required" });
      }
      
      // Get the double reward request
      const request = await storage.verifyDoubleRewardRequest(id, verifierName);
      
      // Calculate doubled reward
      const doubledReward = request.originalReward * 2;
      
      // Update the customer's reward amount with doubled value
      const customer = await storage.getCustomer(request.customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }
      
      // Update customer with doubled reward amount in storage
      await storage.updateCustomerReward(request.customerId, doubledReward);
      
      // Update the existing Google Sheets entry with doubled reward (not add new)
      // Do NOT mark customer as verified yet - only update the amount
      // Employee must verify from the PENDING list to mark customer as verified
      await googleSheetsService.updateReward(request.vehicleNumber, doubledReward);
      
      // Mark the 2x request as verified so customer moves from 2x list to pending list
      // This does NOT verify the customer - just confirms the 2x request was processed
      await storage.verifyDoubleRewardRequest(request.id, verifierName);
      
      res.json({ 
        success: true, 
        request,
        doubledReward 
      });
    } catch (error: any) {
      console.error("Verify double reward request error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
