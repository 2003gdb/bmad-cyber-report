import Foundation
import Combine

class ReportingService: ObservableObject {
    private let apiService: APIService

    init(apiService: APIService = APIService.shared) {
        self.apiService = apiService
    }

    // MARK: - Report Creation

    /// Submit a new cybersecurity incident report
    func submitReport(_ request: CreateReportRequest) -> AnyPublisher<CreateReportResponse, Error> {
        // Prepare the URL
        guard let url = URL(string: "\(apiService.baseURL)/reportes") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }

        // Create JSON request
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add authentication token if available
        if let token = apiService.authToken {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Encode request as JSON
        do {
            let jsonData = try JSONEncoder().encode(request)
            urlRequest.httpBody = jsonData

            // Debug logging
            print("🔍 Sending report request:")
            print("URL: \(url)")
            print("Headers: \(urlRequest.allHTTPHeaderFields ?? [:])")
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                print("JSON Body: \(jsonString)")
            }
        } catch {
            return Fail(error: error)
                .eraseToAnyPublisher()
        }

        return URLSession.shared.dataTaskPublisher(for: urlRequest)
            .map { output in
                // Debug response
                print("🔍 Received response:")
                print("Status code: \((output.response as? HTTPURLResponse)?.statusCode ?? -1)")
                if let responseString = String(data: output.data, encoding: .utf8) {
                    print("Response body: \(responseString)")
                }
                return output.data
            }
            .decode(type: CreateReportResponse.self, decoder: JSONDecoder.reportDecoder)
            .catch { error in
                print("❌ Decoding error: \(error)")
                return Fail<CreateReportResponse, Error>(error: error)
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }

    // DISABLED: File attachment functionality removed
    // Submit reports using the standard submitReport() method instead

    // MARK: - Report Retrieval

    /// Get a specific report by ID
    func getReport(id: Int) -> AnyPublisher<Report?, Error> {
        guard let url = URL(string: "\(apiService.baseURL)/reportes/\(id)") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }

        var request = URLRequest(url: url)

        // Add authentication token if available
        if let token = apiService.authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: GetReportResponse.self, decoder: JSONDecoder.reportDecoder)
            .map { response in
                return response.success ? response.reporte : nil
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }

    /// Get user's reports (requires authentication)
    func getUserReports() -> AnyPublisher<[Report], Error> {
        guard let token = apiService.authToken else {
            return Fail(error: APIError.invalidResponse)
                .eraseToAnyPublisher()
        }

        guard let url = URL(string: "\(apiService.baseURL)/reportes/user/mis-reportes") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        return URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: GetUserReportsResponse.self, decoder: JSONDecoder.reportDecoder)
            .map { response in
                return response.success ? response.reportes : []
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
}

// MARK: - Supporting Types

struct GetReportResponse: Codable {
    let success: Bool
    let message: String?
    let reporte: Report?
}

struct GetUserReportsResponse: Codable {
    let success: Bool
    let message: String
    let reportes: [Report]
    let total: Int
}


// MARK: - JSONDecoder Extension

extension JSONDecoder {
    static var reportDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        decoder.dateDecodingStrategy = .formatted(formatter)
        return decoder
    }
}