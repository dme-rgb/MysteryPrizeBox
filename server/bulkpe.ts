/* =======================
   Types
======================= */

interface PayoutRequest {
  amount: number;
  phoneNumber: string;
  beneficiaryName: string;
  referenceId: string; // payout reference (must be unique per payout)
  note?: string;
  cachedVPA?: {
    vpa: string;
    accountHolderName?: string;
  };
}

interface VpaResponse {
  status?: boolean;
  statusCode?: number;
  data?: {
    vpa?: string;
    account_holder_name?: string;
  };
  message?: string;
  error?: string;
}

interface PayoutResponse {
  status: boolean;
  statusCode?: number;
  data?: {
    transaction_id?: string;
    reference_id?: string;
    amount?: number;
    status?: string;
    message?: string;
  };
  message?: string;

  // added for logging
  vpaUsed?: string;
  accountHolderNameFromVpa?: string;
}

/* =======================
   Utils
======================= */

function normalizePhoneNumber(phone: any): string {
  if (!phone) throw new Error('Phone number is required');

  const phoneStr = String(phone).replace(/\D/g, '');

  if (phoneStr.length === 12 && phoneStr.startsWith('91')) {
    return phoneStr.slice(2);
  }

  if (phoneStr.length === 10) {
    return phoneStr;
  }

  if (phoneStr.length > 10) {
    return phoneStr.slice(-10);
  }

  throw new Error(`Invalid phone number: ${phone}`);
}

/* =======================
   Service
======================= */

export class BulkPEService {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.BULKPE_API_KEY;
    if (!apiKey) throw new Error('BULKPE_API_KEY not set');
    this.apiKey = apiKey;
  }

  /* =======================
     STEP 1: Get VPA
     IMPORTANT:
     - This CREATES a transaction in BulkPE
     - Must use a UNIQUE reference_id
  ======================= */
  private async getVPA(
    phoneNumber: string,
    vpaReferenceId: string
  ): Promise<{ vpa: string; accountHolderName?: string }> {

    const response = await fetch(
      'https://api.bulkpe.in/client/getVpa',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          phone: phoneNumber,
          reference_id: vpaReferenceId,
          transaction_note: 'FUEL RUSH Reward Payout'
        })
      }
    );

    const rawText = await response.text();
    console.log('[BULKPE] getVpa RAW:', rawText);

    let data: VpaResponse;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error('Invalid JSON returned from BulkPE getVpa');
    }

    const vpa = data?.data?.vpa;
    const accountHolderName = data?.data?.account_holder_name;

    if (!vpa) {
      throw new Error(
        data?.message ||
        data?.error ||
        'No VPA received from BulkPE'
      );
    }

    return { vpa, accountHolderName };
  }

  /* =======================
     STEP 2: Initiate Payout
     - MUST use a DIFFERENT reference_id
     - Check data.status (not HTTP 200)
  ======================= */
  private async initiatePayoutWithUPI(
    vpaData: { vpa: string; accountHolderName?: string },
    request: PayoutRequest
  ): Promise<PayoutResponse> {

    const response = await fetch(
      'https://api.bulkpe.in/client/initiatepayout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          amount: request.amount,
          account_number: '0',
          payment_mode: 'UPI',
          reference_id: request.referenceId,
          upi: vpaData.vpa,
          beneficiaryName: request.beneficiaryName,
          transaction_note: request.note || 'FUEL RUSH Cashback Reward',
          ifsc: ''
        })
      }
    );

    const data: PayoutResponse = await response.json();
    console.log('[BULKPE] initiatepayout:', data);

    // 🔴 IMPORTANT: Check data.status, NOT response.ok
    if (!data.status) {
      throw new Error(
        data.message || 'BulkPE payout failed'
      );
    }

    return {
      ...data,
      vpaUsed: vpaData.vpa,
      accountHolderNameFromVpa: vpaData.accountHolderName
    };
  }

  /* =======================
     PUBLIC METHOD
  ======================= */
  async initiatePayout(
    request: PayoutRequest
  ): Promise<PayoutResponse> {

    const normalizedPhone =
      normalizePhoneNumber(request.phoneNumber);

    if (!Number.isFinite(request.amount) || request.amount <= 0) {
      throw new Error(`Invalid amount: ${request.amount}`);
    }

    let vpaData: { vpa: string; accountHolderName?: string };

    try {
      // Use cached VPA if available
      if (request.cachedVPA) {
        console.log('[BULKPE] Using cached VPA:', request.cachedVPA.vpa);
        vpaData = request.cachedVPA;
      } else {
        // Unique reference ONLY for VPA call
        const vpaReferenceId = `VPA${Date.now()}`;
        vpaData = await this.getVPA(
          normalizedPhone,
          vpaReferenceId
        );
      }

      // Payout uses caller-provided referenceId
      return await this.initiatePayoutWithUPI(
        vpaData,
        request
      );

    } catch (err: any) {
      console.error('[BULKPE] Payout failed:', err.message);
      throw err;
    }
  }
}

/* =======================
   Singleton
======================= */

let bulkpeService: BulkPEService | null = null;

export function getBulkPEService(): BulkPEService | null {
  if (!process.env.BULKPE_API_KEY) {
    console.warn('[BULKPE] API key missing');
    return null;
  }

  if (!bulkpeService) {
    bulkpeService = new BulkPEService();
  }

  return bulkpeService;
}
