# SafeTrade iOS App

SwiftUI application for the SafeTrade cybersecurity reporting platform.

## Requirements

- iOS 14.0+ 
- Xcode 14.0+
- Swift 5.8+

## Setup

**Note**: This project structure has been created programmatically. To complete the iOS setup:

1. **Create Xcode Project**: 
   - Open Xcode
   - Create new project: iOS App
   - Name: "SafeTrade"  
   - Interface: SwiftUI
   - Language: Swift
   - Save in: `packages/mobile/SafeTrade/`

2. **Import Source Files**:
   - Copy the Swift files from the created structure into your Xcode project
   - Organize them according to the folder structure in the project navigator

3. **Configure Build Settings**:
   - Deployment Target: iOS 14.0
   - Swift Language Version: Swift 5
   - Enable SwiftLint if available

## Architecture

The app follows MVVM pattern with SwiftUI:

- **App/**: Application lifecycle and main content view
- **Views/**: SwiftUI views organized by feature
  - Auth/: Authentication screens
  - Reporting/: Report creation and management
  - Community/: Community trends and analytics
  - Profile/: User profile and report history
- **Models/**: Data models matching backend API
- **Services/**: API communication layer
- **ViewModels/**: MVVM view models with @StateObject/@ObservedObject
- **Utils/**: Utilities and constants
- **Resources/**: Assets, localizations, etc.

## Key Features to Implement

- User authentication (login/register/anonymous)
- Incident reporting with file uploads
- Community trends and recommendations  
- Spanish localization
- Secure API communication
- Anonymous report privacy protection

## Testing

- Unit tests in `SafeTradeTests/`
- Use XCTest framework
- Test naming convention: `*Tests.swift`

## Notes

- All user-facing text should be in Spanish
- API endpoints use Spanish names (/reportes, /tendencias-comunidad)
- Anonymous reports must not leak personal information
- Use structured concurrency (async/await) for network calls
- Follow SwiftLint guidelines for code formatting