import Foundation
import SwiftUI

class TrendsViewModel: ObservableObject {
    @Published var trendsData: CommunityTrendsData?
    @Published var communityAlert: CommunityAlert?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var selectedPeriod: TrendPeriod = .thirtyDays
    @Published var showingPeriodPicker = false

    private let communityService = CommunityService()

    init() {
        loadTrends()
        loadCommunityAlert()
    }

    // MARK: - Data Loading
    func loadTrends(period: TrendPeriod? = nil) {
        let periodToUse = period ?? selectedPeriod
        isLoading = true
        errorMessage = nil

        Task {
            do {
                let response = try await communityService.getTrends(period: periodToUse)
                await MainActor.run {
                    self.isLoading = false
                    if response.success {
                        self.trendsData = response.data
                    } else {
                        self.errorMessage = response.message
                    }
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = "Error al cargar tendencias: \(error.localizedDescription)"
                }
            }
        }
    }

    func loadCommunityAlert() {
        Task {
            do {
                let response = try await communityService.getCommunityAlert()
                await MainActor.run {
                    if response.success {
                        self.communityAlert = response.alerta
                    }
                }
            } catch {
                print("Error loading community alert: \(error.localizedDescription)")
            }
        }
    }

    func refreshData() {
        loadTrends()
        loadCommunityAlert()
    }

    // MARK: - Period Selection
    func changePeriod(to period: TrendPeriod) {
        selectedPeriod = period
        loadTrends(period: period)
    }

    // MARK: - Data Processing
    var topAttackTypes: [TrendData] {
        return trendsData?.attackTrends.prefix(5).map { $0 } ?? []
    }

    var topImpactLevels: [TrendData] {
        return trendsData?.impactTrends.prefix(3).map { $0 } ?? []
    }

    var recentTimeTrends: [TimeBasedTrend] {
        return trendsData?.timeTrends.suffix(7).map { $0 } ?? []
    }

    var communityStats: CommunityStats? {
        return trendsData?.communityStats
    }

    var trendsSummary: TrendsSummary? {
        return trendsData?.summary
    }

    // MARK: - Chart Data Preparation
    var attackTypesChartData: [(String, Double)] {
        return topAttackTypes.map { ($0.attackType, $0.percentageValue) }
    }

    var impactLevelsChartData: [(String, Double)] {
        return topImpactLevels.map { ($0.attackType, $0.percentageValue) }
    }

    var timeBasedChartData: [(String, Int)] {
        return recentTimeTrends.compactMap { trend in
            guard let date = trend.displayDate else { return nil }
            let formatter = DateFormatter()
            formatter.dateFormat = "dd/MM"
            return (formatter.string(from: date), trend.count)
        }
    }

    // MARK: - UI Helpers
    var hasData: Bool {
        return trendsData != nil
    }

    var totalReports: Int {
        return communityStats?.totalReports ?? 0
    }

    var mainThreatDescription: String {
        guard let summary = trendsSummary else {
            return "No hay datos suficientes para determinar la amenaza principal"
        }
        return "La amenaza principal es: \(summary.mainThreat)"
    }

    var alertLevelDescription: String {
        guard let alert = communityAlert else {
            return "Estado de alerta no disponible"
        }
        return alert.mensaje
    }

    var periodDisplayName: String {
        return selectedPeriod.displayName
    }

    // MARK: - Color Helpers
    func colorForAttackType(_ attackType: String) -> Color {
        let colors: [Color] = [.red, .orange, .blue, .purple, .green, .pink]
        let index = abs(attackType.hashValue) % colors.count
        return colors[index]
    }

    func colorForImpactLevel(_ impactLevel: String) -> Color {
        switch impactLevel.lowercased() {
        case "sin impacto":
            return .green
        case "robo de datos":
            return .orange
        case "robo de dinero":
            return .red
        case "cuenta comprometida":
            return .purple
        default:
            return .gray
        }
    }

    // MARK: - Percentage Formatting
    func formatPercentage(_ percentage: Double) -> String {
        return String(format: "%.1f%%", percentage)
    }

    func formatCount(_ count: Int) -> String {
        if count >= 1000 {
            return String(format: "%.1fK", Double(count) / 1000.0)
        }
        return "\(count)"
    }
}