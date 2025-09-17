import Foundation
import Combine
import SwiftUI

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

    // Form validation
    @Published var showValidationErrors: Bool = false

    // MARK: - Private Properties

    private let reportingService: ReportingService
    private let authService: AuthenticationService
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

        reportingService.submitReport(request)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] (completion: Subscribers.Completion<Error>) in
                    self?.isSubmitting = false

                    if case .failure(let error) = completion {
                        self?.alertMessage = "Error al enviar el reporte: \(error.localizedDescription)"
                        self?.showingErrorAlert = true
                    }
                },
                receiveValue: { [weak self] (response: CreateReportResponse) in
                    if response.success {
                        self?.handleSuccessfulSubmission(response)
                    } else {
                        self?.alertMessage = response.message
                        self?.showingErrorAlert = true
                    }
                }
            )
            .store(in: &cancellables)
    }

    private func handleSuccessfulSubmission(_ response: CreateReportResponse) {
        lastSubmittedReport = response.reporte
        recommendations = response.recommendations ?? []
        victimSupport = response.victimSupport

        alertMessage = response.message
        showingSuccessAlert = true

        // Reset form for next report
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            self.resetForm()
        }
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
            // Basic URL validation
            if !suspiciousUrl.hasPrefix("http://") && !suspiciousUrl.hasPrefix("https://") {
                return "La URL debe comenzar con http:// o https://"
            }
        }
        return nil
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