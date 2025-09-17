import Foundation

struct AuthResponse: Codable {
    let success: Bool
    let message: String
    let accessToken: String
    let refreshToken: String
    let user: User

    enum CodingKeys: String, CodingKey {
        case success, message, user
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
    }
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let name: String
}