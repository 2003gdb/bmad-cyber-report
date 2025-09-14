# Security

**MANDATORY security requirements for AI and human developers - these rules directly impact code generation and implementation decisions.**

## Input Validation
- **Validation Library:** class-validator 0.14.0 with Spanish error messages for consistent user experience
- **Validation Location:** All validation at API boundary before business logic processing - never trust client input
- **Required Rules:**
  - All external inputs MUST be validated using class-validator decorators on DTOs
  - Validation at API boundary before processing - implement validation pipes in NestJS controllers
  - Whitelist approach preferred over blacklist - explicitly allow known good inputs rather than blocking known bad

## Authentication & Authorization
- **Auth Method:** JWT-based stateless authentication with bcrypt password hashing using individual salts and refresh token rotation
- **Session Management:** Stateless JWT tokens with 1-hour expiry and refresh token system for extended sessions
- **Required Patterns:**
  - NEVER store passwords in plain text - use bcrypt with minimum 12 salt rounds combined with unique per-user salts
  - Generate cryptographically secure random salts using crypto.randomBytes() for each user during registration
  - Store individual salts in database alongside password hashes for enhanced security
  - ALL protected endpoints MUST validate JWT tokens using NestJS Guards before processing
  - Triple authentication support: anonymous access, user JWT tokens, admin JWT tokens with role-based access

## Secrets Management
- **Development:** .env files with individual secrets per developer - never commit secrets to repository
- **Production:** Environment variables injected at runtime - no hardcoded secrets in codebase
- **Code Requirements:**
  - NEVER hardcode secrets, API keys, or sensitive configuration in source code
  - Access via configuration service only - use NestJS ConfigModule with validation
  - No secrets in logs or error messages - sanitize all logging output

## API Security
- **Rate Limiting:** 100 requests per minute per IP address using @nestjs/throttler to prevent abuse
- **CORS Policy:** Restrictive CORS allowing only iOS app and admin portal origins - never use wildcard in production
- **Security Headers:** Helmet.js middleware for security headers including CSP, HSTS, and X-Frame-Options
- **HTTPS Enforcement:** All connections must use HTTPS in production - redirect HTTP to HTTPS automatically

## Data Protection
- **Encryption at Rest:** MySQL encryption at rest for database files
- **Encryption in Transit:** HTTPS/TLS 1.3 for all API communication with automatic certificate renewal
- **PII Handling:** Anonymous reports must never log or expose personal identifiers - use 'anonymous' placeholder
- **Logging Restrictions:** Never log passwords, JWT tokens, personal data, or sensitive business information

## Dependency Security
- **Scanning Tool:** npm audit for vulnerability scanning with monthly dependency updates
- **Update Policy:** Monthly security updates for dependencies - immediate updates for critical vulnerabilities
- **Approval Process:** Review all new dependencies for security reputation and maintenance status

## Security Testing
- **SAST Tool:** ESLint security rules and SonarQube for static analysis of security vulnerabilities
- **DAST Tool:** Manual security testing checklist for SQL injection, XSS, and authentication bypass
- **Penetration Testing:** Academic security assessment focusing on JWT validation, file upload security, and API authorization
