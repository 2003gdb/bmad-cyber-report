import Foundation

// ViewModel Layer - handles UI state and coordinates between Model and Repository
@MainActor
class AuthenticationService: ObservableObject {
    static let shared = AuthenticationService()

    // MARK: - Published Properties (UI State)
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - Dependencies
    private let repository = AuthenticationRepository.shared

    private init() {
        checkAuthenticationStatus()
    }

    // MARK: - Authentication Status
    func checkAuthenticationStatus() {
        if repository.hasValidToken() {
            // Set token in API service
            if let token = repository.getToken() {
                APIService.shared.setAuthToken(token)
            }
            self.isAuthenticated = true
            self.currentUser = repository.getCurrentUser()
        } else {
            APIService.shared.setAuthToken(nil)
            self.isAuthenticated = false
            self.currentUser = nil
        }
    }

    // MARK: - Login
    func login(email: String, password: String) async throws -> AuthResponse {
        isLoading = true
        errorMessage = nil

        do {
            // Validate inputs
            guard AuthenticationModel.validateEmail(email) else {
                throw AuthError.invalidCredentials
            }
            guard AuthenticationModel.validatePassword(password) else {
                throw AuthError.invalidCredentials
            }

            // Perform login via Model
            let authResponse = try await AuthenticationModel.login(email: email, password: password)

            // Store data via Repository
            try repository.storeToken(authResponse.accessToken)
            try repository.storeRefreshToken(authResponse.refreshToken)
            try repository.storeUser(authResponse.user)

            // Update API service token
            APIService.shared.setAuthToken(authResponse.accessToken)

            // Update UI state
            self.isAuthenticated = true
            self.currentUser = authResponse.user
            self.isLoading = false

            // Provide success haptic feedback
            HapticFeedback.shared.loginSuccess()

            return authResponse
        } catch {
            self.isLoading = false
            self.errorMessage = error.localizedDescription

            // Provide error haptic feedback
            HapticFeedback.shared.loginError()

            throw error
        }
    }

    // MARK: - Registration
    func register(email: String, password: String, name: String) async throws -> AuthResponse {
        isLoading = true
        errorMessage = nil

        do {
            // Validate inputs
            guard AuthenticationModel.validateEmail(email) else {
                throw AuthError.invalidCredentials
            }
            guard AuthenticationModel.validatePassword(password) else {
                throw AuthError.invalidCredentials
            }
            guard AuthenticationModel.validateName(name) else {
                throw AuthError.invalidCredentials
            }

            // Perform registration via Model
            let authResponse = try await AuthenticationModel.register(email: email, password: password, name: name)

            // Store data via Repository
            try repository.storeToken(authResponse.accessToken)
            try repository.storeRefreshToken(authResponse.refreshToken)
            try repository.storeUser(authResponse.user)

            // Update API service token
            APIService.shared.setAuthToken(authResponse.accessToken)

            // Update UI state
            self.isAuthenticated = true
            self.currentUser = authResponse.user
            self.isLoading = false

            return authResponse
        } catch {
            self.isLoading = false
            self.errorMessage = error.localizedDescription
            throw error
        }
    }

    // MARK: - Logout
    func logout() {
        // Clear data via Repository
        repository.clearAllData()

        // Clear API service token
        APIService.shared.setAuthToken(nil)

        // Update UI state
        self.isAuthenticated = false
        self.currentUser = nil
        self.errorMessage = nil
    }

    // MARK: - Token Refresh
    func refreshToken() async throws {
        guard let refreshToken = repository.getRefreshToken() else {
            throw AuthError.noRefreshToken
        }

        do {
            // Refresh token via Model
            let authResponse = try await AuthenticationModel.refreshToken(refreshToken: refreshToken)

            // Store new tokens via Repository
            try repository.storeToken(authResponse.accessToken)
            try repository.storeRefreshToken(authResponse.refreshToken)

            // Update API service token
            APIService.shared.setAuthToken(authResponse.accessToken)
        } catch {
            // If refresh fails, logout user
            logout()
            throw error
        }
    }

    // MARK: - Convenience Methods
    func clearError() {
        errorMessage = nil
    }

    // MARK: - Authorization Header
    func getAuthorizationHeader() -> [String: String] {
        return repository.getAuthorizationHeader()
    }
}

enum AuthError: Error, LocalizedError {
    case noRefreshToken
    case keychainError
    case invalidCredentials
    case networkError

    var errorDescription: String? {
        switch self {
        case .noRefreshToken:
            return "No hay token de actualización disponible"
        case .keychainError:
            return "Error al acceder al almacenamiento seguro"
        case .invalidCredentials:
            return "Credenciales inválidas"
        case .networkError:
            return "Error de conexión"
        }
    }
}
