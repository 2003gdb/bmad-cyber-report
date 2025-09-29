// Admin API Service for Backend Communication

import {
  LoginRequest,
  LoginResponse,
  ReportSummary,
  Report,
  DashboardMetrics,
  EnhancedDashboardMetrics,
  PaginatedResponse,
  UpdateStatusRequest,
  SearchFilters,
  SearchResult,
  SavedSearch,
  SearchHistory,
  AdminNote,
  NoteTemplate
} from '../types';

import {
  CatalogData,
  CatalogMaps,
  CatalogAPIResponse
} from '../types/catalog.types';

import {
  ReportWithDetails,
  NormalizedReport,
  AdminPortalFilters
} from '../types/normalized.types';

import { CatalogUtils } from '../utils/catalogUtils';

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
  private catalogCache: CatalogData | null = null;
  private catalogMaps: CatalogMaps | null = null;
  private lastCacheTime: number = 0;
  private readonly CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

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

    console.log('🌐 Making request:', { url, method: config.method || 'GET', hasAuth: !!this.token });

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

  // Catalog Methods
  async getCatalogs(): Promise<CatalogData> {
    const now = Date.now();

    // Return cached data if valid and not expired
    if (this.catalogCache && this.isCacheValid(now)) {
      return this.catalogCache;
    }

    console.log('📋 Loading catalog data from API...');

    try {
      console.log('🔄 Making request to /reportes/catalogs...');
      const response = await this.request<{success: boolean; data: CatalogAPIResponse}>('/reportes/catalogs');

      console.log('📦 Raw response received:', response);

      // Handle the wrapped response from backend: {success: true, data: {...}}
      let catalogData: CatalogAPIResponse;

      if (response.data && response.data.attackTypes) {
        // Backend returns: { success: true, data: { attackTypes: [...], impacts: [...], statuses: [...] } }
        catalogData = response.data;
      } else if (response.attackTypes) {
        // Fallback: Backend returns: { success: true, attackTypes: [...], impacts: [...], statuses: [...] }
        catalogData = response as any;
      } else {
        console.error('Unexpected response structure:', response);
        throw new Error('Invalid catalog data structure received from API');
      }

      if (!catalogData || !catalogData.attackTypes || !catalogData.impacts || !catalogData.statuses) {
        console.error('Missing required catalog data fields:', catalogData);
        throw new Error('Invalid catalog data structure received from API');
      }

      this.catalogCache = {
        attackTypes: catalogData.attackTypes,
        impacts: catalogData.impacts,
        statuses: catalogData.statuses
      };

      this.catalogMaps = CatalogUtils.createLookupMaps(this.catalogCache);
      this.lastCacheTime = now;

      console.log('✅ Catalog data loaded and cached:', {
        attackTypes: this.catalogCache.attackTypes.length,
        impacts: this.catalogCache.impacts.length,
        statuses: this.catalogCache.statuses.length
      });

      return this.catalogCache;
    } catch (error) {
      console.error('❌ Error loading catalog data:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        baseURL: this.baseURL
      });

      // Return default catalogs as fallback
      const defaultCatalogs = CatalogUtils.createDefaultCatalogs();
      console.warn('🔄 Using default catalog data as fallback');
      return defaultCatalogs;
    }
  }

  async getCatalogMaps(): Promise<CatalogMaps> {
    if (!this.catalogMaps) {
      await this.getCatalogs(); // This will create the maps
    }
    return this.catalogMaps!;
  }

  async refreshCatalogs(): Promise<void> {
    console.log('🔄 Refreshing catalog cache...');
    this.catalogCache = null;
    this.catalogMaps = null;
    this.lastCacheTime = 0;
    await this.getCatalogs();
  }

  // Helper methods for catalog lookups
  async getAttackTypeName(id: number): Promise<string> {
    const maps = await this.getCatalogMaps();
    return maps.attackTypeMap.get(id) || 'Desconocido';
  }

  async getImpactName(id: number): Promise<string> {
    const maps = await this.getCatalogMaps();
    return maps.impactMap.get(id) || 'Desconocido';
  }

  async getStatusName(id: number): Promise<string> {
    const maps = await this.getCatalogMaps();
    return maps.statusMap.get(id) || 'Desconocido';
  }

  private isCacheValid(now: number): boolean {
    return (now - this.lastCacheTime) < this.CACHE_TIMEOUT;
  }

  // Dashboard Methods
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await this.request<{
      total_reports: number;
      reports_today: number;
      critical_reports: number;
      recent_trends: Array<{ attackType: string; count: number; percentage: number }>;
    }>('/admin/dashboard');

    // Transform API spec format to frontend DashboardMetrics format
    return {
      totalReports: response.total_reports,
      reportsToday: response.reports_today,
      criticalReports: response.critical_reports,
      recentTrends: response.recent_trends
    };
  }

  async getEnhancedDashboardMetrics(): Promise<EnhancedDashboardMetrics> {
    // Ensure catalogs are loaded
    await this.getCatalogs();
    const maps = await this.getCatalogMaps();

    const response = await this.request<EnhancedDashboardMetrics>('/admin/dashboard/enhanced');

    // Enrich the response with catalog names if they're not already present
    const enrichedResponse = {
      ...response,
      attack_types: response.attack_types?.map((item: any) => ({
        ...item,
        attack_type: item.attack_type_name || item.attack_type, // Ensure backward compatibility
        attack_type_name: item.attack_type_name || maps.attackTypeMap.get(item.attack_type_id) || 'Desconocido'
      })),
      impact_distribution: response.impact_distribution?.map((item: any) => ({
        ...item,
        impact_name: item.impact_name || maps.impactMap.get(item.impact_id) || 'Desconocido'
      })),
      status_distribution: response.status_distribution?.map((item: any) => ({
        ...item,
        status_name: item.status_name || maps.statusMap.get(item.status_id) || 'Desconocido'
      }))
    };

    return enrichedResponse;
  }

  // Reports Methods
  async getReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
    attackType?: string;
    isAnonymous?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<ReportSummary>> {
    // Ensure catalogs are loaded for enrichment
    await this.getCatalogs();
    const maps = await this.getCatalogMaps();

    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);
    if (params?.attackType) queryParams.set('attack_type', params.attackType);
    if (params?.isAnonymous) queryParams.set('is_anonymous', params.isAnonymous);
    if (params?.dateFrom) queryParams.set('date_from', params.dateFrom);
    if (params?.dateTo) queryParams.set('date_to', params.dateTo);

    // Use standard reportes endpoint
    const endpoint = `/reportes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await this.request<PaginatedResponse<ReportSummary>>(endpoint);

    // Enrich reports with catalog names if they don't already have them
    const enrichedReports = response.data.map((report: ReportSummary) => {
      // Try to convert string attack types to IDs if they're still strings
      let attackTypeId: number | null = null;
      let impactId: number | null = null;
      let statusId: number | null = null;

      if (typeof report.attack_type === 'string') {
        attackTypeId = maps.attackTypeNameMap.get(report.attack_type) || null;
      }
      if (typeof report.impact_level === 'string') {
        impactId = maps.impactNameMap.get(report.impact_level) || null;
      }
      if (typeof report.status === 'string') {
        statusId = maps.statusNameMap.get(report.status) || null;
      }

      return {
        ...report,
        // Preserve original fields while adding enriched data
        attackTypeId,
        impactId,
        statusId
      };
    });

    return {
      ...response,
      data: enrichedReports
    };
  }

  async getReportById(id: number): Promise<Report> {
    // Use admin-specific endpoint for consistent data transformation
    return this.request<Report>(`/admin/reports/${id}`);
  }

  async updateReportStatus(id: number, updateData: UpdateStatusRequest): Promise<Report> {
    return this.request<Report>(`/admin/reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Advanced Search Methods
  async searchReports(filters: SearchFilters, page: number = 1, limit: number = 10): Promise<PaginatedResponse<SearchResult>> {
    const queryParams = new URLSearchParams();

    queryParams.set('page', page.toString());
    queryParams.set('limit', limit.toString());

    if (filters.query) queryParams.set('q', filters.query);
    if (filters.status) queryParams.set('status', filters.status);
    if (filters.attackType) queryParams.set('attack_type', filters.attackType);
    if (filters.impactLevel) queryParams.set('impact_level', filters.impactLevel);
    if (filters.isAnonymous !== undefined) queryParams.set('is_anonymous', filters.isAnonymous.toString());
    if (filters.dateFrom) queryParams.set('date_from', filters.dateFrom);
    if (filters.dateTo) queryParams.set('date_to', filters.dateTo);
    if (filters.location) queryParams.set('location', filters.location);

    try {
      const endpoint = `/admin/reports/search?${queryParams.toString()}`;
      return await this.request<PaginatedResponse<SearchResult>>(endpoint);
    } catch (error) {
      // Fallback to basic reports with client-side filtering if search endpoint doesn't exist
      console.warn('Advanced search endpoint not available, falling back to basic filtering');

      const basicFilters = {
        page,
        limit,
        status: filters.status,
        attackType: filters.attackType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      };

      const response = await this.getReports(basicFilters);

      // Convert ReportSummary to SearchResult format
      const searchResults: SearchResult[] = response.data.map(report => ({
        ...report,
        highlights: filters.query ? {
          description: [filters.query],
          location: report.attack_origin?.toLowerCase().includes(filters.query.toLowerCase()) ? [filters.query] : undefined
        } : undefined,
        score: filters.query ? this.calculateBasicScore(report, filters.query) : undefined
      }));

      return {
        ...response,
        data: searchResults
      };
    }
  }

  private calculateBasicScore(report: ReportSummary, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    if (report.attack_origin?.toLowerCase().includes(lowerQuery)) score += 0.5;
    if (report.attack_type.toLowerCase().includes(lowerQuery)) score += 0.3;
    if (report.id.toString().includes(query)) score += 0.2;

    return Math.min(score, 1.0);
  }

  // Search History Management
  async getSearchHistory(): Promise<SearchHistory[]> {
    // For now, use localStorage for search history
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('admin_search_history');
      return history ? JSON.parse(history) : [];
    }
    return [];
  }

  async saveSearchToHistory(query: string, filters: SearchFilters, resultCount: number): Promise<void> {
    if (typeof window !== 'undefined') {
      const history = await this.getSearchHistory();
      const newEntry: SearchHistory = {
        id: Date.now().toString(),
        query,
        filters,
        timestamp: new Date().toISOString(),
        resultCount
      };

      // Keep only last 50 searches
      const updatedHistory = [newEntry, ...history.slice(0, 49)];
      localStorage.setItem('admin_search_history', JSON.stringify(updatedHistory));
    }
  }

  async clearSearchHistory(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_search_history');
    }
  }

  // Saved Searches Management
  async getSavedSearches(): Promise<SavedSearch[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_saved_searches');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  }

  async saveSearch(name: string, filters: SearchFilters): Promise<SavedSearch> {
    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      const saved = await this.getSavedSearches();
      const updated = [newSavedSearch, ...saved];
      localStorage.setItem('admin_saved_searches', JSON.stringify(updated));
    }

    return newSavedSearch;
  }

  async deleteSavedSearch(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const saved = await this.getSavedSearches();
      const updated = saved.filter(search => search.id !== id);
      localStorage.setItem('admin_saved_searches', JSON.stringify(updated));
    }
  }


  // Admin Notes Methods
  async getReportNotes(reportId: number): Promise<AdminNote[]> {
    try {
      return await this.request<AdminNote[]>(`/admin/reports/${reportId}/notes`);
    } catch (error) {
      // Fallback to empty notes if endpoint doesn't exist
      console.warn('Admin notes endpoint not available, returning empty notes');
      return [];
    }
  }

  async addReportNote(reportId: number, content: string, isTemplate: boolean = false, templateName?: string): Promise<AdminNote> {
    try {
      return await this.request<AdminNote>(`/admin/reports/${reportId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content, isTemplate, templateName }),
      });
    } catch (error) {
      // Fallback to creating a mock note for UI consistency
      console.warn('Admin notes endpoint not available, creating mock note');
      const mockNote: AdminNote = {
        id: Date.now(),
        reportId,
        adminId: 1,
        adminName: 'Admin User',
        content,
        isTemplate,
        templateName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return mockNote;
    }
  }

  async updateNote(noteId: number, content: string): Promise<AdminNote> {
    try {
      return await this.request<AdminNote>(`/admin/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
    } catch (error) {
      console.warn('Note update endpoint not available');
      throw new Error('Note update not available in current backend implementation');
    }
  }

  async deleteNote(noteId: number): Promise<void> {
    try {
      return await this.request<void>(`/admin/notes/${noteId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Note delete endpoint not available');
      throw new Error('Note deletion not available in current backend implementation');
    }
  }

  // Note Templates
  async getNoteTemplates(): Promise<NoteTemplate[]> {
    if (typeof window !== 'undefined') {
      const templates = localStorage.getItem('admin_note_templates');
      return templates ? JSON.parse(templates) : this.getDefaultNoteTemplates();
    }
    return this.getDefaultNoteTemplates();
  }

  private getDefaultNoteTemplates(): NoteTemplate[] {
    return [
      {
        id: '1',
        name: 'Investigación Iniciada',
        content: 'Se ha iniciado la investigación de este reporte. Se han tomado las medidas iniciales para verificar la información proporcionada.',
        category: 'Investigación'
      },
      {
        id: '2',
        name: 'Información Adicional Requerida',
        content: 'Se requiere información adicional del usuario para continuar con la investigación. Se ha enviado una solicitud de seguimiento.',
        category: 'Seguimiento'
      },
      {
        id: '3',
        name: 'Caso Resuelto',
        content: 'El caso ha sido resuelto satisfactoriamente. Se han implementado las medidas correctivas necesarias.',
        category: 'Resolución'
      },
      {
        id: '4',
        name: 'Escalado a Autoridades',
        content: 'El caso ha sido escalado a las autoridades competentes debido a la gravedad del incidente reportado.',
        category: 'Escalación'
      }
    ];
  }

  async saveNoteTemplate(template: Omit<NoteTemplate, 'id'>): Promise<NoteTemplate> {
    const newTemplate: NoteTemplate = {
      ...template,
      id: Date.now().toString()
    };

    if (typeof window !== 'undefined') {
      const templates = await this.getNoteTemplates();
      const updated = [newTemplate, ...templates];
      localStorage.setItem('admin_note_templates', JSON.stringify(updated));
    }

    return newTemplate;
  }

  async deleteNoteTemplate(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const templates = await this.getNoteTemplates();
      const updated = templates.filter(template => template.id !== id);
      localStorage.setItem('admin_note_templates', JSON.stringify(updated));
    }
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