"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  CreditCard,
  Truck,
  ShoppingCart,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Settings,
  TestTube,
  BarChart3,
  DollarSign,
  Database,
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
import { useAuth } from "@/store";

interface Supplier {
  type: string;
  name: string;
  configured: boolean;
  environment: string;
}

interface Gateway {
  type: string;
  gateway: string;
  configured: boolean;
  environment: string;
}

interface SyncResult {
  total: number;
  updated: number;
  created: number;
  errors: number;
}

export default function IntegrationsFinalPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({});

  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user]);

  const loadIntegrations = async () => {
    try {
      // Carregar fornecedores
      const suppliersResponse = await fetch('/api/suppliers');
      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData.suppliers || []);
      }

      // Carregar gateways
      const gatewaysResponse = await fetch('/api/payments');
      if (gatewaysResponse.ok) {
        const gatewaysData = await gatewaysResponse.json();
        setGateways(gatewaysData.gateways || []);
      }
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
    }
  };

  const testSupplierConnection = async (supplierType: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/suppliers?action=test&supplier=${supplierType}`);
      if (response.ok) {
        const data = await response.json();
        alert(`Conexão com ${supplierType}: ${data.result.connected ? 'Conectado' : 'Falhou'}`);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      alert('Erro ao testar conexão');
    } finally {
      setLoading(false);
    }
  };

  const syncSupplier = async (supplierType: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/suppliers?action=sync&supplier=${supplierType}`);
      if (response.ok) {
        const data = await response.json();
        setSyncResults(prev => ({
          ...prev,
          [supplierType]: data.result
        }));
        alert(`Sincronização concluída: ${data.result.total} produtos processados`);
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      alert('Erro na sincronização');
    } finally {
      setLoading(false);
    }
  };

  const syncAllSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/suppliers?action=sync-all');
      if (response.ok) {
        const data = await response.json();
        setSyncResults(data.results);
        alert('Sincronização de todos os fornecedores concluída');
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      alert('Erro na sincronização');
    } finally {
      setLoading(false);
    }
  };

  const testGatewayConnection = async (gatewayType: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments?action=test&gateway=${gatewayType}`);
      if (response.ok) {
        const data = await response.json();
        alert(`Gateway ${gatewayType}: ${data.connected ? 'Conectado' : 'Falhou'}`);
      }
    } catch (error) {
      console.error('Erro ao testar gateway:', error);
      alert('Erro ao testar gateway');
    } finally {
      setLoading(false);
    }
  };

  const createTestPayment = async () => {
    if (!selectedGateway) {
      alert('Selecione um gateway');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gatewayType: selectedGateway,
          amount: 100.00,
          currency: 'BRL',
          description: 'Teste de pagamento',
          paymentMethod: 'credit_card',
          metadata: {
            test: true,
            userId: user?.id
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Pagamento de teste criado: ${data.result.id}`);
      } else {
        alert('Erro ao criar pagamento de teste');
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      alert('Erro ao criar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center">
            <Settings className="w-8 h-8 mr-3" />
            Integrações Finais
          </h1>
          <p className="text-text-secondary mt-1">
            Fornecedores e Gateway de Pagamento
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadIntegrations}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fornecedores */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Fornecedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers.map((supplier) => (
                  <div key={supplier.type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{supplier.name}</h3>
                        <p className="text-sm text-text-secondary">{supplier.type}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {supplier.configured ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Configurado</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Não Configurado</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testSupplierConnection(supplier.type)}
                        disabled={loading || !supplier.configured}
                      >
                        <TestTube className="w-4 h-4 mr-1" />
                        Testar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncSupplier(supplier.type)}
                        disabled={loading || !supplier.configured}
                      >
                        <Database className="w-4 h-4 mr-1" />
                        Sincronizar
                      </Button>
                    </div>

                    {syncResults[supplier.type] && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>Total: {syncResults[supplier.type].total}</div>
                          <div>Atualizados: {syncResults[supplier.type].updated}</div>
                          <div>Criados: {syncResults[supplier.type].created}</div>
                          <div>Erros: {syncResults[supplier.type].errors}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  onClick={syncAllSuppliers}
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar Todos os Fornecedores
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gateway de Pagamento */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Gateway de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gateways.map((gateway) => (
                  <div key={gateway.type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{gateway.gateway.toUpperCase()}</h3>
                        <p className="text-sm text-text-secondary">{gateway.type}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {gateway.configured ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Configurado</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Não Configurado</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testGatewayConnection(gateway.type)}
                        disabled={loading || !gateway.configured}
                      >
                        <TestTube className="w-4 h-4 mr-1" />
                        Testar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedGateway(gateway.type)}
                        disabled={loading || !gateway.configured}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Testar Pagamento
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Teste de Pagamento */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Teste de Pagamento</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-text-secondary">Gateway</label>
                      <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione um gateway" />
                        </SelectTrigger>
                        <SelectContent>
                          {gateways.filter(g => g.configured).map((gateway) => (
                            <SelectItem key={gateway.type} value={gateway.type}>
                              {gateway.gateway.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={createTestPayment}
                      disabled={loading || !selectedGateway}
                      className="w-full"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Criar Pagamento de Teste (R$ 100,00)
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Estatísticas das Integrações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {suppliers.length}
              </div>
              <div className="text-sm text-blue-700">Fornecedores</div>
              <div className="text-xs text-blue-600 mt-1">
                {suppliers.filter(s => s.configured).length} configurados
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {gateways.length}
              </div>
              <div className="text-sm text-green-700">Gateways</div>
              <div className="text-xs text-green-600 mt-1">
                {gateways.filter(g => g.configured).length} configurados
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(syncResults).reduce((sum, result) => sum + result.total, 0)}
              </div>
              <div className="text-sm text-purple-700">Produtos Sincronizados</div>
              <div className="text-xs text-purple-600 mt-1">
                {Object.values(syncResults).reduce((sum, result) => sum + result.errors, 0)} erros
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(syncResults).length}
              </div>
              <div className="text-sm text-orange-700">Sincronizações</div>
              <div className="text-xs text-orange-600 mt-1">
                Realizadas hoje
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Variáveis de Ambiente Necessárias</h3>
              <div className="bg-gray-100 p-4 rounded-lg text-sm font-mono">
                <div># Fornecedores</div>
                <div>PHARMACEUTICAL_API_URL=</div>
                <div>PHARMACEUTICAL_API_KEY=</div>
                <div>EQUIPMENT_API_URL=</div>
                <div>EQUIPMENT_API_KEY=</div>
                <div>PET_FOOD_API_URL=</div>
                <div>PET_FOOD_API_KEY=</div>
                <br />
                <div># Gateways de Pagamento</div>
                <div>STRIPE_API_KEY=</div>
                <div>STRIPE_WEBHOOK_SECRET=</div>
                <div>MERCADOPAGO_API_KEY=</div>
                <div>MERCADOPAGO_WEBHOOK_SECRET=</div>
                <div>PAYPAL_CLIENT_ID=</div>
                <div>PAYPAL_CLIENT_SECRET=</div>
                <div>PIX_API_KEY=</div>
                <div>PIX_WEBHOOK_SECRET=</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Funcionalidades Implementadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Integração com Fornecedores</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Sincronização de Produtos</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Pedidos Automáticos</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Verificação de Estoque</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Gateway de Pagamento</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Múltiplos Gateways</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Reembolsos</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Webhooks Seguros</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
