import { normalizeVehicleNumber, validateVehicleNumber } from "@shared/schema";

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzXq3up_wE6fjX2goRcPBfWqdWkYLIBFxoDhzREVuvJHivBmp2hLDvqPRXSQcvQUq4/exec";

export interface SheetCustomer {
  name: string;
  number: string;
  prize: number | null;
  vehicleNumber: string;
  vehicleType?: string; // bike, car, or truck
  timestamp: string;
  verified?: boolean;
  amount?: number; // Employee-entered payout amount during verification
  verifiedBy?: string;
  verificationTimestamp?: string;
  vpa?: string; // VPA Address
  vpaAccountHolderName?: string;
  beneficiaryName?: string;
  transactionTimestamp?: string;
  vpaMessage?: string;
}

export interface TransactionLog {
  vehicleNumber: string;
  customerName: string;
  phoneNumber: string;
  amount: number;
  transactionId: string;
  referenceId: string;
  upi?: string;
  paymentMode?: string;
  beneficiaryName?: string;
  bulkpeStatus?: string;
  bulkpeMessage?: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  timestamp: string;
  // VPA Response Fields
  vpaAddress?: string;
  vpaAccountHolderName?: string;
  vpaTransactionId?: string;
  vpaReferenceId?: string;
  vpaStatus?: string;
  vpaMessage?: string;
}

export class GoogleSheetsNotConfiguredError extends Error {
  constructor() {
    super("Google Sheets webhook is not configured. Please set up the Apps Script code.");
    this.name = "GoogleSheetsNotConfiguredError";
  }
}

export class GoogleSheetsService {
  private webhookUrl: string;
  private isConfigured: boolean | null = null;

  constructor() {
    this.webhookUrl = WEBHOOK_URL;
  }

  private async checkResponse(response: Response): Promise<string> {
    if (!response.ok) {
      throw new Error(`Google Sheets webhook error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    
    // Check if response is HTML (Apps Script not set up)
    if (text.trim().startsWith('<')) {
      this.isConfigured = false;
      throw new GoogleSheetsNotConfiguredError();
    }

    this.isConfigured = true;
    return text;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.webhookUrl}?action=getVerifiedCount`, {
        method: 'GET',
      });

      const text = await this.checkResponse(response);
      JSON.parse(text); // Verify it's valid JSON
      
      this.isConfigured = true;
      return true;
    } catch (error) {
      if (error instanceof GoogleSheetsNotConfiguredError) {
        this.isConfigured = false;
        return false;
      }
      console.error('Google Sheets health check failed:', error);
      return false;
    }
  }

  async addCustomer(customer: SheetCustomer): Promise<void> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'add',
        ...customer,
      }),
    });

    await this.checkResponse(response);
  }

  async getAllCustomers(): Promise<SheetCustomer[]> {
    const response = await fetch(`${this.webhookUrl}?action=getAll`, {
      method: 'GET',
    });

    const text = await this.checkResponse(response);
    const data = JSON.parse(text);
    return data.customers || [];
  }

  async getCustomerByVehicle(vehicleNumber: string): Promise<SheetCustomer | null> {
    const normalized = normalizeVehicleNumber(vehicleNumber);
    const response = await fetch(`${this.webhookUrl}?action=getByVehicle&vehicleNumber=${encodeURIComponent(normalized)}`, {
      method: 'GET',
    });

    const text = await this.checkResponse(response);
    const data = JSON.parse(text);
    return data.customer || null;
  }

  async getTodaysCustomerByVehicle(vehicleNumber: string): Promise<SheetCustomer | null> {
    const normalized = normalizeVehicleNumber(vehicleNumber);
    const response = await fetch(`${this.webhookUrl}?action=getTodayByVehicle&vehicleNumber=${encodeURIComponent(normalized)}`, {
      method: 'GET',
    });

    const text = await this.checkResponse(response);
    const data = JSON.parse(text);
    return data.customer || null;
  }

  async updateReward(vehicleNumber: string, rewardAmount: number): Promise<void> {
    const normalized = normalizeVehicleNumber(vehicleNumber);
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateReward',
        vehicleNumber: normalized,
        prize: rewardAmount,
      }),
    });

    await this.checkResponse(response);
  }

  async verifyReward(vehicleNumber: string, payoutAmount?: number, verifierName?: string, verificationTimestamp?: string): Promise<void> {
    const normalized = normalizeVehicleNumber(vehicleNumber);
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'verifyAndSetAmount',
        vehicleNumber: normalized,
        amount: payoutAmount,
        verifierName: verifierName || 'Unknown',
        verificationTimestamp: verificationTimestamp || new Date().toISOString(),
      }),
    });

    await this.checkResponse(response);
  }

  async removeFromVerification(vehicleNumber: string): Promise<void> {
    const normalized = normalizeVehicleNumber(vehicleNumber);
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateReward',
        vehicleNumber: normalized,
        prize: 0, // Use 0 as a marker for removed entries
      }),
    });

    await this.checkResponse(response);
  }

  async getVerifiedRewardsCount(): Promise<number> {
    const response = await fetch(`${this.webhookUrl}?action=getVerifiedCount`, {
      method: 'GET',
    });

    const text = await this.checkResponse(response);
    const data = JSON.parse(text);
    return data.count || 0;
  }

  async getTotalVerifiedAmountByVehicle(vehicleNumber: string): Promise<number> {
    const normalized = normalizeVehicleNumber(vehicleNumber);
    const response = await fetch(`${this.webhookUrl}?action=getTotalVerifiedAmount&vehicleNumber=${encodeURIComponent(normalized)}`, {
      method: 'GET',
    });

    const text = await this.checkResponse(response);
    const data = JSON.parse(text);
    return data.totalAmount || 0;
  }

  async logTransaction(transaction: TransactionLog): Promise<void> {
    console.log("[GOOGLE SHEETS] Calling logTransaction webhook with data:", JSON.stringify({
      action: 'logTransaction',
      ...transaction,
    }, null, 2));
    
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'logTransaction',
        ...transaction,
      }),
    });

    console.log("[GOOGLE SHEETS] logTransaction response status:", response.status);
    const responseText = await response.text();
    console.log("[GOOGLE SHEETS] logTransaction response body:", responseText);
    
    // Check response without calling checkResponse which might throw
    if (!response.ok) {
      throw new Error(`Google Sheets webhook error: ${response.status} ${response.statusText}`);
    }
    
    // Check if response is HTML (Apps Script not set up)
    if (responseText.trim().startsWith('<')) {
      throw new Error("Google Sheets Apps Script not properly deployed - received HTML instead of JSON");
    }
    
    try {
      JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response from Google Sheets: ${responseText}`);
    }
  }

  async getTransactionByPhone(phoneNumber: string): Promise<{ found: boolean; vpa?: string | null; accountHolderName?: string | null; beneficiaryName?: string | null; vpaMessage?: string | null; timestamp?: string | null } | null> {
    try {
      const response = await fetch(`${this.webhookUrl}?action=getTransactionByPhone&phone=${encodeURIComponent(phoneNumber)}`, {
        method: 'GET',
      });

      const text = await this.checkResponse(response);
      const data = JSON.parse(text);
      
      if (data.found) {
        console.log(`[GOOGLE SHEETS] Found transaction for ${phoneNumber}: VPA=${data.vpa}, Message=${data.vpaMessage}, Beneficiary=${data.beneficiaryName}`);
        return {
          found: true,
          vpa: data.vpa || null,
          accountHolderName: data.accountHolderName || null,
          beneficiaryName: data.beneficiaryName || null,
          vpaMessage: data.vpaMessage || null,
          timestamp: data.timestamp || null
        };
      }
      
      console.log(`[GOOGLE SHEETS] No transaction found for ${phoneNumber} in Transactions sheet`);
      return null;
    } catch (error) {
      console.log("[GOOGLE SHEETS] Transaction lookup error:", error);
      return null;
    }
  }

  getIsConfigured(): boolean | null {
    return this.isConfigured;
  }
}

export const googleSheetsService = new GoogleSheetsService();
