"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Package,
  AlertTriangle,
  Calculator,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/store";

interface Product {
  product_id: string;
  name: string;
  sku: string;
  category: string;
  inventory: {
    stock: number;
    minimumStock: number;
  };
}

const movementTypes = [
  { value: 'IN', label: 'Entrada', description: 'Adicionar produtos ao estoque' },
  { value: 'OUT', label: 'Saída', description: 'Remover produtos do estoque' },
  { value: 'ADJUSTMENT', label: 'Ajuste', description: 'Ajustar quantidade do estoque' },
  { value: 'TRANSFER', label: 'Transferência', description: 'Transferir entre locais' },
  { value: 'RETURN', label: 'Devolução', description: 'Devolver produtos' },
  { value: 'LOSS', label: 'Perda', description: 'Registrar perda/avaria' },
];

const referenceTypes = [
  { value: 'PURCHASE', label: 'Compra' },
  { value: 'SALE', label: 'Venda' },
  { value: 'PRESCRIPTION', label: 'Prescrição' },
  { value: 'TRANSFER', label: 'Transferência' },
  { value: 'ADJUSTMENT', label: 'Ajuste' },
  { value: 'RETURN', label: 'Devolução' },
  { value: 'LOSS', label: 'Perda' },
];

export default function NewMovementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    itemId: '',
    type: 'IN' as const,
    quantity: 1,
    reason: '',
    reference: '',
    referenceType: 'PURCHASE' as const,
    unitCost: 0,
    supplier: '',
    invoiceNumber: '',
    batchNumber: '',
    expirationDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await apiClient.get('/products?limit=100');
        setProducts(response.products);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      }
    };

    if (user) {
      loadProducts();
    }
  }, [user]);

  // Update selected product when itemId changes
  useEffect(() => {
    const product = products.find(p => p.product_id === formData.itemId);
    setSelectedProduct(product || null);
  }, [formData.itemId, products]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemId) {
      newErrors.itemId = 'Produto é obrigatório';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }

    if (formData.type === 'OUT' && selectedProduct && formData.quantity > selectedProduct.inventory.stock) {
      newErrors.quantity = `Estoque insuficiente. Disponível: ${selectedProduct.inventory.stock}`;
    }

    if (formData.type === 'ADJUSTMENT' && formData.quantity < 0) {
      newErrors.quantity = 'Quantidade não pode ser negativa para ajustes';
    }

    if (!formData.reason) {
      newErrors.reason = 'Motivo é obrigatório';
    }

    if (formData.unitCost < 0) {
      newErrors.unitCost = 'Custo unitário não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        quantity: formData.type === 'OUT' || formData.type === 'LOSS' ? -Math.abs(formData.quantity) : Math.abs(formData.quantity),
        unitCost: formData.unitCost || undefined,
        expirationDate: formData.expirationDate || undefined,
      };

      await apiClient.post('/inventory/movements', payload);
      
      router.push('/dashboard/inventory/movements');
    } catch (error: any) {
      console.error('Erro ao criar movimentação:', error);
      alert('Erro ao criar movimentação: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = () => {
    return formData.unitCost * Math.abs(formData.quantity);
  };

  const getMovementTypeInfo = (type: string) => {
    return movementTypes.find(t => t.value === type) || movementTypes[0];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Nova Movimentação
            </h1>
            <p className="text-text-secondary mt-1">
              Registre uma nova movimentação no estoque
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Produto *
                    </label>
                    <Select
                      value={formData.itemId}
                      onValueChange={(value) => handleInputChange('itemId', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.product_id} value={product.product_id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-sm text-text-secondary">
                                {product.sku} • Estoque: {product.inventory.stock}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.itemId && (
                      <p className="text-error text-sm mt-1">{errors.itemId}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Tipo de Movimentação *
                    </label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => handleInputChange('type', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {movementTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{type.label}</span>
                              <span className="text-sm text-text-secondary">
                                {type.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Quantidade *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                    {errors.quantity && (
                      <p className="text-error text-sm mt-1">{errors.quantity}</p>
                    )}
                    {selectedProduct && (
                      <p className="text-text-secondary text-sm mt-1">
                        Estoque atual: {selectedProduct.inventory.stock}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Motivo *
                    </label>
                    <Input
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      placeholder="Ex: Compra de fornecedor, Consulta veterinária..."
                      className="mt-1"
                    />
                    {errors.reason && (
                      <p className="text-error text-sm mt-1">{errors.reason}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reference Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Informações de Referência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Tipo de Referência
                    </label>
                    <Select
                      value={formData.referenceType}
                      onValueChange={(value: any) => handleInputChange('referenceType', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {referenceTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Número de Referência
                    </label>
                    <Input
                      value={formData.reference}
                      onChange={(e) => handleInputChange('reference', e.target.value)}
                      placeholder="Ex: NF-001, Prescrição #123..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Fornecedor
                    </label>
                    <Input
                      value={formData.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      placeholder="Nome do fornecedor"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Número da Nota Fiscal
                    </label>
                    <Input
                      value={formData.invoiceNumber}
                      onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                      placeholder="Número da NF"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Número do Lote
                    </label>
                    <Input
                      value={formData.batchNumber}
                      onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                      placeholder="Número do lote"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Data de Vencimento
                    </label>
                    <Input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Informações de Custo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Custo Unitário (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitCost}
                    onChange={(e) => handleInputChange('unitCost', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                  {errors.unitCost && (
                    <p className="text-error text-sm mt-1">{errors.unitCost}</p>
                  )}
                </div>

                <div className="bg-background-secondary p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Custo Total:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(calculateTotalCost())}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Information */}
            {selectedProduct && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Informações do Produto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-text-secondary">Nome</p>
                    <p className="font-medium">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">SKU</p>
                    <p className="font-medium">{selectedProduct.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Categoria</p>
                    <p className="font-medium">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Estoque Atual</p>
                    <p className={`font-bold ${selectedProduct.inventory.stock <= selectedProduct.inventory.minimumStock ? 'text-error' : 'text-success'}`}>
                      {selectedProduct.inventory.stock}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Estoque Mínimo</p>
                    <p className="font-medium">{selectedProduct.inventory.minimumStock}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {selectedProduct && formData.type === 'OUT' && formData.quantity > selectedProduct.inventory.stock && (
              <Card className="border-error">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-error" />
                    <span className="font-medium text-error">Estoque Insuficiente</span>
                  </div>
                  <p className="text-sm text-error mt-2">
                    A quantidade solicitada ({formData.quantity}) é maior que o estoque disponível ({selectedProduct.inventory.stock}).
                  </p>
                </CardContent>
              </Card>
            )}

            {selectedProduct && selectedProduct.inventory.stock <= selectedProduct.inventory.minimumStock && (
              <Card className="border-warning">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <span className="font-medium text-warning">Estoque Baixo</span>
                  </div>
                  <p className="text-sm text-warning mt-2">
                    O estoque atual está abaixo do mínimo recomendado.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
