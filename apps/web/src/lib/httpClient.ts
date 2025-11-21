/**
 * HTTP client for API communication
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

class HttpClient {
  private baseURL: string;
  private supabase: any = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Lazy load supabase for auth tokens
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.warn('Failed to initialize Supabase client:', error);
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.supabase) {
      await this.initializeSupabase();
    }

    if (this.supabase) {
      try {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session?.access_token) {
          return { Authorization: `Bearer ${session.access_token}` };
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error);
      }
    }

    return {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create and export the client instance
export const httpClient = new HttpClient(API_BASE_URL);

// Export the class for testing
export { HttpClient };