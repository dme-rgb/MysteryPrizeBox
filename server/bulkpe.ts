const BULKPE_API_URL = 'https://api.bulkpe.in/client/initiatepayout';

interface PayoutRequest {
  amount: number;
  phoneNumber: string;
  beneficiaryName: string;
  referenceId: string;
  note?: string;
}

interface PayoutResponse {
  status: boolean;
  statusCode: number;
  data?: {
    transcation_id: string;
    reference_id: string;
    amount: number;
    status: string;
    message: string;
  };
  message: string;
}

function normalizePhoneNumber(phone: any): string {
  if (!phone) {
    throw new Error('Phone number is required');
  }
  
  // Convert to string if it's a number
  const phoneStr = String(phone).trim();
  const digitsOnly = phoneStr.replace(/\D/g, '');
  
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly.slice(2);
  }
  
  if (digitsOnly.length === 10) {
    return digitsOnly;
  }
  
  if (digitsOnly.length > 10) {
    return digitsOnly.slice(-10);
  }
  
  return digitsOnly;
}

export class BulkPEService {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.BULKPE_API_KEY;
    if (!apiKey) {
      throw new Error('BULKPE_API_KEY environment variable is not set');
    }
    this.apiKey = apiKey;
  }

  async initiatePayout(request: PayoutRequest): Promise<PayoutResponse> {
    const normalizedPhone = normalizePhoneNumber(request.phoneNumber);
    
    console.log(`[BULKPE] Initiating payout for phone: ${request.phoneNumber} -> ${normalizedPhone}`);
    
    if (normalizedPhone.length !== 10) {
      console.error(`[BULKPE] Invalid phone: ${request.phoneNumber} (normalized: ${normalizedPhone})`);
      throw new Error(`Invalid phone number: ${request.phoneNumber} (normalized to ${normalizedPhone})`);
    }
    
    if (!Number.isFinite(request.amount) || request.amount <= 0) {
      console.error(`[BULKPE] Invalid amount: ${request.amount}`);
      throw new Error(`Invalid payout amount: ${request.amount}`);
    }
    
    const payload = {
      amount: request.amount,
      payment_mode: 'MOBILE',
      mobile: normalizedPhone,
      reference_id: request.referenceId,
      beneficiaryName: request.beneficiaryName,
      transcation_note: request.note || 'FUEL RUSH Cashback Reward'
    };


    console.log(`[BULKPE] Sending request to ${BULKPE_API_URL}`, { 
      amount: request.amount,
      mobile: normalizedPhone,
      reference_id: request.referenceId
    });


    const response = await fetch(BULKPE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json() as PayoutResponse;
    
    console.log(`[BULKPE] Response status: ${response.status}`, { 
      statusCode: data.statusCode, 
      status: data.status, 
      message: data.message 
    });
    
    if (!response.ok) {
      console.error(`[BULKPE] Payout failed: ${data.message}`);
      throw new Error(data.message || 'Payout failed');
    }

    console.log(`[BULKPE] Payout successful:`, data.data);
    return data;
  }
}

let bulkpeService: BulkPEService | null = null;

export function getBulkPEService(): BulkPEService | null {
  if (!process.env.BULKPE_API_KEY) {
    console.warn("[BULKPE] API Key not found in environment");
    return null;
  }
  
  if (!bulkpeService) {
    console.log("[BULKPE] Initializing BulkPE service");
    bulkpeService = new BulkPEService();
  }
  
  return bulkpeService;
}
