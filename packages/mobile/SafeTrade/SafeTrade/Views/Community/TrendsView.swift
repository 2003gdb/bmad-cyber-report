import SwiftUI
import Charts

struct TrendsView: View {
    @StateObject private var viewModel = TrendsViewModel()
    @State private var selectedAttackType: String?
    @State private var selectedImpactLevel: String?

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 20) {
                // Community Alert Section
                if let alert = viewModel.communityAlert {
                    CommunityAlertCard(alert: alert)
                        .transition(.asymmetric(
                            insertion: .move(edge: .top).combined(with: .opacity),
                            removal: .move(edge: .top).combined(with: .opacity)
                        ))
                }

                // Period Selector
                PeriodSelectorCard(
                    selectedPeriod: viewModel.selectedPeriod,
                    onPeriodChanged: { period in
                        viewModel.changePeriod(to: period)
                    }
                )
                .transition(.move(edge: .leading).combined(with: .opacity))

                // Summary Stats
                if let stats = viewModel.communityStats {
                    CommunityStatsCard(stats: stats)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }

                // Attack Types Chart
                if !viewModel.topAttackTypes.isEmpty {
                    AttackTypesChartCard(
                        trends: viewModel.topAttackTypes,
                        selectedType: $selectedAttackType,
                        colorProvider: viewModel.colorForAttackType
                    )
                    .transition(.move(edge: .trailing).combined(with: .opacity))
                }

                // Impact Levels Chart
                if !viewModel.topImpactLevels.isEmpty {
                    ImpactLevelsChartCard(
                        trends: viewModel.topImpactLevels,
                        selectedLevel: $selectedImpactLevel,
                        colorProvider: viewModel.colorForImpactLevel
                    )
                    .transition(.move(edge: .leading).combined(with: .opacity))
                }

                // Time-based Trends
                if !viewModel.recentTimeTrends.isEmpty {
                    TimeBasedTrendsCard(
                        trends: viewModel.recentTimeTrends,
                        periodName: viewModel.periodDisplayName
                    )
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }

                // Key Insights
                if let summary = viewModel.trendsSummary {
                    KeyInsightsCard(summary: summary)
                        .transition(.move(edge: .top).combined(with: .opacity))
                }
            }
            .animation(.easeInOut(duration: 0.5), value: viewModel.selectedPeriod)
            .animation(.easeInOut(duration: 0.4), value: viewModel.isLoading)
            .padding()
        }
        .refreshable {
            viewModel.refreshData()
        }
        .overlay {
            if viewModel.isLoading && !viewModel.hasData {
                LoadingOverlay()
                    .transition(.opacity.combined(with: .scale))
                    .animation(.easeInOut(duration: 0.3), value: viewModel.isLoading)
            }
        }
        .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
            Button("Reintentar") {
                viewModel.refreshData()
            }
            Button("Cancelar", role: .cancel) {
                viewModel.errorMessage = nil
            }
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
    }
}

// MARK: - Community Alert Card
struct CommunityAlertCard: View {
    let alert: CommunityAlert

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: alert.alertLevelIcon)
                    .foregroundColor(Color(alert.alertLevelColor))
                    .font(.title2)

                Text("Estado de Alerta")
                    .font(.headline)
                    .fontWeight(.semibold)

                Spacer()

                Text(alert.nivel.uppercased())
                    .font(.caption)
                    .fontWeight(.bold)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(Color(alert.alertLevelColor).opacity(0.2))
                    .foregroundColor(Color(alert.alertLevelColor))
                    .cornerRadius(8)
            }

            Text(alert.mensaje)
                .font(.body)
                .foregroundColor(.secondary)

            if !alert.recomendacionesGenerales.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Recomendaciones:")
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    ForEach(alert.recomendacionesGenerales.prefix(3), id: \.self) { recommendation in
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                                .font(.caption)

                            Text(recommendation)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

// MARK: - Period Selector Card
struct PeriodSelectorCard: View {
    let selectedPeriod: TrendPeriod
    let onPeriodChanged: (TrendPeriod) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Período de Análisis")
                .font(.headline)
                .fontWeight(.semibold)

            HStack(spacing: 12) {
                ForEach(TrendPeriod.allCases, id: \.self) { period in
                    Button(action: {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            onPeriodChanged(period)
                        }
                        HapticFeedback.shared.selectionChanged()
                    }) {
                        VStack(spacing: 4) {
                            Text(period.shortName)
                                .font(.caption)
                                .fontWeight(.bold)
                            Text(period.displayName)
                                .font(.caption2)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(
                            selectedPeriod == period ?
                            Color.accentColor : Color(.systemGray6)
                        )
                        .foregroundColor(
                            selectedPeriod == period ? .white : .primary
                        )
                        .cornerRadius(8)
                        .animation(.easeInOut(duration: 0.2), value: selectedPeriod)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

// MARK: - Community Stats Card
struct CommunityStatsCard: View {
    let stats: CommunityStats

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Estadísticas Comunitarias")
                .font(.headline)
                .fontWeight(.semibold)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 16) {
                StatItem(
                    title: "Total Reportes",
                    value: "\(stats.totalReports)",
                    icon: "doc.text.fill",
                    color: .blue
                )

                StatItem(
                    title: "Período Activo",
                    value: stats.activePeriod,
                    icon: "calendar.circle.fill",
                    color: .green
                )

                StatItem(
                    title: "Amenaza Principal",
                    value: stats.mostCommonAttack,
                    icon: "exclamationmark.triangle.fill",
                    color: .red
                )

                StatItem(
                    title: "Reportes Anónimos",
                    value: "\(Int(stats.anonymousPercentage))%",
                    icon: "person.crop.circle.badge.questionmark.fill",
                    color: .purple
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct StatItem: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)

            Text(value)
                .font(.title3)
                .fontWeight(.bold)

            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

// MARK: - Attack Types Chart Card
struct AttackTypesChartCard: View {
    let trends: [TrendData]
    @Binding var selectedType: String?
    let colorProvider: (String) -> Color

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Tipos de Ataques Más Comunes")
                .font(.headline)
                .fontWeight(.semibold)

            Chart(trends) { trend in
                BarMark(
                    x: .value("Porcentaje", trend.percentageValue),
                    y: .value("Tipo", trend.attackType)
                )
                .foregroundStyle(colorProvider(trend.attackType))
                .opacity(selectedType == nil || selectedType == trend.attackType ? 1.0 : 0.5)
            }
            .frame(height: 200)
            .chartYAxis {
                AxisMarks { _ in
                    AxisValueLabel()
                        .font(.caption)
                }
            }
            .chartXAxis {
                AxisMarks { _ in
                    AxisValueLabel()
                        .font(.caption)
                }
            }
            .onTapGesture { location in
                withAnimation(.easeInOut(duration: 0.3)) {
                    selectedType = selectedType == nil ? trends.first?.attackType : nil
                }
                HapticFeedback.shared.selectionChanged()
            }

            // Legend
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 8) {
                ForEach(trends, id: \.id) { trend in
                    HStack(spacing: 8) {
                        Circle()
                            .fill(colorProvider(trend.attackType))
                            .frame(width: 12, height: 12)

                        Text(trend.attackType)
                            .font(.caption)
                            .lineLimit(1)

                        Spacer()

                        Text("\(trend.percentageValue, specifier: "%.1f")%")
                            .font(.caption)
                            .fontWeight(.semibold)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

// MARK: - Impact Levels Chart Card
struct ImpactLevelsChartCard: View {
    let trends: [TrendData]
    @Binding var selectedLevel: String?
    let colorProvider: (String) -> Color

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Niveles de Impacto")
                .font(.headline)
                .fontWeight(.semibold)

            Chart(trends) { trend in
                SectorMark(
                    angle: .value("Porcentaje", trend.percentageValue),
                    innerRadius: .ratio(0.4),
                    angularInset: 2.0
                )
                .foregroundStyle(colorProvider(trend.attackType))
                .opacity(selectedLevel == nil || selectedLevel == trend.attackType ? 1.0 : 0.5)
            }
            .frame(height: 200)
            .onTapGesture {
                withAnimation(.easeInOut(duration: 0.3)) {
                    selectedLevel = selectedLevel == nil ? trends.first?.attackType : nil
                }
                HapticFeedback.shared.selectionChanged()
            }

            // Legend
            VStack(spacing: 8) {
                ForEach(trends, id: \.id) { trend in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(colorProvider(trend.attackType))
                            .frame(width: 12, height: 12)

                        Text(trend.attackType)
                            .font(.body)

                        Spacer()

                        Text("\(trend.percentageValue, specifier: "%.1f")%")
                            .font(.body)
                            .fontWeight(.semibold)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

// MARK: - Time Based Trends Card
struct TimeBasedTrendsCard: View {
    let trends: [TimeBasedTrend]
    let periodName: String

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Tendencia Temporal - \(periodName)")
                .font(.headline)
                .fontWeight(.semibold)

            Chart(trends) { trend in
                LineMark(
                    x: .value("Fecha", trend.date),
                    y: .value("Reportes", trend.count)
                )
                .foregroundStyle(.blue)
                .symbol(.circle)
                .interpolationMethod(.catmullRom)

                AreaMark(
                    x: .value("Fecha", trend.date),
                    y: .value("Reportes", trend.count)
                )
                .foregroundStyle(.blue.opacity(0.3))
                .interpolationMethod(.catmullRom)
            }
            .frame(height: 150)
            .chartYAxis {
                AxisMarks { _ in
                    AxisValueLabel()
                        .font(.caption)
                }
            }
            .chartXAxis {
                AxisMarks { _ in
                    AxisValueLabel()
                        .font(.caption)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

// MARK: - Key Insights Card
struct KeyInsightsCard: View {
    let summary: TrendsSummary

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "lightbulb.fill")
                    .foregroundColor(.yellow)
                    .font(.title2)

                Text("Análisis Clave")
                    .font(.headline)
                    .fontWeight(.semibold)
            }

            VStack(alignment: .leading, spacing: 8) {
                InsightRow(
                    title: "Amenaza Principal:",
                    value: summary.mainThreat,
                    icon: "exclamationmark.triangle.fill",
                    color: .red
                )

                InsightRow(
                    title: "Impacto Principal:",
                    value: summary.mainImpact,
                    icon: "shield.fill",
                    color: .orange
                )

                InsightRow(
                    title: "Nivel de Alerta:",
                    value: summary.communityAlertLevel.capitalized,
                    icon: summary.alertLevelIcon,
                    color: Color(summary.alertLevelColor)
                )
            }

            Divider()

            Text(summary.keyInsight)
                .font(.body)
                .foregroundColor(.secondary)
                .padding(.top, 4)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct InsightRow: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 16)

            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)

            Spacer()

            Text(value)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
        }
    }
}

// MARK: - Loading Overlay
struct LoadingOverlay: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)

            Text("Cargando tendencias...")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground).opacity(0.8))
    }
}

#Preview {
    TrendsView()
}
