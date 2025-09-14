# Error Handling Strategy

## General Approach
- **Error Model:** NestJS Exception Filters with structured error responses and Spanish localization
- **Exception Hierarchy:** Built-in HTTP exceptions extended with custom business logic exceptions
- **Error Propagation:** Centralized error handling with consistent API responses and proper HTTP status codes

## Logging Standards
- **Library:** Winston 3.9.0 with structured JSON logging and multiple transports
- **Format:** JSON structured logs with timestamp, level, message, and contextual metadata
- **Levels:** ERROR (system failures), WARN (recoverable issues), INFO (user actions), DEBUG (development only)
- **Required Context:**
  - Correlation ID: UUID v4 format generated per request for request tracing
  - Service Context: Module name, controller, method for debugging location
  - User Context: Anonymized user identifier or 'anonymous' for privacy compliance

## Error Handling Patterns

### External API Errors
- **Retry Policy:** Exponential backoff (1s, 2s, 4s) with maximum 3 attempts for transient failures
- **Circuit Breaker:** Open circuit after 5 consecutive failures, half-open retry after 30 seconds
- **Timeout Configuration:** 5 second timeout for API calls, 10 seconds for file operations
- **Error Translation:** Map external service errors to SafeTrade business exceptions with Spanish messages

### Business Logic Errors
- **Custom Exceptions:** SafeTradeException, InvalidReportException, UnauthorizedAccessException with Spanish error messages
- **User-Facing Errors:** Structured response format with actionable guidance and Spanish localization
- **Error Codes:** Hierarchical error code system (AUTH_001, REPORT_002) for precise error identification

### Data Consistency
- **Transaction Strategy:** Database transactions for multi-table operations with automatic rollback on failures
- **Compensation Logic:** Saga pattern for file uploads - rollback file storage if database save fails
- **Idempotency:** UUID-based operation keys for report submissions to prevent duplicate entries
