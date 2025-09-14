# Architecture Integration Points

## Backend-Frontend Integration

### API Contract Enforcement
```typescript
// shared/types/api-contract.ts - Shared between backend and frontend
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: string
}

export interface PaginatedResponse<T> extends APIResponse<T> {
  data: {
    items: T[]
    pagination: {
      total: number
      page: number
      pages: number
      limit: number
    }
  }
}

// API endpoint types that match backend OpenAPI spec
export interface ReportsListResponse extends PaginatedResponse<Report[]> {
  data: {
    reports: Report[]
    pagination: {
      total: number
      page: number
      pages: number
    }
  }
}
```

### Type Safety Enforcement
```swift
// iOS - Matching backend types exactly
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: APIError?
    let timestamp: String
    
    struct APIError: Codable {
        let code: String
        let message: String
        let details: [String: AnyCodable]?
    }
}

// Ensure iOS models match backend exactly
struct Report: Codable, Identifiable {
    let id: UUID
    let userId: UUID?
    let isAnonymous: Bool
    let attackType: AttackType
    let incidentDate: Date
    let incidentTime: Time?
    let attackOrigin: String
    let suspiciousUrl: String?
    let messageContent: String?
    let impactLevel: ImpactLevel
    let description: String
    let status: ReportStatus
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id = "report_id"
        case userId = "user_id"
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case incidentTime = "incident_time"
        case attackOrigin = "attack_origin"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case impactLevel = "impact_level"
        case description
        case status
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
```

## Real-time Data Synchronization

### WebSocket Integration Pattern
```typescript
// hooks/useRealTimeUpdates.ts
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import io, { Socket } from 'socket.io-client'

export function useRealTimeUpdates() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: {
        token: localStorage.getItem('access_token'),
      },
    })
    
    setSocket(socketInstance)
    
    // Listen for report updates
    socketInstance.on('report_status_updated', (data) => {
      // Update the specific report in cache
      queryClient.setQueryData(['report', data.report_id], (oldData: any) => ({
        ...oldData,
        status: data.new_status,
        updated_at: data.updated_at,
      }))
      
      // Invalidate reports list to refresh
      queryClient.invalidateQueries(['reports'])
    })
    
    // Listen for new reports
    socketInstance.on('new_report_submitted', (data) => {
      queryClient.invalidateQueries(['reports'])
      queryClient.invalidateQueries(['dashboard-metrics'])
    })
    
    return () => {
      socketInstance.close()
    }
  }, [queryClient])
  
  return socket
}
```

```swift
// iOS - WebSocket integration for real-time updates
import Foundation
import Combine

class RealTimeUpdateService: ObservableObject {
    @Published var latestUpdate: String?
    
    private var webSocketTask: URLSessionWebSocketTask?
    private var cancellables = Set<AnyCancellable>()
    
    func connect() {
        guard let url = URL(string: "ws://localhost:3000/ws") else { return }
        
        webSocketTask = URLSession.shared.webSocketTask(with: url)
        webSocketTask?.resume()
        
        receiveMessage()
    }
    
    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    DispatchQueue.main.async {
                        self?.handleWebSocketMessage(text)
                    }
                case .data(let data):
                    // Handle binary data if needed
                    break
                @unknown default:
                    break
                }
                
                // Continue listening
                self?.receiveMessage()
                
            case .failure(let error):
                print("WebSocket error: \(error)")
            }
        }
    }
    
    private func handleWebSocketMessage(_ message: String) {
        // Parse JSON message and update appropriate data
        if let data = message.data(using: .utf8),
           let update = try? JSONDecoder().decode(RealtimeUpdate.self, from: data) {
            
            switch update.type {
            case "report_status_updated":
                NotificationCenter.default.post(
                    name: .reportStatusUpdated,
                    object: update.data
                )
            case "new_community_trend":
                NotificationCenter.default.post(
                    name: .communityTrendUpdated,
                    object: update.data
                )
            default:
                break
            }
        }
    }
    
    func disconnect() {
        webSocketTask?.cancel()
        webSocketTask = nil
    }
}
```
