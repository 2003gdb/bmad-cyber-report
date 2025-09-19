import SwiftUI

struct TabBarView: View {
    @StateObject private var navigationModel = TabNavigationModel()

    var body: some View {
        ZStack(alignment: .bottom) {
            // Main Content
            tabContent
                .frame(maxWidth: .infinity, maxHeight: .infinity)

            // Custom Tab Bar
            customTabBar
        }
        .sheet(isPresented: $navigationModel.showingReportSelection) {
            ReportSelectionView {
                navigationModel.hideReportSelection()
            }
        }
    }

    // MARK: - Tab Content
    @ViewBuilder
    private var tabContent: some View {
        switch navigationModel.selectedTab {
        case .trends:
            TrendsView()
        case .profile:
            ProfileView()
        }
    }

    // MARK: - Custom Tab Bar
    private var customTabBar: some View {
        HStack(spacing: 0) {
            // Trends Tab
            TabBarItem(
                tab: .trends,
                isSelected: navigationModel.selectedTab == .trends
            ) {
                navigationModel.selectTab(.trends)
            }

            Spacer()

            // Center Report Button
            Button(action: {
                navigationModel.showReportSelection()
            }) {
                ZStack {
                    Circle()
                        .fill(Color.orange)
                        .frame(width: 56, height: 56)
                        .shadow(color: .orange.opacity(0.3), radius: 8, x: 0, y: 4)

                    Image(systemName: "plus")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                }
            }
            .offset(y: -8) // Slightly elevated

            Spacer()

            // Profile Tab
            TabBarItem(
                tab: .profile,
                isSelected: navigationModel.selectedTab == .profile
            ) {
                navigationModel.selectTab(.profile)
            }
        }
        .padding(.horizontal, 32)
        .padding(.top, 16)
        .padding(.bottom, 8)
        .background(
            Rectangle()
                .fill(.ultraThinMaterial)
                .background(Color.white)
                .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: -2)
        )
        .ignoresSafeArea(.all, edges: .bottom)
    }
}

// MARK: - Tab Bar Item
struct TabBarItem: View {
    let tab: TabItem
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: tab.icon)
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(isSelected ? .blue : .gray)

                Text(tab.title)
                    .font(.caption2)
                    .fontWeight(.medium)
                    .foregroundColor(isSelected ? .blue : .gray)
            }
            .frame(maxWidth: .infinity)
            .contentShape(Rectangle())
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Report Selection View
struct ReportSelectionView: View {
    let onDismiss: () -> Void

    var body: some View {
        NavigationView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 16) {
                    Image(systemName: "shield.lefthalf.filled")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)

                    Text("Crear Reporte")
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    Text("¿Qué tipo de reporte deseas crear?")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                // Report Type Options
                VStack(spacing: 20) {
                    // Identified Report
                    NavigationLink(destination: ReportSubmissionView(isAnonymous: false)) {
                        ReportTypeCard(
                            icon: "person.fill.badge.plus",
                            title: "Reporte Identificado",
                            subtitle: "Se asociará con tu cuenta",
                            backgroundColor: .blue
                        )
                    }

                    // Anonymous Report
                    NavigationLink(destination: ReportSubmissionView(isAnonymous: true)) {
                        ReportTypeCard(
                            icon: "person.fill.questionmark",
                            title: "Reporte Anónimo",
                            subtitle: "Tu identidad permanecerá privada",
                            backgroundColor: .orange
                        )
                    }
                }
                .padding(.horizontal, 24)

                Spacer()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancelar") {
                        onDismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Report Type Card
struct ReportTypeCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let backgroundColor: Color

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.white)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)

                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.9))
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
        }
        .padding(20)
        .background(backgroundColor)
        .cornerRadius(16)
        .shadow(color: backgroundColor.opacity(0.3), radius: 8, x: 0, y: 4)
    }
}

#Preview {
    TabBarView()
}