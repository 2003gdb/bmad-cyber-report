import Foundation
import Combine
import SwiftUI
import UIKit

@MainActor
class ReportingViewModel: ObservableObject {
    // MARK: - Published Properties

    @Published var isAnonymous: Bool = true
    @Published var selectedAttackType: AttackType = .email
    @Published var incidentDate = Date()
    @Published var incidentTime: String = ""
    @Published var attackOrigin: String = ""
    @Published var suspiciousUrl: String = ""
    @Published var messageContent: String = ""
    @Published var selectedImpactLevel: ImpactLevel = .ninguno
    @Published var description: String = ""

    // UI State
    @Published var isSubmitting: Bool = false
    @Published var showingSuccessAlert: Bool = false
    @Published var showingErrorAlert: Bool = false
    @Published var alertMessage: String = ""
    @Published var lastSubmittedReport: ReportSummary?
    @Published var recommendations: [String] = []
    @Published var victimSupport: VictimSupport?
    @Published var submittedAttackType: String?

    // Form validation
    @Published var showValidationErrors: Bool = false


    // MARK: - Private Properties

    private let reportingService: ReportingService
    private let authService: AuthenticationService
    private let userPreferencesService = UserPreferencesService.shared
    private let draftManager = DraftManager.shared
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization

    init(isAnonymous: Bool? = nil,
         reportingService: ReportingService = ReportingService(),
         authService: AuthenticationService? = nil) {
        self.reportingService = reportingService
        self.authService = authService ?? AuthenticationService.shared

        // Set anonymous state based on parameter or authentication status
        if let isAnonymous = isAnonymous {
            self.isAnonymous = isAnonymous
        } else {
            // Access repository directly to avoid actor isolation issues
            let repository = AuthenticationRepository.shared
            self.isAnonymous = !repository.hasValidToken()
        }

        // Apply smart defaults on initialization
        applySmartDefaults()
    }

    // MARK: - Computed Properties

    var isFormValid: Bool {
        return !attackOrigin.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var canSubmitIdentified: Bool {
        return authService.isAuthenticated
    }

    var formattedIncidentDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: incidentDate)
    }

    // MARK: - Form Actions

    func resetForm() {
        // Note: isAnonymous is not reset as it's set during initialization
        selectedAttackType = .email
        incidentDate = Date()
        incidentTime = ""
        attackOrigin = ""
        suspiciousUrl = ""
        messageContent = ""
        selectedImpactLevel = .ninguno
        description = ""
        showValidationErrors = false
        recommendations = []
        victimSupport = nil
        lastSubmittedReport = nil
    }

    // MARK: - Report Submission

    func submitReport() {
        guard isFormValid else {
            showValidationErrors = true
            alertMessage = "Por favor, completa todos los campos requeridos"
            showingErrorAlert = true
            HapticFeedback.shared.formValidationError()
            return
        }

        isSubmitting = true
        showValidationErrors = false

        let request = CreateReportRequest(
            isAnonymous: isAnonymous,
            attackType: selectedAttackType.rawValue,
            incidentDate: formattedIncidentDate,
            incidentTime: incidentTime.isEmpty ? nil : incidentTime,
            attackOrigin: attackOrigin.trimmingCharacters(in: .whitespacesAndNewlines),
            suspiciousUrl: suspiciousUrl.isEmpty ? nil : suspiciousUrl,
            messageContent: messageContent.isEmpty ? nil : messageContent,
            impactLevel: selectedImpactLevel.rawValue,
            description: description.isEmpty ? nil : description
        )

        // Note: File attachments are currently disabled
        // Always use the standard JSON-only submission
        let publisher = reportingService.submitReport(request)

        publisher
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] (completion: Subscribers.Completion<Error>) in
                    self?.isSubmitting = false

                    if case .failure(let error) = completion {
                        self?.alertMessage = "Error al enviar el reporte: \(error.localizedDescription)"
                        self?.showingErrorAlert = true
                        HapticFeedback.shared.reportSubmissionError()
                    }
                },
                receiveValue: { [weak self] (response: CreateReportResponse) in
                    if response.success {
                        self?.handleSuccessfulSubmission(response)
                    } else {
                        self?.alertMessage = response.message
                        self?.showingErrorAlert = true
                        HapticFeedback.shared.reportSubmissionError()
                    }
                }
            )
            .store(in: &cancellables)
    }

    private func handleSuccessfulSubmission(_ response: CreateReportResponse) {
        lastSubmittedReport = response.reporte
        recommendations = response.recommendations ?? []
        victimSupport = response.victimSupport
        submittedAttackType = selectedAttackType.rawValue

        alertMessage = response.message

        // Record user preferences for future suggestions
        recordUserPreferences()

        // Provide success haptic feedback
        HapticFeedback.shared.reportSubmissionSuccess()

        // Immediately show recommendations instead of success alert
        showingSuccessAlert = true

        // Reset form for next report
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.resetForm()
        }
    }

    private func recordUserPreferences() {
        // Record attack type usage
        userPreferencesService.recordAttackTypeUsage(selectedAttackType)

        // Record attack origin if not empty
        let cleanOrigin = attackOrigin.trimmingCharacters(in: .whitespacesAndNewlines)
        if !cleanOrigin.isEmpty {
            userPreferencesService.recordAttackOriginUsage(cleanOrigin)
        }

        // Record impact level usage
        userPreferencesService.recordImpactLevelUsage(selectedImpactLevel)

        // Clear draft after successful submission
        draftManager.clearDraft()
    }

    // MARK: - Draft Management

    func startAutoDraftSaving() {
        draftManager.startAutosave(for: self)
    }

    func stopAutoDraftSaving() {
        draftManager.stopAutosave()
    }

    func loadDraftIfAvailable() -> Bool {
        guard let draft = draftManager.loadDraft() else { return false }

        draftManager.applyDraft(to: self, draft: draft)
        return true
    }

    func saveDraftManually() {
        draftManager.saveDraft(from: self)
    }

    func clearDraft() {
        draftManager.clearDraft()
    }

    var hasDraft: Bool {
        return draftManager.hasDraft
    }

    // MARK: - Validation Helpers

    func validateAttackOrigin() -> String? {
        let trimmed = attackOrigin.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty {
            return "Origen del ataque es requerido"
        }
        return nil
    }

    func validateSuspiciousUrl() -> String? {
        if !suspiciousUrl.isEmpty {
            // Length validation
            if suspiciousUrl.count > 2048 {
                return "La URL no puede exceder 2048 caracteres"
            }

            // Basic domain validation - must contain at least one dot
            if !suspiciousUrl.contains(".") {
                return "La URL sospechosa debe contener al menos un dominio (ej: sitio.com)"
            }
        }
        return nil
    }

    func validateMessageContent() -> String? {
        if messageContent.count > 5000 {
            return "El contenido del mensaje no puede exceder 5000 caracteres"
        }
        return nil
    }

    // MARK: - Smart Defaults

    func applySmartDefaults() {
        // Auto-populate current date and time
        incidentDate = Date()
        incidentTime = getCurrentTimeString()

        // Set most common attack type as default (email is most common)
        selectedAttackType = getMostCommonAttackType()

        // Set reasonable default for impact level
        selectedImpactLevel = .ninguno
    }

    func getMostCommonAttackType() -> AttackType {
        // Return most used attack type based on user history, fallback to email
        return userPreferencesService.getMostUsedAttackType() ?? .email
    }

    func getAttackTypeSuggestions() -> [AttackType] {
        // Get suggestions based on user history
        return userPreferencesService.getSuggestedAttackTypes()
    }

    func getAttackOriginSuggestions() -> [String] {
        return userPreferencesService.getAttackOriginSuggestions(for: selectedAttackType)
    }

    func getPreferredImpactLevel() -> ImpactLevel {
        return userPreferencesService.getPreferredImpactLevel() ?? .ninguno
    }

    func setQuickDefaults() {
        // Quick mode defaults for streamlined workflow
        applySmartDefaults()

        // Pre-fill with reasonable device defaults
        if attackOrigin.isEmpty {
            attackOrigin = getDefaultAttackOrigin()
        }
    }

    func getDefaultAttackOrigin() -> String {
        // Provide a template/placeholder for user to modify
        switch selectedAttackType {
        case .email:
            return "correo@ejemplo.com"
        case .sms:
            return "+52 55 1234 5678"
        case .whatsapp:
            return "+52 55 1234 5678"
        case .llamada:
            return "+52 55 1234 5678"
        case .redesSociales:
            return "usuario@redessociales"
        case .otro:
            return "origen desconocido"
        }
    }

    // MARK: - Date/Time Helpers

    func formatTimeForDisplay(_ time: String) -> String {
        // Format time string for better display
        if time.count == 5 && time.contains(":") {
            return time
        }
        return ""
    }

    func getCurrentTimeString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: Date())
    }

}

// MARK: - Validation Error Types

enum ReportValidationError: Error, LocalizedError {
    case missingAttackOrigin
    case invalidUrl
    case invalidTime

    var errorDescription: String? {
        switch self {
        case .missingAttackOrigin:
            return "El origen del ataque es requerido"
        case .invalidUrl:
            return "URL inválida"
        case .invalidTime:
            return "Formato de tiempo inválido"
        }
    }
}