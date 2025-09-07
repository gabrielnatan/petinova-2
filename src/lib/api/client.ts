class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(options.headers);

    // Adicionar Content-Type para requisições com body
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include', // Importante para enviar cookies httpOnly automaticamente
    });


    if (!response.ok) {
      let errorMessage = 'Erro na requisição';
      
      try {
        const errorData = await response.json();
    console.log("RESPONSE ", errorData)
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Se não conseguir fazer parse do JSON, usar status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Retornar resposta vazia para status 204 (No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }



  async get<T = any>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { method: 'GET', ...options });
  }

  async post<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T = any>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { method: 'DELETE', ...options });
  }
}

// Instância singleton do cliente da API
export const apiClient = new APIClient(
  typeof window !== 'undefined' ? window.location.origin : ''
);

// Re-exportar a classe para casos específicos
export { APIClient };