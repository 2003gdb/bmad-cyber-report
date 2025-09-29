import Foundation

/**
 * Updated Report Models Compatible with Backend String-Based API
 *
 * These models work with the backend's string-based catalog system,
 * maintaining compatibility with existing mobile app UI.
 * Uses types from Report.swift to avoid conflicts.
 */

// MARK: - Catalog Data Container
struct CatalogData: Codable {
    let attackTypes: [CatalogAttackType]
    let impacts: [CatalogImpact]
    let statuses: [CatalogStatus]

    enum CodingKeys: String, CodingKey {
        case attackTypes = "attackTypes"  // Backend might return camelCase or snake_case
        case impacts
        case statuses
    }

    // Custom decoder to handle both camelCase and snake_case from backend
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

        // Try both possible keys for attack types
        if let attackTypesArray = try? container.decode([CatalogAttackType].self, forKey: DynamicCodingKeys(stringValue: "attackTypes")!) {
            self.attackTypes = attackTypesArray
        } else if let attackTypesArray = try? container.decode([CatalogAttackType].self, forKey: DynamicCodingKeys(stringValue: "attack_types")!) {
            self.attackTypes = attackTypesArray
        } else {
            throw DecodingError.keyNotFound(
                DynamicCodingKeys(stringValue: "attackTypes")!,
                DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Missing attackTypes or attack_types")
            )
        }

        self.impacts = try container.decode([CatalogImpact].self, forKey: DynamicCodingKeys(stringValue: "impacts")!)
        self.statuses = try container.decode([CatalogStatus].self, forKey: DynamicCodingKeys(stringValue: "statuses")!)
    }
}

// Dynamic coding key for flexible decoding
struct DynamicCodingKeys: CodingKey {
    var stringValue: String
    var intValue: Int?

    init?(stringValue: String) {
        self.stringValue = stringValue
    }

    init?(intValue: Int) {
        return nil
    }
}

// MARK: - Catalog API Response Models (for /reportes/catalogs endpoint)
struct CatalogAttackType: Codable, Identifiable, Hashable {
    let id: Int
    let name: String

    enum CodingKeys: String, CodingKey {
        case id, name
    }
}

struct CatalogImpact: Codable, Identifiable, Hashable {
    let id: Int
    let name: String

    enum CodingKeys: String, CodingKey {
        case id, name
    }
}

struct CatalogStatus: Codable, Identifiable, Hashable {
    let id: Int
    let name: String

    enum CodingKeys: String, CodingKey {
        case id, name
    }
}

// MARK: - Normalized Report Model (String-based, matches backend)
struct NormalizedReport: Codable, Identifiable {
    let id: Int
    let userId: Int?
    let isAnonymous: Bool
    let attackType: String // String value from backend
    let incidentDate: Date
    let evidenceUrl: String?
    let attackOrigin: String?
    let suspiciousUrl: String?
    let messageContent: String?
    let description: String?
    let impactLevel: String // String value from backend
    let status: String // String value from backend
    let adminNotes: String?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case evidenceUrl = "evidence_url"
        case attackOrigin = "attack_origin"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case description
        case impactLevel = "impact_level"
        case status
        case adminNotes = "admin_notes"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - Report with Details (simplified, backend provides string values)
struct ReportWithDetails: Codable, Identifiable {
    let id: Int
    let userId: Int?
    let isAnonymous: Bool
    let attackType: String // Backend provides string value directly
    let incidentDate: Date
    let evidenceUrl: String?
    let attackOrigin: String?
    let suspiciousUrl: String?
    let messageContent: String?
    let description: String?
    let impactLevel: String // Backend provides string value directly
    let status: String // Backend provides string value directly
    let adminNotes: String?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case evidenceUrl = "evidence_url"
        case attackOrigin = "attack_origin"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case description
        case impactLevel = "impact_level"
        case status
        case adminNotes = "admin_notes"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - Create Report DTO (String-based, matches backend expectations)
struct CreateReportV2: Codable {
    let userId: Int?
    let isAnonymous: Bool
    let attackType: String // Backend expects string value
    let incidentDate: String // Backend expects string format
    let incidentTime: String?
    let evidenceUrl: String?
    let attackOrigin: String
    let suspiciousUrl: String?
    let messageContent: String?
    let description: String?
    let impactLevel: String // Backend expects string value

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case incidentTime = "incident_time"
        case evidenceUrl = "evidence_url"
        case attackOrigin = "attack_origin"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case description
        case impactLevel = "impact_level"
    }
}

// MARK: - Response Models
struct CatalogResponse: Codable {
    let success: Bool
    let data: CatalogData

    enum CodingKeys: String, CodingKey {
        case success
        case data
    }
}

struct ReportsListResponse: Codable {
    let data: [ReportWithDetails] // Backend returns data array
    let total: Int
    let page: Int?
    let limit: Int?
    let totalPages: Int?

    enum CodingKeys: String, CodingKey {
        case data
        case total
        case page
        case limit
        case totalPages = "total_pages"
    }
}

// MARK: - Catalog Cache Model
struct CatalogCache: Codable {
    let data: CatalogData
    let lastUpdated: Date
    let version: String

    var isExpired: Bool {
        Date().timeIntervalSince(lastUpdated) > 3600 // 1 hour
    }
}

// MARK: - Catalog Helper (Simplified for String-based API)
class CatalogHelper {
    private let catalogData: CatalogData

    init(catalogData: CatalogData) {
        self.catalogData = catalogData
    }

    // MARK: - Picker Options (String-based for backend compatibility)
    var attackTypeOptions: [(value: String, displayName: String)] {
        return catalogData.attackTypes.map { (value: $0.name, displayName: getAttackTypeDisplayName($0.name)) }
    }

    var impactOptions: [(value: String, displayName: String)] {
        return catalogData.impacts.map { (value: $0.name, displayName: getImpactDisplayName($0.name)) }
    }

    var statusOptions: [(value: String, displayName: String)] {
        return catalogData.statuses.map { (value: $0.name, displayName: getStatusDisplayName($0.name)) }
    }

    // MARK: - Display Name Helpers
    private func getAttackTypeDisplayName(_ name: String) -> String {
        // Convert backend values to user-friendly display names
        switch name {
        case "email": return "Correo Electrónico"
        case "SMS": return "SMS"
        case "whatsapp": return "WhatsApp"
        case "llamada": return "Llamada Telefónica"
        case "redes_sociales": return "Redes Sociales"
        case "otro": return "Otro"
        default: return name
        }
    }

    private func getImpactDisplayName(_ name: String) -> String {
        switch name {
        case "ninguno": return "Sin Impacto"
        case "robo_datos": return "Robo de Datos"
        case "robo_dinero": return "Robo de Dinero"
        case "cuenta_comprometida": return "Cuenta Comprometida"
        default: return name
        }
    }

    private func getStatusDisplayName(_ name: String) -> String {
        switch name {
        case "nuevo": return "Nuevo"
        case "revisado": return "Revisado"
        case "en_investigacion": return "En Investigación"
        case "cerrado": return "Cerrado"
        default: return name
        }
    }
}

// MARK: - Legacy Compatibility Helpers
extension NormalizedReport {
    /**
     * Convert to display format (simplified since backend provides strings)
     */
    func toDisplayFormat() -> ReportWithDetails {
        return ReportWithDetails(
            id: id,
            userId: userId,
            isAnonymous: isAnonymous,
            attackType: attackType, // Already a string from backend
            incidentDate: incidentDate,
            evidenceUrl: evidenceUrl,
            attackOrigin: attackOrigin,
            suspiciousUrl: suspiciousUrl,
            messageContent: messageContent,
            description: description,
            impactLevel: impactLevel, // Already a string from backend
            status: status, // Already a string from backend
            adminNotes: adminNotes,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

// MARK: - Legacy Report Conversion
extension CreateReportV2 {
    /**
     * Create from legacy CreateReportRequest (simplified for string-based API)
     */
    static func from(_ legacyRequest: CreateReportRequest, userId: Int?) -> CreateReportV2 {
        return CreateReportV2(
            userId: legacyRequest.isAnonymous ? nil : userId,
            isAnonymous: legacyRequest.isAnonymous,
            attackType: legacyRequest.attackType, // Use string value directly
            incidentDate: legacyRequest.incidentDate, // Use string format from legacy request
            incidentTime: legacyRequest.incidentTime,
            evidenceUrl: legacyRequest.suspiciousUrl,
            attackOrigin: legacyRequest.attackOrigin,
            suspiciousUrl: legacyRequest.suspiciousUrl,
            messageContent: legacyRequest.messageContent,
            description: legacyRequest.description,
            impactLevel: legacyRequest.impactLevel // Use string value directly
        )
    }
}