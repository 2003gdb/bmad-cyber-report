import Foundation

// Model Layer - contains pure business logic
// Not @MainActor - can be used from any thread
struct AuthenticationModel {

    // MARK: - Authentication Business Logic

    static func login(email: String, password: String) async throws -> AuthResponse {
        let loginRequest = LoginRequest(email: email, password: password)
        let jsonData = try JSONEncoder().encode(loginRequest)

        let authResponse = try await APIService.shared.request(
            endpoint: "/auth/login",
            method: .POST,
            body: jsonData,
            responseType: AuthResponse.self
        )

        return authResponse
    }

    static func register(email: String, password: String, name: String) async throws -> AuthResponse {
        let registerRequest = RegisterRequest(email: email, password: password, name: name)
        let jsonData = try JSONEncoder().encode(registerRequest)

        let authResponse = try await APIService.shared.request(
            endpoint: "/users/register",
            method: .POST,
            body: jsonData,
            responseType: AuthResponse.self
        )

        return authResponse
    }

    static func refreshToken(refreshToken: String) async throws -> AuthResponse {
        let refreshRequest = ["refresh_token": refreshToken]
        let jsonData = try JSONSerialization.data(withJSONObject: refreshRequest)

        let authResponse = try await APIService.shared.request(
            endpoint: "/auth/refresh",
            method: .POST,
            body: jsonData,
            responseType: AuthResponse.self
        )

        return authResponse
    }

    // MARK: - Validation Logic

    static func validateEmail(_ email: String) -> Bool {
        let emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }

    static func validatePassword(_ password: String) -> Bool {
        return password.count >= 6 // Minimum password length
    }

    static func validateName(_ name: String) -> Bool {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        return !trimmed.isEmpty && trimmed.count >= 2
    }

    // MARK: - Token Validation

    static func isTokenExpired(_ token: String) -> Bool {
        // TODO: Implement JWT token expiry validation
        // For now, return false (assume token is valid)
        return false
    }

    // MARK: - Business Rules

    static func shouldAutoRefreshToken(lastRefresh: Date) -> Bool {
        let refreshInterval: TimeInterval = 24 * 60 * 60 // 24 hours
        return Date().timeIntervalSince(lastRefresh) > refreshInterval
    }

    static func canAttemptLogin(failedAttempts: Int, lastAttempt: Date) -> Bool {
        let maxAttempts = 5
        let lockoutDuration: TimeInterval = 15 * 60 // 15 minutes

        if failedAttempts >= maxAttempts {
            return Date().timeIntervalSince(lastAttempt) > lockoutDuration
        }

        return true
    }
}