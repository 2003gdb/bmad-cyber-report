import SwiftUI

struct AuthenticatedMainView: View {
    @StateObject private var authService = AuthenticationService.shared
    @State private var showingReportType = false

    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                // Header with User Info
                VStack(spacing: 16) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)

                    if let user = authService.currentUser {
                        Text("Bienvenido")
                            .font(.title2)
                            .foregroundColor(.secondary)

                        Text(user.email)
                            .font(.title)
                            .fontWeight(.semibold)
                    }
                }
                .padding(.top, 40)

                Spacer()

                // Main Actions
                VStack(spacing: 20) {
                    Text("¿Qué tipo de reporte deseas crear?")
                        .font(.headline)
                        .multilineTextAlignment(.center)

                    VStack(spacing: 16) {
                        // Identified Report Button
                        NavigationLink(destination: ReportSubmissionView(isAnonymous: false)) {
                            HStack {
                                Image(systemName: "person.fill.badge.plus")
                                    .font(.title2)
                                VStack(alignment: .leading) {
                                    Text("Reporte Identificado")
                                        .font(.headline)
                                        .fontWeight(.medium)
                                    Text("Se asociará con tu cuenta")
                                        .font(.caption)
                                        .foregroundColor(.white.opacity(0.8))
                                }
                                Spacer()
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }

                        // Anonymous Report Button
                        NavigationLink(destination: ReportSubmissionView(isAnonymous: true)) {
                            HStack {
                                Image(systemName: "person.fill.questionmark")
                                    .font(.title2)
                                VStack(alignment: .leading) {
                                    Text("Reporte Anónimo")
                                        .font(.headline)
                                        .fontWeight(.medium)
                                    Text("Tu identidad permanecerá privada")
                                        .font(.caption)
                                        .foregroundColor(.white.opacity(0.8))
                                }
                                Spacer()
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.orange)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                    }
                }
                .padding(.horizontal, 24)

                Spacer()

                // Logout Button
                Button(action: {
                    authService.logout()
                }) {
                    HStack {
                        Image(systemName: "arrow.backward.circle")
                        Text("Cerrar Sesión")
                    }
                    .foregroundColor(.red)
                }
                .padding(.bottom, 30)
            }
            .navigationBarHidden(true)
        }
    }
}

struct AuthenticatedMainView_Previews: PreviewProvider {
    static var previews: some View {
        AuthenticatedMainView()
    }
}