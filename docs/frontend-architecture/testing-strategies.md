# Testing Strategies

## iOS Testing Architecture

### Unit Testing Strategy
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

### UI Testing with SwiftUI
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

## Next.js Testing Architecture

### Component Testing with React Testing Library
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

### API Integration Testing
```typescript
// __tests__/api/reports.test.ts
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { apiClient } from '@/lib/api'
import { beforeAll, afterEach, afterAll, describe, it, expect } from 'vitest'

// Mock server setup
const server = setupServer(
  http.get('http://localhost:3000/api/v1/reports', () => {
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
  
  http.put('http://localhost:3000/api/v1/admin/reports/:id/status', ({ params }) => {
    return HttpResponse.json({
      message: 'Estado actualizado correctamente',
      report_id: params.id,
    })
  }),
  
  http.post('http://localhost:3000/api/v1/admin/login', async ({ request }) => {
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

### End-to-End Testing with Playwright
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
