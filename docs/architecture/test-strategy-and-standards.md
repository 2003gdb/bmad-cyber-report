# Test Strategy and Standards

## Testing Philosophy
- **Approach:** Test-After Development (TAD) with emphasis on critical business logic and API endpoint coverage
- **Coverage Goals:** 80% unit test coverage for services and controllers, 90% coverage for authentication and security modules
- **Test Pyramid:** 70% unit tests, 25% integration tests, 5% end-to-end tests optimized for academic timeline constraints

## Test Types and Organization

### Unit Tests
- **Framework:** Jest 29.5.0 with @nestjs/testing utilities for dependency injection testing
- **File Convention:** `*.spec.ts` files alongside source code (e.g., `auth.service.spec.ts` next to `auth.service.ts`)
- **Location:** Same directory as source files for easy navigation and maintenance
- **Mocking Library:** Jest built-in mocking with custom factory functions for SafeTrade entities
- **Coverage Requirement:** 80% minimum line coverage, 90% for critical security modules

**AI Agent Requirements:**
- Generate tests for all public methods in services and controllers
- Cover edge cases and error conditions (invalid JWT tokens, malformed report data, file upload failures)
- Include salt generation and password hashing tests for authentication security modules
- Test salt uniqueness and cryptographic randomness for user registration flows
- Follow AAA pattern (Arrange, Act, Assert) with descriptive test names in English
- Mock all external dependencies (database, file system, external APIs)

### Integration Tests
- **Scope:** API endpoint testing with real database connections and file upload handling
- **Location:** `test/` directory in backend package with descriptive filenames
- **Test Infrastructure:**
  - **Database:** In-memory SQLite for fast test execution, or Docker MySQL container for production-like testing
  - **File Storage:** Temporary directory with automatic cleanup after test completion
  - **Authentication:** Test JWT tokens generated with known secrets for consistent testing, test salt-based password hashing flows

### End-to-End Tests
- **Framework:** Detox for iOS end-to-end testing with device simulators
- **Scope:** Critical user journeys - anonymous reporting, user registration/login, community trends viewing
- **Environment:** iOS Simulator with backend running in Docker container for realistic testing
- **Test Data:** Seeded database with predictable test scenarios and clean state between tests

## Test Data Management
- **Strategy:** Factory pattern for generating test entities with realistic Spanish content
- **Fixtures:** Predefined test files (sample screenshots, malicious URLs) in `test/fixtures/` directory
- **Factories:** TypeScript factory functions creating consistent test data across unit and integration tests
- **Cleanup:** Automatic database reset and file cleanup between test runs to prevent test contamination

## Continuous Testing
- **CI Integration:** Manual testing process for academic project - automated testing deferred to post-MVP
- **Performance Tests:** Simple load testing with artillery.js to verify <2s response time requirements
- **Security Tests:** Manual security testing checklist focusing on JWT validation, file upload security, and SQL injection prevention
