import SwiftUI

struct WelcomeView: View {
    @StateObject private var authService = AuthenticationService.shared
    @State private var showingLogin = false
    @State private var showingRegister = false

    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Spacer()

                // App Logo and Title
                VStack(spacing: 16) {
                    Image(systemName: "shield.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.blue)

                    Text("SafeTrade")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)

                    Text("Sistema de Reportes de Ciberseguridad")
                        .font(.headline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                Spacer()

                // Main Action Buttons
                VStack(spacing: 16) {
                    // Anonymous Report Button
                    NavigationLink(destination: ReportSubmissionView(isAnonymous: true)) {
                        HStack {
                            Image(systemName: "person.fill.questionmark")
                                .font(.title2)
                            Text("Reportar Anónimamente")
                                .font(.headline)
                                .fontWeight(.medium)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.orange)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }

                    // Login/Register Section
                    VStack(spacing: 12) {
                        Text("¿Ya tienes cuenta?")
                            .font(.subheadline)
                            .foregroundColor(.secondary)

                        HStack(spacing: 12) {
                            // Login Button
                            Button(action: {
                                showingLogin = true
                            }) {
                                Text("Iniciar Sesión")
                                    .font(.headline)
                                    .fontWeight(.medium)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.blue)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }

                            // Register Button
                            Button(action: {
                                showingRegister = true
                            }) {
                                Text("Registrarse")
                                    .font(.headline)
                                    .fontWeight(.medium)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.green)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                        }
                    }
                }
                .padding(.horizontal, 24)

                Spacer()

                // Info Text
                Text("Protege tu información y ayuda a tu comunidad")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                    .padding(.bottom, 30)
            }
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $showingLogin) {
            LoginView()
        }
        .sheet(isPresented: $showingRegister) {
            RegisterView()
        }
    }
}

struct WelcomeView_Previews: PreviewProvider {
    static var previews: some View {
        WelcomeView()
    }
}