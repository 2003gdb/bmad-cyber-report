import Foundation

struct Report: Codable, Identifiable {
    let id: Int
    let userId: Int? // Null for anonymous reports
    let attackType: String // String value from backend catalog
    let incidentDate: String // Backend uses string format YYYY-MM-DD
    let incidentTime: String?
    let attackOrigin: String
    let suspiciousUrl: String?
    let messageContent: String?
    let impactLevel: String // String value from backend catalog
    let description: String?
    let isAnonymous: Bool
    let status: String // String value from backend catalog
    let evidenceUrl: String? // NEW: URL to uploaded evidence
    let adminNotes: String? // NEW: Admin investigation notes
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case incidentTime = "incident_time"
        case attackOrigin = "attack_origin"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case impactLevel = "impact_level"
        case description
        case isAnonymous = "is_anonymous"
        case status
        case evidenceUrl = "evidence_url"
        case adminNotes = "admin_notes"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    // Explicit initializer for creating instances programmatically
    init(id: Int, userId: Int?, attackType: String, incidentDate: String, incidentTime: String?,
         attackOrigin: String, suspiciousUrl: String?, messageContent: String?, impactLevel: String,
         description: String?, isAnonymous: Bool, status: String, evidenceUrl: String? = nil,
         adminNotes: String? = nil, createdAt: Date, updatedAt: Date) {
        self.id = id
        self.userId = userId
        self.attackType = attackType
        self.incidentDate = incidentDate
        self.incidentTime = incidentTime
        self.attackOrigin = attackOrigin
        self.suspiciousUrl = suspiciousUrl
        self.messageContent = messageContent
        self.impactLevel = impactLevel
        self.description = description
        self.isAnonymous = isAnonymous
        self.status = status
        self.evidenceUrl = evidenceUrl
        self.adminNotes = adminNotes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    // Computed property for Date conversion
    var incidentDateTime: Date? {
        let dateTimeString = incidentDate + "T" + (incidentTime ?? "00:00:00")
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: dateTimeString)
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        userId = try container.decodeIfPresent(Int.self, forKey: .userId)
        attackType = try container.decode(String.self, forKey: .attackType)
        incidentDate = try container.decode(String.self, forKey: .incidentDate)
        incidentTime = try container.decodeIfPresent(String.self, forKey: .incidentTime)
        attackOrigin = try container.decode(String.self, forKey: .attackOrigin)
        suspiciousUrl = try container.decodeIfPresent(String.self, forKey: .suspiciousUrl)
        messageContent = try container.decodeIfPresent(String.self, forKey: .messageContent)
        impactLevel = try container.decode(String.self, forKey: .impactLevel)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        isAnonymous = try container.decode(Bool.self, forKey: .isAnonymous)
        status = try container.decode(String.self, forKey: .status)
        evidenceUrl = try container.decodeIfPresent(String.self, forKey: .evidenceUrl)
        adminNotes = try container.decodeIfPresent(String.self, forKey: .adminNotes)

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        if let date = formatter.date(from: createdAtString) {
            createdAt = date
        } else {
            throw DecodingError.dataCorrupted(DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Invalid createdAt date format"))
        }

        let updatedAtString = try container.decode(String.self, forKey: .updatedAt)
        if let date = formatter.date(from: updatedAtString) {
            updatedAt = date
        } else {
            throw DecodingError.dataCorrupted(DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Invalid updatedAt date format"))
        }
    }

    // MARK: - Display Helpers (use catalog system for new code)

    // Get display name for attack type using catalog
    func getAttackTypeDisplayName() -> String {
        return CatalogHelpers.getLocalizedName(for: attackType)
    }

    // Get display name for impact level using catalog
    func getImpactLevelDisplayName() -> String {
        return CatalogHelpers.getLocalizedName(for: impactLevel)
    }

    // Get display name for status using catalog
    func getStatusDisplayName() -> String {
        return CatalogHelpers.getLocalizedName(for: status)
    }

    // Legacy compatibility - convert to old enum types if needed
    var legacyAttackType: LegacyAttackType? {
        return LegacyAttackType.from(catalogValue: attackType)
    }

    var legacyImpactLevel: LegacyImpactLevel? {
        return LegacyImpactLevel.from(catalogValue: impactLevel)
    }

    var legacyStatus: LegacyReportStatus? {
        return LegacyReportStatus.from(catalogValue: status)
    }
}

// Legacy AttackType enum for backward compatibility (use CatalogHelpers for new code)
enum LegacyAttackType: String, Codable, CaseIterable {
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

    var description: String {
        switch self {
        case .email: return "Correos de phishing, enlaces maliciosos, archivos adjuntos sospechosos"
        case .sms: return "Mensajes de texto fraudulentos con enlaces o solicitudes de información"
        case .whatsapp: return "Mensajes de WhatsApp con enlaces sospechosos o intentos de estafa"
        case .llamada: return "Llamadas telefónicas fraudulentas solicitando información personal"
        case .redesSociales: return "Ataques a través de Facebook, Instagram, Twitter u otras redes sociales"
        case .otro: return "Otros tipos de ataques cibernéticos"
        }
    }

    // Convert to string value for catalog system
    var catalogValue: String {
        return self.rawValue
    }

    // Create from catalog string value
    static func from(catalogValue: String) -> LegacyAttackType? {
        return LegacyAttackType(rawValue: catalogValue)
    }
}

// Legacy ImpactLevel enum for backward compatibility (use CatalogHelpers for new code)
enum LegacyImpactLevel: String, Codable, CaseIterable {
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

    var description: String {
        switch self {
        case .ninguno: return "No sufrí ningún daño, solo quiero reportar el intento"
        case .roboDatos: return "Mis datos personales fueron robados o comprometidos"
        case .roboDinero: return "Perdí dinero debido a este ataque"
        case .cuentaComprometida: return "Una o más de mis cuentas fueron comprometidas"
        }
    }

    var severity: Int {
        switch self {
        case .ninguno: return 0
        case .roboDatos: return 2
        case .cuentaComprometida: return 3
        case .roboDinero: return 4
        }
    }

    // Convert to string value for catalog system
    var catalogValue: String {
        return self.rawValue
    }

    // Create from catalog string value
    static func from(catalogValue: String) -> LegacyImpactLevel? {
        return LegacyImpactLevel(rawValue: catalogValue)
    }
}

// Legacy ReportStatus enum for backward compatibility (use CatalogHelpers for new code)
enum LegacyReportStatus: String, Codable {
    case nuevo = "nuevo"
    case revisado = "revisado"
    case enInvestigacion = "en_investigacion"
    case cerrado = "cerrado"

    var displayName: String {
        switch self {
        case .nuevo: return "Nuevo"
        case .revisado: return "Revisado"
        case .enInvestigacion: return "En Investigación"
        case .cerrado: return "Cerrado"
        }
    }

    // Convert to string value for catalog system
    var catalogValue: String {
        return self.rawValue
    }

    // Create from catalog string value
    static func from(catalogValue: String) -> LegacyReportStatus? {
        return LegacyReportStatus(rawValue: catalogValue)
    }
}

// Request DTO for creating reports
struct CreateReportRequest: Codable {
    let isAnonymous: Bool
    let attackType: String
    let incidentDate: String
    let incidentTime: String?
    let attackOrigin: String
    let suspiciousUrl: String?
    let messageContent: String?
    let impactLevel: String
    let description: String?
    let evidenceUrl: String? // NEW: Support for evidence upload

    enum CodingKeys: String, CodingKey {
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case incidentTime = "incident_time"
        case attackOrigin = "attack_origin"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case impactLevel = "impact_level"
        case description
        case evidenceUrl = "evidence_url"
    }
}

// Response from backend after creating report
struct CreateReportResponse: Codable {
    let success: Bool
    let message: String
    let reporte: ReportSummary?
    let recommendations: [String]?
    let victimSupport: VictimSupport?
    enum CodingKeys: String, CodingKey {
        case success
        case message
        case reporte
        case recommendations
        case victimSupport = "victim_support"
    }
}

struct ReportSummary: Codable {
    let id: Int
    let attackType: String
    let incidentDate: String
    let impactLevel: String
    let status: String
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case impactLevel = "impact_level"
        case status
        case createdAt = "created_at"
    }

    // Explicit initializer for creating instances programmatically
    init(id: Int, attackType: String, incidentDate: String, impactLevel: String, status: String, createdAt: Date) {
        self.id = id
        self.attackType = attackType
        self.incidentDate = incidentDate
        self.impactLevel = impactLevel
        self.status = status
        self.createdAt = createdAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        attackType = try container.decode(String.self, forKey: .attackType)
        incidentDate = try container.decode(String.self, forKey: .incidentDate)
        impactLevel = try container.decode(String.self, forKey: .impactLevel)
        status = try container.decode(String.self, forKey: .status)

        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: createdAtString) {
            createdAt = date
        } else {
            throw DecodingError.dataCorrupted(DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Invalid date format"))
        }
    }
}

struct VictimSupport: Codable {
    let title: String
    let steps: [String]
    let resources: [String]
}

// MARK: - Catalog System Models (from ReportV2)

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

// MARK: - Catalog Data Container
struct CatalogData: Codable {
    let attackTypes: [CatalogAttackType]
    let impacts: [CatalogImpact]
    let statuses: [CatalogStatus]

    enum CodingKeys: String, CodingKey {
        case attackTypes = "attackTypes"
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

// MARK: - Catalog Item Models
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

// MARK: - API Response Models
struct CatalogResponse: Codable {
    let success: Bool
    let data: CatalogData

    enum CodingKeys: String, CodingKey {
        case success
        case data
    }
}

struct ReportsListResponse: Codable {
    let data: [Report]
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

// MARK: - Normalized Report Model (String-based, Date for incidentDate)
struct NormalizedReport: Codable, Identifiable {
    let id: Int
    let userId: Int?
    let isAnonymous: Bool
    let attackType: String
    let incidentDate: Date // Date instead of String
    let evidenceUrl: String?
    let attackOrigin: String?
    let suspiciousUrl: String?
    let messageContent: String?
    let description: String?
    let impactLevel: String
    let status: String
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

// MARK: - Report with Details (same as NormalizedReport for now)
typealias ReportWithDetails = NormalizedReport

// MARK: - Create Report V2 DTO
struct CreateReportV2: Codable {
    let userId: Int?
    let isAnonymous: Bool
    let attackType: String
    let incidentDate: String
    let incidentTime: String?
    let evidenceUrl: String?
    let attackOrigin: String
    let suspiciousUrl: String?
    let messageContent: String?
    let description: String?
    let impactLevel: String

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

    // Convert from CreateReportRequest
    static func from(_ legacyRequest: CreateReportRequest, userId: Int?) -> CreateReportV2 {
        return CreateReportV2(
            userId: legacyRequest.isAnonymous ? nil : userId,
            isAnonymous: legacyRequest.isAnonymous,
            attackType: legacyRequest.attackType,
            incidentDate: legacyRequest.incidentDate,
            incidentTime: legacyRequest.incidentTime,
            evidenceUrl: legacyRequest.evidenceUrl,
            attackOrigin: legacyRequest.attackOrigin,
            suspiciousUrl: legacyRequest.suspiciousUrl,
            messageContent: legacyRequest.messageContent,
            description: legacyRequest.description,
            impactLevel: legacyRequest.impactLevel
        )
    }
}

