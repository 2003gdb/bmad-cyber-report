# iOS Mobile Application Architecture

## SwiftUI + MVVM Architecture Pattern

### Architecture Overview
The iOS application follows the **Model-View-ViewModel (MVVM)** pattern optimized for SwiftUI's declarative paradigm. This architecture ensures clear separation of concerns, testability, and reactive data binding between UI components and business logic.

### Core Components

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

### MVVM Implementation Details

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

## iOS State Management Strategy

### Primary State Management: Combine Framework
- **@StateObject:** ViewModel ownership in views, automatic memory management
- **@ObservedObject:** Passed ViewModels, shared state between views
- **@Published:** Automatic UI updates when ViewModel properties change
- **@State:** Local view state for UI-only concerns (toggles, text field focus)

### Data Flow Pattern
1. **User Interaction:** SwiftUI view captures user input
2. **ViewModel Processing:** View calls ViewModel methods
3. **Service Layer:** ViewModel delegates to appropriate service
4. **API Communication:** Service makes HTTP request to NestJS backend
5. **Data Transformation:** Service converts API response to Swift models
6. **State Update:** ViewModel updates @Published properties
7. **UI Refresh:** SwiftUI automatically updates view based on state changes

### State Persistence Strategy
- **JWT Tokens:** Stored securely in iOS Keychain using KeychainAccess library
- **User Preferences:** Stored in UserDefaults for non-sensitive settings
- **Report Drafts:** Local storage using Core Data for offline report creation
- **Community Data:** Temporary caching in memory with automatic refresh

## iOS Security Implementation

### JWT Token Management
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

### File Upload Security
- **MIME Type Validation:** Check file types before upload
- **File Size Limits:** Enforce maximum file size (10MB per attachment)
- **Image Compression:** Automatically compress images to reduce bandwidth
- **Secure Temporary Storage:** Use app sandbox for temporary file storage

## iOS API Integration Patterns

### HTTP Client Configuration
```swift
class APIService {
    private let baseURL = "http://localhost:3000"
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

### Error Handling with Spanish Localization
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

## iOS Data Models

### Core Data Models
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

// Updated Report Model with normalized structure
struct Report: Codable, Identifiable {
    let id: Int
    let userId: Int?
    let isAnonymous: Bool
    let attackType: Int // Foreign key to AttackType.id
    let incidentDate: Date // Combined date and time
    let attackOrigin: String?
    let evidenceUrl: String? // URL to evidence files
    let suspiciousUrl: String?
    let messageContent: String?
    let description: String?
    let impact: Int // Foreign key to Impact.id
    let status: Int // Foreign key to ReportStatus.id
    let adminNotes: String?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id = "report_id"
        case userId = "user_id"
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case attackOrigin = "attack_origin"
        case evidenceUrl = "evidence_url"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case description
        case impact
        case status
        case adminNotes = "admin_notes"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// Extended Report with display names
struct ReportWithDetails: Codable, Identifiable {
    let id: Int
    let userId: Int?
    let isAnonymous: Bool
    let attackType: Int
    let attackTypeName: String
    let incidentDate: Date
    let attackOrigin: String?
    let evidenceUrl: String?
    let suspiciousUrl: String?
    let messageContent: String?
    let description: String?
    let impact: Int
    let impactName: String
    let status: Int
    let statusName: String
    let adminNotes: String?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id = "report_id"
        case userId = "user_id"
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case attackTypeName = "attack_type_name"
        case incidentDate = "incident_date"
        case attackOrigin = "attack_origin"
        case evidenceUrl = "evidence_url"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case description
        case impact
        case impactName = "impact_name"
        case status
        case statusName = "status_name"
        case adminNotes = "admin_notes"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// Catalog Models
struct AttackType: Codable, Identifiable {
    let id: Int
    let name: String
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, name
        case createdAt = "created_at"
    }

    var displayName: String {
        switch name {
        case "email": return "Correo Electrónico"
        case "SMS": return "SMS"
        case "whatsapp": return "WhatsApp"
        case "llamada": return "Llamada Telefónica"
        case "redes_sociales": return "Redes Sociales"
        case "otro": return "Otro"
        default: return name.capitalized
        }
    }
}

struct Impact: Codable, Identifiable {
    let id: Int
    let name: String
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, name
        case createdAt = "created_at"
    }

    var displayName: String {
        switch name {
        case "ninguno": return "Sin Impacto"
        case "robo_datos": return "Robo de Datos"
        case "robo_dinero": return "Robo de Dinero"
        case "cuenta_comprometida": return "Cuenta Comprometida"
        default: return name.capitalized
        }
    }

    var severity: Int {
        switch name {
        case "ninguno": return 1
        case "robo_datos": return 2
        case "cuenta_comprometida": return 3
        case "robo_dinero": return 4
        default: return 0
        }
    }
}

struct ReportStatus: Codable, Identifiable {
    let id: Int
    let name: String
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, name
        case createdAt = "created_at"
    }

    var displayName: String {
        switch name {
        case "nuevo": return "Nuevo"
        case "revisado": return "Revisado"
        case "en_investigacion": return "En Investigación"
        case "cerrado": return "Cerrado"
        default: return name.capitalized
        }
    }
}

// Catalog Data Container
struct CatalogData: Codable {
    let attackTypes: [AttackType]
    let impacts: [Impact]
    let statuses: [ReportStatus]

    enum CodingKeys: String, CodingKey {
        case attackTypes, impacts, statuses
    }
}
```
