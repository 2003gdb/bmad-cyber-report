import Foundation

struct Report: Codable, Identifiable {
    let id: Int
    let userId: Int? // Null for anonymous reports
    let attackType: AttackType
    let incidentDate: String // Backend uses string format YYYY-MM-DD
    let incidentTime: String?
    let attackOrigin: String
    let suspiciousUrl: String?
    let messageContent: String?
    let impactLevel: ImpactLevel
    let description: String?
    let isAnonymous: Bool
    let status: ReportStatus
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
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// Backend-compatible attack types (Spanish values)
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
}

// Backend-compatible impact levels (Spanish values)
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
}

// Backend-compatible status values (Spanish values)
enum ReportStatus: String, Codable {
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
    }
}

// Response from backend after creating report
struct CreateReportResponse: Codable {
    let success: Bool
    let message: String
    let reporte: ReportSummary?
    let recommendations: [String]?
    let victimSupport: VictimSupport?
    let attachments: [AttachmentInfo]?
    let filesUploaded: Int

    enum CodingKeys: String, CodingKey {
        case success
        case message
        case reporte
        case recommendations
        case victimSupport = "victim_support"
        case attachments
        case filesUploaded = "files_uploaded"
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
}

struct VictimSupport: Codable {
    let title: String
    let steps: [String]
    let resources: [String]
}

struct AttachmentInfo: Codable {
    let id: Int
    let filename: String
    let size: Int
    let mimetype: String
}