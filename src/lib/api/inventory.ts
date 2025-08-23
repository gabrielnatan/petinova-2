interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
  category: string;
  stock?: number;
}

interface StockMovement {
  movement_id: string;
  product: Product;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  notes?: string;
  reference?: string;
  referenceType?: 'CONSULTATION' | 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'EXPIRATION' | 'LOSS';
  unitCost?: number;
  totalCost?: number;
  supplier?: string;
  invoiceNumber?: string;
  batchNumber?: string;
  expirationDate?: string;
  user: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface MovementStats {
  summary: Record<string, { count: number; quantity: number }>;
}

interface MovementListResponse {
  movements: StockMovement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: MovementStats;
}

interface MovementResponse {
  movement: StockMovement;
}

interface CreateMovementData {
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  notes?: string;
  reference?: string;
  referenceType?: 'CONSULTATION' | 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'EXPIRATION' | 'LOSS';
  unitCost?: number;
  supplier?: string;
  invoiceNumber?: string;
  batchNumber?: string;
  expirationDate?: string;
}

class InventoryAPI {
  private baseURL = '/api/inventory';

  async getMovements(params?: {
    page?: number;
    limit?: number;
    search?: string;
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MovementListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.productId) searchParams.append('productId', params.productId);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const response = await fetch(`${this.baseURL}/movements?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar movimentações');
    }

    return response.json();
  }

  async getMovement(id: string): Promise<MovementResponse> {
    const response = await fetch(`${this.baseURL}/movements/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar movimentação');
    }

    return response.json();
  }

  async createMovement(data: CreateMovementData): Promise<MovementResponse> {
    const response = await fetch(`${this.baseURL}/movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar movimentação');
    }

    return response.json();
  }

  async deleteMovement(id: string): Promise<{ message: string; revertedStock: number }> {
    const response = await fetch(`${this.baseURL}/movements/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao cancelar movimentação');
    }

    return response.json();
  }

  // Utility methods
  getMovementTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      'IN': 'Entrada',
      'OUT': 'Saída',
      'ADJUSTMENT': 'Ajuste'
    };
    
    return typeLabels[type] || type;
  }

  getMovementTypeColor(type: string): string {
    const typeColors: Record<string, string> = {
      'IN': 'text-success bg-success/10',
      'OUT': 'text-error bg-error/10',
      'ADJUSTMENT': 'text-warning bg-warning/10'
    };
    
    return typeColors[type] || 'text-text-tertiary bg-background-secondary';
  }

  getReferenceTypeLabel(referenceType?: string): string {
    const referenceTypeLabels: Record<string, string> = {
      'CONSULTATION': 'Consulta',
      'PURCHASE': 'Compra',
      'SALE': 'Venda',
      'ADJUSTMENT': 'Ajuste',
      'EXPIRATION': 'Vencimento',
      'LOSS': 'Perda'
    };
    
    return referenceType ? referenceTypeLabels[referenceType] || referenceType : '';
  }

  formatMovementQuantity(movement: StockMovement): string {
    const prefix = movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : '';
    return `${prefix}${Math.abs(movement.quantity)} ${movement.product.unit}`;
  }

  validateMovementData(data: CreateMovementData): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    if (!data.productId) {
      errors.productId = 'Produto é obrigatório';
    }

    if (!data.type) {
      errors.type = 'Tipo de movimentação é obrigatório';
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.quantity = 'Quantidade deve ser maior que zero';
    }

    if (!data.reason?.trim()) {
      errors.reason = 'Motivo é obrigatório';
    }

    if (data.unitCost && data.unitCost <= 0) {
      errors.unitCost = 'Custo unitário deve ser maior que zero';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Export functionality
  async exportMovements(params?: {
    search?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'xlsx';
  }): Promise<Blob> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.format) searchParams.append('format', params.format);

    const response = await fetch(`${this.baseURL}/movements/export?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao exportar movimentações');
    }

    return response.blob();
  }

  downloadExportFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const inventoryAPI = new InventoryAPI();
export type { 
  StockMovement, 
  MovementListResponse, 
  MovementResponse, 
  CreateMovementData,
  Product,
  MovementStats
};