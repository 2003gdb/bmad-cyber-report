import SwiftUI

struct ReportsListView: View {
    @StateObject private var viewModel = ReportsListViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Search Bar
            SearchBarView(searchText: $viewModel.searchQuery)
                .padding(.horizontal)
                .padding(.top, 8)

            // Filter Chips
            FilterChipsView(
                selectedFilter: $viewModel.selectedFilter,
                canShowMyReports: viewModel.canShowMyReports,
                onFilterChanged: viewModel.changeFilter
            )
            .padding(.horizontal)
            .padding(.vertical, 12)

            // Reports List or Empty State
            if viewModel.isLoading && viewModel.filteredReports.isEmpty {
                LoadingView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if viewModel.filteredReports.isEmpty {
                EmptyStateView(message: viewModel.emptyStateMessage)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(viewModel.filteredReports) { report in
                            ReportCardView(
                                report: report,
                                statusColor: viewModel.statusColor(for: report),
                                statusIcon: viewModel.statusIcon(for: report),
                                attackTypeIcon: viewModel.attackTypeIcon(for: report),
                                formattedDate: viewModel.formatDate(report.createdAt),
                                reporterName: viewModel.reporterName(for: report)
                            )
                            .transition(.asymmetric(
                                insertion: .move(edge: .top).combined(with: .opacity),
                                removal: .move(edge: .trailing).combined(with: .opacity)
                            ))
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 20)
                }
                .refreshable {
                    viewModel.refreshData()
                }
            }
        }
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: viewModel.showPopup) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                }
            }
        }
        .alert("Error", isPresented: Binding(
            get: { viewModel.errorMessage != nil },
            set: { if !$0 { viewModel.errorMessage = nil } }
        )) {
            Button("Reintentar") {
                viewModel.refreshData()
            }
            Button("Cancelar", role: .cancel) { }
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
        .overlay {
            if viewModel.showingPopup {
                PopupOverlayView(
                    isPresented: $viewModel.showingPopup,
                    communityAlert: viewModel.communityAlert,
                    isLoading: viewModel.communityAlertLoading,
                    errorMessage: viewModel.communityAlertError
                )
            }
        }
        .animation(.easeInOut(duration: 0.3), value: viewModel.filteredReports.count)
        .animation(.easeInOut(duration: 0.2), value: viewModel.selectedFilter)
    }
}
// MARK: - Search Bar
struct SearchBarView: View {
    @Binding var searchText: String

    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
                .frame(width: 16, height: 16)

            TextField("Buscar reportes...", text: $searchText)
                .textFieldStyle(.plain)
                .autocorrectionDisabled()
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

// MARK: - Filter Chips
struct FilterChipsView: View {
    @Binding var selectedFilter: ReportFilter
    let canShowMyReports: Bool
    let onFilterChanged: (ReportFilter) -> Void

    private var availableFilters: [ReportFilter] {
        var filters: [ReportFilter] = [.todos]

        if canShowMyReports {
            filters.append(.misReportes)
        }

        filters.append(contentsOf: [.nuevo, .revisado, .enInvestigacion, .cerrado])
        return filters
    }

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(availableFilters, id: \.self) { filter in
                    FilterChip(
                        title: filter.displayName,
                        isSelected: selectedFilter == filter,
                        action: { onFilterChanged(filter) }
                    )
                }
            }
            .padding(.horizontal)
        }
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(isSelected ? .white : .primary)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    (isSelected ? Color.accentColor : Color(.systemGray5))
                        .animation(.easeInOut(duration: 0.2), value: isSelected)
                )
                .cornerRadius(16)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Report Card
struct ReportCardView: View {
    let report: Report
    let statusColor: Color
    let statusIcon: String
    let attackTypeIcon: String
    let formattedDate: String
    let reporterName: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header with status
            HStack {
                HStack(spacing: 8) {
                    Circle()
                        .fill(statusColor)
                        .frame(width: 8, height: 8)

                    Text(report.getAttackTypeDisplayName())
                        .font(.headline)
                        .fontWeight(.semibold)
                }

                Spacer()

                HStack(spacing: 4) {
                    Image(systemName: statusIcon)
                        .font(.caption)
                        .foregroundColor(statusColor)

                    Text(report.getStatusDisplayName())
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(statusColor)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(statusColor.opacity(0.1))
                        .cornerRadius(8)
                }
            }

            // Details
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Image(systemName: "calendar")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(width: 16)

                    Text("Fecha: \(formattedDate)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                HStack(spacing: 8) {
                    Image(systemName: "person")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(width: 16)

                    Text("Reportado por: \(reporterName)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                HStack(spacing: 8) {
                    Image(systemName: attackTypeIcon)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(width: 16)

                    Text("Origen: \(report.attackOrigin)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
            }

            if let description = report.description, !description.isEmpty {
                Text(description)
                    .font(.body)
                    .foregroundColor(.primary)
                    .lineLimit(3)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

// MARK: - Empty State
struct EmptyStateView: View {
    let message: String

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 48))
                .foregroundColor(.secondary)

            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 40)
    }
}

// MARK: - Loading View
struct LoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)

            Text("Cargando reportes...")
                .font(.body)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Popup Overlay
struct PopupOverlayView: View {
    @Binding var isPresented: Bool
    let communityAlert: CommunityAlert?
    let isLoading: Bool
    let errorMessage: String?

    var body: some View {
        ZStack {
            // Background overlay
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation(.easeOut(duration: 0.3)) {
                        isPresented = false
                    }
                }

            VStack {
                Spacer()

                // Content based on state
                Group {
                    if isLoading {
                        LoadingAlertCard()
                    } else if let error = errorMessage {
                        ErrorAlertCard(errorMessage: error)
                    } else if let alert = communityAlert {
                        CommunityAlertCard(alert: alert)
                    } else {
                        EmptyAlertCard()
                    }
                }
                .padding(.horizontal, 20)
                .transition(.asymmetric(
                    insertion: .move(edge: .bottom).combined(with: .opacity),
                    removal: .move(edge: .bottom).combined(with: .opacity)
                ))

                Spacer()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: isPresented)
    }
}

// MARK: - Loading Alert Card
struct LoadingAlertCard: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)

            Text("Cargando alerta comunitaria...")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(32)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

// MARK: - Error Alert Card
struct ErrorAlertCard: View {
    let errorMessage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.orange)
                    .font(.title2)

                Text("Error")
                    .font(.headline)
                    .fontWeight(.semibold)

                Spacer()
            }

            Text(errorMessage)
                .font(.body)
                .foregroundColor(.secondary)

            Text("Intenta nuevamente más tarde o verifica tu conexión.")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

// MARK: - Empty Alert Card
struct EmptyAlertCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "info.circle.fill")
                    .foregroundColor(.blue)
                    .font(.title2)

                Text("Sin Información")
                    .font(.headline)
                    .fontWeight(.semibold)

                Spacer()
            }

            Text("No hay información de alerta disponible en este momento.")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
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

#Preview {
    ReportsListView()
}
