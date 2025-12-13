interface PayoutRequest {
  amount: number;
  phoneNumber: string;
  beneficiaryName: string;
  referenceId: string;
  note?: string;
}

interface VpaResponse {
  vpa?: string;
  account_holder_name?: string;
  message?: string;
  error?: string;
}

interface PayoutResponse {
  status: boolean;
  statusCode?: number;
  data?: {
    account_holder_name?: string;
    vpa?: string;
    transcation_id?: string;
    transaction_id?: string;
    reference_id?: string;
    amount?: number;
    status?: string;
    message?: string;
  };
  message?: string;
}

function normalizePhoneNumber(phone: any): string {
  if (!phone) throw new Error('Phone number is required');
  const phoneStr = String(phone).trim().replace(/\D/g, '');
  if (phoneStr.length === 12 && phoneStr.startsWith('91')) return phoneStr.slice(2);
  if (phoneStr.length === 10) return phoneStr;
  if (phoneStr.length > 10) return phoneStr.slice(-10);
  return phoneStr;
}

export class BulkPEService {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.BULKPE_API_KEY;
    if (!apiKey) throw new Error('BULKPE_API_KEY not set');
    this.apiKey = apiKey;
  }

  private async getVPA(phoneNumber: string, referenceId: string): Promise<{ vpa: string; accountHolderName?: string }> {
    console.log(`[BULKPE] Step 1: Fetching VPA for ${phoneNumber}`);
    
    const response = await fetch('https://api.bulkpe.in/client/getVpa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        phone: phoneNumber,
        reference_id: referenceId,
        transaction_note: "FUEL RUSH Reward Payout"
      })
    });

    const data: VpaResponse = await response.json();
    console.log(`[BULKPE] VPA Response:`, data);

    if (!data.vpa) {
      throw new Error(data.message || data.error || 'No VPA received');
    }

    console.log(`[BULKPE] VPA received: ${data.vpa}, Account Holder: ${data.account_holder_name}`);
    return { 
      vpa: data.vpa,
      accountHolderName: data.account_holder_name
    };
  }

  private async initiatePayoutWithUPI(
    vpaData: { vpa: string; accountHolderName?: string },
    request_data: PayoutRequest,
    referenceId: string
  ): Promise<PayoutResponse> {
    console.log(`[BULKPE] Step 2: Initiating payout with VPA ${vpaData.vpa}`);
    
    const response = await fetch('https://api.bulkpe.in/client/initiatepayout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        amount: request_data.amount,
        account_number: "0",
        payment_mode: "UPI",
        reference_id: referenceId,
        upi: vpaData.vpa,
        beneficiaryName: request_data.beneficiaryName,
        transaction_note: request_data.note || 'FUEL RUSH Cashback Reward',
        ifsc: ""
      })
    });

    const data: PayoutResponse = await response.json();
    console.log(`[BULKPE] Payout Response (${response.status}):`, data);

    if (!response.ok) {
      throw new Error(data.message || 'Payout failed');
    }

    console.log(`[BULKPE] Payout successful:`, data.data);
    return data;
  }

  async initiatePayout(request_param: PayoutRequest): Promise<PayoutResponse> {
    const normalizedPhone = normalizePhoneNumber(request_param.phoneNumber);

    console.log(`[BULKPE] Starting payout: ${request_param.phoneNumber} -> ${normalizedPhone}`);

    if (normalizedPhone.length !== 10) {
      throw new Error(`Invalid phone: ${normalizedPhone}`);
    }
    if (!Number.isFinite(request_param.amount) || request_param.amount <= 0) {
      throw new Error(`Invalid amount: ${request_param.amount}`);
    }

    const referenceId = `TXN${Date.now()}`;

    try {
      const vpaData = await this.getVPA(normalizedPhone, referenceId);
      return await this.initiatePayoutWithUPI(vpaData, request_param, referenceId);
    } catch (err: any) {
      console.error(`[BULKPE] Payout failed:`, err.message);
      throw err;
    }
  }
}

let bulkpeService: BulkPEService | null = null;

export function getBulkPEService(): BulkPEService | null {
  if (!process.env.BULKPE_API_KEY) {
    console.warn("[BULKPE] API Key not found");
    return null;
  }
  if (!bulkpeService) {
    console.log("[BULKPE] Initializing");
    bulkpeService = new BulkPEService();
  }
  return bulkpeService;
}
