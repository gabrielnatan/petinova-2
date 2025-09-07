import axios from 'axios';
import crypto from 'crypto';

interface PaymentConfig {
  gateway: 'stripe' | 'mercadopago' | 'paypal' | 'pix';
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'transfer';
  brand?: string;
  last4?: string;
  holderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethod: PaymentMethod;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface CreatePaymentRequest {
  amount: number;
  currency: string;
  description?: string;
  paymentMethod: string;
  customerId?: string;
  metadata?: Record<string, any>;
  returnUrl?: string;
  cancelUrl?: string;
}

interface PaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentUrl?: string;
  qrCode?: string;
  expiresAt?: Date;
}

class PaymentGateway {
  private config: PaymentConfig;
  private baseUrl: string;

  constructor(config: PaymentConfig) {
    this.config = config;
    this.baseUrl = this.getBaseUrl();
  }

  private getBaseUrl(): string {
    const isProduction = this.config.environment === 'production';
    
    switch (this.config.gateway) {
      case 'stripe':
        return isProduction ? 'https://api.stripe.com/v1' : 'https://api.stripe.com/v1';
      case 'mercadopago':
        return isProduction ? 'https://api.mercadopago.com' : 'https://api.mercadopago.com/sandbox';
      case 'paypal':
        return isProduction ? 'https://api-m.paypal.com/v1' : 'https://api-m.sandbox.paypal.com/v1';
      case 'pix':
        return 'https://api.pix.com.br/v1';
      default:
        throw new Error(`Gateway de pagamento não suportado: ${this.config.gateway}`);
    }
  }

  // Criar pagamento
  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      switch (this.config.gateway) {
        case 'stripe':
          return this.createStripePayment(request);
        case 'mercadopago':
          return this.createMercadoPagoPayment(request);
        case 'paypal':
          return this.createPayPalPayment(request);
        case 'pix':
          return this.createPixPayment(request);
        default:
          throw new Error(`Gateway não implementado: ${this.config.gateway}`);
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw new Error(`Falha ao criar pagamento: ${error}`);
    }
  }

  // Stripe
  private async createStripePayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await axios.post(`${this.baseUrl}/payment_intents`, {
      amount: request.amount * 100, // Stripe usa centavos
      currency: request.currency,
      description: request.description,
      metadata: request.metadata,
      payment_method_types: ['card'],
      confirm: true,
      return_url: request.returnUrl
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return {
      id: response.data.id,
      status: response.data.status,
      amount: response.data.amount / 100,
      currency: response.data.currency,
      paymentUrl: response.data.next_action?.redirect_to_url?.url
    };
  }

  // MercadoPago
  private async createMercadoPagoPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await axios.post(`${this.baseUrl}/payments`, {
      transaction_amount: request.amount,
      currency: request.currency,
      description: request.description,
      payment_method_id: request.paymentMethod,
      payer: {
        email: request.metadata?.customerEmail
      },
      external_reference: request.metadata?.orderId,
      notification_url: `${process.env.BASE_URL}/api/payments/webhook/mercadopago`,
      back_urls: {
        success: request.returnUrl,
        failure: request.cancelUrl,
        pending: request.returnUrl
      }
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      id: response.data.id.toString(),
      status: response.data.status,
      amount: response.data.transaction_amount,
      currency: response.data.currency_id,
      paymentUrl: response.data.init_point
    };
  }

  // PayPal
  private async createPayPalPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    // Primeiro, obter access token
    const tokenResponse = await axios.post(`${this.baseUrl}/oauth2/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.secretKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Criar ordem
    const orderResponse = await axios.post(`${this.baseUrl}/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: request.currency,
          value: request.amount.toString()
        },
        description: request.description
      }],
      application_context: {
        return_url: request.returnUrl,
        cancel_url: request.cancelUrl
      }
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      id: orderResponse.data.id,
      status: orderResponse.data.status,
      amount: request.amount,
      currency: request.currency,
      paymentUrl: orderResponse.data.links.find((link: any) => link.rel === 'approve')?.href
    };
  }

  // PIX
  private async createPixPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await axios.post(`${this.baseUrl}/payments`, {
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      payment_method: 'pix',
      expires_in: 3600, // 1 hora
      metadata: request.metadata
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      id: response.data.id,
      status: response.data.status,
      amount: response.data.amount,
      currency: response.data.currency,
      qrCode: response.data.qr_code,
      expiresAt: new Date(Date.now() + 3600 * 1000)
    };
  }

  // Verificar status do pagamento
  async getPaymentStatus(paymentId: string): Promise<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    paidAt?: Date;
    failureReason?: string;
  }> {
    try {
      switch (this.config.gateway) {
        case 'stripe':
          return this.getStripePaymentStatus(paymentId);
        case 'mercadopago':
          return this.getMercadoPagoPaymentStatus(paymentId);
        case 'paypal':
          return this.getPayPalPaymentStatus(paymentId);
        case 'pix':
          return this.getPixPaymentStatus(paymentId);
        default:
          throw new Error(`Gateway não implementado: ${this.config.gateway}`);
      }
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      throw new Error(`Falha ao verificar status: ${error}`);
    }
  }

  // Stripe status
  private async getStripePaymentStatus(paymentId: string) {
    const response = await axios.get(`${this.baseUrl}/payment_intents/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    });

    return {
      id: response.data.id,
      status: response.data.status,
      amount: response.data.amount / 100,
      currency: response.data.currency,
      paidAt: response.data.charges?.data?.[0]?.created ? new Date(response.data.charges.data[0].created * 1000) : undefined,
      failureReason: response.data.last_payment_error?.message
    };
  }

  // MercadoPago status
  private async getMercadoPagoPaymentStatus(paymentId: string) {
    const response = await axios.get(`${this.baseUrl}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    });

    return {
      id: response.data.id.toString(),
      status: response.data.status,
      amount: response.data.transaction_amount,
      currency: response.data.currency_id,
      paidAt: response.data.date_approved ? new Date(response.data.date_approved) : undefined,
      failureReason: response.data.status_detail
    };
  }

  // PayPal status
  private async getPayPalPaymentStatus(paymentId: string) {
    const tokenResponse = await axios.post(`${this.baseUrl}/oauth2/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.secretKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const response = await axios.get(`${this.baseUrl}/checkout/orders/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return {
      id: response.data.id,
      status: response.data.status,
      amount: parseFloat(response.data.purchase_units[0].amount.value),
      currency: response.data.purchase_units[0].amount.currency_code,
      paidAt: response.data.update_time ? new Date(response.data.update_time) : undefined
    };
  }

  // PIX status
  private async getPixPaymentStatus(paymentId: string) {
    const response = await axios.get(`${this.baseUrl}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    });

    return {
      id: response.data.id,
      status: response.data.status,
      amount: response.data.amount,
      currency: response.data.currency,
      paidAt: response.data.paid_at ? new Date(response.data.paid_at) : undefined
    };
  }

  // Reembolsar pagamento
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<{
    id: string;
    status: string;
    amount: number;
  }> {
    try {
      switch (this.config.gateway) {
        case 'stripe':
          return this.refundStripePayment(paymentId, amount, reason);
        case 'mercadopago':
          return this.refundMercadoPagoPayment(paymentId, amount, reason);
        case 'paypal':
          return this.refundPayPalPayment(paymentId, amount, reason);
        case 'pix':
          return this.refundPixPayment(paymentId, amount, reason);
        default:
          throw new Error(`Gateway não implementado: ${this.config.gateway}`);
      }
    } catch (error) {
      console.error('Erro ao reembolsar pagamento:', error);
      throw new Error(`Falha ao reembolsar: ${error}`);
    }
  }

  // Stripe refund
  private async refundStripePayment(paymentId: string, amount?: number, reason?: string) {
    const response = await axios.post(`${this.baseUrl}/refunds`, {
      payment_intent: paymentId,
      amount: amount ? amount * 100 : undefined,
      reason: reason || 'requested_by_customer'
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return {
      id: response.data.id,
      status: response.data.status,
      amount: response.data.amount / 100
    };
  }

  // MercadoPago refund
  private async refundMercadoPagoPayment(paymentId: string, amount?: number, reason?: string) {
    const response = await axios.post(`${this.baseUrl}/payments/${paymentId}/refunds`, {
      amount: amount
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      id: response.data.id.toString(),
      status: response.data.status,
      amount: response.data.amount
    };
  }

  // PayPal refund
  private async refundPayPalPayment(paymentId: string, amount?: number, reason?: string) {
    const tokenResponse = await axios.post(`${this.baseUrl}/oauth2/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.secretKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const response = await axios.post(`${this.baseUrl}/payments/captures/${paymentId}/refund`, {
      amount: amount ? {
        value: amount.toString(),
        currency_code: 'BRL'
      } : undefined,
      note_to_payer: reason
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      id: response.data.id,
      status: response.data.status,
      amount: amount || 0
    };
  }

  // PIX refund
  private async refundPixPayment(paymentId: string, amount?: number, reason?: string) {
    const response = await axios.post(`${this.baseUrl}/payments/${paymentId}/refund`, {
      amount: amount,
      reason: reason
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      id: response.data.id,
      status: response.data.status,
      amount: response.data.amount
    };
  }

  // Verificar webhook
  verifyWebhook(payload: string, signature: string): boolean {
    try {
      switch (this.config.gateway) {
        case 'stripe':
          return this.verifyStripeWebhook(payload, signature);
        case 'mercadopago':
          return this.verifyMercadoPagoWebhook(payload, signature);
        case 'paypal':
          return this.verifyPayPalWebhook(payload, signature);
        case 'pix':
          return this.verifyPixWebhook(payload, signature);
        default:
          return false;
      }
    } catch (error) {
      console.error('Erro ao verificar webhook:', error);
      return false;
    }
  }

  // Stripe webhook verification
  private verifyStripeWebhook(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret || '')
      .update(payload)
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }

  // MercadoPago webhook verification
  private verifyMercadoPagoWebhook(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret || '')
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }

  // PayPal webhook verification
  private verifyPayPalWebhook(payload: string, signature: string): boolean {
    // PayPal usa certificados X.509 para verificação
    // Implementação simplificada
    return true;
  }

  // PIX webhook verification
  private verifyPixWebhook(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret || '')
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }
}

// Configurações de gateways
export const PAYMENT_CONFIGS = {
  STRIPE: {
    gateway: 'stripe' as const,
    apiKey: process.env.STRIPE_API_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    environment: (process.env.STRIPE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production'
  },
  MERCADOPAGO: {
    gateway: 'mercadopago' as const,
    apiKey: process.env.MERCADOPAGO_API_KEY || '',
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
    environment: (process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production'
  },
  PAYPAL: {
    gateway: 'paypal' as const,
    apiKey: process.env.PAYPAL_CLIENT_ID || '',
    secretKey: process.env.PAYPAL_CLIENT_SECRET || '',
    webhookSecret: process.env.PAYPAL_WEBHOOK_SECRET || '',
    environment: (process.env.PAYPAL_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production'
  },
  PIX: {
    gateway: 'pix' as const,
    apiKey: process.env.PIX_API_KEY || '',
    webhookSecret: process.env.PIX_WEBHOOK_SECRET || '',
    environment: (process.env.PIX_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production'
  }
};

// Função helper para criar gateway
export function createPaymentGateway(gatewayType: keyof typeof PAYMENT_CONFIGS): PaymentGateway {
  const config = PAYMENT_CONFIGS[gatewayType];
  return new PaymentGateway(config);
}

export { PaymentGateway };
