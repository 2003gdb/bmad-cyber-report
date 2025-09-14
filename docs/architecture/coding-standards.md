# Coding Standards

**IMPORTANT NOTE:** These standards are MANDATORY for AI agents and directly control code generation behavior. They focus on project-specific conventions and critical rules to prevent bad code, assuming AI knows general best practices.

## Core Standards
- **Languages & Runtimes:** TypeScript 5.2.0 for backend/admin, Swift 5.8+ for iOS - strict typing enabled, no `any` types except for third-party integration
- **Style & Linting:** ESLint 8.44.0 + Prettier 3.0.0 for TS/JS code, SwiftLint for iOS - automatic formatting on save required
- **Test Organization:** `*.spec.ts` for unit tests alongside source files, `*.e2e-spec.ts` in test/ directory, `*Tests.swift` in iOS test targets

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| API Endpoints | Spanish resources, kebab-case | `/reportes`, `/tendencias-comunidad` |
| Database Tables | PascalCase, English | `Reports`, `ReportAttachments` |
| TypeScript Classes | PascalCase | `ReportingService`, `AuthController` |
| TypeScript Methods | camelCase | `createReport()`, `validateToken()` |
| Swift Classes/Structs | PascalCase | `ReportViewModel`, `AuthService` |
| Swift Properties | camelCase | `reportId`, `attackType` |
| Environment Variables | UPPER_SNAKE_CASE | `DB_PASSWORD`, `JWT_SECRET` |

## Critical Rules

- **Spanish Error Messages Only:** All user-facing error messages MUST be in Spanish - never return English error text to mobile or admin interfaces
- **Anonymous Report Privacy:** NEVER log user_id, email, or personal data for reports where is_anonymous=true - use 'anonymous' placeholder in logs
- **JWT Token Validation:** ALL protected endpoints MUST validate JWT tokens before processing - use NestJS Guards, never implement custom validation logic
- **File Upload Security:** NEVER accept file uploads without MIME type validation and size limits - use Multer configuration with strict file type checking
- **Database Transactions:** ALL multi-table operations MUST use database transactions - report creation with attachments requires transaction wrapper
- **Input Validation:** NEVER trust client input - use class-validator decorators on all DTOs with Spanish error messages
- **Password Handling:** NEVER store plain text passwords - use bcrypt with salt rounds >= 12 combined with unique per-user salts generated via crypto.randomBytes() for all password operations
- **SQL Injection Prevention:** NEVER use raw SQL queries - use Sequelize ORM with parameterized queries only
- **CORS Configuration:** NEVER use wildcard CORS in production - specify exact origins for iOS app and admin portal
- **Environment Variables:** NEVER commit .env files or hardcode secrets - use .env.example templates with placeholder values

## Language-Specific Guidelines

### TypeScript Specifics
- **Strict Mode:** Enable all TypeScript strict flags - noImplicitAny, strictNullChecks, strictFunctionTypes
- **Import Organization:** Use absolute imports with path mapping - `@/shared/utils` instead of relative paths
- **Error Handling:** Use Result<T, E> pattern for operations that can fail - avoid throwing exceptions in business logic
- **Type Definitions:** Create shared types in `/shared/types` - never duplicate type definitions across packages

### Swift Specifics  
- **SwiftUI Patterns:** Use @StateObject for view model ownership, @ObservedObject for passed dependencies
- **Async/Await:** Use structured concurrency - avoid completion handlers for new code
- **Error Handling:** Use Result<Success, Failure> and do-try-catch patterns - throw descriptive errors with Spanish messages
- **Memory Management:** Use weak references for delegates and closures to prevent retain cycles
