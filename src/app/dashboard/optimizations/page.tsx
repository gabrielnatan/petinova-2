"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Image,
  Package,
  Upload,
  Download,
  Settings,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileImage,
  HardDrive,
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
import { OptimizedImage, ResponsiveImage, BlurImage } from "@/components/ui/optimized-image";
import { useAuth } from "@/store";
import { getComponentCacheStats, optimizeImports } from "@/lib/bundle-splitting";

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  width: number;
  height: number;
}

interface BundleStats {
  totalChunks: number;
  cachedComponents: string[];
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

export default function OptimizationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [optimizationOptions, setOptimizationOptions] = useState({
    quality: 80,
    format: 'webp',
    width: 0,
    height: 0,
    blur: 0,
    sharpen: false
  });
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [bundleStats, setBundleStats] = useState<BundleStats | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBundleStats();
    }
  }, [user]);

  const loadBundleStats = () => {
    try {
      const stats = getComponentCacheStats();
      const importStats = optimizeImports();
      
      setBundleStats({
        totalChunks: importStats.totalChunks,
        cachedComponents: importStats.cachedComponents,
        memoryUsage: importStats.memoryUsage
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas do bundle:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptimizeImage = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('options', JSON.stringify(optimizationOptions));

      const response = await fetch('/api/optimize-images', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setOptimizationResult(data.result);
      } else {
        alert('Erro ao otimizar imagem: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao otimizar imagem:', error);
      alert('Erro ao otimizar imagem');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center">
            <Zap className="w-8 h-8 mr-3" />
            Otimizações
          </h1>
          <p className="text-text-secondary mt-1">
            Otimização de imagens e bundle splitting
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadBundleStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Otimização de Imagens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="w-5 h-5 mr-2" />
              Otimização de Imagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Upload de arquivo */}
              <div>
                <label className="text-sm font-medium text-text-secondary">Selecionar Imagem</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
              </div>

              {/* Preview da imagem */}
              {imagePreview && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Preview</label>
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <OptimizedImage
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Opções de otimização */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Qualidade</label>
                  <Select
                    value={optimizationOptions.quality.toString()}
                    onValueChange={(value) => setOptimizationOptions(prev => ({ ...prev, quality: parseInt(value) }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60%</SelectItem>
                      <SelectItem value="70">70%</SelectItem>
                      <SelectItem value="80">80%</SelectItem>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="100">100%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">Formato</label>
                  <Select
                    value={optimizationOptions.format}
                    onValueChange={(value) => setOptimizationOptions(prev => ({ ...prev, format: value as any }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webp">WebP</SelectItem>
                      <SelectItem value="avif">AVIF</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">Largura</label>
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={optimizationOptions.width || ''}
                    onChange={(e) => setOptimizationOptions(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">Altura</label>
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={optimizationOptions.height || ''}
                    onChange={(e) => setOptimizationOptions(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Botão de otimização */}
              <Button
                onClick={handleOptimizeImage}
                disabled={!selectedFile || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Otimizando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Otimizar Imagem
                  </>
                )}
              </Button>

              {/* Resultado da otimização */}
              {optimizationResult && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Otimização Concluída</span>
                  </div>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>Formato: {optimizationResult.format.toUpperCase()}</p>
                    <p>Tamanho original: {formatBytes(optimizationResult.originalSize)}</p>
                    <p>Tamanho otimizado: {formatBytes(optimizationResult.optimizedSize)}</p>
                    <p>Redução: {optimizationResult.compressionRatio.toFixed(2)}%</p>
                    <p>Dimensões: {optimizationResult.width} x {optimizationResult.height}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bundle Splitting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Bundle Splitting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bundleStats ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {bundleStats.totalChunks}
                      </div>
                      <div className="text-sm text-blue-700">Chunks Carregados</div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {bundleStats.cachedComponents.length}
                      </div>
                      <div className="text-sm text-green-700">Componentes em Cache</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-text-primary mb-2">Uso de Memória</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Heap Usado:</span>
                        <span>{formatMemory(bundleStats.memoryUsage.heapUsed)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heap Total:</span>
                        <span>{formatMemory(bundleStats.memoryUsage.heapTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RSS:</span>
                        <span>{formatMemory(bundleStats.memoryUsage.rss)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-text-primary mb-2">Componentes em Cache</h3>
                    <div className="max-h-32 overflow-y-auto">
                      {bundleStats.cachedComponents.length > 0 ? (
                        <div className="space-y-1">
                          {bundleStats.cachedComponents.map((component, index) => (
                            <div key={index} className="text-sm text-text-secondary bg-gray-50 px-2 py-1 rounded">
                              {component}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-text-secondary">Nenhum componente em cache</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-text-secondary">Carregando estatísticas...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exemplos de Componentes Otimizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Exemplos de Componentes Otimizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Imagem Otimizada</h4>
              <OptimizedImage
                src="/images/sample.jpg"
                alt="Exemplo de imagem otimizada"
                width={200}
                height={150}
                className="rounded-lg"
                fallback="/images/placeholder.jpg"
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Imagem Responsiva</h4>
              <ResponsiveImage
                src="/images/sample.jpg"
                alt="Exemplo de imagem responsiva"
                aspectRatio={16/9}
                className="rounded-lg"
                fallback="/images/placeholder.jpg"
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Imagem com Blur</h4>
              <BlurImage
                src="/images/sample.jpg"
                alt="Exemplo de imagem com blur"
                width={200}
                height={150}
                className="rounded-lg"
                fallback="/images/placeholder.jpg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="w-5 h-5 mr-2" />
            Estatísticas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                <FileImage className="w-8 h-8 mx-auto mb-2" />
              </div>
              <div className="text-sm text-purple-700">Otimização de Imagens</div>
              <div className="text-xs text-purple-600 mt-1">WebP, AVIF, Responsivo</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                <Package className="w-8 h-8 mx-auto mb-2" />
              </div>
              <div className="text-sm text-orange-700">Bundle Splitting</div>
              <div className="text-xs text-orange-600 mt-1">Lazy Loading, Cache</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                <Zap className="w-8 h-8 mx-auto mb-2" />
              </div>
              <div className="text-sm text-blue-700">Performance</div>
              <div className="text-xs text-blue-600 mt-1">Otimizado</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              </div>
              <div className="text-sm text-green-700">Status</div>
              <div className="text-xs text-green-600 mt-1">Ativo</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
