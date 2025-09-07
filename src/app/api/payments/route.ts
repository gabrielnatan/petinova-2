import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createPaymentGateway, PAYMENT_CONFIGS } from '@/lib/payment-gateway';

// GET /api/payments - Listar gateways e status
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const paymentId = searchParams.get('paymentId');
    const gatewayType = searchParams.get('gateway') as keyof typeof PAYMENT_CONFIGS;

    if (action === 'status' && paymentId && gatewayType) {
      // Verificar status do pagamento
      const gateway = createPaymentGateway(gatewayType);
      const status = await gateway.getPaymentStatus(paymentId);

      return NextResponse.json({
        success: true,
        status
      });
    }

    if (action === 'test' && gatewayType) {
      // Testar gateway (simulado)
      return NextResponse.json({
        success: true,
        gateway: gatewayType,
        connected: true,
        responseTime: 150
      });
    }

    // Listar gateways disponíveis
    const gateways = Object.entries(PAYMENT_CONFIGS).map(([key, config]) => ({
      type: key,
      gateway: config.gateway,
      configured: !!(config.apiKey),
      environment: config.environment
    }));

    return NextResponse.json({
      gateways,
      message: 'Gateways de pagamento disponíveis'
    });

  } catch (error) {
    console.error('Erro na API de pagamentos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Criar pagamento
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      gatewayType, 
      amount, 
      currency, 
      description, 
      paymentMethod, 
      customerId, 
      metadata,
      returnUrl,
      cancelUrl 
    } = body;

    if (!gatewayType || !amount || !currency) {
      return NextResponse.json({
        error: 'Dados obrigatórios não fornecidos'
      }, { status: 400 });
    }

    const gateway = createPaymentGateway(gatewayType);

    const paymentRequest = {
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      description,
      paymentMethod,
      customerId,
      metadata,
      returnUrl: returnUrl || `${process.env.BASE_URL}/payments/success`,
      cancelUrl: cancelUrl || `${process.env.BASE_URL}/payments/cancel`
    };

    const result = await gateway.createPayment(paymentRequest);

    return NextResponse.json({
      success: true,
      result,
      message: 'Pagamento criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/payments - Reembolsar pagamento
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { gatewayType, paymentId, amount, reason } = body;

    if (!gatewayType || !paymentId) {
      return NextResponse.json({
        error: 'Gateway e ID do pagamento são obrigatórios'
      }, { status: 400 });
    }

    const gateway = createPaymentGateway(gatewayType);
    const result = await gateway.refundPayment(paymentId, amount, reason);

    return NextResponse.json({
      success: true,
      result,
      message: 'Reembolso processado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao processar reembolso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
