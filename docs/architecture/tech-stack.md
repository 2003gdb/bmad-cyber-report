# Tech Stack

## Cloud Infrastructure
- **Provider:** Local/Self-hosted development environment
- **Key Services:** MySQL (local), Let's Encrypt SSL, local file storage
- **Deployment Regions:** Local development, single production deployment

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Language** | TypeScript | 5.2.0 | Primary backend language | Strong typing, excellent tooling, NestJS requirement |
| **Runtime** | Node.js | 18.17.0 LTS | JavaScript runtime | LTS stability, NestJS compatibility, academic reliability |
| **Backend Framework** | NestJS | 10.2.0 | Enterprise API framework | Modular architecture, DI, TypeScript-first, scalable patterns |
| **Database** | MySQL | 8.0+ | Local development database | Open source, reliable, widely supported for academic projects |
| **Database ORM** | Sequelize | 6.32.0 | MySQL integration | Migration support, TypeScript definitions, query optimization |
| **Authentication** | JWT + bcrypt + crypto | jsonwebtoken@9.0.0, bcrypt@5.1.0, crypto (Node.js built-in) | Token-based auth with salt-enhanced security | Stateless sessions, anonymous + identified flows support, individual user salts |
| **iOS Framework** | SwiftUI | iOS 14+ | Native iOS development | Declarative UI, modern iOS patterns, starter template choice |
| **iOS Language** | Swift | 5.8+ | iOS development language | Native performance, type safety, Apple ecosystem integration |
| **Admin Framework** | Next.js | 13.4.0 | React-based admin portal | SSR/SSG capabilities, built-in optimization, starter template choice |
| **Admin Language** | TypeScript | 5.2.0 | Admin portal development | Type safety, consistent with backend, developer productivity |
| **Testing Framework** | Jest + Supertest | jest@29.5.0, supertest@6.3.0 | Backend testing | NestJS integration, API testing, academic project standard |
| **iOS Testing** | XCTest | Built-in | iOS unit testing | Native iOS testing framework, integrated with Xcode |
| **File Upload** | Multer | 1.4.5 | Secure file handling | NestJS compatibility, validation support, local storage |
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
DB_NAME=safetrade_dev
DB_USER=root
DB_PASSWORD=[individual_password]

# JWT Configuration  
JWT_SECRET=[individual_secret]
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=[individual_refresh_secret]

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Application Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
```
