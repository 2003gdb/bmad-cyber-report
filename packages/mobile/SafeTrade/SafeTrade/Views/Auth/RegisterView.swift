import SwiftUI

struct RegisterView: View {
    @Environment(\.presentationMode) var presentationMode
    @ObservedObject private var authService = AuthenticationService.shared

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var isLoading = false
    @State private var errorMessage = ""
    @State private var showingError = false

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 16) {
                        Image(systemName: "person.badge.plus.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.green)

                        Text("Crear Cuenta")
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        Text("Únete a la comunidad SafeTrade")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 40)

                    // Form Fields
                    VStack(spacing: 16) {
                        // Name Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Nombre Completo")
                                .font(.headline)
                                .foregroundColor(.primary)

                            TextField("Tu nombre completo", text: $name)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .autocorrectionDisabled()
                        }

                        // Email Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Correo Electrónico")
                                .font(.headline)
                                .foregroundColor(.primary)

                            TextField("tu@email.com", text: $email)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                .autocorrectionDisabled()
                        }

                        // Password Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Contraseña")
                                .font(.headline)
                                .foregroundColor(.primary)

                            SecureField("Mínimo 8 caracteres", text: $password)
                                .textFieldStyle(RoundedBorderTextFieldStyle())

                            if !password.isEmpty && password.count < 8 {
                                Text("La contraseña debe tener al menos 8 caracteres")
                                    .font(.caption)
                                    .foregroundColor(.red)
                            }
                        }

                        // Confirm Password Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Confirmar Contraseña")
                                .font(.headline)
                                .foregroundColor(.primary)

                            SecureField("Confirma tu contraseña", text: $confirmPassword)
                                .textFieldStyle(RoundedBorderTextFieldStyle())

                            if !confirmPassword.isEmpty && password != confirmPassword {
                                Text("Las contraseñas no coinciden")
                                    .font(.caption)
                                    .foregroundColor(.red)
                            }
                        }
                    }
                    .padding(.horizontal, 24)

                    // Terms and Conditions
                    Text("Al registrarte, aceptas nuestros términos y condiciones de privacidad")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)

                    // Register Button
                    Button(action: {
                        Task {
                            await registerUser()
                        }
                    }) {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .frame(maxWidth: .infinity)
                                .padding()
                        } else {
                            HStack {
                                Image(systemName: "person.badge.plus")
                                Text("Crear Cuenta")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                        }
                    }
                    .background(isFormValid ? Color.green : Color.gray)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                    .disabled(!isFormValid || isLoading)
                    .padding(.horizontal, 24)

                    Spacer()
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancelar") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
        .alert("Error de Registro", isPresented: $showingError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
        .onChange(of: authService.isAuthenticated) {
            if authService.isAuthenticated {
                presentationMode.wrappedValue.dismiss()
            }
        }
    }

    private var isFormValid: Bool {
        !name.isEmpty &&
        !email.isEmpty &&
        !password.isEmpty &&
        !confirmPassword.isEmpty &&
        email.contains("@") &&
        password.count >= 8 &&
        password == confirmPassword
    }

    private func registerUser() async {
        isLoading = true
        errorMessage = ""

        do {
            _ = try await authService.register(email: email, password: password, name: name)
            // Success is handled by the onChange modifier
        } catch {
            errorMessage = error.localizedDescription
            showingError = true
        }

        isLoading = false
    }
}

struct RegisterView_Previews: PreviewProvider {
    static var previews: some View {
        RegisterView()
    }
}