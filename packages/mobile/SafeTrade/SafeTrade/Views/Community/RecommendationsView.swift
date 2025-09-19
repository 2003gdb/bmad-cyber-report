import SwiftUI

struct RecommendationsView: View {
    let attackType: String
    let onReturnToMain: (() -> Void)?
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = RecommendationsViewModel()

    init(attackType: String, onReturnToMain: (() -> Void)? = nil) {
        self.attackType = attackType
        self.onReturnToMain = onReturnToMain
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header with close button
            HStack {
                Spacer()
                Button("Cerrar") {
                    if let onReturnToMain = onReturnToMain {
                        onReturnToMain()
                    } else {
                        dismiss()
                    }
                }
                .font(.headline)
                .foregroundColor(.blue)
            }
            .padding()

            Spacer()

            // Main content with quote
            VStack(spacing: 32) {
                // Security icon
                Image(systemName: "shield.checkered")
                    .font(.system(size: 60))
                    .foregroundColor(.blue)

                // Security quote
                Text(viewModel.securityQuote)
                    .font(.title2)
                    .multilineTextAlignment(.center)
                    .foregroundColor(.primary)
                    .padding(.horizontal, 24)

                // Recommendation tip for this attack type
                if let recommendation = viewModel.recommendation {
                    VStack(spacing: 16) {
                        Text(recommendation.titulo)
                            .font(.headline)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.blue)

                        Text(recommendation.contenido)
                            .font(.body)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                            .padding(.horizontal, 16)
                    }
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                    .padding(.horizontal, 24)
                }
            }

            Spacer()

            // Return button
            Button(action: {
                if let onReturnToMain = onReturnToMain {
                    onReturnToMain()
                } else {
                    dismiss()
                }
            }) {
                Text("Regresar al Inicio")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .background(Color(.systemGroupedBackground))
        .onAppear {
            viewModel.loadRecommendation(for: attackType)
        }
    }
}

// MARK: - Preview
struct RecommendationsView_Previews: PreviewProvider {
    static var previews: some View {
        RecommendationsView(attackType: "email")
    }
}