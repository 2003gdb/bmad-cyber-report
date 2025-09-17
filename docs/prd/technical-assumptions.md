# Technical Assumptions

## Repository Structure: Monorepo

**Rationale:** Single semester academic project with small development team benefits from unified codebase management. Monorepo approach enables shared configuration, documentation, and deployment scripts while maintaining clear separation between iOS app, backend API, and database schema components.

## Service Architecture

**Decision:** Monolithic backend API with microservice-ready modular design within Node.js NestJS framework.

**Rationale:** For MVP scope and academic timeline, monolithic approach provides development velocity and simplified deployment. However, internal module separation (authentication, reporting, analytics, community validation) prepares for future microservices migration as community scales beyond academic project scope.

## Testing Requirements

**Decision:** Unit testing + Integration testing with emphasis on API endpoint testing and core business logic validation.

**Rationale:** Academic timeline requires focused testing strategy. Unit tests for critical business logic (report validation, community scoring, JWT authentication) and integration tests for API endpoints ensure core functionality reliability. End-to-end testing deferred to post-MVP given development resource constraints.

## Additional Technical Assumptions and Requests

**Frontend Technology Stack:**
- **iOS Native:** Swift 5.5+ with SwiftUI for modern declarative UI development, targeting iOS 14+ for broad device compatibility
- **Web Portal:** React.js with TypeScript for type safety and developer productivity, responsive design using CSS Grid/Flexbox

**Backend Technology Stack:**
- **API Framework:** Node.js 18+ with Nest.js using modular repository pattern (Controller → Service → Repository)
- **Authentication:** Triple JWT-based token system (anonymous, user, admin) with salt-enhanced password security
- **Database Access:** Direct MySQL queries using mysql2/promise with connection pooling for optimal performance

**Database and Infrastructure:**
- **Database:** Self-hosted MySQL 8.0+ with encrypted storage at rest and automated backup procedures
- **Hosting:** Self-hosted on-premises or private cloud deployment for data sovereignty and cost control
- **SSL/TLS:** Let's Encrypt certificates for HTTPS everywhere with automatic renewal

**Development and Deployment:**
- **Version Control:** Git with feature branch workflow and code review requirements
- **CI/CD:** GitHub Actions or GitLab CI for automated testing and deployment pipelines
- **Environment Management:** Development, Staging, Production environment separation with configuration management
- **Monitoring:** Basic logging and error tracking (Winston for Node.js, native iOS crash reporting)

**Security Considerations:**
- **Data Encryption:** AES-256 encryption for sensitive data, bcrypt for password hashing, secure JWT implementation
- **Input Validation:** Comprehensive server-side validation for all API endpoints preventing SQL injection and XSS
- **Rate Limiting:** API rate limiting to prevent abuse and ensure service availability
- **CORS Configuration:** Restrictive CORS policy limiting frontend domain access

**Spanish Localization Requirements:**
- **Content Language:** All user interfaces, labels, messages, and content written directly in Spanish without internationalization frameworks
- **Implementation:** Hard-coded Spanish text in UI components and database content
- **Spanish Endpoints:** Module names and API paths use Spanish (`/reportes`, `/comunidad/tendencias`)
- **Database Localization:** MySQL ENUM values and table names use Spanish where appropriate
- **No Special Tools:** Standard development without i18n libraries or translation management systems

**Implementation Architecture Updates:**
- **Module Structure:** Spanish module names (ReportesModule, ComunidadModule) for incident reporting and community features
- **Service Reuse:** AdminModule imports and reuses existing UsersService and ReportesService following DRY principles
- **Repository Pattern:** Clean Controller → Service → Repository separation with direct MySQL queries
- **Anonymous Access:** Friction-free reporting without authentication requirements using AnonymousAuthGuard
