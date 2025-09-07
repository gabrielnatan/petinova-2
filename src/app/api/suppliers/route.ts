import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createSupplierIntegration, syncAllSuppliers, SUPPLIER_CONFIGS } from '@/lib/supplier-integration';

// GET /api/suppliers - Listar fornecedores e status
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas ADMIN pode acessar fornecedores
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const supplierType = searchParams.get('supplier') as keyof typeof SUPPLIER_CONFIGS;

    if (action === 'sync' && supplierType) {
      // Sincronizar fornecedor específico
      const integration = createSupplierIntegration(supplierType);
      const result = await integration.syncProducts();

      return NextResponse.json({
        success: true,
        supplier: supplierType,
        result
      });
    }

    if (action === 'sync-all') {
      // Sincronizar todos os fornecedores
      const results = await syncAllSuppliers();

      return NextResponse.json({
        success: true,
        results
      });
    }

    if (action === 'test' && supplierType) {
      // Testar conexão com fornecedor
      const integration = createSupplierIntegration(supplierType);
      const result = await integration.testConnection();

      return NextResponse.json({
        success: true,
        supplier: supplierType,
        result
      });
    }

    // Listar fornecedores disponíveis
    const suppliers = Object.entries(SUPPLIER_CONFIGS).map(([key, config]) => ({
      type: key,
      name: config.name,
      configured: !!(config.apiKey && config.apiUrl),
      environment: 'production' // ou sandbox
    }));

    return NextResponse.json({
      suppliers,
      message: 'Fornecedores disponíveis'
    });

  } catch (error) {
    console.error('Erro na API de fornecedores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/suppliers - Fazer pedido
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { supplierType, items, notes } = body;

    if (!supplierType || !items || !Array.isArray(items)) {
      return NextResponse.json({
        error: 'Dados inválidos'
      }, { status: 400 });
    }

    const integration = createSupplierIntegration(supplierType);
    
    // Calcular valor total
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    // Fazer pedido
    const order = {
      supplierId: supplierType,
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      totalAmount,
      notes
    };

    const result = await integration.placeOrder(order);

    return NextResponse.json({
      success: true,
      result,
      message: 'Pedido realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao fazer pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
