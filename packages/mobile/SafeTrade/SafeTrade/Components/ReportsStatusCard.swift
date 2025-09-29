import SwiftUI

struct ReportsStatusCard: View {
    let reports: [Report]
    let isLoading: Bool

    private var reportStats: ReportStats {
        let stats = ReportStats()
        for report in reports {
            switch report.status {
            case "nuevo":
                stats.nuevo += 1
            case "revisado":
                stats.revisado += 1
            case "en_investigacion":
                stats.enInvestigacion += 1
            case "cerrado":
                stats.cerrado += 1
            default:
                break // Handle unknown status values gracefully
            }
        }
        return stats
    }

    var body: some View {
        VStack(alignment: .leading, spacing: DesignSystem.Spacing.lg) {
            // Header
            HStack {
                Image(systemName: "doc.text")
                    .font(.title2)
                    .foregroundColor(DesignSystem.Colors.textPrimary)

                Text("Mis Reportes")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(DesignSystem.Colors.textPrimary)

                Spacer()
            }

            if isLoading {
                // Loading state
                HStack {
                    ProgressView()
                        .scaleEffect(0.8)
                    Text("Cargando reportes...")
                        .font(.subheadline)
                        .foregroundColor(DesignSystem.Colors.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.vertical, DesignSystem.Spacing.lg)
            } else {
                // Reports content
                VStack(alignment: .leading, spacing: DesignSystem.Spacing.md) {
                    if reports.count > 0 {
                        // Total count and badges side by side
                        HStack(alignment: .center, spacing: DesignSystem.Spacing.lg) {
                            // Total count (left side)
                            VStack(alignment: .leading, spacing: 4) {
                                Text("\(reports.count)")
                                    .font(.title)
                                    .fontWeight(.bold)
                                    .foregroundColor(DesignSystem.Colors.textPrimary)

                                Text("Reportes enviados")
                                    .font(.caption)
                                    .foregroundColor(DesignSystem.Colors.textSecondary)
                            }

                            Spacer()

                            // Status badges (right side) - single column, left aligned
                            VStack(alignment: .leading, spacing: DesignSystem.Spacing.sm) {
                                if reportStats.nuevo > 0 {
                                    StatusBadge(
                                        count: reportStats.nuevo,
                                        status: "Nuevos",
                                        color: .blue,
                                        icon: "doc.badge.plus"
                                    )
                                }

                                if reportStats.revisado > 0 {
                                    StatusBadge(
                                        count: reportStats.revisado,
                                        status: "Revisados",
                                        color: .orange,
                                        icon: "eye"
                                    )
                                }

                                if reportStats.enInvestigacion > 0 {
                                    StatusBadge(
                                        count: reportStats.enInvestigacion,
                                        status: "En Proceso",
                                        color: .purple,
                                        icon: "magnifyingglass"
                                    )
                                }

                                if reportStats.cerrado > 0 {
                                    StatusBadge(
                                        count: reportStats.cerrado,
                                        status: "Cerrados",
                                        color: .green,
                                        icon: "checkmark.circle"
                                    )
                                }
                            }
                        }
                    } else {
                        // Empty state
                        HStack {
                            Image(systemName: "doc.text.below.ecg")
                                .font(.title2)
                                .foregroundColor(DesignSystem.Colors.textSecondary)

                            Text("Aún no has enviado reportes")
                                .font(.subheadline)
                                .foregroundColor(DesignSystem.Colors.textSecondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.vertical, DesignSystem.Spacing.lg)
                    }
                }
            }
        }
        .padding()
        .bmadCard()
    }
}

// MARK: - Status Badge Component
struct StatusBadge: View {
    let count: Int
    let status: String
    let color: Color
    let icon: String

    var body: some View {
        HStack(spacing: DesignSystem.Spacing.sm) {
            // Count outside the badge
            Text("\(count)")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(DesignSystem.Colors.textPrimary)

            // Badge with icon and status text (matching ReportCardView style)
            HStack(spacing: DesignSystem.Spacing.xs) {
                Image(systemName: icon)
                    .font(.caption)
                    .foregroundColor(color)

                Text(status)
                    .font(.caption2)
                    .fontWeight(.medium)
                    .foregroundColor(color)
                    .lineLimit(1)
            }
            .padding(.horizontal, DesignSystem.Spacing.sm)
            .padding(.vertical, DesignSystem.Spacing.xs)
            .background(color.opacity(0.1))
            .cornerRadius(8)
        }
    }
}

// MARK: - Report Stats Helper
class ReportStats {
    var nuevo: Int = 0
    var revisado: Int = 0
    var enInvestigacion: Int = 0
    var cerrado: Int = 0
}

// MARK: - Preview
#Preview {
    VStack(spacing: 20) {
        // Loading state
        ReportsStatusCard(reports: [], isLoading: true)

        // Empty state
        ReportsStatusCard(reports: [], isLoading: false)

        // With data
        ReportsStatusCard(reports: [
            Report(
                id: 1, userId: 1, attackType: "email", incidentDate: "2024-01-15",
                incidentTime: "10:30", attackOrigin: "test@example.com",
                suspiciousUrl: nil, messageContent: nil, impactLevel: "ninguno",
                description: "Test report", isAnonymous: false, status: "nuevo",
                createdAt: Date(), updatedAt: Date()
            ),
            Report(
                id: 2, userId: 1, attackType: "SMS", incidentDate: "2024-01-16",
                incidentTime: "15:45", attackOrigin: "+1234567890",
                suspiciousUrl: nil, messageContent: nil, impactLevel: "robo_datos",
                description: "Another test", isAnonymous: false, status: "revisado",
                createdAt: Date(), updatedAt: Date()
            ),
            Report(
                id: 3, userId: 1, attackType: "redes_sociales", incidentDate: "2024-01-17",
                incidentTime: "09:15", attackOrigin: "suspicious-site.com",
                suspiciousUrl: nil, messageContent: nil, impactLevel: "robo_dinero",
                description: "Test en investigación", isAnonymous: false, status: "en_investigacion",
                createdAt: Date(), updatedAt: Date()
            ),
            Report(
                id: 4, userId: 1, attackType: "llamada", incidentDate: "2024-01-18",
                incidentTime: "14:30", attackOrigin: "+9876543210",
                suspiciousUrl: nil, messageContent: nil, impactLevel: "cuenta_comprometida",
                description: "Test cerrado", isAnonymous: false, status: "cerrado",
                createdAt: Date(), updatedAt: Date()
            )
        ], isLoading: false)
    }
    .padding()
    .bmadBackgroundGradient()
}