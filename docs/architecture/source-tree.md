# Source Tree

```
safetrade-monorepo/
├── packages/
│   ├── backend/                           # NestJS API Server
│   │   ├── src/
│   │   │   ├── auth/                      # AuthModule
│   │   │   │   ├── auth.controller.ts     # Login/register endpoints
│   │   │   │   ├── auth.service.ts        # JWT token logic
│   │   │   │   ├── auth.module.ts         # Module definition
│   │   │   │   ├── guards/                # JWT guards
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   ├── admin.guard.ts
│   │   │   │   │   └── anonymous.guard.ts
│   │   │   │   ├── strategies/            # Passport strategies
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── admin-jwt.strategy.ts
│   │   │   │   └── dto/                   # Data transfer objects
│   │   │   │       ├── login.dto.ts
│   │   │   │       └── register.dto.ts
│   │   │   ├── reporting/                 # ReportingModule
│   │   │   │   ├── reporting.controller.ts
│   │   │   │   ├── reporting.service.ts
│   │   │   │   ├── reporting.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-report.dto.ts
│   │   │   │   │   └── update-status.dto.ts
│   │   │   │   ├── entities/              # Sequelize models
│   │   │   │   │   ├── report.entity.ts
│   │   │   │   │   └── report-attachment.entity.ts
│   │   │   │   └── services/
│   │   │   │       ├── file-upload.service.ts
│   │   │   │       └── validation.service.ts
│   │   │   ├── community/                 # CommunityModule
│   │   │   │   ├── community.controller.ts
│   │   │   │   ├── community.service.ts
│   │   │   │   ├── community.module.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── trends.service.ts
│   │   │   │   │   ├── recommendations.service.ts
│   │   │   │   │   └── analytics.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── community-trends.entity.ts
│   │   │   ├── admin/                     # AdminModule
│   │   │   │   ├── admin.controller.ts
│   │   │   │   ├── admin.service.ts
│   │   │   │   ├── admin.module.ts
│   │   │   │   ├── entities/
│   │   │   │   │   └── admin-user.entity.ts
│   │   │   │   └── dto/
│   │   │   │       ├── admin-login.dto.ts
│   │   │   │       └── report-filter.dto.ts
│   │   │   ├── shared/                    # Shared utilities
│   │   │   │   ├── database/
│   │   │   │   │   ├── database.module.ts
│   │   │   │   │   └── database.config.ts
│   │   │   │   ├── config/
│   │   │   │   │   ├── app.config.ts
│   │   │   │   │   └── jwt.config.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── logging.interceptor.ts
│   │   │   │   │   └── response.interceptor.ts
│   │   │   │   ├── pipes/
│   │   │   │   │   └── validation.pipe.ts
│   │   │   │   └── utils/
│   │   │   │       ├── file-upload.utils.ts
│   │   │   │       └── crypto.utils.ts       # Salt generation and password hashing utilities
│   │   │   ├── app.module.ts              # Root NestJS module
│   │   │   ├── app.controller.ts
│   │   │   └── main.ts                    # Application entry point
│   │   ├── test/                          # E2E tests
│   │   │   ├── auth.e2e-spec.ts
│   │   │   ├── reporting.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   ├── uploads/                       # File upload storage
│   │   │   ├── reports/                   # Report attachments
│   │   │   └── temp/                      # Temporary upload processing
│   │   ├── database/
│   │   │   ├── migrations/                # Sequelize migrations
│   │   │   │   ├── 001-create-users.js
│   │   │   │   ├── 002-create-reports.js
│   │   │   │   ├── 003-create-attachments.js
│   │   │   │   └── 004-create-admin-users.js
│   │   │   └── seeders/                   # Development test data
│   │   │       ├── admin-users.js
│   │   │       └── sample-reports.js
│   │   ├── .env.example                   # Environment template
│   │   ├── .env                          # Local environment (gitignored)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── README.md
│   │
│   ├── mobile/                           # iOS SwiftUI Application
│   │   ├── SafeTrade.xcodeproj/          # Xcode project
│   │   ├── SafeTrade/
│   │   │   ├── App/                      # App lifecycle
│   │   │   │   ├── SafeTradeApp.swift
│   │   │   │   ├── ContentView.swift
│   │   │   │   └── AppDelegate.swift
│   │   │   ├── Views/                    # SwiftUI Views
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── LoginView.swift
│   │   │   │   │   ├── RegisterView.swift
│   │   │   │   │   └── AnonymousChoiceView.swift
│   │   │   │   ├── Reporting/
│   │   │   │   │   ├── ReportFormView.swift
│   │   │   │   │   ├── AttachmentUploadView.swift
│   │   │   │   │   └── ReportConfirmationView.swift
│   │   │   │   ├── Community/
│   │   │   │   │   ├── TrendsView.swift
│   │   │   │   │   ├── RecommendationsView.swift
│   │   │   │   │   └── CommunityFeedView.swift
│   │   │   │   └── Profile/
│   │   │   │       ├── ProfileView.swift
│   │   │   │       └── ReportHistoryView.swift
│   │   │   ├── Models/                   # Data models
│   │   │   │   ├── User.swift           # Includes salt field for password security
│   │   │   │   ├── Report.swift
│   │   │   │   ├── TrendData.swift
│   │   │   │   └── AuthResponse.swift
│   │   │   ├── Services/                 # API communication
│   │   │   │   ├── APIService.swift
│   │   │   │   ├── AuthService.swift
│   │   │   │   ├── ReportingService.swift
│   │   │   │   └── CommunityService.swift
│   │   │   ├── ViewModels/              # MVVM pattern
│   │   │   │   ├── AuthViewModel.swift
│   │   │   │   ├── ReportingViewModel.swift
│   │   │   │   └── CommunityViewModel.swift
│   │   │   ├── Utils/                   # Utilities
│   │   │   │   ├── Constants.swift
│   │   │   │   ├── Extensions.swift
│   │   │   │   └── NetworkManager.swift
│   │   │   └── Resources/               # Assets
│   │   │       ├── Assets.xcassets/
│   │   │       ├── Colors.xcassets/
│   │   │       └── Localizable.strings  # Spanish localization
│   │   ├── SafeTradeTests/              # Unit tests
│   │   │   ├── AuthTests.swift
│   │   │   ├── ReportingTests.swift
│   │   │   └── CommunityTests.swift
│   │   └── README.md
│   │
│   └── admin-portal/                     # Next.js Admin Web Interface
│       ├── src/
│       │   ├── app/                      # App Router (Next.js 13+)
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   ├── dashboard/
│       │   │   │   └── page.tsx
│       │   │   ├── reports/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx
│       │   │   ├── analytics/
│       │   │   │   └── page.tsx
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/               # React components
│       │   │   ├── auth/
│       │   │   │   └── LoginForm.tsx
│       │   │   ├── dashboard/
│       │   │   │   ├── MetricsCard.tsx
│       │   │   │   └── RecentReports.tsx
│       │   │   ├── reports/
│       │   │   │   ├── ReportsList.tsx
│       │   │   │   ├── ReportDetails.tsx
│       │   │   │   ├── StatusUpdate.tsx
│       │   │   │   └── SearchFilter.tsx
│       │   │   ├── analytics/
│       │   │   │   ├── TrendChart.tsx
│       │   │   │   └── AttackTypeChart.tsx
│       │   │   └── shared/
│       │   │       ├── Layout.tsx
│       │   │       ├── Navigation.tsx
│       │   │       └── LoadingSpinner.tsx
│       │   ├── lib/                     # Utilities
│       │   │   ├── api.ts              # API client
│       │   │   ├── auth.ts             # Auth utilities
│       │   │   └── utils.ts
│       │   ├── types/                  # TypeScript types
│       │   │   ├── Report.ts
│       │   │   ├── User.ts             # Includes salt field for backend models
│       │   │   └── Analytics.ts
│       │   └── styles/                 # CSS styles
│       │       ├── globals.css
│       │       └── components.css
│       ├── public/                     # Static assets
│       ├── .env.local.example
│       ├── .env.local                 # Local environment (gitignored)
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.js         # CSS framework
│       ├── next.config.js
│       └── README.md
│
├── shared/                            # Shared Types and Utilities
│   ├── types/                         # TypeScript definitions
│   │   ├── api-responses.ts          # Common API response types
│   │   ├── report.types.ts           # Report-related types
│   │   └── auth.types.ts             # Authentication types
│   ├── constants/                    # Shared constants
│   │   ├── attack-types.ts
│   │   ├── impact-levels.ts
│   │   └── api-endpoints.ts
│   └── utils/                        # Common utilities
│       ├── validation.ts
│       └── date-utils.ts
│
├── scripts/                          # Monorepo management
│   ├── setup.sh                     # Initial project setup
│   ├── dev.sh                       # Start all development servers
│   ├── build.sh                     # Build all packages
│   └── test.sh                      # Run all tests
│
├── docs/                            # Project documentation
│   ├── api/                         # API documentation
│   │   └── openapi.yaml
│   ├── architecture.md              # This document
│   ├── prd.md                       # Product requirements
│   └── setup-guide.md               # Development setup
│
├── .gitignore                       # Git ignore patterns
├── package.json                     # Root package.json (workspaces)
├── lerna.json                       # Monorepo configuration
├── README.md                        # Project overview
└── LICENSE
```
