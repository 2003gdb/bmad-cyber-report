# Next.js Admin Portal Architecture

## Next.js App Router Architecture

### Architecture Overview
The admin portal leverages **Next.js 13+ App Router** with **React Server Components** and **TypeScript** for optimal performance and developer experience. The architecture follows **component composition patterns** with **custom hooks** for state management and API integration.

### Core Architecture Components

**App Router Structure (Next.js 13+)**
- **Route-Based Organization:** File-system routing with nested layouts
- **Server Components:** Default server-side rendering for optimal performance
- **Client Components:** Interactive components with "use client" directive
- **Loading & Error States:** Built-in loading.tsx and error.tsx components

**Component Hierarchy**
- **Layout Components:** Shared layouts with navigation and authentication
- **Page Components:** Route-specific components with data fetching
- **Feature Components:** Business logic components (ReportsList, StatusUpdate)
- **Shared Components:** Reusable UI components (Button, Modal, LoadingSpinner)

**State Management Strategy**
- **Zustand:** Global state for authentication and application-wide data
- **React Query (TanStack Query):** Server state management with caching
- **React Hook Form:** Form state management with validation
- **Local State:** useState for component-specific UI state

### Next.js Implementation Structure

```typescript
// App Router Layout Structure
app/
├── layout.tsx          // Root layout with providers
├── page.tsx           // Homepage redirect to dashboard
├── login/
│   └── page.tsx       // Admin login page
├── dashboard/
│   ├── layout.tsx     // Dashboard layout with navigation
│   ├── page.tsx       // Dashboard overview
│   └── loading.tsx    // Dashboard loading state
├── reports/
│   ├── layout.tsx     // Reports section layout
│   ├── page.tsx       // Reports list with filters
│   ├── [id]/
│   │   └── page.tsx   // Individual report details
│   └── loading.tsx    // Reports loading state
├── analytics/
│   └── page.tsx       // Analytics dashboard
└── api/               // Optional API routes (if needed)
    └── auth/
        └── route.ts   // Auth helper endpoints
```

## Next.js State Management

### Global State with Zustand
```typescript
// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  adminUser: AdminUser | null
  accessToken: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      adminUser: null,
      accessToken: null,
      
      login: async (credentials) => {
        try {
          const response = await apiClient.post('/admin/login', credentials)
          const { access_token, admin_id } = response.data
          
          set({
            isAuthenticated: true,
            accessToken: access_token,
            adminUser: { admin_id }
          })
        } catch (error) {
          throw new Error('Credenciales inválidas')
        }
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          adminUser: null,
          accessToken: null
        })
      },
      
      refreshToken: async () => {
        // Token refresh logic
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        adminUser: state.adminUser,
        accessToken: state.accessToken
      })
    }
  )
)
```

### Server State with React Query
```typescript
// hooks/useReports.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => apiClient.get('/reportes', { params: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, status, notes }: UpdateStatusRequest) =>
      apiClient.put(`/admin/reports/${reportId}/status`, { status, notes }),
    onSuccess: () => {
      // Invalidate and refetch reports
      queryClient.invalidateQueries(['reports'])
    },
    onError: (error) => {
      console.error('Error actualizando estado del reporte:', error)
    }
  })
}

export function useReportDetails(reportId: number) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => apiClient.get(`/reportes/${reportId}`),
    enabled: !!reportId,
  })
}

// New hook for catalog data
export function useCatalogs() {
  return useQuery({
    queryKey: ['catalogs'],
    queryFn: () => apiClient.get('/reportes/catalogs'),
    staleTime: 30 * 60 * 1000, // 30 minutes - catalogs don't change often
    cacheTime: 60 * 60 * 1000, // 1 hour
  })
}
```

## Next.js Component Architecture

### Feature Component Example
```typescript
// components/reports/ReportsList.tsx
'use client'

import { useState } from 'react'
import { useReports, useUpdateReportStatus } from '@/hooks/useReports'
import { ReportFilters } from '@/types/Report'

interface ReportsListProps {
  initialFilters?: ReportFilters
}

export function ReportsList({ initialFilters = {} }: ReportsListProps) {
  const [filters, setFilters] = useState<ReportFilters>(initialFilters)
  const { data: reports, isLoading, error } = useReports(filters)
  const updateStatusMutation = useUpdateReportStatus()
  
  const handleStatusUpdate = async (reportId: string, status: ReportStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ reportId, status })
      // Success notification
    } catch (error) {
      // Error notification
    }
  }
  
  if (isLoading) {
    return <LoadingSpinner message="Cargando reportes..." />
  }
  
  if (error) {
    return <ErrorMessage message="Error al cargar los reportes" />
  }
  
  return (
    <div className="reports-list">
      <ReportFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />
      
      <div className="reports-grid">
        {reports?.data.reports.map((report) => (
          <ReportCard 
            key={report.report_id}
            report={report}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>
      
      <Pagination 
        currentPage={filters.page || 1}
        totalPages={reports?.data.pagination.pages || 1}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  )
}
```

### Shared Component Library
```typescript
// components/shared/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
}

export function LoadingSpinner({ 
  message = 'Cargando...', 
  size = 'medium' 
}: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="spinner" />
      <p className="loading-message">{message}</p>
    </div>
  )
}

// components/shared/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <p className="error-text">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          Reintentar
        </button>
      )}
    </div>
  )
}
```

## Next.js API Integration

### API Client Configuration
```typescript
// lib/api.ts
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      
      try {
        await useAuthStore.getState().refreshToken()
        const newToken = useAuthStore.getState().accessToken
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)
```

### TypeScript Type Definitions
```typescript
// types/Catalog.ts
export interface AttackType {
  id: number
  name: string
  created_at: string
}

export interface Impact {
  id: number
  name: string
  created_at: string
}

export interface Status {
  id: number
  name: string
  created_at: string
}

export interface CatalogData {
  attackTypes: AttackType[]
  impacts: Impact[]
  statuses: Status[]
}

// types/Report.ts
export interface Report {
  report_id: number
  user_id?: number
  is_anonymous: boolean
  attack_type: number // Foreign key to AttackType.id
  incident_date: string // ISO timestamp
  attack_origin?: string
  evidence_url?: string // URL to evidence files
  suspicious_url?: string
  message_content?: string
  description?: string
  impact: number // Foreign key to Impact.id
  status: number // Foreign key to Status.id
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface ReportWithDetails extends Report {
  attack_type_name: string
  impact_name: string
  status_name: string
  user_name?: string
  user_email?: string
}

export interface ReportFilters {
  status?: number // Filter by status ID
  attack_type?: number // Filter by attack type ID
  impact?: number // Filter by impact ID
  is_anonymous?: boolean
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

export interface UpdateStatusRequest {
  reportId: number
  status: number // Status ID
  notes?: string
}

// types/Analytics.ts
export interface DashboardMetrics {
  total_reports: number
  reports_today: number
  critical_reports: number
  recent_trends: TrendData[]
}

export interface TrendData {
  attack_type_id: number
  attack_type_name: string
  count: number
  percentage: number
  time_period: string
}
```
