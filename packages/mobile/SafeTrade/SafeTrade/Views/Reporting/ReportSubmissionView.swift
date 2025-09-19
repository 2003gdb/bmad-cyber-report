import SwiftUI

struct ReportSubmissionView: View {
    let isAnonymous: Bool
    @StateObject private var viewModel: ReportingViewModel
    @Environment(\.presentationMode) var presentationMode
    @Environment(\.dismiss) private var dismiss

    init(isAnonymous: Bool = false) {
        self.isAnonymous = isAnonymous
        self._viewModel = StateObject(wrappedValue: ReportingViewModel(isAnonymous: isAnonymous))
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header Section
                    headerSection

                    // Attack Type Section
                    attackTypeSection

                    // Incident Details Section
                    incidentDetailsSection

                    // Impact Assessment Section
                    impactSection

                    // Additional Information
                    additionalInfoSection

                    // Submit Button
                    submitButton

                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
            }
            .navigationTitle("Reportar Incidente")
            .navigationBarTitleDisplayMode(.large)
        }
        .fullScreenCover(isPresented: $viewModel.showingSuccessAlert) {
            if let attackType = viewModel.submittedAttackType {
                RecommendationsView(attackType: attackType) {
                    // First dismiss the recommendations view
                    viewModel.showingSuccessAlert = false
                    // Then dismiss the report submission view to return to main
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
        .alert("Error", isPresented: $viewModel.showingErrorAlert) {
            Button("Aceptar") { }
        } message: {
            Text(viewModel.alertMessage)
        }
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(spacing: 12) {
            // Report Type Indicator
            HStack {
                Image(systemName: isAnonymous ? "person.fill.questionmark" : "person.fill.badge.plus")
                    .foregroundColor(isAnonymous ? .orange : .blue)
                Text(isAnonymous ? "Reporte Anónimo" : "Reporte Identificado")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(isAnonymous ? .orange : .blue)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background((isAnonymous ? Color.orange : Color.blue).opacity(0.1))
            .cornerRadius(8)

            Text("Tu reporte ayuda a proteger a toda la comunidad")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
    }


    // MARK: - Attack Type Section

    private var attackTypeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Tipo de Ataque")
                .font(.headline)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                ForEach(AttackType.allCases, id: \.self) { attackType in
                    Button(action: {
                        viewModel.selectedAttackType = attackType
                    }) {
                        VStack(spacing: 8) {
                            Text(attackType.displayName)
                                .font(.system(.subheadline, weight: .medium))
                                .foregroundColor(viewModel.selectedAttackType == attackType ? .white : .primary)

                            Text(attackType.description)
                                .font(.caption)
                                .foregroundColor(viewModel.selectedAttackType == attackType ? .white : .secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, minHeight: 80)
                        .background(viewModel.selectedAttackType == attackType ? Color.blue : Color(.systemGray6))
                        .cornerRadius(12)
                    }
                }
            }
        }
    }

    // MARK: - Incident Details Section

    private var incidentDetailsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Detalles del Incidente")
                .font(.headline)

            // Date Picker
            VStack(alignment: .leading, spacing: 8) {
                Text("Fecha del Incidente")
                    .font(.subheadline)
                    .fontWeight(.medium)

                DatePicker("", selection: $viewModel.incidentDate, displayedComponents: .date)
                    .datePickerStyle(CompactDatePickerStyle())
            }

            // Time Input (Optional)
            VStack(alignment: .leading, spacing: 8) {
                Text("Hora (Opcional)")
                    .font(.subheadline)
                    .fontWeight(.medium)

                TextField("HH:MM", text: $viewModel.incidentTime)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.numbersAndPunctuation)
            }

            // Attack Origin
            VStack(alignment: .leading, spacing: 8) {
                Text("Origen del Ataque *")
                    .font(.subheadline)
                    .fontWeight(.medium)

                TextField("Correo, teléfono, o identificador del atacante", text: $viewModel.attackOrigin)
                    .textFieldStyle(RoundedBorderTextFieldStyle())

                if viewModel.showValidationErrors, let error = viewModel.validateAttackOrigin() {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }

            // Suspicious URL
            VStack(alignment: .leading, spacing: 8) {
                Text("URL Sospechosa (Opcional)")
                    .font(.subheadline)
                    .fontWeight(.medium)

                TextField("https://ejemplo-sospechoso.com", text: $viewModel.suspiciousUrl)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.URL)
                    .autocapitalization(.none)

                if viewModel.showValidationErrors, let error = viewModel.validateSuspiciousUrl() {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }
        }
    }

    // MARK: - Impact Section

    private var impactSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Nivel de Impacto")
                .font(.headline)

            VStack(spacing: 8) {
                ForEach(ImpactLevel.allCases, id: \.self) { level in
                    Button(action: {
                        viewModel.selectedImpactLevel = level
                    }) {
                        HStack {
                            Image(systemName: viewModel.selectedImpactLevel == level ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(viewModel.selectedImpactLevel == level ? .blue : .gray)

                            VStack(alignment: .leading, spacing: 4) {
                                Text(level.displayName)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundColor(viewModel.selectedImpactLevel == level ? .blue : .primary)

                                Text(level.description)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }

                            Spacer()
                        }
                        .padding(12)
                        .background(viewModel.selectedImpactLevel == level ? Color.blue.opacity(0.1) : Color(.systemGray6))
                        .cornerRadius(8)
                    }
                }
            }
        }
    }

    // MARK: - Additional Information Section

    private var additionalInfoSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Información Adicional")
                .font(.headline)

            // Message Content
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Contenido del Mensaje (Opcional)")
                        .font(.subheadline)
                        .fontWeight(.medium)

                    Spacer()

                    Text("\(viewModel.messageContent.count)/5000")
                        .font(.caption)
                        .foregroundColor(viewModel.messageContent.count > 5000 ? .red : .secondary)
                }

                TextField("Describe el mensaje o comunicación recibida...", text: $viewModel.messageContent, axis: .vertical)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .lineLimit(3...6)
                    .onChange(of: viewModel.messageContent) { _, newValue in
                        if newValue.count > 5000 {
                            viewModel.messageContent = String(newValue.prefix(5000))
                        }
                    }

                if viewModel.showValidationErrors, let error = viewModel.validateMessageContent() {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }

            // Description
            VStack(alignment: .leading, spacing: 8) {
                Text("Descripción Detallada (Opcional)")
                    .font(.subheadline)
                    .fontWeight(.medium)

                TextField("Describe lo que pasó, cómo te contactaron, qué te pidieron...", text: $viewModel.description, axis: .vertical)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .lineLimit(4...8)
            }
        }
    }


    // MARK: - Submit Button

    private var submitButton: some View {
        Button(action: {
            viewModel.submitReport()
        }) {
            HStack {
                if viewModel.isSubmitting {
                    ProgressView()
                        .scaleEffect(0.8)
                        .foregroundColor(.white)
                }

                Text(viewModel.isSubmitting ? "Enviando..." : "Enviar Reporte")
                    .font(.headline)
                    .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(viewModel.isFormValid && !viewModel.isSubmitting ? Color.blue : Color.gray)
            .foregroundColor(.white)
            .cornerRadius(12)
        }
        .disabled(!viewModel.isFormValid || viewModel.isSubmitting)
    }
}

struct ReportSubmissionView_Previews: PreviewProvider {
    static var previews: some View {
        ReportSubmissionView()
    }
}
