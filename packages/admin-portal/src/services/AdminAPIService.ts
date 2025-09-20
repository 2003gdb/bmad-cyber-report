// Admin API Service for Backend Communication

import {
  LoginRequest,
  LoginResponse,
  ReportSummary,
  Report,
  DashboardMetrics,
  PaginatedResponse,
  UpdateStatusRequest
} from '../types';

export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  admin?: {
    id: number;
    email: string;
    created_at: string;
  };
}

class AdminAPIService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Error de conexión',
          statusCode: response.status
        }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión de red');
    }
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.request<{access_token: string; admin: { id: number; email: string; isAdmin: boolean; }}>('/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      this.token = response.access_token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', response.access_token);
      }

      return {
        token: response.access_token,
        admin: {
          id: response.admin.id,
          email: response.admin.email,
          name: response.admin.email,
          role: 'admin',
          lastLogin: null,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  }

  async register(credentials: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await this.request<RegisterResponse>('/admin/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error al registrar administrador');
    }
  }

  logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  // Dashboard Methods
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.request<DashboardMetrics>('/admin/dashboard');
  }

  // Reports Methods
  async getReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
    attackType?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<ReportSummary>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);
    if (params?.attackType) queryParams.set('attack_type', params.attackType);
    if (params?.dateFrom) queryParams.set('date_from', params.dateFrom);
    if (params?.dateTo) queryParams.set('date_to', params.dateTo);

    const endpoint = `/admin/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<PaginatedResponse<ReportSummary>>(endpoint);
  }

  async getReportById(id: number): Promise<Report> {
    return this.request<Report>(`/admin/reports/${id}`);
  }

  async updateReportStatus(id: number, updateData: UpdateStatusRequest): Promise<Report> {
    return this.request<Report>(`/admin/reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Utility Methods
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.request<{ valid: boolean }>('/admin/validate-token');
      return true;
    } catch {
      this.logout();
      return false;
    }
  }
}

// Export singleton instance
export const adminAPIService = new AdminAPIService();