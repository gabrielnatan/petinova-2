//@ts-nocheck
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
  Calculator,
  Barcode,
  Truck,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

// Schema de validação
const newProductSchema = z.object({
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

type NewProductFormData = z.infer<typeof newProductSchema>;

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

export default function NewProductPage() {
  const [suggestedMargin, setSuggestedMargin] = useState<number>(50);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewProductFormData>({
    resolver: zodResolver(newProductSchema),
    defaultValues: {
      quantity: 0,
      minStock: 1,
      costPrice: 0,
      salePrice: 0,
    },
  });

  const watchCostPrice = watch("costPrice");
  const watchSalePrice = watch("salePrice");
  const watchType = watch("type");

  // Calcular margem de lucro
  const margin =
    watchCostPrice && watchSalePrice
      ? ((watchSalePrice - watchCostPrice) / watchCostPrice) * 100
      : 0;

  const onSubmit = async (data: NewProductFormData) => {
    try {
      console.log("Creating product:", data);

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to inventory
      window.location.href = "/dashboard/inventory";
    } catch (error) {
      console.error("Error creating product:", error);
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

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      Medicamento: "💊",
      Alimento: "🥘",
      Higiene: "🧼",
      Acessório: "🎾",
      Suplemento: "💉",
      Equipamento: "🔧",
      "Material Cirúrgico": "✂️",
      Vacina: "💉",
    };
    return icons[type] || "📦";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/inventory" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Novo Produto</h1>
          <p className="text-text-secondary">
            Cadastre um novo item no estoque
          </p>
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
                      <option value="">Selecione o tipo</option>
                      {productTypes.map((type) => (
                        <option key={type} value={type}>
                          {getTypeIcon(type)} {type}
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
                      <option value="">Selecione a unidade</option>
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
                    Descrição (Opcional)
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
                    label="Quantidade Inicial"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Localização no Estoque (Opcional)"
                    {...register("location")}
                    placeholder="Ex: Prateleira A2, Geladeira 1"
                  />

                  <Input
                    label="Código de Barras (Opcional)"
                    {...register("barcode")}
                    placeholder="Ex: 7891234567890"
                    icon={Barcode}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Lote (Opcional)"
                    {...register("batch")}
                    placeholder="Ex: L2024001"
                  />

                  <Input
                    label="Data de Validade (Opcional)"
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
              </CardContent>
            </Card>

            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Informações do Fornecedor
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Nome do Fornecedor"
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
            {/* Preview */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Preview do Produto
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-background-secondary rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-lg">
                      {watchType ? getTypeIcon(watchType) : "📦"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary">
                        {watch("name") || "Nome do produto"}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {watchType || "Tipo"} •{" "}
                        {watch("supplier") || "Fornecedor"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Estoque:</span>
                      <span className="text-text-primary">
                        {watch("quantity") || 0} {watch("unit") || "un"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Preço:</span>
                      <span className="text-text-primary font-medium">
                        {formatCurrency(watchSalePrice || 0)}
                      </span>
                    </div>
                    {margin > 0 && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Margem:</span>
                        <span
                          className={`font-medium ${
                            margin >= 30
                              ? "text-success"
                              : margin >= 15
                                ? "text-warning"
                                : "text-error"
                          }`}
                        >
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
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

            {/* Tips */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Dicas
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <h4 className="font-medium text-primary mb-1">
                    💡 Precificação
                  </h4>
                  <p className="text-sm text-primary/80">
                    Margem recomendada: 30-50% para produtos comuns, 50-100%
                    para especialidades.
                  </p>
                </div>

                <div className="p-3 bg-warning/10 rounded-lg">
                  <h4 className="font-medium text-warning mb-1">📦 Estoque</h4>
                  <p className="text-sm text-warning/80">
                    Define o estoque mínimo baseado no consumo médio mensal.
                  </p>
                </div>

                <div className="p-3 bg-success/10 rounded-lg">
                  <h4 className="font-medium text-success mb-1">📅 Validade</h4>
                  <p className="text-sm text-success/80">
                    Medicamentos e alimentos devem sempre ter validade
                    cadastrada.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Ações
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" className="w-full" loading={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Salvando..." : "Cadastrar Produto"}
                </Button>

                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/dashboard/inventory" className="flex items-center justify-center">Cancelar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
