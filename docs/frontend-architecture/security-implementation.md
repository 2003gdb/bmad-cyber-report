# Security Implementation

## JWT Token Management

### iOS Keychain Security
```swift
import KeychainAccess

class SecureTokenStorage {
    private let keychain = Keychain(service: "com.safetrade.tokens")
        .accessibility(.whenUnlockedThisDeviceOnly)
        .synchronizable(false)
    
    func storeAccessToken(_ token: String) throws {
        try keychain.set(token, key: "access_token")
    }
    
    func storeRefreshToken(_ token: String) throws {
        try keychain.set(token, key: "refresh_token")
    }
    
    func getAccessToken() -> String? {
        return try? keychain.get("access_token")
    }
    
    func getRefreshToken() -> String? {
        return try? keychain.get("refresh_token")
    }
    
    func clearAllTokens() {
        try? keychain.removeAll()
    }
    
    // Automatic token refresh
    func refreshTokenIfNeeded() async throws {
        guard let refreshToken = getRefreshToken() else {
            throw AuthError.noRefreshToken
        }
        
        let response = try await apiService.refreshToken(refreshToken)
        try storeAccessToken(response.accessToken)
        try storeRefreshToken(response.refreshToken)
    }
}
```

### Next.js Secure Storage
```typescript
// lib/tokenStorage.ts
class SecureTokenStorage {
  private readonly ACCESS_TOKEN_KEY = 'safetrade_access_token'
  private readonly REFRESH_TOKEN_KEY = 'safetrade_refresh_token'
  
  storeTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return
    
    // Store in httpOnly cookie for maximum security (requires API endpoint)
    this.setHttpOnlyCookie('access_token', accessToken)
    this.setHttpOnlyCookie('refresh_token', refreshToken)
    
    // Fallback to sessionStorage for development
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }
  
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY)
  }
  
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
  }
  
  clearTokens() {
    if (typeof window === 'undefined') return
    
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY)
    
    // Clear httpOnly cookies
    this.clearHttpOnlyCookie('access_token')
    this.clearHttpOnlyCookie('refresh_token')
  }
  
  private setHttpOnlyCookie(name: string, value: string) {
    // Implementation would use Next.js API route to set httpOnly cookie
    fetch('/api/auth/set-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value })
    })
  }
}
```

## Input Validation and Sanitization

### Client-Side Validation
```swift
// iOS Form Validation
struct ReportFormValidator {
    static func validateReportForm(_ form: ReportForm) throws {
        // Required field validation
        guard !form.attackOrigin.trimmingCharacters(in: .whitespaces).isEmpty else {
            throw ValidationError.missingRequiredField("Origen del ataque es requerido")
        }
        
        // Email validation
        if form.attackType == .email {
            guard form.attackOrigin.isValidEmail else {
                throw ValidationError.invalidEmail("Formato de email inválido")
            }
        }
        
        // Phone number validation
        if form.attackType == .llamada || form.attackType == .sms {
            guard form.attackOrigin.isValidPhoneNumber else {
                throw ValidationError.invalidPhoneNumber("Formato de teléfono inválido")
            }
        }
        
        // URL validation
        if let url = form.suspiciousUrl, !url.isEmpty {
            guard url.isValidURL else {
                throw ValidationError.invalidURL("URL inválida")
            }
        }
        
        // File size validation
        let totalSize = form.attachments.reduce(0) { $0 + $1.size }
        guard totalSize <= 50_000_000 else { // 50MB limit
            throw ValidationError.fileSizeExceeded("El tamaño total de archivos excede 50MB")
        }
    }
}
```

```typescript
// Next.js Form Validation with React Hook Form
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const reportStatusUpdateSchema = z.object({
  status: z.enum(['nuevo', 'revisado', 'en_investigacion', 'cerrado'], {
    errorMap: () => ({ message: 'Estado de reporte inválido' })
  }),
  notes: z.string()
    .min(10, 'Las notas deben tener al menos 10 caracteres')
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
})

export function useStatusUpdateForm(reportId: string) {
  const form = useForm<StatusUpdateFormData>({
    resolver: zodResolver(reportStatusUpdateSchema),
    defaultValues: {
      status: 'nuevo',
      notes: ''
    }
  })
  
  const updateMutation = useUpdateReportStatus()
  
  const onSubmit = async (data: StatusUpdateFormData) => {
    try {
      await updateMutation.mutateAsync({
        reportId,
        ...data
      })
      // Success handling
    } catch (error) {
      const errorMessage = handleAPIError(error)
      form.setError('root', { message: errorMessage })
    }
  }
  
  return { form, onSubmit, isLoading: updateMutation.isLoading }
}
```

## File Upload Security

### iOS Secure File Handling
```swift
class SecureFileUploader {
    private let allowedMimeTypes = [
        "image/jpeg", "image/png", "image/heic",
        "application/pdf", "text/plain"
    ]
    
    private let maxFileSize: Int64 = 10_000_000 // 10MB
    
    func validateAndPrepareFile(_ fileData: Data, fileName: String) throws -> AttachmentData {
        // File size validation
        guard fileData.count <= maxFileSize else {
            throw FileUploadError.fileSizeExceeded("Archivo demasiado grande (máximo 10MB)")
        }
        
        // MIME type validation
        let mimeType = getMimeType(from: fileData)
        guard allowedMimeTypes.contains(mimeType) else {
            throw FileUploadError.unsupportedFileType("Tipo de archivo no permitido")
        }
        
        // Image compression for large images
        var processedData = fileData
        if mimeType.hasPrefix("image/"), fileData.count > 2_000_000 {
            processedData = try compressImage(fileData, quality: 0.7)
        }
        
        // Generate secure filename
        let secureFileName = generateSecureFileName(originalName: fileName)
        
        return AttachmentData(
            data: processedData,
            fileName: secureFileName,
            mimeType: mimeType,
            size: processedData.count
        )
    }
    
    private func getMimeType(from data: Data) -> String {
        // Implement MIME type detection based on file signature
        var c: UInt8 = 0
        data.copyBytes(to: &c, count: 1)
        
        switch c {
        case 0xFF: return "image/jpeg"
        case 0x89: return "image/png"
        case 0x25: return "application/pdf"
        default: return "application/octet-stream"
        }
    }
    
    private func compressImage(_ imageData: Data, quality: CGFloat) throws -> Data {
        guard let image = UIImage(data: imageData),
              let compressedData = image.jpegData(compressionQuality: quality) else {
            throw FileUploadError.compressionFailed("Error al comprimir imagen")
        }
        return compressedData
    }
    
    private func generateSecureFileName(originalName: String) -> String {
        let uuid = UUID().uuidString
        let extension = URL(fileURLWithPath: originalName).pathExtension
        return "\(uuid).\(extension)"
    }
}
```
