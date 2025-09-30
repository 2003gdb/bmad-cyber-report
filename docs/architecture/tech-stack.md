# Tech Stack

## Cloud Infrastructure
- **Provider:** Local/Self-hosted development environment
- **Key Services:** MySQL 8.0+ (local), Let's Encrypt SSL, local file storage
- **Deployment Regions:** Local development, single production deployment
- **Active Database:** `safetrade_dev2` (updated from `safetrade_dev`)

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Language** | TypeScript | 5.2.0 | Primary backend language | Strong typing, excellent tooling, NestJS requirement |
| **Runtime** | Node.js | 18.17.0 LTS | JavaScript runtime | LTS stability, NestJS compatibility, academic reliability |
| **Backend Framework** | NestJS | 10.2.0 | Enterprise API framework | Modular architecture, DI, TypeScript-first, scalable patterns |
| **Database** | MySQL | 8.0+ | Local development database | Open source, reliable, widely supported for academic projects |
| **Database Access** | mysql2/promise | 3.14.3 | Direct MySQL queries | Performance optimization, connection pooling, no ORM overhead |
| **Authentication** | JWT + bcrypt + crypto | jsonwebtoken@9.0.0, bcrypt@5.1.0, crypto (Node.js built-in) | Token-based auth with salt-enhanced security | Stateless sessions, anonymous + identified flows support, individual user salts |
| **iOS Framework** | SwiftUI | iOS 14+ | Native iOS development | Declarative UI, modern iOS patterns, starter template choice |
| **iOS Language** | Swift | 5.8+ | iOS development language | Native performance, type safety, Apple ecosystem integration |
| **Admin Framework** | Next.js | 13.4.0 | React-based admin portal | SSR/SSG capabilities, built-in optimization, starter template choice |
| **Admin Language** | TypeScript | 5.2.0 | Admin portal development | Type safety, consistent with backend, developer productivity |
| **File Upload** | Multer | 1.4.5-lts.1 | Photo upload handling | Disk storage, file validation, multipart/form-data support |
| **Testing Framework** | Jest + Supertest | jest@29.5.0, supertest@6.3.0 | Backend testing | NestJS integration, API testing, academic project standard |
| **iOS Testing** | XCTest | Built-in | iOS unit testing | Native iOS testing framework, integrated with Xcode |
| **Validation** | class-validator | 0.14.0 | Input validation | Decorator-based validation, TypeScript integration, security focus |
| **Logging** | Winston | 3.9.0 | Application logging | Structured logging, multiple transports, NestJS integration |
| **Development Tools** | ESLint + Prettier | eslint@8.44.0, prettier@3.0.0 | Code quality | Consistent formatting, error prevention, team collaboration |
| **Environment Config** | dotenv | 16.3.0 | Environment variable management | Team configuration consistency, secret management |

## Environment Configuration Strategy

**Local Development Setup:**
- **`.env.example`** - Template file committed to repo with all required variables (no sensitive values)
- **`.env`** - Local environment file (gitignored) each developer creates from template
- **Team shared values** - Database connection strings, API URLs documented in project README
- **Individual secrets** - JWT secrets, admin passwords generated per developer

**Configuration Categories:**
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=safetrade_dev2
DB_USER=root
DB_PASSWORD=[individual_password]

# JWT Configuration
JWT_SECRET=[individual_secret_256_chars]
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=[individual_refresh_secret_256_chars]

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes

# Application Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1  # NOT USED - routes are at root level

# CORS Configuration (Development)
ADMIN_PORTAL_URL=http://localhost:3001
IOS_APP_URL=safetrade://
```

## Implementation Architecture

**Database Strategy:**
- **Direct MySQL Queries**: Using `mysql2/promise` with connection pooling (10 connections)
- **Repository Pattern**: Controller → Service → Repository for clean separation
- **No ORM Overhead**: Direct SQL queries for optimal performance
- **MySQL Connection Pool**: Global DbService for efficient connection management
- **Normalized Schema**: Catalog tables (attack_types, impacts, status) with foreign keys
- **Active Database**: `safetrade_dev2`

**Authentication Implementation:**
- **Triple Authentication System**:
  - AnonymousAuthGuard: Allows unauthenticated report submission
  - JwtAuthGuard: Validates user JWT tokens
  - AdminAuthGuard: Validates admin JWT tokens (separate from user tokens)
- **Separate Admin Table**: `admins` table isolated from regular `users` for security
- **Spanish Endpoints**: `/reportes`, `/comunidad`, `/admin` for localization
- **Module Reuse**: AdminModule imports and reuses UsersService and ReportesService

**File Upload Implementation:**
- **Upload Endpoint**: `POST /reportes/upload-photo` (separate from report creation)
- **Storage Location**: `/public/uploads/` directory (served as static files)
- **Multer Configuration**: Disk storage with file validation
- **Supported Formats**: JPEG, PNG, HEIC, HEIF (MIME type validation)
- **Filename Generation**: `timestamp-uuid.extension` pattern for uniqueness
- **Max File Size**: 10MB (configurable)
- **URL Pattern**: Returns relative path (e.g., `/uploads/1234567890-abc.jpg`)
- **Two-Step Process**: Upload photo first, then include URL in report submission

**Spanish Localization:**
- **Module Names**: `reportes/`, `comunidad/` for incident reporting and community features
- **Catalog Values**: Spanish strings for attack types, impacts, and statuses
- **API Responses**: All error messages, validation messages, and responses in Spanish
- **DTOs**: Spanish validation messages throughout with class-validator
- **Victim Support**: Context-aware recommendations in Spanish

**API Communication Standards:**
- **No Global Prefix**: All routes at root level (no `/api/v1` prefix despite env variable)
- **JSON Endpoints**: Authentication, data retrieval, report creation use application/json
- **File Upload Endpoints**: Photo upload uses multipart/form-data
- **Consistent Response Format**: All endpoints return standardized JSON responses
- **CORS Configuration**: Allows admin portal (localhost:3001) and iOS app (safetrade://)

**Catalog Mapping System:**
- **CatalogMappingService**: Bidirectional conversion between database IDs and string values
- **Database Storage**: Integer foreign keys (e.g., `attack_type: 1`)
- **API Interface**: String values for compatibility (e.g., `attack_type: "email"`)
- **Automatic Conversion**: Repositories handle transformation transparently
- **Centralized Management**: Single source of truth for catalog data

This tech stack supports SafeTrade's cybersecurity incident reporting requirements with performance-optimized MySQL queries, comprehensive Spanish localization, and production-ready photo upload capabilities.
