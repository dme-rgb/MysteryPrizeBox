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
    const upiId = `${request.phoneNumber}@ybl`;
    
    const payload = {
      amount: request.amount,
      payment_mode: 'UPI',
      reference_id: request.referenceId,
      upi: upiId,
      beneficiaryName: request.beneficiaryName,
      transcation_note: request.note || 'FUEL RUSH Cashback Reward'
    };

    const response = await fetch(BULKPE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json() as PayoutResponse;
    
    if (!response.ok) {
      throw new Error(data.message || 'Payout failed');
    }

    return data;
  }
}

let bulkpeService: BulkPEService | null = null;

export function getBulkPEService(): BulkPEService | null {
  if (!process.env.BULKPE_API_KEY) {
    return null;
  }
  
  if (!bulkpeService) {
    bulkpeService = new BulkPEService();
  }
  
  return bulkpeService;
}
