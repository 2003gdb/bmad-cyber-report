// Admin Portal TypeScript Interfaces

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  lastLogin: string | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export interface ReportSummary {
  id: number;
  attackType: string;
  incidentDate: string;
  impactLevel: string;
  status: string;
  isAnonymous: boolean;
  userId: number | null;
  location: string;
  createdAt: string;
}

export interface Report {
  id: number;
  userId: number | null;
  attackType: string;
  incidentDate: string;
  impactLevel: string;
  description: string;
  location: string;
  deviceInfo: string | null;
  isAnonymous: boolean;
  status: string;
  adminNotes: string | null;
  evidenceUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalReports: number;
  reportsToday: number;
  criticalReports: number;
  recentTrends: TrendData[];
}

export interface TrendData {
  attackType: string;
  count: number;
  percentage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface UpdateStatusRequest {
  status: string;
  adminNotes?: string;
}