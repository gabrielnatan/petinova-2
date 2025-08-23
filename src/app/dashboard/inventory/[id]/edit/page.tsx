"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Calendar,
  AlertTriangle,
  Calculator,
  Barcode,
  Truck,
  Trash2,
  TrendingUp,
  TrendingDown,
  Eye,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

// Schema de validação
const editProductSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  type: z.string().min(1, "Tipo é obrigatório"),
  unit: z.string().min(1, "Unidade é obrigatória"),
  quantity: z.number().min(0, "Quantidade deve ser positiva"),
  minStock: z.number().min(1, "Estoque mínimo deve ser maior que 0"),
  costPrice: z.number().min(0, "Preço de custo deve ser positivo"),
  salePrice: z.number().min(0, "Preço de venda deve ser positivo"),
  validity: z.date().optional().nullable(),
  supplier: z.string().min(1, "Fornecedor é obrigatório"),
  barcode: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  batch: z.string().optional(),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

// Mock data - replace with actual data fetching
const mockProduct = {
  product_id: "1",
  name: "Ração Premium Cães Adultos",
  type: "Alimento",
  unit: "kg",
  quantity: 45,
  minStock: 20,
  costPrice: 45.5,
  salePrice: 89.9,
  validity: new Date("2025-08-15"),
  supplier: "PetFood Distribuidora",
  barcode: "7891234567890",
  description:
    "Ração premium completa e balanceada para cães adultos de porte grande. Rica em proteínas e nutrientes essenciais.",
  location: "Prateleira A2",
  batch: "L2024001",
  created_at: new Date("2024-03-10"),
  updated_at: new Date("2024-12-20"),

  movements: [
    {
      id: "1",
      type: "IN",
      quantity: 50,
      date: new Date("2025-01-25"),
      reason: "Compra - Fornecedor",
      user: "Admin Sistema",
    },
    {
      id: "2",
      type: "OUT",
      quantity: 5,
      date: new Date("2025-01-20"),
      reason: "Venda Balcão",
      user: "Recepção",
    },
  ],

  stats: {
    totalSold: 156,
    totalRevenue: 14040.4,
    averageMonthlyConsumption: 12.5,
    daysUntilExpiry: 198,
    stockDays: Math.floor(45 / (12.5 / 30)), // quantity / (monthly consumption / 30)
  },
};

const productTypes = [
  "Medicamento",
  "Alimento",
  "Higiene",
  "Acessório",
  "Suplemento",
  "Equipamento",
  "Material Cirúrgico",
  "Vacina",
];

const units = [
  "un",
  "kg",
  "g",
  "ml",
  "l",
  "dose",
  "comprimido",
  "cápsula",
  "ampola",
  "frasco",
  "caixa",
  "pacote",
];

export default function EditProductPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [suggestedMargin, setSuggestedMargin] = useState<number>(50);
  const params = useParams();
  const appointmentId = params?.id as string;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: mockProduct.name,
      type: mockProduct.type,
      unit: mockProduct.unit,
      quantity: mockProduct.quantity,
      minStock: mockProduct.minStock,
      costPrice: mockProduct.costPrice,
      salePrice: mockProduct.salePrice,
      validity: mockProduct.validity,
      supplier: mockProduct.supplier,
      barcode: mockProduct.barcode,
      description: mockProduct.description,
      location: mockProduct.location,
      batch: mockProduct.batch,
    },
  });

  const watchCostPrice = watch("costPrice");
  const watchSalePrice = watch("salePrice");
  const watchQuantity = watch("quantity");
  const watchMinStock = watch("minStock");

  // Calcular margem de lucro
  const margin =
    watchCostPrice && watchSalePrice
      ? ((watchSalePrice - watchCostPrice) / watchCostPrice) * 100
      : 0;

  // Status do estoque
  const getStockStatus = () => {
    if (watchQuantity <= watchMinStock) {
      return {
        status: "low",
        color: "text-error",
        bg: "bg-error/10",
        label: "Estoque Baixo",
      };
    }
    if (watchQuantity <= watchMinStock * 1.5) {
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

  const onSubmit = async (data: EditProductFormData) => {
    try {
      console.log("Updating product:", { id: appointmentId, ...data });

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to inventory
      window.location.href = "/dashboard/inventory";
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Deleting product:", appointmentId);

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to inventory
      window.location.href = "/dashboard/inventory";
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const calculateSuggestedPrice = () => {
    if (watchCostPrice) {
      const suggestedPrice = watchCostPrice * (1 + suggestedMargin / 100);
      setValue("salePrice", Number(suggestedPrice.toFixed(2)));
    }
  };

  const applyMarginPreset = (marginPercent: number) => {
    setSuggestedMargin(marginPercent);
    if (watchCostPrice) {
      const suggestedPrice = watchCostPrice * (1 + marginPercent / 100);
      setValue("salePrice", Number(suggestedPrice.toFixed(2)));
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/inventory" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Editar Produto
            </h1>
            <p className="text-text-secondary">
              {mockProduct.name} • Última atualização:{" "}
              {formatDate(mockProduct.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="text-error hover:bg-error/10"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Informações Básicas
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Nome do Produto"
                  {...register("name")}
                  error={errors.name?.message}
                  placeholder="Ex: Ração Premium Cães Adultos"
                  icon={Package}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Tipo de Produto
                    </label>
                    <select
                      {...register("type")}
                      className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                    >
                      {productTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="text-sm text-error mt-1">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Unidade de Medida
                    </label>
                    <select
                      {...register("unit")}
                      className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none"
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    {errors.unit && (
                      <p className="text-sm text-error mt-1">
                        {errors.unit.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Descrição
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary w-full focus:border-border-focus focus:outline-none resize-vertical"
                    placeholder="Descrição detalhada do produto, composição, indicações, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stock Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Controle de Estoque
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Quantidade Atual"
                    type="number"
                    {...register("quantity", { valueAsNumber: true })}
                    error={errors.quantity?.message}
                    placeholder="0"
                    min="0"
                  />

                  <Input
                    label="Estoque Mínimo"
                    type="number"
                    {...register("minStock", { valueAsNumber: true })}
                    error={errors.minStock?.message}
                    placeholder="1"
                    min="1"
                  />
                </div>

                {/* Stock Status Alert */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${stockStatus.bg} border ${
                    stockStatus.status === "low"
                      ? "border-error/20"
                      : stockStatus.status === "medium"
                        ? "border-warning/20"
                        : "border-success/20"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`w-5 h-5 ${stockStatus.color}`} />
                    <span className={`font-medium ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${stockStatus.color}/80`}>
                    {stockStatus.status === "low" &&
                      "Estoque abaixo do mínimo recomendado. Necessário reposição urgente."}
                    {stockStatus.status === "medium" &&
                      "Estoque próximo do mínimo. Considere fazer reposição em breve."}
                    {stockStatus.status === "good" &&
                      `Estoque adequado. Durará aproximadamente ${mockProduct.stats.stockDays} dias.`}
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Localização no Estoque"
                    {...register("location")}
                    placeholder="Ex: Prateleira A2, Geladeira 1"
                  />

                  <Input
                    label="Código de Barras"
                    {...register("barcode")}
                    placeholder="Ex: 7891234567890"
                    icon={Barcode}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Lote"
                    {...register("batch")}
                    placeholder="Ex: L2024001"
                  />

                  <Input
                    label="Data de Validade"
                    type="date"
                    {...register("validity", { valueAsDate: true })}
                    error={errors.validity?.message}
                    icon={Calendar}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Informações Financeiras
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Preço de Custo"
                    type="number"
                    step="0.01"
                    {...register("costPrice", { valueAsNumber: true })}
                    error={errors.costPrice?.message}
                    placeholder="0,00"
                    icon={DollarSign}
                  />

                  <div>
                    <Input
                      label="Preço de Venda"
                      type="number"
                      step="0.01"
                      {...register("salePrice", { valueAsNumber: true })}
                      error={errors.salePrice?.message}
                      placeholder="0,00"
                      icon={DollarSign}
                    />
                    <div className="flex space-x-2 mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => applyMarginPreset(30)}
                      >
                        +30%
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => applyMarginPreset(50)}
                      >
                        +50%
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => applyMarginPreset(100)}
                      >
                        +100%
                      </Button>
                    </div>
                  </div>
                </div>

                {watchCostPrice > 0 && watchSalePrice > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      margin >= 30
                        ? "bg-success/10 border border-success/20"
                        : margin >= 15
                          ? "bg-warning/10 border border-warning/20"
                          : "bg-error/10 border border-error/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4
                          className={`font-medium ${
                            margin >= 30
                              ? "text-success"
                              : margin >= 15
                                ? "text-warning"
                                : "text-error"
                          }`}
                        >
                          Margem de Lucro: {margin.toFixed(1)}%
                        </h4>
                        <p className="text-sm text-text-secondary">
                          Lucro por unidade:{" "}
                          {formatCurrency(watchSalePrice - watchCostPrice)}
                        </p>
                      </div>
                      <Calculator
                        className={`w-5 h-5 ${
                          margin >= 30
                            ? "text-success"
                            : margin >= 15
                              ? "text-warning"
                              : "text-error"
                        }`}
                      />
                    </div>
                  </motion.div>
                )}

                <Input
                  label="Fornecedor"
                  {...register("supplier")}
                  error={errors.supplier?.message}
                  placeholder="Ex: PetFood Distribuidora Ltda"
                  icon={Truck}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Ações
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  loading={isSubmitting}
                  disabled={!isDirty}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>

                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/dashboard/inventory" className="flex items-center justify-center">Cancelar Edição</Link>
                </Button>

                <hr className="border-border" />

                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/dashboard/inventory/${appointmentId}`} className="flex items-center justify-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Product Statistics */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Estatísticas
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-500 mb-1">
                    {mockProduct.stats.totalSold}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Unidades Vendidas
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-success">
                      {formatCurrency(mockProduct.stats.totalRevenue)}
                    </div>
                    <div className="text-xs text-text-secondary">
                      Receita Total
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-text-primary">
                      {mockProduct.stats.averageMonthlyConsumption}
                    </div>
                    <div className="text-xs text-text-secondary">
                      Consumo/Mês
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Criado em:</span>
                    <span className="text-text-primary">
                      {formatDate(mockProduct.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Validade:</span>
                    <span className="text-text-primary">
                      {formatDate(mockProduct.validity)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">
                      Dias para vencer:
                    </span>
                    <span className="text-text-primary">
                      {mockProduct.stats.daysUntilExpiry} dias
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">
                      Duração estimada:
                    </span>
                    <span className="text-text-primary">
                      {mockProduct.stats.stockDays} dias
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Movements */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Movimentações Recentes
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockProduct.movements.map((movement, index) => (
                    <motion.div
                      key={movement.id}
                      className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            movement.type === "IN"
                              ? "bg-success/10"
                              : "bg-error/10"
                          }`}
                        >
                          {movement.type === "IN" ? (
                            <TrendingUp className="w-4 h-4 text-success" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-error" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary">
                            {movement.type === "IN" ? "+" : "-"}
                            {movement.quantity}
                          </h4>
                          <p className="text-sm text-text-secondary">
                            {movement.reason}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text-primary">
                          {formatDate(movement.date)}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {movement.user}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button variant="ghost" className="w-full mt-3" asChild>
                  <Link href="/dashboard/inventory/movements" className="flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Todas Movimentações
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pricing Calculator */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculadora de Preço
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Margem Desejada (%)
                  </label>
                  <Input
                    type="number"
                    value={suggestedMargin}
                    onChange={(e) => setSuggestedMargin(Number(e.target.value))}
                    min="0"
                    max="500"
                  />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={calculateSuggestedPrice}
                  disabled={!watchCostPrice}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calcular Preço
                </Button>

                {watchCostPrice > 0 && (
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Custo:</span>
                      <span className="text-text-primary">
                        {formatCurrency(watchCostPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        Preço sugerido:
                      </span>
                      <span className="text-text-primary font-medium">
                        {formatCurrency(
                          watchCostPrice * (1 + suggestedMargin / 100),
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warning Card */}
            <Card className="border-warning/20 bg-warning/5">
              <CardHeader>
                <h3 className="text-lg font-semibold text-warning flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Atenção
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-warning/80">
                  Este produto possui movimentações no estoque. Alterações nos
                  preços afetarão apenas vendas futuras.
                </p>

                <div className="space-y-2">
                  <p className="text-xs text-warning/60">
                    • {mockProduct.movements.length} movimentações registradas
                    <br />• {mockProduct.stats.totalSold} unidades já vendidas
                    <br />• Receita total:{" "}
                    {formatCurrency(mockProduct.stats.totalRevenue)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Informações
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">ID do Produto:</span>
                  <span className="text-text-primary font-medium">
                    #{appointmentId}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Cadastrado em:</span>
                  <span className="text-text-primary">
                    {formatDate(mockProduct.created_at)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    Última atualização:
                  </span>
                  <span className="text-text-primary">
                    {formatDate(mockProduct.updated_at)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Status:</span>
                  <span className={`font-medium ${stockStatus.color}`}>
                    {stockStatus.label}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Excluir Produto
                </h3>
                <p className="text-sm text-text-secondary">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-text-secondary mb-4">
                Tem certeza que deseja excluir permanentemente este produto?
              </p>

              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <h4 className="font-medium text-error mb-2">
                  ⚠️ Consequências da exclusão:
                </h4>
                <ul className="text-sm text-error/80 space-y-1">
                  <li>• Produto será removido do estoque</li>
                  <li>
                    • {mockProduct.movements.length} movimentação
                    {mockProduct.movements.length !== 1 ? "ões" : ""} será
                    {mockProduct.movements.length !== 1 ? "ão" : ""} mantida
                    {mockProduct.movements.length !== 1 ? "s" : ""} no histórico
                  </li>
                  <li>• Histórico de vendas será preservado</li>
                  <li>
                    • Receita total:{" "}
                    {formatCurrency(mockProduct.stats.totalRevenue)}
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="ghost"
                className="text-error hover:bg-error/10"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Permanentemente
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
