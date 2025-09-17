import SwiftUI

struct AnonymousReportView: View {
    @Environment(\.presentationMode) var presentationMode

    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Spacer()

                VStack(spacing: 16) {
                    Image(systemName: "person.fill.questionmark")
                        .font(.system(size: 80))
                        .foregroundColor(.orange)

                    Text("Reporte Anónimo")
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    Text("Tu identidad permanecerá completamente anónima")
                        .font(.headline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                Spacer()

                VStack(spacing: 16) {
                    Text("Funcionalidad de reporte anónimo")
                        .font(.title2)
                        .fontWeight(.medium)

                    Text("Esta pantalla será implementada en futuras historias")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }

                Spacer()

                NavigationLink(destination: ReportSubmissionView(isAnonymous: true)) {
                    Text("Continuar")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.orange)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .padding(.horizontal, 24)

                Spacer()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Volver") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}

struct AnonymousReportView_Previews: PreviewProvider {
    static var previews: some View {
        AnonymousReportView()
    }
}