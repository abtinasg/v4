/**
 * NOWPayments Integration Service
 * 
 * This service handles cryptocurrency payments via NOWPayments API
 * Documentation: https://documenter.getpostman.com/view/7907941/S1a32n38
 */

const NOWPAYMENTS_API_URL = process.env.NOWPAYMENTS_SANDBOX === 'true' 
  ? 'https://api-sandbox.nowpayments.io/v1'
  : 'https://api.nowpayments.io/v1'

// Get the app URL - must be a valid public URL for NOWPayments
function getAppUrl(): string {
  // First check for explicit app URL
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Production URL (required for NOWPayments)
  if (process.env.PRODUCTION_URL) {
    return process.env.PRODUCTION_URL
  }
  // Fallback - this will fail in dev but that's expected
  return process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
}

interface CreatePaymentParams {
  priceAmount: number
  priceCurrency: string
  payCurrency?: string
  orderId: string
  orderDescription?: string
  ipnCallbackUrl?: string
  successUrl?: string
  cancelUrl?: string
}

interface PaymentResponse {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id: string
  order_description: string
  ipn_callback_url: string
  created_at: string
  updated_at: string
  purchase_id: string
  amount_received: number
  payin_extra_id: string | null
  smart_contract: string | null
  network: string
  network_precision: number
  time_limit: string | null
  burning_percent: string | null
  expiration_estimate_date: string
}

interface InvoiceResponse {
  id: string
  token_id: string
  order_id: string
  order_description: string
  price_amount: string
  price_currency: string
  pay_currency: string | null
  ipn_callback_url: string
  invoice_url: string
  success_url: string
  cancel_url: string
  created_at: string
  updated_at: string
  is_fixed_rate: boolean
  is_fee_paid_by_user: boolean
}

interface PaymentStatusResponse {
  payment_id: number
  payment_status: PaymentStatus
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  actually_paid: number
  pay_currency: string
  order_id: string
  order_description: string
  purchase_id: string
  created_at: string
  updated_at: string
  outcome_amount: number
  outcome_currency: string
}

export type PaymentStatus = 
  | 'waiting'
  | 'confirming'
  | 'confirmed'
  | 'sending'
  | 'partially_paid'
  | 'finished'
  | 'failed'
  | 'refunded'
  | 'expired'

interface AvailableCurrency {
  id: number
  code: string
  name: string
  enable: boolean
  wallet_regex: string
  priority: number
  extra_id_exists: boolean
  extra_id_regex: string | null
  logo_url: string
  track: boolean
  cg_id: string
  is_maxlimit: boolean
  network: string
  smart_contract: string | null
  network_precision: string
  explorer_link_hash: string
  is_defi: boolean
  is_popular: boolean
}

interface MinimumPaymentAmount {
  currency_from: string
  currency_to: string
  min_amount: number
  fiat_equivalent?: number
}

interface EstimatedPrice {
  currency_from: string
  amount_from: number
  currency_to: string
  estimated_amount: string
}

class NOWPaymentsService {
  private apiKey: string
  private ipnSecret: string

  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY || ''
    this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || ''

    if (!this.apiKey) {
      console.warn('NOWPayments API key is not configured')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${NOWPAYMENTS_API_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `NOWPayments API error: ${response.status} - ${errorData.message || response.statusText}`
      )
    }

    return response.json()
  }

  /**
   * Check API status
   */
  async getStatus(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/status')
  }

  /**
   * Get list of available currencies
   */
  async getAvailableCurrencies(): Promise<{ currencies: string[] }> {
    return this.request<{ currencies: string[] }>('/currencies')
  }

  /**
   * Get full list of available currencies with details
   */
  async getAvailableCurrenciesFull(): Promise<{ currencies: AvailableCurrency[] }> {
    return this.request<{ currencies: AvailableCurrency[] }>('/full-currencies')
  }

  /**
   * Get minimum payment amount for a currency pair
   */
  async getMinimumPaymentAmount(
    currencyFrom: string,
    currencyTo: string = 'btc'
  ): Promise<MinimumPaymentAmount> {
    return this.request<MinimumPaymentAmount>(
      `/min-amount?currency_from=${currencyFrom}&currency_to=${currencyTo}`
    )
  }

  /**
   * Get estimated price for currency conversion
   */
  async getEstimatedPrice(
    amount: number,
    currencyFrom: string,
    currencyTo: string
  ): Promise<EstimatedPrice> {
    return this.request<EstimatedPrice>(
      `/estimate?amount=${amount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`
    )
  }

  /**
   * Create a payment
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    const appUrl = getAppUrl()
    const payload = {
      price_amount: params.priceAmount,
      price_currency: params.priceCurrency,
      pay_currency: params.payCurrency,
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: params.ipnCallbackUrl || `${appUrl}/api/payments/nowpayments/webhook`,
    }

    return this.request<PaymentResponse>('/payment', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Create an invoice (hosted payment page)
   */
  async createInvoice(params: CreatePaymentParams): Promise<InvoiceResponse> {
    const appUrl = getAppUrl()
    const payload = {
      price_amount: params.priceAmount,
      price_currency: params.priceCurrency,
      pay_currency: params.payCurrency,
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: params.ipnCallbackUrl || `${appUrl}/api/payments/nowpayments/webhook`,
      success_url: params.successUrl || `${appUrl}/dashboard?payment=success`,
      cancel_url: params.cancelUrl || `${appUrl}/pricing?payment=cancelled`,
      is_fixed_rate: false,
      is_fee_paid_by_user: false,
    }

    return this.request<InvoiceResponse>('/invoice', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Get payment status by ID
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    return this.request<PaymentStatusResponse>(`/payment/${paymentId}`)
  }

  /**
   * Verify IPN callback signature
   */
  verifyIPNSignature(body: string, signature: string): boolean {
    if (!this.ipnSecret) {
      console.warn('IPN secret is not configured')
      return false
    }

    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha512', this.ipnSecret)
    hmac.update(JSON.stringify(this.sortObject(JSON.parse(body))))
    const expectedSignature = hmac.digest('hex')
    
    return signature === expectedSignature
  }

  /**
   * Sort object keys for IPN signature verification
   */
  private sortObject(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.keys(obj)
      .sort()
      .reduce((result: Record<string, unknown>, key) => {
        if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          result[key] = this.sortObject(obj[key] as Record<string, unknown>)
        } else {
          result[key] = obj[key]
        }
        return result
      }, {})
  }

  /**
   * Check if payment is successful
   */
  isPaymentSuccessful(status: PaymentStatus): boolean {
    return status === 'finished' || status === 'confirmed'
  }

  /**
   * Check if payment is pending
   */
  isPaymentPending(status: PaymentStatus): boolean {
    return status === 'waiting' || status === 'confirming' || status === 'sending'
  }

  /**
   * Check if payment failed
   */
  isPaymentFailed(status: PaymentStatus): boolean {
    return status === 'failed' || status === 'expired' || status === 'refunded'
  }
}

// Export singleton instance
export const nowPayments = new NOWPaymentsService()

// Export types
export type {
  CreatePaymentParams,
  PaymentResponse,
  InvoiceResponse,
  PaymentStatusResponse,
  AvailableCurrency,
  MinimumPaymentAmount,
  EstimatedPrice,
}
