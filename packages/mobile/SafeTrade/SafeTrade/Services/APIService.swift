import Foundation
import Combine

class APIService {
    static let shared = APIService()

    let baseURL = "http://localhost:3000"
    var authToken: String?

    private init() {}

    func setAuthToken(_ token: String?) {
        self.authToken = token
    }
    
    func request<T: Codable>(
        endpoint: String,
        method: HTTPMethod = .GET,
        body: Data? = nil,
        headers: [String: String] = [:],
        responseType: T.Type
    ) async throws -> T {
        let fullURL = "\(baseURL)\(endpoint)"
        print("🌐 API Request: \(method.rawValue) \(fullURL)")

        if let body = body, let bodyString = String(data: body, encoding: .utf8) {
            print("📤 Request Body: \(bodyString)")
        }

        guard let url = URL(string: fullURL) else {
            print("❌ Invalid URL: \(fullURL)")
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.httpBody = body
        
        // Add default headers
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        // Add authorization header if token exists
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Add custom headers
        for (key, value) in headers {
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        print("📡 Response Status: \(httpResponse.statusCode)")

        if let responseString = String(data: data, encoding: .utf8) {
            print("📥 Response Body: \(responseString)")
        }

        guard 200...299 ~= httpResponse.statusCode else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        do {
            let decodedResponse = try JSONDecoder().decode(responseType, from: data)
            print("✅ Successful decoding")
            return decodedResponse
        } catch {
            print("❌ Decoding Error: \(error)")
            if let decodingError = error as? DecodingError {
                switch decodingError {
                case .keyNotFound(let key, let context):
                    print("Missing key: \(key.stringValue) - \(context.debugDescription)")
                case .typeMismatch(let type, let context):
                    print("Type mismatch for type: \(type) - \(context.debugDescription)")
                case .valueNotFound(let type, let context):
                    print("Value not found for type: \(type) - \(context.debugDescription)")
                case .dataCorrupted(let context):
                    print("Data corrupted: \(context.debugDescription)")
                @unknown default:
                    print("Unknown decoding error")
                }
            }
            throw APIError.decodingError
        }
    }
}

enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
    case PATCH = "PATCH"
}

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(Int)
    case decodingError
    case catalogLoadFailed
    case invalidData

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL inválida"
        case .invalidResponse:
            return "Respuesta inválida del servidor"
        case .serverError(let code):
            return "Error del servidor: \(code)"
        case .decodingError:
            return "Error al procesar la respuesta"
        case .catalogLoadFailed:
            return "Error cargando catálogos"
        case .invalidData:
            return "Datos inválidos"
        }
    }
}

// MARK: - V2 API Methods
extension APIService {

    // MARK: - Catalog Operations

    /**
     * Get all catalogs (attack types, impacts, statuses)
     */
    func getCatalogs() async throws -> CatalogResponse {
        return try await request(
            endpoint: "/reportes/catalogs",
            method: .GET,
            responseType: CatalogResponse.self
        )
    }

    // MARK: - Report Operations V2

    /**
     * Create a new report using V2 format
     * Uses string-based values directly with backend
     */
    func createReportV2(_ report: CreateReportV2, catalogData: CatalogData) async throws -> NormalizedReport {
        // Create legacy request with string values (userId extracted from JWT token on backend)
        let legacyRequest = CreateReportRequest(
            isAnonymous: report.isAnonymous,
            attackType: report.attackType,
            incidentDate: report.incidentDate,
            incidentTime: report.incidentTime,
            attackOrigin: report.attackOrigin,
            suspiciousUrl: report.suspiciousUrl,
            messageContent: report.messageContent,
            impactLevel: report.impactLevel,
            description: report.description
        )

        let encoder = JSONEncoder()
        let body = try encoder.encode(legacyRequest)

        // Call legacy endpoint and get legacy response
        let response: CreateReportResponse = try await request(
            endpoint: "/reportes",
            method: .POST,
            body: body,
            responseType: CreateReportResponse.self
        )

        // Convert legacy response to normalized format
        guard let legacyReport = response.reporte else {
            throw APIError.invalidData
        }

        // Parse the incident date
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let incidentDate = dateFormatter.date(from: report.incidentDate) ?? Date()

        // Convert legacy report to normalized format
        return NormalizedReport(
            id: legacyReport.id,
            userId: report.userId,
            isAnonymous: report.isAnonymous,
            attackType: report.attackType,
            incidentDate: incidentDate,
            evidenceUrl: report.evidenceUrl,
            attackOrigin: report.attackOrigin,
            suspiciousUrl: report.suspiciousUrl,
            messageContent: report.messageContent,
            description: report.description,
            impactLevel: report.impactLevel,
            status: "nuevo", // Default to 'nuevo'
            adminNotes: nil,
            createdAt: legacyReport.createdAt,
            updatedAt: legacyReport.createdAt
        )
    }

    /**
     * Get all reports with details (including catalog names)
     */
    func getReportsWithDetails() async throws -> ReportsListResponse {
        return try await request(
            endpoint: "/reportes",
            method: .GET,
            responseType: ReportsListResponse.self
        )
    }

    /**
     * Get user's reports (requires authentication)
     */
    func getUserReports() async throws -> ReportsListResponse {
        return try await request(
            endpoint: "/reportes/user/mis-reportes",
            method: .GET,
            responseType: ReportsListResponse.self
        )
    }

    /**
     * Get a specific report by ID
     */
    func getReportById(_ id: Int) async throws -> ReportWithDetails {
        return try await request(
            endpoint: "/reportes/\(id)",
            method: .GET,
            responseType: ReportWithDetails.self
        )
    }

    // MARK: - Legacy Compatibility

    /**
     * Create report using legacy format (converts to V2 internally)
     */
    func createReportLegacy(_ request: CreateReportRequest, catalogData: CatalogData, userId: Int?) async throws -> NormalizedReport {
        let reportV2 = CreateReportV2(
            userId: request.isAnonymous ? nil : userId,
            isAnonymous: request.isAnonymous,
            attackType: request.attackType,
            incidentDate: request.incidentDate,
            incidentTime: request.incidentTime,
            evidenceUrl: nil,
            attackOrigin: request.attackOrigin,
            suspiciousUrl: request.suspiciousUrl,
            messageContent: request.messageContent,
            description: request.description,
            impactLevel: request.impactLevel
        )

        return try await createReportV2(reportV2, catalogData: catalogData)
    }
}
