interface ProductPrices {
  purchase: number;
  sale: number;
  margin?: number;
}

interface ProductInventory {
  stock: number;
  minimumStock: number;
  unit: 'un' | 'kg' | 'g' | 'l' | 'ml' | 'cx' | 'pct';
  location?: string;
  estimatedDaysToStock?: number;
}

interface ProductDetails {
  expirationDate?: string;
  batchNumber?: string;
  prescriptionRequired: boolean;
  notes?: string;
  images?: string[];
}

interface ProductStats {
  totalSales: number;
  totalPurchases: number;
  salesThisMonth?: number;
  lastSaleDate?: string;
  averageMonthlyUsage?: number;
  isLowStock: boolean;
  isExpiringSoon?: boolean;
}

interface Product {
  product_id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  supplier?: string;
  prices: ProductPrices;
  inventory: ProductInventory;
  details: ProductDetails;
  stats: ProductStats;
  recentSales?: Array<{
    id: string;
    quantity: number;
    price: number;
    createdAt: string;
    consultation?: {
      id: string;
      createdAt: string;
      pet: {
        id: string;
        name: string;
      };
    };
  }>;
  recentPurchases?: Array<{
    id: string;
    quantity: number;
    price: number;
    createdAt: string;
    supplier?: string;
    invoiceNumber?: string;
  }>;
  isActive: boolean;
  clinic_id: string;
  created_at: string;
  updated_at: string;
}

interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ProductResponse {
  product: Product;
}

interface CreateProductData {
  name: string;
  description?: string;
  supplier?: string;
  purchasePrice?: number;
  stock: number;
  expirationDate?: string;
  notes?: string;
  // Simplified to match InventoryItem model
}

type UpdateProductData = Partial<CreateProductData>

interface StockMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  notes?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

class ProductAPI {
  private baseURL = '/api/products';

  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStock?: boolean;
    isActive?: boolean;
    prescriptionRequired?: boolean;
  }): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.lowStock !== undefined) searchParams.append('lowStock', params.lowStock.toString());
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.prescriptionRequired !== undefined) searchParams.append('prescriptionRequired', params.prescriptionRequired.toString());

    const response = await fetch(`${this.baseURL}?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar produtos');
    }

    return response.json();
  }

  async getProduct(id: string): Promise<ProductResponse> {
    const response = await fetch(`${this.baseURL}/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar produto');
    }

    return response.json();
  }

  async createProduct(data: CreateProductData): Promise<ProductResponse> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar produto');
    }

    return response.json();
  }

  async updateProduct(id: string, data: UpdateProductData): Promise<ProductResponse> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar produto');
    }

    return response.json();
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao excluir produto');
    }

    return response.json();
  }

  async updateStock(id: string, data: {
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    reason: string;
    notes?: string;
  }): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/${id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar estoque');
    }

    return response.json();
  }

  // Métodos utilitários
  async searchProducts(search: string): Promise<Product[]> {
    const response = await this.getProducts({ search, limit: 50 });
    return response.products;
  }

  async getActiveProducts(): Promise<Product[]> {
    const response = await this.getProducts({ isActive: true, limit: 1000 });
    return response.products;
  }

  async getLowStockProducts(): Promise<Product[]> {
    const response = await this.getProducts({ lowStock: true, limit: 100 });
    return response.products;
  }

  async getExpiringSoonProducts(days: number = 30): Promise<Product[]> {
    const response = await this.getProducts({ limit: 1000 });
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + days);
    
    return response.products.filter(product => 
      product.details.expirationDate && 
      new Date(product.details.expirationDate) <= expiringDate
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await this.getProducts({ category, limit: 100 });
    return response.products;
  }

  async getPrescriptionProducts(): Promise<Product[]> {
    const response = await this.getProducts({ prescriptionRequired: true, limit: 100 });
    return response.products;
  }

  // async toggleProductStatus(id: string, isActive: boolean): Promise<ProductResponse> {
  //   return this.updateProduct(id, { isActive });
  // }

  // Métodos de relatório e análise
  async getInventoryReport(): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    expiringSoonItems: number;
    topSellingProducts: Product[];
    categoryBreakdown: { category: string; count: number; value: number }[];
  }> {
    // Buscar todos os produtos ativos
    const response = await this.getProducts({ isActive: true, limit: 1000 });
    const products = response.products;

    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => 
      sum + (product.inventory.stock * product.prices.purchase), 0
    );
    const lowStockItems = products.filter(p => p.stats.isLowStock).length;
    const expiringSoonItems = products.filter(p => p.stats.isExpiringSoon).length;

    // Agrupar por categoria
    const categoryMap = new Map<string, { count: number; value: number }>();
    products.forEach(product => {
      const category = product.category;
      const current = categoryMap.get(category) || { count: 0, value: 0 };
      current.count++;
      current.value += product.inventory.stock * product.prices.purchase;
      categoryMap.set(category, current);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({ category, ...data })
    );

    // Top produtos vendedores (ordenar por vendas)
    const topSellingProducts = products
      .sort((a, b) => b.stats.totalSales - a.stats.totalSales)
      .slice(0, 10);

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      expiringSoonItems,
      topSellingProducts,
      categoryBreakdown
    };
  }

  async getStockMovements(): Promise<StockMovement[]> {
    // Stock movements not implemented with current schema
    // Return empty array for compatibility
    return [];
  }

  // Utilitário para gerar código de barras
  generateBarcode(): string {
    return (Math.floor(Math.random() * 9000000000000) + 1000000000000).toString();
  }

  // Utilitário para gerar SKU
  generateSKU(name: string, category: string): string {
    const nameCode = name.substring(0, 3).toUpperCase();
    const categoryCode = category.substring(0, 3).toUpperCase();
    const randomCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${categoryCode}-${nameCode}-${randomCode}`;
  }

  // Validação de código de barras
  validateBarcode(barcode: string): boolean {
    // Implementar validação básica de código de barras
    return /^\d{8,13}$/.test(barcode);
  }
}

export const productAPI = new ProductAPI();
export type { 
  Product, 
  ProductListResponse, 
  ProductResponse, 
  CreateProductData, 
  UpdateProductData,
  ProductPrices,
  ProductInventory,
  ProductDetails,
  ProductStats,
  StockMovement
};