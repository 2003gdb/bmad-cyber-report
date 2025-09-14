# High Level Frontend Architecture

## Technical Summary

SafeTrade employs a **modern client-server architecture** with native iOS client and web-based administrative interface. The iOS application uses **SwiftUI with MVVM pattern** for reactive UI development, while the admin portal leverages **Next.js with App Router** for optimal performance and SEO. Core architectural patterns include **Repository Pattern** for data access abstraction, **Service Layer Architecture** for API communication, and **State Management** using Combine (iOS) and Zustand (Next.js). This architecture directly supports the PRD goals by enabling seamless anonymous and authenticated reporting flows, real-time community intelligence, and comprehensive administrative oversight with consistent Spanish localization.

## High Level Frontend Overview

**Architectural Style:** Component-Based Architecture with Service Layer Pattern
- SwiftUI views with ViewModel binding for reactive iOS development
- Next.js components with custom hooks for state management and API integration
- Shared service layers for API communication and data transformation

**State Management Strategy:**
- **iOS:** Combine framework with @StateObject and @ObservedObject for reactive data binding
- **Admin Portal:** Zustand for global state management with React Query for server state caching
- **Shared Patterns:** Repository pattern abstracts API calls from UI components

**Authentication Integration:**
- JWT token storage and management across both platforms
- Automatic token refresh with seamless user experience
- Triple authentication support: anonymous access, user authentication, and admin authentication

**Primary User Interaction Flows:**
1. **Mobile Entry:** App launch → Authentication choice (anonymous/register/login) → Report creation → Community trends → Victim support
2. **Admin Flow:** Login → Dashboard overview → Report management → Investigation workflows → Analytics insights
3. **Data Synchronization:** Real-time updates for community trends and report status changes

## Frontend Architecture Diagram

```mermaid
graph TB
    subgraph "iOS Mobile App - SwiftUI"
        subgraph "Views Layer"
            AuthViews[Authentication Views<br/>Login/Register/Anonymous]
            ReportViews[Reporting Views<br/>Form/Attachments/Confirmation]
            CommunityViews[Community Views<br/>Trends/Recommendations/Support]
            ProfileViews[Profile Views<br/>History/Settings]
        end
        
        subgraph "ViewModels Layer (MVVM)"
            AuthVM[AuthViewModel<br/>@StateObject]
            ReportVM[ReportingViewModel<br/>@StateObject]
            CommunityVM[CommunityViewModel<br/>@StateObject]
        end
        
        subgraph "Services Layer"
            APIService[APIService<br/>HTTP Client]
            AuthService[AuthService<br/>JWT Management]
            ReportService[ReportingService<br/>Business Logic]
            CommunityService[CommunityService<br/>Data Processing]
        end
        
        subgraph "Data Layer"
            Models[Data Models<br/>Codable Structs]
            KeychainManager[Keychain Manager<br/>Secure Storage]
            UserDefaults[UserDefaults<br/>App Preferences]
        end
    end
    
    subgraph "Next.js Admin Portal"
        subgraph "Pages Layer (App Router)"
            LoginPage[Login Page<br/>Admin Authentication]
            DashboardPage[Dashboard<br/>Metrics & Overview]
            ReportsPage[Reports Management<br/>Search/Filter/Details]
            AnalyticsPage[Analytics<br/>Charts & Insights]
        end
        
        subgraph "Components Layer"
            AuthComponents[Auth Components<br/>LoginForm/ProtectedRoute]
            ReportComponents[Report Components<br/>List/Details/StatusUpdate]
            DashboardComponents[Dashboard Components<br/>MetricsCard/RecentReports]
            SharedComponents[Shared Components<br/>Layout/Navigation/Loading]
        end
        
        subgraph "Hooks & State"
            CustomHooks[Custom Hooks<br/>useAuth/useReports/useAnalytics]
            ZustandStore[Zustand Store<br/>Global State]
            ReactQuery[React Query<br/>Server State Cache]
        end
        
        subgraph "Services & Utils"
            APIClient[API Client<br/>Axios/Fetch]
            AuthUtils[Auth Utils<br/>Token Management]
            TypeDefs[TypeScript Types<br/>Shared Interfaces]
        end
    end
    
    subgraph "Backend Integration"
        NestJSAPI[NestJS REST API<br/>Triple Authentication]
    end
    
    AuthViews --> AuthVM
    ReportViews --> ReportVM
    CommunityViews --> CommunityVM
    
    AuthVM --> AuthService
    ReportVM --> ReportService
    CommunityVM --> CommunityService
    
    AuthService --> APIService
    ReportService --> APIService
    CommunityService --> APIService
    
    APIService --> Models
    AuthService --> KeychainManager
    
    LoginPage --> AuthComponents
    DashboardPage --> DashboardComponents
    ReportsPage --> ReportComponents
    
    AuthComponents --> CustomHooks
    ReportComponents --> CustomHooks
    DashboardComponents --> CustomHooks
    
    CustomHooks --> ZustandStore
    CustomHooks --> ReactQuery
    CustomHooks --> APIClient
    
    APIClient --> AuthUtils
    APIService --> NestJSAPI
    APIClient --> NestJSAPI
    
    classDef ios fill:#A1CDF4
    classDef nextjs fill:#25283D,color:#fff
    classDef backend fill:#F5853F
    
    class AuthViews,ReportViews,CommunityViews,ProfileViews,AuthVM,ReportVM,CommunityVM,APIService,AuthService,ReportService,CommunityService,Models,KeychainManager,UserDefaults ios
    class LoginPage,DashboardPage,ReportsPage,AnalyticsPage,AuthComponents,ReportComponents,DashboardComponents,SharedComponents,CustomHooks,ZustandStore,ReactQuery,APIClient,AuthUtils,TypeDefs nextjs
    class NestJSAPI backend
```
