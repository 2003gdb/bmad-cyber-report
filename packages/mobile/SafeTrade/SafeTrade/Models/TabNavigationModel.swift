import SwiftUI

enum TabItem: String, CaseIterable {
    case trends = "trends"
    case profile = "profile"

    var title: String {
        switch self {
        case .trends:
            return "Estadísticas"
        case .profile:
            return "Perfil"
        }
    }

    var icon: String {
        switch self {
        case .trends:
            return "chart.bar.fill"
        case .profile:
            return "person.fill"
        }
    }
}

class TabNavigationModel: ObservableObject {
    @Published var selectedTab: TabItem = .trends
    @Published var showingReportSelection = false

    func selectTab(_ tab: TabItem) {
        selectedTab = tab
    }

    func showReportSelection() {
        showingReportSelection = true
    }

    func hideReportSelection() {
        showingReportSelection = false
    }
}