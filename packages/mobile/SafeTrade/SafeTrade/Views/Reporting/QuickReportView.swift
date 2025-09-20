import SwiftUI

struct QuickReportView: View {
    let isAnonymous: Bool
    @StateObject private var viewModel: ReportingViewModel
    @Environment(\.presentationMode) var presentationMode
    @Environment(\.dismiss) private var dismiss

    // Progressive disclosure state
    @State private var showAdvancedFields = false
    @State private var currentStep = 1
    private let totalSteps = 3

    // Draft recovery state
    @State private var showDraftRecoveryAlert = false

    init(isAnonymous: Bool = false) {
        self.isAnonymous = isAnonymous
        self._viewModel = StateObject(wrappedValue: ReportingViewModel(isAnonymous: isAnonymous))
    }

    var body: some View {
        NavigationView {
            GeometryReader { geometry in
                ScrollView {
                    VStack(spacing: 20) {
                        // Progress indicator
                        progressIndicator

                        // Header
                        headerSection

                        // Step-based content
                        VStack(spacing: 24) {
                            switch currentStep {
                            case 1:
                                attackTypeQuickSelection
                            case 2:
                                essentialDetailsSection
                            case 3:
                                impactAndSubmitSection
                            default:
                                EmptyView()
                            }
                        }

                        // Advanced fields toggle (only on step 2)
                        if currentStep == 2 {
                            advancedFieldsToggle
                        }

                        // Advanced fields (when expanded)
                        if showAdvancedFields && currentStep == 2 {
                            advancedFieldsSection
                                .transition(.opacity.combined(with: .slide))
                        }

                        // Spacer to push navigation buttons to thumb zone
                        Spacer(minLength: 120)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 16)
                    .padding(.bottom, OneHandedOperation.thumbZoneHeight(for: geometry.size.height) / 2)
                }

                // Fixed navigation buttons in thumb-friendly zone
                VStack {
                    Spacer()
                    navigationButtons(in: geometry)
                        .inThumbZone()
                }
                .ignoresSafeArea(.keyboard)
            }
            .navigationTitle("Reporte Rápido")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancelar") {
                        dismiss()
                    }
                    .foregroundColor(.blue)
                }
            }
        }
        .onAppear {
            // Check for draft first, then apply defaults if no draft
            if DraftManager.shared.hasDraft {
                showDraftRecoveryAlert = true
            } else {
                viewModel.setQuickDefaults()
            }
            viewModel.startAutoDraftSaving()
        }
        .onDisappear {
            viewModel.stopAutoDraftSaving()
        }
        .fullScreenCover(isPresented: $viewModel.showingSuccessAlert) {
            if let attackType = viewModel.submittedAttackType {
                RecommendationsView(attackType: attackType) {
                    viewModel.showingSuccessAlert = false
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
        .alert("Borrador Encontrado", isPresented: $showDraftRecoveryAlert) {
            Button("Recuperar") {
                if viewModel.loadDraftIfAvailable() {
                    viewModel.startAutoDraftSaving()
                } else {
                    viewModel.setQuickDefaults()
                }
            }
            Button("Empezar de Nuevo") {
                viewModel.clearDraft()
                viewModel.setQuickDefaults()
                viewModel.startAutoDraftSaving()
            }
            Button("Cancelar", role: .cancel) {
                dismiss()
            }
        } message: {
            Text("Se encontró un borrador de reporte guardado hace \(DraftManager.shared.getDraftAgeString()). ¿Deseas recuperarlo o empezar un nuevo reporte?")
        }
    }

    // MARK: - Progress Indicator

    private var progressIndicator: some View {
        HStack {
            ForEach(1...totalSteps, id: \.self) { step in
                ZStack {
                    Circle()
                        .fill(stepColor(for: step))
                        .frame(width: 24, height: 24)

                    if step < currentStep {
                        Image(systemName: "checkmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                    } else if step == currentStep {
                        Text("\(step)")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                    } else {
                        Text("\(step)")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.gray)
                    }
                }

                if step < totalSteps {
                    Rectangle()
                        .fill(step < currentStep ? Color.blue : Color.gray.opacity(0.3))
                        .frame(height: 2)
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(.horizontal, 40)
    }

    private func stepColor(for step: Int) -> Color {
        if step < currentStep {
            return .green // Completed steps
        } else if step == currentStep {
            return .blue // Current step
        } else {
            return Color.gray.opacity(0.3) // Future steps
        }
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(spacing: 12) {
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

            Text("Proceso rápido de 3 pasos")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }

    // MARK: - Step 1: Attack Type Quick Selection

    private var attackTypeQuickSelection: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("1. Tipo de Ataque")
                    .font(.headline)
                Text("Selecciona el tipo más común")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            // Quick selection grid with most common types first
            let suggestedTypes = viewModel.getAttackTypeSuggestions().prefix(4)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                ForEach(Array(suggestedTypes), id: \.self) { attackType in
                    Button(action: {
                        viewModel.selectedAttackType = attackType
                        HapticFeedback.shared.selectionChanged()
                    }) {
                        VStack(spacing: 8) {
                            Text(attackType.displayName)
                                .font(.system(.subheadline, weight: .medium))
                                .foregroundColor(viewModel.selectedAttackType == attackType ? .white : .primary)
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, minHeight: 60)
                        .background(viewModel.selectedAttackType == attackType ? Color.blue : Color(.systemGray6))
                        .cornerRadius(12)
                    }
                }
            }

            // Show more types option
            if AttackType.allCases.count > 4 {
                Button("Ver más tipos") {
                    // This could expand to show all types
                }
                .font(.subheadline)
                .foregroundColor(.blue)
            }
        }
    }

    // MARK: - Step 2: Essential Details

    private var essentialDetailsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("2. Detalles Esenciales")
                    .font(.headline)
                Text("Solo la información básica")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            // Auto-populated date/time
            VStack(alignment: .leading, spacing: 8) {
                Text("Fecha y Hora")
                    .font(.subheadline)
                    .fontWeight(.medium)

                HStack {
                    Text(viewModel.formattedIncidentDate)
                    Spacer()
                    Text(viewModel.incidentTime)
                }
                .padding(12)
                .background(Color(.systemGray6))
                .cornerRadius(8)
                .overlay(
                    Text("Auto-detectado")
                        .font(.caption)
                        .foregroundColor(.blue)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(4)
                        .offset(x: 8, y: -8),
                    alignment: .topTrailing
                )
            }

            // Attack origin with suggestions
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Origen del Ataque *")
                        .font(.subheadline)
                        .fontWeight(.medium)

                    Spacer()

                    if !viewModel.attackOrigin.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                            .font(.subheadline)
                    }
                }

                TextField("¿De dónde vino el ataque?", text: $viewModel.attackOrigin)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .overlay(
                        RoundedRectangle(cornerRadius: 6)
                            .stroke(!viewModel.attackOrigin.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? Color.green : Color.clear, lineWidth: 2)
                    )

                // Quick suggestions based on attack type
                let suggestions = viewModel.getAttackOriginSuggestions().prefix(2)
                if !suggestions.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Sugerencias:")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        HStack {
                            ForEach(Array(suggestions), id: \.self) { suggestion in
                                Button(suggestion) {
                                    viewModel.attackOrigin = suggestion
                                    HapticFeedback.shared.selectionChanged()
                                }
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.blue.opacity(0.1))
                                .foregroundColor(.blue)
                                .cornerRadius(4)
                            }
                            Spacer()
                        }
                    }
                }

                if viewModel.showValidationErrors, let error = viewModel.validateAttackOrigin() {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }
        }
    }

    // MARK: - Advanced Fields Toggle

    private var advancedFieldsToggle: some View {
        Button(action: {
            withAnimation(.easeInOut(duration: 0.3)) {
                showAdvancedFields.toggle()
            }
            HapticFeedback.shared.selectionChanged()
        }) {
            HStack {
                Text("Más detalles")
                    .font(.subheadline)
                    .fontWeight(.medium)

                Spacer()

                Image(systemName: showAdvancedFields ? "chevron.up" : "chevron.down")
                    .font(.subheadline)
            }
            .foregroundColor(.blue)
            .padding(12)
            .background(Color.blue.opacity(0.1))
            .cornerRadius(8)
        }
    }

    // MARK: - Advanced Fields Section

    private var advancedFieldsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Información Adicional")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.secondary)

            // Suspicious URL
            VStack(alignment: .leading, spacing: 8) {
                Text("URL Sospechosa (Opcional)")
                    .font(.subheadline)
                    .fontWeight(.medium)

                TextField("https://ejemplo-sospechoso.com", text: $viewModel.suspiciousUrl)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.URL)
                    .autocapitalization(.none)
            }

            // Message content
            VStack(alignment: .leading, spacing: 8) {
                Text("Contenido del Mensaje (Opcional)")
                    .font(.subheadline)
                    .fontWeight(.medium)

                TextField("Describe el mensaje recibido...", text: $viewModel.messageContent, axis: .vertical)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .lineLimit(2...4)
            }
        }
        .padding(.top, 8)
    }

    // MARK: - Step 3: Impact and Submit

    private var impactAndSubmitSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("3. Nivel de Impacto")
                    .font(.headline)
                Text("¿Qué tan grave fue?")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            VStack(spacing: 12) {
                ForEach(ImpactLevel.allCases, id: \.self) { level in
                    Button(action: {
                        viewModel.selectedImpactLevel = level
                        HapticFeedback.shared.selectionChanged()
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

            // Submit button
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

    // MARK: - Navigation Buttons

    private func navigationButtons(in geometry: GeometryProxy) -> some View {
        HStack {
            if currentStep > 1 {
                Button("Anterior") {
                    previousStep()
                }
                .buttonStyle(ThumbFriendlyButtonStyle(isPrimary: false, isEnabled: true))
                .frame(maxWidth: .infinity)
            }

            if currentStep < totalSteps {
                Button("Siguiente") {
                    nextStep()
                }
                .buttonStyle(ThumbFriendlyButtonStyle(isPrimary: true, isEnabled: canAdvanceToNextStep()))
                .disabled(!canAdvanceToNextStep())
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal, 20)
        .gesture(
            SwipeGestureHelper.createHorizontalSwipeGesture(
                leftAction: nextStep,
                rightAction: previousStep
            )
        )
    }

    // MARK: - Helper Methods

    private func nextStep() {
        guard canAdvanceToNextStep() else { return }

        withAnimation(.easeInOut(duration: 0.2)) {
            currentStep += 1
        }
        HapticFeedback.shared.selectionChanged()
    }

    private func previousStep() {
        guard currentStep > 1 else { return }

        withAnimation(.easeInOut(duration: 0.2)) {
            currentStep -= 1
        }
        HapticFeedback.shared.selectionChanged()
    }

    private func canAdvanceToNextStep() -> Bool {
        switch currentStep {
        case 1:
            return true // Attack type is pre-selected
        case 2:
            return viewModel.isFormValid
        default:
            return false
        }
    }
}

struct QuickReportView_Previews: PreviewProvider {
    static var previews: some View {
        QuickReportView()
    }
}