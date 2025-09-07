import axios from 'axios';

interface SupplierConfig {
  name: string;
  apiUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  brand: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  barcode?: string;
  imageUrl?: string;
  active: boolean;
}

interface Order {
  id: string;
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  expectedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
}

interface OrderResponse {
  orderId: string;
  status: string;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  confirmationUrl?: string;
}

class SupplierIntegration {
  private config: SupplierConfig;
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos

  constructor(config: SupplierConfig) {
    this.config = config;
  }

  // Obter produtos do fornecedor
  async getProducts(filters?: {
    category?: string;
    brand?: string;
    active?: boolean;
    search?: string;
  }): Promise<Product[]> {
    try {
      const cacheKey = `products_${JSON.stringify(filters)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.config.apiUrl}/products`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: filters,
        timeout: this.config.timeout
      });

      const products = response.data.products || response.data;
      this.setCache(cacheKey, products);
      return products;

    } catch (error) {
      console.error('Erro ao obter produtos do fornecedor:', error);
      throw new Error(`Falha ao obter produtos: ${error}`);
    }
  }

  // Obter produto específico
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const cacheKey = `product_${productId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.config.apiUrl}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      });

      const product = response.data;
      this.setCache(cacheKey, product);
      return product;

    } catch (error) {
      console.error('Erro ao obter produto do fornecedor:', error);
      return null;
    }
  }

  // Verificar estoque
  async checkStock(productId: string): Promise<{
    available: number;
    reserved: number;
    total: number;
    lastUpdate: Date;
  }> {
    try {
      const response = await axios.get(`${this.config.apiUrl}/products/${productId}/stock`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      });

      return {
        available: response.data.available || 0,
        reserved: response.data.reserved || 0,
        total: response.data.total || 0,
        lastUpdate: new Date(response.data.lastUpdate || Date.now())
      };

    } catch (error) {
      console.error('Erro ao verificar estoque:', error);
      throw new Error(`Falha ao verificar estoque: ${error}`);
    }
  }

  // Fazer pedido
  async placeOrder(order: Omit<Order, 'id' | 'status' | 'orderDate'>): Promise<OrderResponse> {
    try {
      const response = await axios.post(`${this.config.apiUrl}/orders`, {
        items: order.items,
        totalAmount: order.totalAmount,
        notes: order.notes
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      });

      return {
        orderId: response.data.orderId,
        status: response.data.status,
        estimatedDelivery: response.data.estimatedDelivery ? new Date(response.data.estimatedDelivery) : undefined,
        trackingNumber: response.data.trackingNumber,
        confirmationUrl: response.data.confirmationUrl
      };

    } catch (error) {
      console.error('Erro ao fazer pedido:', error);
      throw new Error(`Falha ao fazer pedido: ${error}`);
    }
  }

  // Verificar status do pedido
  async getOrderStatus(orderId: string): Promise<{
    status: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    trackingNumber?: string;
    trackingUrl?: string;
  }> {
    try {
      const response = await axios.get(`${this.config.apiUrl}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      });

      return {
        status: response.data.status,
        estimatedDelivery: response.data.estimatedDelivery ? new Date(response.data.estimatedDelivery) : undefined,
        actualDelivery: response.data.actualDelivery ? new Date(response.data.actualDelivery) : undefined,
        trackingNumber: response.data.trackingNumber,
        trackingUrl: response.data.trackingUrl
      };

    } catch (error) {
      console.error('Erro ao verificar status do pedido:', error);
      throw new Error(`Falha ao verificar status: ${error}`);
    }
  }

  // Cancelar pedido
  async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.config.apiUrl}/orders/${orderId}/cancel`, {
        reason
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      });

      return response.data.success || false;

    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      throw new Error(`Falha ao cancelar pedido: ${error}`);
    }
  }

  // Sincronizar produtos
  async syncProducts(): Promise<{
    total: number;
    updated: number;
    created: number;
    errors: number;
  }> {
    try {
      const products = await this.getProducts();
      let updated = 0;
      let created = 0;
      let errors = 0;

      for (const product of products) {
        try {
          // Aqui você implementaria a lógica para sincronizar com seu banco de dados
          // Por exemplo, verificar se o produto existe e atualizar/ criar
          const existingProduct = await this.findProductInDatabase(product.sku);
          
          if (existingProduct) {
            await this.updateProductInDatabase(product);
            updated++;
          } else {
            await this.createProductInDatabase(product);
            created++;
          }
        } catch (error) {
          console.error(`Erro ao sincronizar produto ${product.sku}:`, error);
          errors++;
        }
      }

      return {
        total: products.length,
        updated,
        created,
        errors
      };

    } catch (error) {
      console.error('Erro na sincronização de produtos:', error);
      throw new Error(`Falha na sincronização: ${error}`);
    }
  }

  // Verificar conectividade
  async testConnection(): Promise<{
    connected: boolean;
    responseTime: number;
    error?: string;
  }> {
    try {
      const startTime = Date.now();
      
      const response = await axios.get(`${this.config.apiUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      });

      const responseTime = Date.now() - startTime;

      return {
        connected: response.status === 200,
        responseTime
      };

    } catch (error) {
      console.error('Erro ao testar conexão com fornecedor:', error);
      return {
        connected: false,
        responseTime: 0,
        error: error.message
      };
    }
  }

  // Cache methods
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear();
  }

  // Métodos auxiliares (implementar conforme sua estrutura de banco)
  private async findProductInDatabase(sku: string): Promise<any> {
    // Implementar busca no seu banco de dados
    return null;
  }

  private async updateProductInDatabase(product: Product): Promise<void> {
    // Implementar atualização no seu banco de dados
  }

  private async createProductInDatabase(product: Product): Promise<void> {
    // Implementar criação no seu banco de dados
  }
}

// Configurações de fornecedores conhecidos
export const SUPPLIER_CONFIGS = {
  // Exemplo de fornecedor farmacêutico
  PHARMACEUTICAL_SUPPLIER: {
    name: 'Fornecedor Farmacêutico',
    apiUrl: process.env.PHARMACEUTICAL_API_URL || 'https://api.pharmaceutical-supplier.com',
    apiKey: process.env.PHARMACEUTICAL_API_KEY || '',
    timeout: 30000,
    retryAttempts: 3
  },

  // Exemplo de fornecedor de equipamentos
  EQUIPMENT_SUPPLIER: {
    name: 'Fornecedor de Equipamentos',
    apiUrl: process.env.EQUIPMENT_API_URL || 'https://api.equipment-supplier.com',
    apiKey: process.env.EQUIPMENT_API_KEY || '',
    timeout: 30000,
    retryAttempts: 3
  },

  // Exemplo de fornecedor de rações
  PET_FOOD_SUPPLIER: {
    name: 'Fornecedor de Rações',
    apiUrl: process.env.PET_FOOD_API_URL || 'https://api.pet-food-supplier.com',
    apiKey: process.env.PET_FOOD_API_KEY || '',
    timeout: 30000,
    retryAttempts: 3
  }
};

// Função helper para criar integração com fornecedor
export function createSupplierIntegration(supplierType: keyof typeof SUPPLIER_CONFIGS): SupplierIntegration {
  const config = SUPPLIER_CONFIGS[supplierType];
  return new SupplierIntegration(config);
}

// Função helper para sincronizar todos os fornecedores
export async function syncAllSuppliers(): Promise<{
  [key: string]: {
    total: number;
    updated: number;
    created: number;
    errors: number;
  };
}> {
  const results: any = {};

  for (const [supplierType, config] of Object.entries(SUPPLIER_CONFIGS)) {
    try {
      const integration = new SupplierIntegration(config);
      const result = await integration.syncProducts();
      results[supplierType] = result;
    } catch (error) {
      console.error(`Erro ao sincronizar fornecedor ${supplierType}:`, error);
      results[supplierType] = {
        total: 0,
        updated: 0,
        created: 0,
        errors: 1
      };
    }
  }

  return results;
}

export { SupplierIntegration };
