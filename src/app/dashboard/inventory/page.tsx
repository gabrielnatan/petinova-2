"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Package,
  TrendingDown,
  AlertTriangle,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  BarChart3,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { productAPI, type Product } from "@/lib/api/products";
import Link from "next/link";
import { useRouter } from "next/navigation";
function ProductCard({ 
  product, 
  onDelete 
}: { 
  product: Product;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const getStockStatus = () => {
    if (product.inventory.stock <= product.inventory.minimumStock) {
      return {
        status: "low",
        color: "text-error",
        bg: "bg-error/10",
        label: "Estoque Baixo",
      };
    }
    if (product.inventory.stock <= product.inventory.minimumStock * 1.5) {
      return {
        status: "medium",
        color: "text-warning",
        bg: "bg-warning/10",
        label: "Estoque Médio",
      };
    }
    return {
      status: "good",
      color: "text-success",
      bg: "bg-success/10",
      label: "Estoque OK",
    };
  };
  const getValidityStatus = () => {
    if (!product.details.expirationDate) return null;
    const expirationDate = new Date(product.details.expirationDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    if (expirationDate < now) {
      return { status: "expired", color: "text-error", label: "Vencido" };
    }
    if (expirationDate <= thirtyDaysFromNow) {
      return {
        status: "expiring",
        color: "text-warning",
        label: "Vence em breve",
      };
    }
    return { status: "valid", color: "text-success", label: "Válido" };
  };
  const stockStatus = getStockStatus();
  const validityStatus = getValidityStatus();
  return (
    <div
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {product.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {product.category} • {product.supplier || 'Sem fornecedor'}
                </p>
              </div>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-lg z-10 min-w-[150px]"
                >
                  <button
                    onClick={() => router.push(`/dashboard/inventory/${product.product_id}`)}
                    className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </button>
                  <Link
                    href={`/dashboard/inventory/${product.product_id}/edit`}
                    className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Link>
                  <button 
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir este produto?')) {
                        onDelete(product.product_id);
                      }
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-error hover:bg-background-secondary"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Estoque:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-text-primary">
                  {product.inventory.stock} {product.inventory.unit}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${stockStatus.bg} ${stockStatus.color}`}
                >
                  {stockStatus.label}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                Preço venda:
              </span>
              <span className="font-medium text-text-primary">
                {formatCurrency(product.prices.sale)}
              </span>
            </div>
            {validityStatus && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Validade:</span>
                <span className={`text-sm ${validityStatus.color}`}>
                  {validityStatus.label}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span>Custo: {formatCurrency(product.prices.purchase)}</span>
              <span>
                Margem: {product.prices.margin?.toFixed(1) || 0}%
              </span>
            </div>
            {product.stats.isLowStock && (
              <div className="flex items-center space-x-1 p-2 bg-error/5 rounded border border-error/20">
                <AlertTriangle className="w-4 h-4 text-error" />
                <span className="text-xs text-error">Estoque baixo!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    expiringSoonItems: 0
  });
  const router = useRouter();
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter === 'low_stock') params.lowStock = true;
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;
      const response = await productAPI.getProducts(params);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, categoryFilter, statusFilter]);
  const loadStats = useCallback(async () => {
    try {
      const report = await productAPI.getInventoryReport();
      setStats({
        totalProducts: report.totalProducts,
        totalValue: report.totalValue,
        lowStockItems: report.lowStockItems,
        expiringSoonItems: report.expiringSoonItems
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);
  useEffect(() => {
    loadProducts();
    loadStats();
  }, [loadProducts, loadStats]);
  const handleDelete = async (productId: string) => {
    try {
      await productAPI.deleteProduct(productId);
      loadProducts();
      loadStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir produto');
    }
  };
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'category') setCategoryFilter(value);
    if (filter === 'status') setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  const getStockStatus = (product: Product) => {
    if (product.inventory.stock <= product.inventory.minimumStock) {
      return {
        status: "low",
        color: "text-error",
        bg: "bg-error/10",
        label: "Estoque Baixo",
      };
    }
    if (product.inventory.stock <= product.inventory.minimumStock * 1.5) {
      return {
        status: "medium",
        color: "text-warning",
        bg: "bg-warning/10",
        label: "Estoque Médio",
      };
    }
    return {
      status: "good",
      color: "text-success",
      bg: "bg-success/10",
      label: "Estoque OK",
    };
  };
  const getValidityStatus = (expirationDate?: string) => {
    if (!expirationDate) return null;
    const expDate = new Date(expirationDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    if (expDate < now) {
      return { status: "expired", color: "text-error", label: "Vencido" };
    }
    if (expDate <= thirtyDaysFromNow) {
      return {
        status: "expiring",
        color: "text-warning",
        label: "Vence em breve",
      };
    }
    return { status: "valid", color: "text-success", label: "Válido" };
  };
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Estoque</h1>
          <p className="text-text-secondary">
            Gerencie produtos, medicamentos e suprimentos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" asChild>
            <Link href="/dashboard/inventory/movements" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Movimentações
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/inventory/new" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>
      {/* Error State */}
      {error && (
        <Card className="border-error">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-error">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-3"
              onClick={loadProducts}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total de Produtos</p>
                <p className="text-2xl font-bold text-text-primary">
                  {stats.totalProducts}
                </p>
              </div>
              <Package className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Estoque Baixo</p>
                <p className="text-2xl font-bold text-error">
                  {stats.lowStockItems}
                </p>
              </div>
              <div className="w-8 h-8 bg-error/10 rounded-full flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">
                  Vencendo em 30 dias
                </p>
                <p className="text-2xl font-bold text-warning">
                  {stats.expiringSoonItems}
                </p>
              </div>
              <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Valor Total</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
          >
            <option value="all">Todas categorias</option>
            <option value="Alimento">Alimentos</option>
            <option value="Medicamento">Medicamentos</option>
            <option value="Higiene">Higiene</option>
            <option value="Acessório">Acessórios</option>
            <option value="Equipamento">Equipamentos</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="low_stock">Estoque baixo</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "cards" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Tabela
          </Button>
        </div>
      </div>
      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-background-secondary rounded w-3/4"></div>
                  <div className="h-4 bg-background-secondary rounded w-1/2"></div>
                  <div className="h-20 bg-background-secondary rounded"></div>
                  <div className="h-4 bg-background-secondary rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <div
              key={product.product_id}
            >
              <ProductCard product={product} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const validityStatus = getValidityStatus(product.details.expirationDate);
                return (
                  <TableRow key={product.product_id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {product.name}
                          </div>
                          <div className="text-sm text-text-secondary">
                            SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {product.category}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-text-primary font-medium">
                          {product.inventory.stock} {product.inventory.unit}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${stockStatus.bg} ${stockStatus.color}`}
                        >
                          {stockStatus.status === "low"
                            ? "Baixo"
                            : stockStatus.status === "medium"
                              ? "Médio"
                              : "OK"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-text-primary">
                          {formatCurrency(product.prices.sale)}
                        </div>
                        <div className="text-xs text-text-secondary">
                          Custo: {formatCurrency(product.prices.purchase)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.details.expirationDate ? (
                        <div
                          className={`text-sm ${validityStatus?.color || "text-text-primary"}`}
                        >
                          {formatDate(product.details.expirationDate)}
                        </div>
                      ) : (
                        <span className="text-text-tertiary">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${stockStatus.bg} ${stockStatus.color}`}
                      >
                        {stockStatus.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.push(`/dashboard/inventory/${product.product_id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} produtos
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-text-secondary">
              Página {pagination.page} de {pagination.pages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-text-secondary mb-4">
            {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece cadastrando o primeiro produto do estoque"}
          </p>
          <Button asChild>
            <Link href="/dashboard/inventory/new" className="flex items-center justify-center">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Produto
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}