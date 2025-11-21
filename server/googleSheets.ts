const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzXq3up_wE6fjX2goRcPBfWqdWkYLIBFxoDhzREVuvJHivBmp2hLDvqPRXSQcvQUq4/exec";

export interface SheetCustomer {
  name: string;
  number: string;
  prize: number | null;
  vehicleNumber: string;
  timestamp: string;
  verified?: boolean;
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
    const response = await fetch(`${this.webhookUrl}?action=getByVehicle&vehicleNumber=${encodeURIComponent(vehicleNumber)}`, {
      method: 'GET',
    });

    const text = await this.checkResponse(response);
    const data = JSON.parse(text);
    return data.customer || null;
  }

  async getTodaysCustomerByVehicle(vehicleNumber: string): Promise<SheetCustomer | null> {
    const response = await fetch(`${this.webhookUrl}?action=getTodayByVehicle&vehicleNumber=${encodeURIComponent(vehicleNumber)}`, {
      method: 'GET',
    });

    const text = await this.checkResponse(response);
    const data = JSON.parse(text);
    return data.customer || null;
  }

  async updateReward(vehicleNumber: string, rewardAmount: number): Promise<void> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateReward',
        vehicleNumber,
        prize: rewardAmount,
      }),
    });

    await this.checkResponse(response);
  }

  async verifyReward(vehicleNumber: string): Promise<void> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'verify',
        vehicleNumber,
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

  getIsConfigured(): boolean | null {
    return this.isConfigured;
  }
}

export const googleSheetsService = new GoogleSheetsService();
