# SafeTrade Frontend Architecture Document

## Goals and Background Context

This document outlines the comprehensive frontend architecture for **SafeTrade**, including the iOS mobile application and Next.js admin portal. It serves as the definitive architectural guide for client-side development, complementing the Backend Architecture Document. This frontend architecture ensures seamless integration with the NestJS backend while delivering optimal user experiences for both mobile and web interfaces.

**Relationship to Backend Architecture:**
This document builds directly upon the Backend Architecture Document and must be used in conjunction with it. All API integrations, authentication patterns, and data models reference the backend specifications. The frontend architecture implements the client-side components that consume the REST API endpoints defined in the backend architecture.

## Introduction

### Frontend Components Overview

SafeTrade's frontend consists of two primary applications:

1. **iOS Mobile App (SwiftUI + Swift)** - Primary user interface for incident reporting, community intelligence, and victim support
2. **Next.js Admin Portal (React + TypeScript)** - Administrative interface for report management, analytics, and investigation workflows

Both applications integrate with the unified NestJS backend API, supporting the triple authentication model (anonymous, authenticated users, and admin users) while maintaining consistent Spanish localization throughout.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-11 | 1.0 | Initial frontend architecture creation based on backend architecture | Claude Frontend Architect |

## High Level Frontend Architecture

### Technical Summary

SafeTrade employs a **modern client-server architecture** with native iOS client and web-based administrative interface. The iOS application uses **SwiftUI with MVVM pattern** for reactive UI development, while the admin portal leverages **Next.js with App Router** for optimal performance and SEO. Core architectural patterns include **Repository Pattern** for data access abstraction, **Service Layer Architecture** for API communication, and **State Management** using Combine (iOS) and Zustand (Next.js). This architecture directly supports the PRD goals by enabling seamless anonymous and authenticated reporting flows, real-time community intelligence, and comprehensive administrative oversight with consistent Spanish localization.

### High Level Frontend Overview

**Architectural Style:** Component-Based Architecture with Service Layer Pattern
- SwiftUI views with ViewModel binding for reactive iOS development
- Next.js components with custom hooks for state management and API integration
- Shared service layers for API communication and data transformation

**State Management Strategy:**
- **iOS:** Combine framework with @StateObject and @ObservedObject for reactive data binding
- **Admin Portal:** Zustand for global state management with React Query for server state caching
- **Shared Patterns:** Repository pattern abstracts API calls from UI components

**Authentication Integration:**
- JWT token storage and management across both platforms
- Automatic token refresh with seamless user experience
- Triple authentication support: anonymous access, user authentication, and admin authentication

**Primary User Interaction Flows:**
1. **Mobile Entry:** App launch → Authentication choice (anonymous/register/login) → Report creation → Community trends → Victim support
2. **Admin Flow:** Login → Dashboard overview → Report management → Investigation workflows → Analytics insights
3. **Data Synchronization:** Real-time updates for community trends and report status changes

### Frontend Architecture Diagram

```mermaid
graph TB
    subgraph "iOS Mobile App - SwiftUI"
        subgraph "Views Layer"
            AuthViews[Authentication Views<br/>Login/Register/Anonymous]
            ReportViews[Reporting Views<br/>Form/Attachments/Confirmation]
            CommunityViews[Community Views<br/>Trends/Recommendations/Support]
            ProfileViews[Profile Views<br/>History/Settings]
        end
        
        subgraph "ViewModels Layer (MVVM)"
            AuthVM[AuthViewModel<br/>@StateObject]
            ReportVM[ReportingViewModel<br/>@StateObject]
            CommunityVM[CommunityViewModel<br/>@StateObject]
        end
        
        subgraph "Services Layer"
            APIService[APIService<br/>HTTP Client]
            AuthService[AuthService<br/>JWT Management]
            ReportService[ReportingService<br/>Business Logic]
            CommunityService[CommunityService<br/>Data Processing]
        end
        
        subgraph "Data Layer"
            Models[Data Models<br/>Codable Structs]
            KeychainManager[Keychain Manager<br/>Secure Storage]
            UserDefaults[UserDefaults<br/>App Preferences]
        end
    end
    
    subgraph "Next.js Admin Portal"
        subgraph "Pages Layer (App Router)"
            LoginPage[Login Page<br/>Admin Authentication]
            DashboardPage[Dashboard<br/>Metrics & Overview]
            ReportsPage[Reports Management<br/>Search/Filter/Details]
            AnalyticsPage[Analytics<br/>Charts & Insights]
        end
        
        subgraph "Components Layer"
            AuthComponents[Auth Components<br/>LoginForm/ProtectedRoute]
            ReportComponents[Report Components<br/>List/Details/StatusUpdate]
            DashboardComponents[Dashboard Components<br/>MetricsCard/RecentReports]
            SharedComponents[Shared Components<br/>Layout/Navigation/Loading]
        end
        
        subgraph "Hooks & State"
            CustomHooks[Custom Hooks<br/>useAuth/useReports/useAnalytics]
            ZustandStore[Zustand Store<br/>Global State]
            ReactQuery[React Query<br/>Server State Cache]
        end
        
        subgraph "Services & Utils"
            APIClient[API Client<br/>Axios/Fetch]
            AuthUtils[Auth Utils<br/>Token Management]
            TypeDefs[TypeScript Types<br/>Shared Interfaces]
        end
    end
    
    subgraph "Backend Integration"
        NestJSAPI[NestJS REST API<br/>Triple Authentication]
    end
    
    AuthViews --> AuthVM
    ReportViews --> ReportVM
    CommunityViews --> CommunityVM
    
    AuthVM --> AuthService
    ReportVM --> ReportService
    CommunityVM --> CommunityService
    
    AuthService --> APIService
    ReportService --> APIService
    CommunityService --> APIService
    
    APIService --> Models
    AuthService --> KeychainManager
    
    LoginPage --> AuthComponents
    DashboardPage --> DashboardComponents
    ReportsPage --> ReportComponents
    
    AuthComponents --> CustomHooks
    ReportComponents --> CustomHooks
    DashboardComponents --> CustomHooks
    
    CustomHooks --> ZustandStore
    CustomHooks --> ReactQuery
    CustomHooks --> APIClient
    
    APIClient --> AuthUtils
    APIService --> NestJSAPI
    APIClient --> NestJSAPI
    
    classDef ios fill:#A1CDF4
    classDef nextjs fill:#25283D,color:#fff
    classDef backend fill:#F5853F
    
    class AuthViews,ReportViews,CommunityViews,ProfileViews,AuthVM,ReportVM,CommunityVM,APIService,AuthService,ReportService,CommunityService,Models,KeychainManager,UserDefaults ios
    class LoginPage,DashboardPage,ReportsPage,AnalyticsPage,AuthComponents,ReportComponents,DashboardComponents,SharedComponents,CustomHooks,ZustandStore,ReactQuery,APIClient,AuthUtils,TypeDefs nextjs
    class NestJSAPI backend
```

## iOS Mobile Application Architecture

### SwiftUI + MVVM Architecture Pattern

#### Architecture Overview
The iOS application follows the **Model-View-ViewModel (MVVM)** pattern optimized for SwiftUI's declarative paradigm. This architecture ensures clear separation of concerns, testability, and reactive data binding between UI components and business logic.

#### Core Components

**View Layer (SwiftUI Views)**
- **Declarative UI:** Pure SwiftUI views with no business logic
- **Data Binding:** Views observe ViewModels using @StateObject and @ObservedObject
- **Navigation:** SwiftUI NavigationView with programmatic navigation control
- **Spanish Localization:** All text content localized using Localizable.strings

**ViewModel Layer (Combine + ObservableObject)**
- **State Management:** ViewModels conform to ObservableObject for reactive updates
- **Business Logic:** ViewModels handle user interactions and coordinate with services
- **Combine Integration:** Uses @Published properties for automatic UI updates
- **Lifecycle Management:** ViewModels manage loading states, error handling, and data validation

**Service Layer (Business Logic Abstraction)**
- **API Communication:** Service classes handle all HTTP communication with NestJS backend
- **Data Transformation:** Convert API responses to Swift model objects
- **Error Handling:** Centralized error processing with Spanish error messages
- **Authentication Management:** JWT token storage, refresh, and validation

#### MVVM Implementation Details

```swift
// Example ViewModel Structure
@MainActor
class ReportingViewModel: ObservableObject {
    @Published var reportForm = ReportForm()
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var attachments: [AttachmentData] = []
    
    private let reportingService: ReportingService
    private let authService: AuthService
    
    init(reportingService: ReportingService, authService: AuthService) {
        self.reportingService = reportingService
        self.authService = authService
    }
    
    func submitReport() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let result = await reportingService.submitReport(
                reportForm, 
                attachments: attachments,
                isAnonymous: !authService.isAuthenticated
            )
            // Handle success - navigate to confirmation view
            handleReportSubmissionSuccess(result)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

### iOS State Management Strategy

#### Primary State Management: Combine Framework
- **@StateObject:** ViewModel ownership in views, automatic memory management
- **@ObservedObject:** Passed ViewModels, shared state between views
- **@Published:** Automatic UI updates when ViewModel properties change
- **@State:** Local view state for UI-only concerns (toggles, text field focus)

#### Data Flow Pattern
1. **User Interaction:** SwiftUI view captures user input
2. **ViewModel Processing:** View calls ViewModel methods
3. **Service Layer:** ViewModel delegates to appropriate service
4. **API Communication:** Service makes HTTP request to NestJS backend
5. **Data Transformation:** Service converts API response to Swift models
6. **State Update:** ViewModel updates @Published properties
7. **UI Refresh:** SwiftUI automatically updates view based on state changes

#### State Persistence Strategy
- **JWT Tokens:** Stored securely in iOS Keychain using KeychainAccess library
- **User Preferences:** Stored in UserDefaults for non-sensitive settings
- **Report Drafts:** Local storage using Core Data for offline report creation
- **Community Data:** Temporary caching in memory with automatic refresh

### iOS Security Implementation

#### JWT Token Management
```swift
class AuthService: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    private let keychainManager = KeychainManager()
    private let apiService: APIService
    
    // Secure token storage
    func storeTokens(_ authResponse: AuthResponse) {
        keychainManager.store(key: "access_token", value: authResponse.accessToken)
        keychainManager.store(key: "refresh_token", value: authResponse.refreshToken)
        updateAuthenticationState()
    }
    
    // Automatic token refresh
    func refreshTokenIfNeeded() async throws {
        guard let refreshToken = keychainManager.retrieve(key: "refresh_token") else {
            throw AuthError.noRefreshToken
        }
        
        let newTokens = try await apiService.refreshToken(refreshToken)
        storeTokens(newTokens)
    }
    
    // Secure logout
    func logout() {
        keychainManager.removeAll()
        isAuthenticated = false
        currentUser = nil
    }
}
```

#### File Upload Security
- **MIME Type Validation:** Check file types before upload
- **File Size Limits:** Enforce maximum file size (10MB per attachment)
- **Image Compression:** Automatically compress images to reduce bandwidth
- **Secure Temporary Storage:** Use app sandbox for temporary file storage

### iOS API Integration Patterns

#### HTTP Client Configuration
```swift
class APIService {
    private let baseURL = "http://localhost:3000/"
    private let session: URLSession
    
    init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: configuration)
    }
    
    // Generic request method with JWT authentication
    func request<T: Codable>(
        endpoint: APIEndpoint,
        method: HTTPMethod,
        body: Data? = nil,
        requiresAuth: Bool = true
    ) async throws -> T {
        var request = URLRequest(url: URL(string: baseURL + endpoint.path)!)
        request.httpMethod = method.rawValue
        request.httpBody = body
        
        // Add authentication header if required
        if requiresAuth, let token = keychainManager.retrieve(key: "access_token") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Add content type for JSON requests
        if body != nil {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        
        let (data, response) = try await session.data(for: request)
        
        // Handle HTTP errors
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        if httpResponse.statusCode == 401 {
            // Token expired, attempt refresh
            try await authService.refreshTokenIfNeeded()
            // Retry original request
            return try await request(endpoint: endpoint, method: method, body: body, requiresAuth: requiresAuth)
        }
        
        guard 200...299 ~= httpResponse.statusCode else {
            throw APIError.httpError(httpResponse.statusCode, data)
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

#### Error Handling with Spanish Localization
```swift
enum APIError: LocalizedError {
    case networkUnavailable
    case invalidCredentials
    case reportSubmissionFailed
    case fileUploadFailed
    
    var errorDescription: String? {
        switch self {
        case .networkUnavailable:
            return NSLocalizedString("error.network.unavailable", 
                                   comment: "No hay conexión a internet disponible")
        case .invalidCredentials:
            return NSLocalizedString("error.auth.invalid_credentials", 
                                   comment: "Email o contraseña incorrectos")
        case .reportSubmissionFailed:
            return NSLocalizedString("error.report.submission_failed", 
                                   comment: "Error al enviar el reporte. Inténtalo nuevamente.")
        case .fileUploadFailed:
            return NSLocalizedString("error.file.upload_failed", 
                                   comment: "Error al subir el archivo adjunto")
        }
    }
}
```

### iOS Data Models

#### Core Data Models
```swift
// User Model
struct User: Codable, Identifiable {
    let id: UUID
    let email: String
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id = "user_id"
        case email
        case createdAt = "created_at"
    }
}

// Report Model
struct Report: Codable, Identifiable {
    let id: UUID
    let userId: UUID?
    let isAnonymous: Bool
    let attackType: AttackType
    let incidentDate: Date
    let incidentTime: Time?
    let attackOrigin: String
    let suspiciousUrl: String?
    let messageContent: String?
    let impactLevel: ImpactLevel
    let description: String
    let status: ReportStatus
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id = "report_id"
        case userId = "user_id"
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case incidentTime = "incident_time"
        case attackOrigin = "attack_origin"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case impactLevel = "impact_level"
        case description
        case status
        case createdAt = "created_at"
    }
}

// Enums with Spanish Cases
enum AttackType: String, Codable, CaseIterable {
    case email = "email"
    case sms = "SMS"
    case whatsapp = "whatsapp"
    case llamada = "llamada"
    case redesSociales = "redes_sociales"
    case otro = "otro"
    
    var displayName: String {
        switch self {
        case .email: return "Correo Electrónico"
        case .sms: return "SMS"
        case .whatsapp: return "WhatsApp"
        case .llamada: return "Llamada Telefónica"
        case .redesSociales: return "Redes Sociales"
        case .otro: return "Otro"
        }
    }
}

enum ImpactLevel: String, Codable, CaseIterable {
    case ninguno = "ninguno"
    case roboDatos = "robo_datos"
    case roboDinero = "robo_dinero"
    case cuentaComprometida = "cuenta_comprometida"
    
    var displayName: String {
        switch self {
        case .ninguno: return "Sin Impacto"
        case .roboDatos: return "Robo de Datos"
        case .roboDinero: return "Robo de Dinero"
        case .cuentaComprometida: return "Cuenta Comprometida"
        }
    }
    
    var severity: Int {
        switch self {
        case .ninguno: return 1
        case .roboDatos: return 2
        case .cuentaComprometida: return 3
        case .roboDinero: return 4
        }
    }
}
```

## Next.js Admin Portal Architecture

### Next.js App Router Architecture

#### Architecture Overview
The admin portal leverages **Next.js 13+ App Router** with **React Server Components** and **TypeScript** for optimal performance and developer experience. The architecture follows **component composition patterns** with **custom hooks** for state management and API integration.

#### Core Architecture Components

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

#### Next.js Implementation Structure

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

### Next.js State Management

#### Global State with Zustand
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

#### Server State with React Query
```typescript
// hooks/useReports.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => apiClient.get('/reports', { params: filters }),
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

export function useReportDetails(reportId: string) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => apiClient.get(`/admin/reports/${reportId}`),
    enabled: !!reportId,
  })
}
```

### Next.js Component Architecture

#### Feature Component Example
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

#### Shared Component Library
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

### Next.js API Integration

#### API Client Configuration
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

#### TypeScript Type Definitions
```typescript
// types/Report.ts
export interface Report {
  report_id: string
  user_id?: string
  is_anonymous: boolean
  attack_type: AttackType
  incident_date: string
  incident_time?: string
  attack_origin: string
  suspicious_url?: string
  message_content?: string
  impact_level: ImpactLevel
  description: string
  status: ReportStatus
  created_at: string
  updated_at: string
  attachments?: ReportAttachment[]
}

export interface ReportFilters {
  status?: ReportStatus
  attack_type?: AttackType
  impact_level?: ImpactLevel
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

export interface UpdateStatusRequest {
  reportId: string
  status: ReportStatus
  notes?: string
}

export type AttackType = 'email' | 'SMS' | 'whatsapp' | 'llamada' | 'redes_sociales' | 'otro'
export type ImpactLevel = 'ninguno' | 'robo_datos' | 'robo_dinero' | 'cuenta_comprometida'
export type ReportStatus = 'nuevo' | 'revisado' | 'en_investigacion' | 'cerrado'

// types/Analytics.ts
export interface DashboardMetrics {
  total_reports: number
  reports_today: number
  critical_reports: number
  recent_trends: TrendData[]
}

export interface TrendData {
  attack_type: AttackType
  count: number
  percentage: number
  time_period: string
}
```

## API Integration and Error Handling

### Unified API Integration Strategy

#### HTTP Client Implementation
Both platforms use consistent HTTP client patterns with the following features:
- **Automatic Authentication:** JWT tokens automatically added to requests
- **Token Refresh:** Automatic token refresh on 401 responses
- **Error Handling:** Centralized error processing with Spanish messages
- **Request/Response Interceptors:** Logging, loading states, and error transformation
- **Timeout Management:** Configurable timeouts for different request types

#### Common API Patterns

**Authentication Flow Integration**
```typescript
// Shared authentication pattern across both platforms

// iOS Swift
class AuthService {
    func authenticate(_ credentials: LoginCredentials) async throws -> AuthResponse {
        let endpoint = credentials.isAdmin ? "/admin/login" : "/auth/login"
        let response: AuthResponse = try await apiService.request(
            endpoint: endpoint,
            method: .POST,
            body: try JSONEncoder().encode(credentials),
            requiresAuth: false
        )
        
        storeTokens(response)
        return response
    }
}

// Next.js TypeScript
export async function authenticate(credentials: LoginCredentials): Promise<AuthResponse> {
  const endpoint = credentials.isAdmin ? '/admin/login' : '/auth/login'
  const response = await apiClient.post(endpoint, credentials)
  
  // Store tokens in appropriate storage
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', response.data.access_token)
  }
  
  return response.data
}
```

**Report Submission Integration**
```typescript
// iOS Swift
func submitReport(_ report: ReportForm, attachments: [AttachmentData]) async throws -> Report {
    // Create multipart form data
    let formData = createMultipartFormData(report: report, attachments: attachments)
    
    let result: ReportSubmissionResponse = try await apiService.request(
        endpoint: .reports,
        method: .POST,
        body: formData,
        requiresAuth: !report.isAnonymous
    )
    
    return result.report
}

// Next.js TypeScript
export async function submitReport(
  report: ReportFormData, 
  attachments: File[]
): Promise<Report> {
  const formData = new FormData()
  
  // Add report data
  Object.entries(report).forEach(([key, value]) => {
    formData.append(key, value as string)
  })
  
  // Add attachments
  attachments.forEach((file, index) => {
    formData.append(`attachments`, file)
  })
  
  const response = await apiClient.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  return response.data.report
}
```

### Error Handling Patterns

#### Centralized Error Processing
```swift
// iOS Error Handling
enum SafeTradeError: LocalizedError {
    case networkError(underlying: Error)
    case apiError(code: String, message: String)
    case authenticationRequired
    case invalidData
    
    var errorDescription: String? {
        switch self {
        case .networkError:
            return NSLocalizedString("error.network", comment: "Error de conexión a internet")
        case .apiError(_, let message):
            return message // Already in Spanish from API
        case .authenticationRequired:
            return NSLocalizedString("error.auth_required", comment: "Debes iniciar sesión")
        case .invalidData:
            return NSLocalizedString("error.invalid_data", comment: "Datos inválidos")
        }
    }
}

// Error processing in ViewModel
func handleAPIError(_ error: Error) {
    switch error {
    case let apiError as APIError:
        self.errorMessage = apiError.localizedDescription
    case let networkError where networkError.isNetworkConnectionError:
        self.errorMessage = "Sin conexión a internet. Verifica tu conexión."
    default:
        self.errorMessage = "Ha ocurrido un error inesperado. Inténtalo nuevamente."
    }
}
```

```typescript
// Next.js Error Handling
export interface APIError {
  code: string
  message: string
  details?: Record<string, any>
}

export function handleAPIError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as APIError
    
    if (apiError?.message) {
      return apiError.message // Already in Spanish from API
    }
    
    switch (error.response?.status) {
      case 401:
        return 'Sesión expirada. Por favor, inicia sesión nuevamente.'
      case 403:
        return 'No tienes permisos para realizar esta acción.'
      case 404:
        return 'El recurso solicitado no fue encontrado.'
      case 500:
        return 'Error interno del servidor. Inténtalo más tarde.'
      default:
        return 'Error de conexión. Verifica tu internet.'
    }
  }
  
  return 'Ha ocurrido un error inesperado.'
}

// Usage in components
const { mutate: updateStatus, error } = useUpdateReportStatus()

useEffect(() => {
  if (error) {
    const errorMessage = handleAPIError(error)
    showNotification(errorMessage, 'error')
  }
}, [error])
```

#### Retry and Resilience Patterns
```typescript
// Exponential backoff retry logic
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Usage in API calls
export async function submitReportWithRetry(data: ReportData): Promise<Report> {
  return withRetry(() => apiClient.post('/reports', data))
}
```

## Security Implementation

### JWT Token Management

#### iOS Keychain Security
```swift
import KeychainAccess

class SecureTokenStorage {
    private let keychain = Keychain(service: "com.safetrade.tokens")
        .accessibility(.whenUnlockedThisDeviceOnly)
        .synchronizable(false)
    
    func storeAccessToken(_ token: String) throws {
        try keychain.set(token, key: "access_token")
    }
    
    func storeRefreshToken(_ token: String) throws {
        try keychain.set(token, key: "refresh_token")
    }
    
    func getAccessToken() -> String? {
        return try? keychain.get("access_token")
    }
    
    func getRefreshToken() -> String? {
        return try? keychain.get("refresh_token")
    }
    
    func clearAllTokens() {
        try? keychain.removeAll()
    }
    
    // Automatic token refresh
    func refreshTokenIfNeeded() async throws {
        guard let refreshToken = getRefreshToken() else {
            throw AuthError.noRefreshToken
        }
        
        let response = try await apiService.refreshToken(refreshToken)
        try storeAccessToken(response.accessToken)
        try storeRefreshToken(response.refreshToken)
    }
}
```

#### Next.js Secure Storage
```typescript
// lib/tokenStorage.ts
class SecureTokenStorage {
  private readonly ACCESS_TOKEN_KEY = 'safetrade_access_token'
  private readonly REFRESH_TOKEN_KEY = 'safetrade_refresh_token'
  
  storeTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return
    
    // Store in httpOnly cookie for maximum security (requires API endpoint)
    this.setHttpOnlyCookie('access_token', accessToken)
    this.setHttpOnlyCookie('refresh_token', refreshToken)
    
    // Fallback to sessionStorage for development
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }
  
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY)
  }
  
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
  }
  
  clearTokens() {
    if (typeof window === 'undefined') return
    
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY)
    
    // Clear httpOnly cookies
    this.clearHttpOnlyCookie('access_token')
    this.clearHttpOnlyCookie('refresh_token')
  }
  
  private setHttpOnlyCookie(name: string, value: string) {
    // Implementation would use Next.js API route to set httpOnly cookie
    fetch('/api/auth/set-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value })
    })
  }
}
```

### Input Validation and Sanitization

#### Client-Side Validation
```swift
// iOS Form Validation
struct ReportFormValidator {
    static func validateReportForm(_ form: ReportForm) throws {
        // Required field validation
        guard !form.attackOrigin.trimmingCharacters(in: .whitespaces).isEmpty else {
            throw ValidationError.missingRequiredField("Origen del ataque es requerido")
        }
        
        // Email validation
        if form.attackType == .email {
            guard form.attackOrigin.isValidEmail else {
                throw ValidationError.invalidEmail("Formato de email inválido")
            }
        }
        
        // Phone number validation
        if form.attackType == .llamada || form.attackType == .sms {
            guard form.attackOrigin.isValidPhoneNumber else {
                throw ValidationError.invalidPhoneNumber("Formato de teléfono inválido")
            }
        }
        
        // URL validation
        if let url = form.suspiciousUrl, !url.isEmpty {
            guard url.isValidURL else {
                throw ValidationError.invalidURL("URL inválida")
            }
        }
        
        // File size validation
        let totalSize = form.attachments.reduce(0) { $0 + $1.size }
        guard totalSize <= 50_000_000 else { // 50MB limit
            throw ValidationError.fileSizeExceeded("El tamaño total de archivos excede 50MB")
        }
    }
}
```

```typescript
// Next.js Form Validation with React Hook Form
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const reportStatusUpdateSchema = z.object({
  status: z.enum(['nuevo', 'revisado', 'en_investigacion', 'cerrado'], {
    errorMap: () => ({ message: 'Estado de reporte inválido' })
  }),
  notes: z.string()
    .min(10, 'Las notas deben tener al menos 10 caracteres')
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
})

export function useStatusUpdateForm(reportId: string) {
  const form = useForm<StatusUpdateFormData>({
    resolver: zodResolver(reportStatusUpdateSchema),
    defaultValues: {
      status: 'nuevo',
      notes: ''
    }
  })
  
  const updateMutation = useUpdateReportStatus()
  
  const onSubmit = async (data: StatusUpdateFormData) => {
    try {
      await updateMutation.mutateAsync({
        reportId,
        ...data
      })
      // Success handling
    } catch (error) {
      const errorMessage = handleAPIError(error)
      form.setError('root', { message: errorMessage })
    }
  }
  
  return { form, onSubmit, isLoading: updateMutation.isLoading }
}
```

### File Upload Security

#### iOS Secure File Handling
```swift
class SecureFileUploader {
    private let allowedMimeTypes = [
        "image/jpeg", "image/png", "image/heic",
        "application/pdf", "text/plain"
    ]
    
    private let maxFileSize: Int64 = 10_000_000 // 10MB
    
    func validateAndPrepareFile(_ fileData: Data, fileName: String) throws -> AttachmentData {
        // File size validation
        guard fileData.count <= maxFileSize else {
            throw FileUploadError.fileSizeExceeded("Archivo demasiado grande (máximo 10MB)")
        }
        
        // MIME type validation
        let mimeType = getMimeType(from: fileData)
        guard allowedMimeTypes.contains(mimeType) else {
            throw FileUploadError.unsupportedFileType("Tipo de archivo no permitido")
        }
        
        // Image compression for large images
        var processedData = fileData
        if mimeType.hasPrefix("image/"), fileData.count > 2_000_000 {
            processedData = try compressImage(fileData, quality: 0.7)
        }
        
        // Generate secure filename
        let secureFileName = generateSecureFileName(originalName: fileName)
        
        return AttachmentData(
            data: processedData,
            fileName: secureFileName,
            mimeType: mimeType,
            size: processedData.count
        )
    }
    
    private func getMimeType(from data: Data) -> String {
        // Implement MIME type detection based on file signature
        var c: UInt8 = 0
        data.copyBytes(to: &c, count: 1)
        
        switch c {
        case 0xFF: return "image/jpeg"
        case 0x89: return "image/png"
        case 0x25: return "application/pdf"
        default: return "application/octet-stream"
        }
    }
    
    private func compressImage(_ imageData: Data, quality: CGFloat) throws -> Data {
        guard let image = UIImage(data: imageData),
              let compressedData = image.jpegData(compressionQuality: quality) else {
            throw FileUploadError.compressionFailed("Error al comprimir imagen")
        }
        return compressedData
    }
    
    private func generateSecureFileName(originalName: String) -> String {
        let uuid = UUID().uuidString
        let extension = URL(fileURLWithPath: originalName).pathExtension
        return "\(uuid).\(extension)"
    }
}
```

## Performance Optimization and Caching

### iOS Performance Optimization

#### Image Loading and Caching
```swift
// Custom image caching solution
class ImageCacheManager {
    static let shared = ImageCacheManager()
    
    private let cache = NSCache<NSString, UIImage>()
    private let fileManager = FileManager.default
    private let cacheDirectory: URL
    
    private init() {
        cache.countLimit = 100 // Limit to 100 images in memory
        cache.totalCostLimit = 50 * 1024 * 1024 // 50MB memory limit
        
        let cacheDir = fileManager.urls(for: .cachesDirectory, in: .userDomainMask).first!
        cacheDirectory = cacheDir.appendingPathComponent("ImageCache")
        
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
    }
    
    func loadImage(from url: URL) async throws -> UIImage {
        let cacheKey = url.absoluteString as NSString
        
        // Check memory cache first
        if let cachedImage = cache.object(forKey: cacheKey) {
            return cachedImage
        }
        
        // Check disk cache
        let diskCacheURL = cacheDirectory.appendingPathComponent(cacheKey.hash.description)
        if let diskData = try? Data(contentsOf: diskCacheURL),
           let diskImage = UIImage(data: diskData) {
            cache.setObject(diskImage, forKey: cacheKey)
            return diskImage
        }
        
        // Download image
        let (data, _) = try await URLSession.shared.data(from: url)
        guard let image = UIImage(data: data) else {
            throw ImageCacheError.invalidImageData
        }
        
        // Cache in memory and disk
        cache.setObject(image, forKey: cacheKey)
        try? data.write(to: diskCacheURL)
        
        return image
    }
}
```

#### Data Caching Strategy
```swift
// Core Data stack for offline capabilities
class CoreDataManager {
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "SafeTrade")
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data error: \(error)")
            }
        }
        return container
    }()
    
    var context: NSManagedObjectContext {
        return persistentContainer.viewContext
    }
    
    func save() {
        if context.hasChanges {
            try? context.save()
        }
    }
    
    // Cache community trends data
    func cacheTrendsData(_ trends: [TrendData]) {
        // Clear old cached data
        let fetchRequest: NSFetchRequest<CachedTrendData> = CachedTrendData.fetchRequest()
        let oldTrends = try? context.fetch(fetchRequest)
        oldTrends?.forEach { context.delete($0) }
        
        // Save new trends data
        trends.forEach { trend in
            let cachedTrend = CachedTrendData(context: context)
            cachedTrend.attackType = trend.attackType.rawValue
            cachedTrend.count = Int32(trend.count)
            cachedTrend.percentage = trend.percentage
            cachedTrend.timePeriod = trend.timePeriod
            cachedTrend.cachedAt = Date()
        }
        
        save()
    }
    
    func getCachedTrends() -> [TrendData] {
        let fetchRequest: NSFetchRequest<CachedTrendData> = CachedTrendData.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "cachedAt > %@", Date().addingTimeInterval(-3600)) // 1 hour cache
        
        guard let cachedTrends = try? context.fetch(fetchRequest) else {
            return []
        }
        
        return cachedTrends.compactMap { cached in
            guard let attackType = AttackType(rawValue: cached.attackType ?? "") else { return nil }
            return TrendData(
                attackType: attackType,
                count: Int(cached.count),
                percentage: cached.percentage,
                timePeriod: cached.timePeriod ?? ""
            )
        }
    }
}
```

### Next.js Performance Optimization

#### React Query Caching Configuration
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})

// Prefetch critical data
export function prefetchDashboardData() {
  queryClient.prefetchQuery(['dashboard-metrics'], fetchDashboardMetrics)
  queryClient.prefetchQuery(['recent-reports'], () => fetchReports({ limit: 10 }))
}
```

#### Image Optimization and Lazy Loading
```typescript
// components/shared/OptimizedImage.tsx
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {error ? (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded">
          <span className="text-gray-500 text-sm">Error al cargar imagen</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setError(true)
          }}
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      )}
    </div>
  )
}
```

#### Bundle Optimization
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'api.safetrade.com'],
    formats: ['image/webp', 'image/avif'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer for production builds
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }
    
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    }
    
    return config
  },
  // Enable compression
  compress: true,
  // Optimize runtime
  swcMinify: true,
}

module.exports = nextConfig
```

## Testing Strategies

### iOS Testing Architecture

#### Unit Testing Strategy
```swift
// AuthServiceTests.swift
import XCTest
import Combine
@testable import SafeTrade

final class AuthServiceTests: XCTestCase {
    var authService: AuthService!
    var mockAPIService: MockAPIService!
    var mockKeychainManager: MockKeychainManager!
    var cancellables: Set<AnyCancellable>!
    
    override func setUpWithError() throws {
        mockAPIService = MockAPIService()
        mockKeychainManager = MockKeychainManager()
        authService = AuthService(
            apiService: mockAPIService,
            keychainManager: mockKeychainManager
        )
        cancellables = Set<AnyCancellable>()
    }
    
    override func tearDownWithError() throws {
        cancellables = nil
        authService = nil
        mockAPIService = nil
        mockKeychainManager = nil
    }
    
    func testSuccessfulLogin() async throws {
        // Arrange
        let credentials = LoginCredentials(email: "test@safetrade.com", password: "password123")
        let expectedResponse = AuthResponse(
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
            user: User(id: UUID(), email: credentials.email, createdAt: Date())
        )
        
        mockAPIService.authResponse = expectedResponse
        
        // Act
        let result = try await authService.login(credentials)
        
        // Assert
        XCTAssertEqual(result.user.email, credentials.email)
        XCTAssertTrue(authService.isAuthenticated)
        XCTAssertEqual(mockKeychainManager.storedTokens["access_token"], expectedResponse.accessToken)
    }
    
    func testLoginFailure() async {
        // Arrange
        let credentials = LoginCredentials(email: "invalid@test.com", password: "wrong")
        mockAPIService.shouldFail = true
        
        // Act & Assert
        do {
            _ = try await authService.login(credentials)
            XCTFail("Expected login to throw an error")
        } catch {
            XCTAssertFalse(authService.isAuthenticated)
            XCTAssertNil(mockKeychainManager.storedTokens["access_token"])
        }
    }
    
    func testAutomaticTokenRefresh() async throws {
        // Arrange
        mockKeychainManager.storedTokens["refresh_token"] = "valid_refresh_token"
        let newAuthResponse = AuthResponse(
            accessToken: "new_access_token",
            refreshToken: "new_refresh_token",
            user: User(id: UUID(), email: "test@test.com", createdAt: Date())
        )
        mockAPIService.refreshTokenResponse = newAuthResponse
        
        // Act
        try await authService.refreshTokenIfNeeded()
        
        // Assert
        XCTAssertEqual(mockKeychainManager.storedTokens["access_token"], "new_access_token")
        XCTAssertEqual(mockKeychainManager.storedTokens["refresh_token"], "new_refresh_token")
    }
}

// Mock classes for testing
class MockAPIService: APIServiceProtocol {
    var authResponse: AuthResponse?
    var refreshTokenResponse: AuthResponse?
    var shouldFail = false
    
    func request<T: Codable>(endpoint: APIEndpoint, method: HTTPMethod, body: Data?, requiresAuth: Bool) async throws -> T {
        if shouldFail {
            throw APIError.invalidCredentials
        }
        
        if endpoint == .authLogin, let response = authResponse as? T {
            return response
        }
        
        if endpoint == .authRefresh, let response = refreshTokenResponse as? T {
            return response
        }
        
        throw APIError.invalidResponse
    }
}

class MockKeychainManager: KeychainManagerProtocol {
    var storedTokens: [String: String] = [:]
    
    func store(key: String, value: String) {
        storedTokens[key] = value
    }
    
    func retrieve(key: String) -> String? {
        return storedTokens[key]
    }
    
    func remove(key: String) {
        storedTokens.removeValue(forKey: key)
    }
    
    func removeAll() {
        storedTokens.removeAll()
    }
}
```

#### UI Testing with SwiftUI
```swift
// ReportFormUITests.swift
import XCTest

final class ReportFormUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchEnvironment = ["UI_TESTING": "1"] // Enable UI testing mode
        app.launch()
    }
    
    func testAnonymousReportSubmission() throws {
        // Navigate to report form
        app.buttons["Reportar Incidente"].tap()
        app.buttons["Continuar como Anónimo"].tap()
        
        // Fill out the form
        let attackTypePicker = app.pickerWheels.firstMatch
        attackTypePicker.adjust(toPickerWheelValue: "Correo Electrónico")
        
        let originField = app.textFields["Origen del Ataque"]
        originField.tap()
        originField.typeText("malicious@example.com")
        
        let descriptionField = app.textViews["Descripción"]
        descriptionField.tap()
        descriptionField.typeText("Recibí un email sospechoso solicitando información personal")
        
        // Submit the report
        app.buttons["Enviar Reporte"].tap()
        
        // Verify confirmation screen
        XCTAssertTrue(app.staticTexts["Reporte Enviado"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.staticTexts["Gracias por ayudar a la comunidad"].exists)
    }
    
    func testFormValidation() throws {
        app.buttons["Reportar Incidente"].tap()
        app.buttons["Continuar como Anónimo"].tap()
        
        // Try to submit without required fields
        app.buttons["Enviar Reporte"].tap()
        
        // Check for validation errors
        XCTAssertTrue(app.staticTexts["Origen del ataque es requerido"].exists)
        XCTAssertTrue(app.staticTexts["Descripción es requerida"].exists)
    }
    
    func testAttachmentUpload() throws {
        app.buttons["Reportar Incidente"].tap()
        app.buttons["Continuar como Anónimo"].tap()
        
        // Add attachment
        app.buttons["Agregar Archivo"].tap()
        app.buttons["Seleccionar Foto"].tap()
        
        // Mock photo selection (requires simulator setup)
        let photoLibrary = app.otherElements["Photos"]
        if photoLibrary.exists {
            app.images.firstMatch.tap()
            app.buttons["Elegir"].tap()
        }
        
        // Verify attachment added
        XCTAssertTrue(app.staticTexts["1 archivo adjunto"].exists)
    }
}
```

### Next.js Testing Architecture

#### Component Testing with React Testing Library
```typescript
// __tests__/components/ReportsList.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { ReportsList } from '@/components/reports/ReportsList'
import { useReports } from '@/hooks/useReports'

// Mock the custom hook
vi.mock('@/hooks/useReports')
const mockUseReports = vi.mocked(useReports)

// Test setup
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('ReportsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('renders loading state', () => {
    mockUseReports.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)
    
    renderWithProviders(<ReportsList />)
    
    expect(screen.getByText('Cargando reportes...')).toBeInTheDocument()
  })
  
  it('renders reports list when data is loaded', async () => {
    const mockReports = {
      data: {
        reports: [
          {
            report_id: '123',
            attack_type: 'email',
            incident_date: '2023-01-15',
            impact_level: 'robo_datos',
            status: 'nuevo',
            created_at: '2023-01-15T10:00:00Z',
          },
          {
            report_id: '456',
            attack_type: 'SMS',
            incident_date: '2023-01-14',
            impact_level: 'ninguno',
            status: 'revisado',
            created_at: '2023-01-14T15:30:00Z',
          },
        ],
        pagination: {
          total: 2,
          page: 1,
          pages: 1,
        },
      },
    }
    
    mockUseReports.mockReturnValue({
      data: mockReports,
      isLoading: false,
      error: null,
    } as any)
    
    renderWithProviders(<ReportsList />)
    
    await waitFor(() => {
      expect(screen.getByText('Correo Electrónico')).toBeInTheDocument()
      expect(screen.getByText('SMS')).toBeInTheDocument()
      expect(screen.getByText('Robo de Datos')).toBeInTheDocument()
      expect(screen.getByText('Sin Impacto')).toBeInTheDocument()
    })
  })
  
  it('handles error state', () => {
    mockUseReports.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    } as any)
    
    renderWithProviders(<ReportsList />)
    
    expect(screen.getByText('Error al cargar los reportes')).toBeInTheDocument()
  })
  
  it('filters reports by status', async () => {
    const mockFilteredReports = {
      data: {
        reports: [
          {
            report_id: '789',
            attack_type: 'whatsapp',
            status: 'en_investigacion',
            // ... other fields
          },
        ],
        pagination: { total: 1, page: 1, pages: 1 },
      },
    }
    
    mockUseReports.mockReturnValue({
      data: mockFilteredReports,
      isLoading: false,
      error: null,
    } as any)
    
    renderWithProviders(<ReportsList />)
    
    // Change filter
    const statusFilter = screen.getByLabelText('Estado')
    fireEvent.change(statusFilter, { target: { value: 'en_investigacion' } })
    
    await waitFor(() => {
      expect(mockUseReports).toHaveBeenCalledWith({ status: 'en_investigacion' })
    })
  })
})
```

#### API Integration Testing
```typescript
// __tests__/api/reports.test.ts
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { apiClient } from '@/lib/api'
import { beforeAll, afterEach, afterAll, describe, it, expect } from 'vitest'

// Mock server setup
const server = setupServer(
  http.get('http://localhost:3000/reports', () => {
    return HttpResponse.json({
      reports: [
        {
          report_id: 'test-id',
          attack_type: 'email',
          status: 'nuevo',
          created_at: '2023-01-15T10:00:00Z',
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        pages: 1,
      },
    })
  }),
  
  http.put('http://localhost:3000/admin/reports/:id/status', ({ params }) => {
    return HttpResponse.json({
      message: 'Estado actualizado correctamente',
      report_id: params.id,
    })
  }),
  
  http.post('http://localhost:3000/admin/login', async ({ request }) => {
    const body = await request.json() as any
    
    if (body.email === 'admin@safetrade.com' && body.password === 'password') {
      return HttpResponse.json({
        access_token: 'mock_token',
        admin_id: 'admin-123',
      })
    }
    
    return HttpResponse.json(
      { message: 'Credenciales inválidas' },
      { status: 401 }
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('API Integration', () => {
  it('fetches reports successfully', async () => {
    const response = await apiClient.get('/reports')
    
    expect(response.status).toBe(200)
    expect(response.data.reports).toHaveLength(1)
    expect(response.data.reports[0].attack_type).toBe('email')
  })
  
  it('updates report status', async () => {
    const response = await apiClient.put('/admin/reports/test-id/status', {
      status: 'revisado',
      notes: 'Reporte verificado',
    })
    
    expect(response.status).toBe(200)
    expect(response.data.message).toBe('Estado actualizado correctamente')
  })
  
  it('handles authentication errors', async () => {
    try {
      await apiClient.post('/admin/login', {
        email: 'wrong@email.com',
        password: 'wrongpassword',
      })
    } catch (error: any) {
      expect(error.response.status).toBe(401)
      expect(error.response.data.message).toBe('Credenciales inválidas')
    }
  })
})
```

#### End-to-End Testing with Playwright
```typescript
// e2e/admin-workflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin Portal Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/login')
    await page.fill('[data-testid=email-input]', 'admin@safetrade.com')
    await page.fill('[data-testid=password-input]', 'password123')
    await page.click('[data-testid=login-button]')
    
    // Wait for dashboard to load
    await expect(page.locator('[data-testid=dashboard-title]')).toBeVisible()
  })
  
  test('should display dashboard metrics', async ({ page }) => {
    await expect(page.locator('[data-testid=total-reports-metric]')).toBeVisible()
    await expect(page.locator('[data-testid=critical-reports-metric]')).toBeVisible()
    await expect(page.locator('[data-testid=reports-today-metric]')).toBeVisible()
  })
  
  test('should navigate to reports and update status', async ({ page }) => {
    // Navigate to reports
    await page.click('[data-testid=reports-nav-link]')
    await expect(page.locator('[data-testid=reports-list]')).toBeVisible()
    
    // Click on first report
    await page.click('[data-testid=report-card]:first-child')
    await expect(page.locator('[data-testid=report-details]')).toBeVisible()
    
    // Update status
    await page.selectOption('[data-testid=status-select]', 'en_investigacion')
    await page.fill('[data-testid=notes-textarea]', 'Iniciando investigación del caso')
    await page.click('[data-testid=update-status-button]')
    
    // Verify success message
    await expect(page.locator('[data-testid=success-notification]')).toBeVisible()
    await expect(page.locator('text=Estado actualizado correctamente')).toBeVisible()
  })
  
  test('should filter reports by criteria', async ({ page }) => {
    await page.goto('http://localhost:3000/reports')
    
    // Apply filters
    await page.selectOption('[data-testid=attack-type-filter]', 'email')
    await page.selectOption('[data-testid=impact-level-filter]', 'robo_datos')
    await page.click('[data-testid=apply-filters-button]')
    
    // Verify filtered results
    await expect(page.locator('[data-testid=report-card]')).toHaveCount(1)
    await expect(page.locator('text=Correo Electrónico')).toBeVisible()
    await expect(page.locator('text=Robo de Datos')).toBeVisible()
  })
  
  test('should handle logout properly', async ({ page }) => {
    // Logout
    await page.click('[data-testid=user-menu]')
    await page.click('[data-testid=logout-button]')
    
    // Verify redirect to login
    await expect(page).toHaveURL('http://localhost:3000/login')
    
    // Try to access protected route
    await page.goto('http://localhost:3000/dashboard')
    await expect(page).toHaveURL('http://localhost:3000/login')
  })
})
```

## Spanish Localization Strategy

### iOS Localization Implementation

#### String Resources Management
```swift
// Localizable.strings (Spanish - es.lproj)
/* Authentication */
"auth.login.title" = "Iniciar Sesión";
"auth.login.email.placeholder" = "Correo electrónico";
"auth.login.password.placeholder" = "Contraseña";
"auth.login.button" = "Iniciar Sesión";
"auth.register.title" = "Crear Cuenta";
"auth.anonymous.title" = "Reportar de Forma Anónima";
"auth.anonymous.description" = "Puedes reportar incidentes sin crear una cuenta";
"auth.choose.title" = "¿Cómo deseas continuar?";

/* Report Form */
"report.form.title" = "Reportar Incidente";
"report.attack_type.label" = "Tipo de Ataque";
"report.attack_type.email" = "Correo Electrónico";
"report.attack_type.sms" = "SMS";
"report.attack_type.whatsapp" = "WhatsApp";
"report.attack_type.call" = "Llamada Telefónica";
"report.attack_type.social" = "Redes Sociales";
"report.attack_type.other" = "Otro";

"report.origin.label" = "Origen del Ataque";
"report.origin.placeholder" = "Número de teléfono o email del atacante";
"report.date.label" = "Fecha del Incidente";
"report.time.label" = "Hora del Incidente";
"report.url.label" = "URL Sospechosa";
"report.url.placeholder" = "https://sitio-sospechoso.com";
"report.message.label" = "Mensaje del Atacante";
"report.message.placeholder" = "Contenido del mensaje recibido";

"report.impact.label" = "Nivel de Impacto";
"report.impact.none" = "Sin Impacto";
"report.impact.data_theft" = "Robo de Datos";
"report.impact.money_theft" = "Robo de Dinero";
"report.impact.account_compromise" = "Cuenta Comprometida";

"report.description.label" = "Descripción Detallada";
"report.description.placeholder" = "Describe qué sucedió y cómo te afectó";
"report.attachments.label" = "Archivos Adjuntos";
"report.submit.button" = "Enviar Reporte";

/* Community */
"community.trends.title" = "Tendencias de Amenazas";
"community.trends.period.7days" = "Últimos 7 días";
"community.trends.period.30days" = "Últimos 30 días";
"community.trends.period.90days" = "Últimos 90 días";
"community.recommendations.title" = "Recomendaciones de Seguridad";
"community.support.title" = "Recursos de Apoyo";

/* Error Messages */
"error.network" = "Error de conexión a internet";
"error.auth_required" = "Debes iniciar sesión para continuar";
"error.invalid_credentials" = "Email o contraseña incorrectos";
"error.invalid_email" = "Formato de email inválido";
"error.invalid_phone" = "Formato de teléfono inválido";
"error.invalid_url" = "URL inválida";
"error.file_size_exceeded" = "El archivo es demasiado grande (máximo 10MB)";
"error.upload_failed" = "Error al subir el archivo";
"error.report_submission_failed" = "Error al enviar el reporte";
"error.required_field" = "Este campo es obligatorio";

/* Success Messages */
"success.report_submitted" = "Reporte enviado exitosamente";
"success.login" = "Sesión iniciada correctamente";
"success.registration" = "Cuenta creada exitosamente";
```

#### Localization Helper Class
```swift
// LocalizationManager.swift
import Foundation

class LocalizationManager {
    static let shared = LocalizationManager()
    
    private init() {}
    
    func localizedString(_ key: String, comment: String = "") -> String {
        return NSLocalizedString(key, comment: comment)
    }
    
    // Convenience methods for common localizations
    func errorMessage(_ key: String) -> String {
        return localizedString("error.\(key)")
    }
    
    func successMessage(_ key: String) -> String {
        return localizedString("success.\(key)")
    }
    
    func authString(_ key: String) -> String {
        return localizedString("auth.\(key)")
    }
    
    func reportString(_ key: String) -> String {
        return localizedString("report.\(key)")
    }
    
    func communityString(_ key: String) -> String {
        return localizedString("community.\(key)")
    }
}

// Extension for easy access
extension String {
    var localized: String {
        return LocalizationManager.shared.localizedString(self)
    }
    
    func localized(comment: String) -> String {
        return NSLocalizedString(self, comment: comment)
    }
}

// Usage in SwiftUI Views
struct ReportFormView: View {
    var body: some View {
        Form {
            Section(header: Text("report.form.title".localized)) {
                TextField("report.origin.placeholder".localized, text: $reportForm.attackOrigin)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                Picker("report.attack_type.label".localized, selection: $reportForm.attackType) {
                    ForEach(AttackType.allCases, id: \.self) { type in
                        Text(type.localizedName).tag(type)
                    }
                }
            }
        }
        .navigationTitle("report.form.title".localized)
    }
}
```

### Next.js Internationalization

#### i18n Configuration
```typescript
// i18n/config.ts
export const locales = ['es'] as const
export const defaultLocale = 'es' as const
export type Locale = (typeof locales)[number]

// messages/es.json
{
  "auth": {
    "login": {
      "title": "Iniciar Sesión",
      "email": "Correo electrónico",
      "password": "Contraseña",
      "button": "Iniciar Sesión",
      "forgot_password": "¿Olvidaste tu contraseña?"
    },
    "errors": {
      "invalid_credentials": "Email o contraseña incorrectos",
      "session_expired": "Sesión expirada. Por favor, inicia sesión nuevamente",
      "access_denied": "No tienes permisos para acceder a esta sección"
    }
  },
  "dashboard": {
    "title": "Panel de Control",
    "metrics": {
      "total_reports": "Total de Reportes",
      "reports_today": "Reportes Hoy",
      "critical_reports": "Reportes Críticos",
      "pending_review": "Pendientes de Revisión"
    },
    "recent_activity": "Actividad Reciente",
    "view_all": "Ver Todos"
  },
  "reports": {
    "title": "Gestión de Reportes",
    "search_placeholder": "Buscar reportes...",
    "filters": {
      "status": "Estado",
      "attack_type": "Tipo de Ataque",
      "impact_level": "Nivel de Impacto",
      "date_range": "Rango de Fechas",
      "apply": "Aplicar Filtros",
      "clear": "Limpiar Filtros"
    },
    "status": {
      "nuevo": "Nuevo",
      "revisado": "Revisado",
      "en_investigacion": "En Investigación",
      "cerrado": "Cerrado"
    },
    "actions": {
      "view_details": "Ver Detalles",
      "update_status": "Actualizar Estado",
      "add_notes": "Agregar Notas",
      "download_attachments": "Descargar Adjuntos"
    },
    "details": {
      "report_id": "ID del Reporte",
      "submission_date": "Fecha de Envío",
      "attack_origin": "Origen del Ataque",
      "impact_assessment": "Evaluación de Impacto",
      "description": "Descripción",
      "attachments": "Archivos Adjuntos",
      "investigation_notes": "Notas de Investigación"
    }
  },
  "analytics": {
    "title": "Análisis y Estadísticas",
    "trends": {
      "attack_types": "Tipos de Ataque más Comunes",
      "timeline": "Línea de Tiempo de Incidentes",
      "impact_distribution": "Distribución por Nivel de Impacto",
      "geographic_distribution": "Distribución Geográfica"
    },
    "periods": {
      "7days": "Últimos 7 días",
      "30days": "Últimos 30 días",
      "90days": "Últimos 90 días",
      "1year": "Último año"
    }
  },
  "common": {
    "loading": "Cargando...",
    "error": "Ha ocurrido un error",
    "retry": "Reintentar",
    "cancel": "Cancelar",
    "save": "Guardar",
    "edit": "Editar",
    "delete": "Eliminar",
    "confirm": "Confirmar",
    "back": "Volver",
    "next": "Siguiente",
    "previous": "Anterior",
    "close": "Cerrar",
    "search": "Buscar",
    "filter": "Filtrar",
    "export": "Exportar",
    "download": "Descargar",
    "upload": "Subir",
    "success": "Operación exitosa",
    "warning": "Advertencia",
    "info": "Información"
  },
  "validation": {
    "required": "Este campo es obligatorio",
    "invalid_email": "Formato de email inválido",
    "min_length": "Debe tener al menos {min} caracteres",
    "max_length": "No puede exceder {max} caracteres",
    "invalid_url": "URL inválida",
    "file_size_exceeded": "El archivo excede el tamaño máximo permitido",
    "invalid_file_type": "Tipo de archivo no permitido"
  }
}
```

#### Translation Hook Implementation
```typescript
// hooks/useTranslation.ts
import { useRouter } from 'next/router'
import es from '@/messages/es.json'

type Messages = typeof es
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

type MessageKeys = NestedKeyOf<Messages>

export function useTranslation() {
  const { locale } = useRouter()
  const messages = es // Only Spanish for this project
  
  const t = (key: MessageKeys, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = messages
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`)
      return key
    }
    
    // Replace parameters in the string
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => 
          str.replace(`{${paramKey}}`, String(paramValue)),
        value
      )
    }
    
    return value
  }
  
  return { t, locale: locale || 'es' }
}

// Usage in components
export function LoginForm() {
  const { t } = useTranslation()
  
  return (
    <form>
      <h1>{t('auth.login.title')}</h1>
      <input
        type="email"
        placeholder={t('auth.login.email')}
        required
      />
      <input
        type="password"
        placeholder={t('auth.login.password')}
        required
      />
      <button type="submit">
        {t('auth.login.button')}
      </button>
    </form>
  )
}
```

## Deployment and Build Configuration

### iOS Deployment Configuration

#### Build Settings
```swift
// Config.xcconfig for different environments
// Development.xcconfig
API_BASE_URL = http:/$()/localhost:3000
ENABLE_LOGGING = YES
BUILD_CONFIGURATION = DEBUG

// Production.xcconfig  
API_BASE_URL = https:/$()/api.safetrade.com
ENABLE_LOGGING = NO
BUILD_CONFIGURATION = RELEASE
```

#### Environment-Specific Configuration
```swift
// ConfigurationManager.swift
import Foundation

enum Environment {
    case development
    case production
    
    static var current: Environment {
        #if DEBUG
        return .development
        #else
        return .production
        #endif
    }
}

struct Configuration {
    static var apiBaseURL: String {
        guard let path = Bundle.main.path(forResource: "Config", ofType: "plist"),
              let config = NSDictionary(contentsOfFile: path),
              let url = config["API_BASE_URL"] as? String else {
            fatalError("Config.plist not found or API_BASE_URL not configured")
        }
        return url
    }
    
    static var isLoggingEnabled: Bool {
        guard let path = Bundle.main.path(forResource: "Config", ofType: "plist"),
              let config = NSDictionary(contentsOfFile: path),
              let enabled = config["ENABLE_LOGGING"] as? Bool else {
            return false
        }
        return enabled
    }
}
```

### Next.js Build Configuration

#### Production Build Setup
```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment-specific settings
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV,
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'api.safetrade.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:3000 https://api.safetrade.com;",
          },
        ],
      },
    ]
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analysis in production
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }
    
    return config
  },
}

// Add Sentry configuration for error tracking in production
const sentryWebpackPluginOptions = {
  silent: true,
  org: 'safetrade',
  project: 'admin-portal',
}

module.exports = process.env.NODE_ENV === 'production' 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig
```

#### Environment Configuration
```bash
# .env.local.example
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3001

# Production environment
NEXT_PUBLIC_API_URL=https://api.safetrade.com
NEXT_PUBLIC_APP_ENV=production
NEXTAUTH_SECRET=production-secret
NEXTAUTH_URL=https://admin.safetrade.com
```

## Architecture Integration Points

### Backend-Frontend Integration

#### API Contract Enforcement
```typescript
// shared/types/api-contract.ts - Shared between backend and frontend
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: string
}

export interface PaginatedResponse<T> extends APIResponse<T> {
  data: {
    items: T[]
    pagination: {
      total: number
      page: number
      pages: number
      limit: number
    }
  }
}

// API endpoint types that match backend OpenAPI spec
export interface ReportsListResponse extends PaginatedResponse<Report[]> {
  data: {
    reports: Report[]
    pagination: {
      total: number
      page: number
      pages: number
    }
  }
}
```

#### Type Safety Enforcement
```swift
// iOS - Matching backend types exactly
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: APIError?
    let timestamp: String
    
    struct APIError: Codable {
        let code: String
        let message: String
        let details: [String: AnyCodable]?
    }
}

// Ensure iOS models match backend exactly
struct Report: Codable, Identifiable {
    let id: UUID
    let userId: UUID?
    let isAnonymous: Bool
    let attackType: AttackType
    let incidentDate: Date
    let incidentTime: Time?
    let attackOrigin: String
    let suspiciousUrl: String?
    let messageContent: String?
    let impactLevel: ImpactLevel
    let description: String
    let status: ReportStatus
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id = "report_id"
        case userId = "user_id"
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case incidentTime = "incident_time"
        case attackOrigin = "attack_origin"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case impactLevel = "impact_level"
        case description
        case status
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
```

### Real-time Data Synchronization

#### WebSocket Integration Pattern
```typescript
// hooks/useRealTimeUpdates.ts
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import io, { Socket } from 'socket.io-client'

export function useRealTimeUpdates() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: {
        token: localStorage.getItem('access_token'),
      },
    })
    
    setSocket(socketInstance)
    
    // Listen for report updates
    socketInstance.on('report_status_updated', (data) => {
      // Update the specific report in cache
      queryClient.setQueryData(['report', data.report_id], (oldData: any) => ({
        ...oldData,
        status: data.new_status,
        updated_at: data.updated_at,
      }))
      
      // Invalidate reports list to refresh
      queryClient.invalidateQueries(['reports'])
    })
    
    // Listen for new reports
    socketInstance.on('new_report_submitted', (data) => {
      queryClient.invalidateQueries(['reports'])
      queryClient.invalidateQueries(['dashboard-metrics'])
    })
    
    return () => {
      socketInstance.close()
    }
  }, [queryClient])
  
  return socket
}
```

```swift
// iOS - WebSocket integration for real-time updates
import Foundation
import Combine

class RealTimeUpdateService: ObservableObject {
    @Published var latestUpdate: String?
    
    private var webSocketTask: URLSessionWebSocketTask?
    private var cancellables = Set<AnyCancellable>()
    
    func connect() {
        guard let url = URL(string: "ws://localhost:3000/ws") else { return }
        
        webSocketTask = URLSession.shared.webSocketTask(with: url)
        webSocketTask?.resume()
        
        receiveMessage()
    }
    
    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    DispatchQueue.main.async {
                        self?.handleWebSocketMessage(text)
                    }
                case .data(let data):
                    // Handle binary data if needed
                    break
                @unknown default:
                    break
                }
                
                // Continue listening
                self?.receiveMessage()
                
            case .failure(let error):
                print("WebSocket error: \(error)")
            }
        }
    }
    
    private func handleWebSocketMessage(_ message: String) {
        // Parse JSON message and update appropriate data
        if let data = message.data(using: .utf8),
           let update = try? JSONDecoder().decode(RealtimeUpdate.self, from: data) {
            
            switch update.type {
            case "report_status_updated":
                NotificationCenter.default.post(
                    name: .reportStatusUpdated,
                    object: update.data
                )
            case "new_community_trend":
                NotificationCenter.default.post(
                    name: .communityTrendUpdated,
                    object: update.data
                )
            default:
                break
            }
        }
    }
    
    func disconnect() {
        webSocketTask?.cancel()
        webSocketTask = nil
    }
}
```

## Next Steps and Implementation Roadmap

### Phase 1: Foundation Setup (Week 1-2)
1. **Project Structure Setup**
   - Initialize iOS Xcode project with SwiftUI
   - Setup Next.js project with App Router
   - Configure shared type definitions
   - Implement basic navigation and routing

2. **Authentication Implementation**
   - JWT token management for both platforms
   - Login/register forms with validation
   - Anonymous access flow for iOS
   - Protected route guards for admin portal

### Phase 2: Core Features (Week 3-5)
1. **Report Submission (iOS)**
   - Report form with validation
   - File upload functionality
   - Anonymous and authenticated flows
   - Error handling and user feedback

2. **Report Management (Admin Portal)**
   - Reports list with filtering and pagination
   - Report details view
   - Status update functionality
   - Investigation notes system

### Phase 3: Advanced Features (Week 6-8)
1. **Community Intelligence**
   - Trends visualization
   - Recommendation engine integration
   - Victim support resources
   - Real-time data updates

2. **Analytics and Dashboard**
   - Admin dashboard with metrics
   - Analytics charts and reports
   - Data export functionality
   - Performance monitoring

### Phase 4: Polish and Testing (Week 9-10)
1. **Testing Implementation**
   - Unit tests for critical components
   - Integration tests for API flows
   - E2E tests for user workflows
   - Performance testing and optimization

2. **Deployment Preparation**
   - Production build configuration
   - Security hardening
   - Documentation completion
   - Academic presentation preparation

### Handoff to Development Team

This frontend architecture document provides:
- **Complete implementation guide** for both iOS and Next.js applications
- **Integration patterns** with the NestJS backend API
- **Security best practices** for JWT management and data protection
- **Performance optimization** strategies for both platforms
- **Testing approaches** to ensure quality and reliability
- **Spanish localization** implementation for complete user experience

The architecture ensures seamless integration with the backend systems while delivering optimal user experiences for both mobile and web interfaces, supporting SafeTrade's mission of community-driven cybersecurity incident reporting.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create comprehensive frontend architecture document", "activeForm": "Creating comprehensive frontend architecture document", "status": "completed"}, {"content": "Define iOS SwiftUI application architecture with MVVM patterns", "activeForm": "Defining iOS SwiftUI application architecture with MVVM patterns", "status": "completed"}, {"content": "Design Next.js admin portal architecture with component organization", "activeForm": "Designing Next.js admin portal architecture with component organization", "status": "completed"}, {"content": "Specify state management strategies for both platforms", "activeForm": "Specifying state management strategies for both platforms", "status": "completed"}, {"content": "Define API integration and error handling patterns", "activeForm": "Defining API integration and error handling patterns", "status": "completed"}, {"content": "Implement security patterns for JWT storage and token management", "activeForm": "Implementing security patterns for JWT storage and token management", "status": "completed"}, {"content": "Design performance optimization and caching strategies", "activeForm": "Designing performance optimization and caching strategies", "status": "completed"}, {"content": "Define testing approaches for both frontend applications", "activeForm": "Defining testing approaches for both frontend applications", "status": "completed"}, {"content": "Add Spanish localization strategy and implementation details", "activeForm": "Adding Spanish localization strategy and implementation details", "status": "in_progress"}]