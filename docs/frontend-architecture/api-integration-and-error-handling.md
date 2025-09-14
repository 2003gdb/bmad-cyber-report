# API Integration and Error Handling

## Unified API Integration Strategy

### HTTP Client Implementation
Both platforms use consistent HTTP client patterns with the following features:
- **Automatic Authentication:** JWT tokens automatically added to requests
- **Token Refresh:** Automatic token refresh on 401 responses
- **Error Handling:** Centralized error processing with Spanish messages
- **Request/Response Interceptors:** Logging, loading states, and error transformation
- **Timeout Management:** Configurable timeouts for different request types

### Common API Patterns

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

## Error Handling Patterns

### Centralized Error Processing
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

### Retry and Resilience Patterns
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
