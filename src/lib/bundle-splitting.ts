import { lazy, Suspense, ComponentType, useState, useEffect, useCallback } from 'react';

// Interface para componentes lazy
interface LazyComponentConfig {
  fallback?: React.ReactNode;
  preload?: boolean;
  chunkName?: string;
}

// Cache para componentes já carregados
const loadedComponents = new Map<string, ComponentType<any>>();

// Função para criar componente lazy com configurações avançadas
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyComponentConfig = {}
): T {
  const { fallback, preload, chunkName } = config;

  const LazyComponent = lazy(async () => {
    try {
      const module = await importFn();
      
      // Adicionar ao cache se chunkName for fornecido
      if (chunkName) {
        loadedComponents.set(chunkName, module.default);
      }
      
      return module;
    } catch (error) {
      console.error('Erro ao carregar componente lazy:', error);
      throw error;
    }
  });

  // Preload se especificado
  if (preload) {
    importFn().catch(() => {
      // Ignorar erros de preload
    });
  }

  return LazyComponent as T;
}

// Wrapper para Suspense com fallback padrão
export function withSuspense<T extends ComponentType<any>>(
  Component: T,
  fallback?: React.ReactNode
): T {
  const WrappedComponent = (props: any) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <Component {...props} />
    </Suspense>
  );

  return WrappedComponent as T;
}

// Fallback padrão
function DefaultFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-sm text-text-secondary">Carregando...</span>
    </div>
  );
}

// Função para preload de componentes
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  chunkName?: string
): Promise<T> {
  return importFn().then(module => {
    if (chunkName) {
      loadedComponents.set(chunkName, module.default);
    }
    return module.default;
  });
}

// Função para verificar se componente já foi carregado
export function isComponentLoaded(chunkName: string): boolean {
  return loadedComponents.has(chunkName);
}

// Função para obter componente do cache
export function getCachedComponent<T extends ComponentType<any>>(
  chunkName: string
): T | null {
  return (loadedComponents.get(chunkName) as T) || null;
}

// Função para limpar cache
export function clearComponentCache(): void {
  loadedComponents.clear();
}

// Função para obter estatísticas do cache
export function getComponentCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: loadedComponents.size,
    keys: Array.from(loadedComponents.keys())
  };
}

// Configurações de chunk para diferentes tipos de componentes
export const CHUNK_CONFIGS = {
  // Componentes de dashboard
  DASHBOARD: {
    chunkName: 'dashboard',
    preload: true,
    fallback: <DashboardFallback />
  },
  
  // Componentes de formulários
  FORMS: {
    chunkName: 'forms',
    preload: false,
    fallback: <FormFallback />
  },
  
  // Componentes de relatórios
  REPORTS: {
    chunkName: 'reports',
    preload: false,
    fallback: <ReportFallback />
  },
  
  // Componentes de configurações
  SETTINGS: {
    chunkName: 'settings',
    preload: false,
    fallback: <SettingsFallback />
  },
  
  // Componentes de monitoramento
  MONITORING: {
    chunkName: 'monitoring',
    preload: false,
    fallback: <MonitoringFallback />
  }
};

// Fallbacks específicos para diferentes tipos de componentes
function DashboardFallback() {
  return (
    <div className="p-6 space-y-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FormFallback() {
  return (
    <div className="p-6 space-y-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportFallback() {
  return (
    <div className="p-6 space-y-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

function SettingsFallback() {
  return (
    <div className="p-6 space-y-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonitoringFallback() {
  return (
    <div className="p-6 space-y-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook para lazy loading com preload
export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyComponentConfig = {}
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (Component) return Component;

    setIsLoading(true);
    setError(null);

    try {
      const module = await importFn();
      const LazyComponent = createLazyComponent(importFn, config);
      setComponent(LazyComponent);
      return LazyComponent;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [Component, importFn, config]);

  // Preload se especificado
  useEffect(() => {
    if (config.preload) {
      loadComponent().catch(() => {
        // Ignorar erros de preload
      });
    }
  }, [loadComponent, config.preload]);

  return {
    Component,
    isLoading,
    error,
    loadComponent
  };
}

// Função para criar bundle dinâmico
export function createDynamicBundle<T extends ComponentType<any>>(
  components: Record<string, () => Promise<{ default: T }>>,
  config: LazyComponentConfig = {}
) {
  const bundle: Record<string, T> = {};

  Object.entries(components).forEach(([name, importFn]) => {
    bundle[name] = createLazyComponent(importFn, {
      ...config,
      chunkName: `${config.chunkName || 'bundle'}-${name}`
    });
  });

  return bundle;
}

// Função para otimizar imports
export function optimizeImports() {
  // Esta função seria usada para analisar e otimizar imports
  // Em um ambiente real, seria integrada com ferramentas como webpack-bundle-analyzer
  
  const importStats = {
    totalChunks: loadedComponents.size,
    cachedComponents: Array.from(loadedComponents.keys()),
    memoryUsage: process.memoryUsage()
  };

  return importStats;
}
