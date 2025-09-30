# REST API Spec

```yaml
openapi: 3.0.0
info:
  title: SafeTrade Cybersecurity Incident Reporting API
  version: 1.0.0
  description: RESTful API for SafeTrade platform supporting anonymous and identified cybersecurity incident reporting with community intelligence features. All routes are at root level (no /api/v1 prefix).
servers:
  - url: http://localhost:3000
    description: Local development server (routes at root level)

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    AdminAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Admin-specific JWT token
  
  schemas:
    User:
      type: object
      properties:
        user_id:
          type: integer
        email:
          type: string
          format: email
        name:
          type: string
        created_at:
          type: string
          format: date-time
      # Note: pass_hash and salt fields are never exposed through API for security

    AttackType:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        created_at:
          type: string
          format: date-time

    Impact:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        created_at:
          type: string
          format: date-time

    Status:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        created_at:
          type: string
          format: date-time

    CatalogData:
      type: object
      properties:
        attackTypes:
          type: array
          items:
            $ref: '#/components/schemas/AttackType'
        impacts:
          type: array
          items:
            $ref: '#/components/schemas/Impact'
        statuses:
          type: array
          items:
            $ref: '#/components/schemas/Status'

    Report:
      type: object
      properties:
        report_id:
          type: integer
        user_id:
          type: integer
          nullable: true
        is_anonymous:
          type: boolean
        attack_type:
          type: integer
          description: Foreign key to attack_types.id
        incident_date:
          type: string
          format: date-time
          description: Combined date and time of incident
        attack_origin:
          type: string
          description: Phone number or email of attacker
          nullable: true
        evidence_url:
          type: string
          format: uri
          nullable: true
          description: URL to evidence files/screenshots
        suspicious_url:
          type: string
          format: uri
          nullable: true
          description: Malicious URL related to attack
        message_content:
          type: string
          nullable: true
        description:
          type: string
          nullable: true
        impact:
          type: integer
          description: Foreign key to impacts.id
        status:
          type: integer
          description: Foreign key to status.id
        admin_notes:
          type: string
          nullable: true
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    ReportWithDetails:
      allOf:
        - $ref: '#/components/schemas/Report'
        - type: object
          properties:
            attack_type_name:
              type: string
              description: Display name for attack type
            impact_name:
              type: string
              description: Display name for impact level
            status_name:
              type: string
              description: Display name for status
            user_name:
              type: string
              nullable: true
              description: User name (null for anonymous reports)
            user_email:
              type: string
              nullable: true
              description: User email (null for anonymous reports)
    
    TrendData:
      type: object
      properties:
        attack_type_id:
          type: integer
          description: Foreign key to attack_types.id
        attack_type_name:
          type: string
          description: Display name for attack type
        count:
          type: integer
        percentage:
          type: number
        time_period:
          type: string

paths:
  # User Registration (moved to /users for consistency with implementation)
  /users/register:
    post:
      tags: [Authentication]
      summary: Register new user account (returns tokens immediately)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                name:
                  type: string
                password:
                  type: string
                  minLength: 8
      responses:
        '201':
          description: User registered successfully with tokens
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'
        '400':
          description: Invalid email or password requirements not met
        '409':
          description: Email already registered
  
  /auth/login:
    post:
      tags: [Authentication]
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'
        '401':
          description: Invalid credentials

  /auth/refresh:
    post:
      tags: [Authentication]
      summary: Refresh access token using refresh token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [refresh_token]
              properties:
                refresh_token:
                  type: string
      responses:
        '200':
          description: New access token generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
        '401':
          description: Invalid or expired refresh token

  /auth/profile:
    get:
      tags: [Authentication]
      summary: Get authenticated user profile
      security:
        - BearerAuth: []
      responses:
        '200':
          description: User profile data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          description: Unauthorized

  # User Profile Management
  /users/profile:
    get:
      tags: [User Management]
      summary: Get user profile (authenticated)
      security:
        - BearerAuth: []
      responses:
        '200':
          description: User profile data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          description: Unauthorized

  /users/profile/email:
    put:
      tags: [User Management]
      summary: Update user email (requires password verification)
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  description: Current password for verification
      responses:
        '200':
          description: Email updated successfully
        '400':
          description: Invalid email format
        '401':
          description: Invalid password

  /users/profile/name:
    put:
      tags: [User Management]
      summary: Update user name (requires password verification)
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, password]
              properties:
                name:
                  type: string
                password:
                  type: string
                  description: Current password for verification
      responses:
        '200':
          description: Name updated successfully
        '401':
          description: Invalid password

  /users/profile/password:
    put:
      tags: [User Management]
      summary: Change user password
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [oldPassword, newPassword]
              properties:
                oldPassword:
                  type: string
                newPassword:
                  type: string
                  minLength: 8
      responses:
        '200':
          description: Password changed successfully
        '400':
          description: New password does not meet requirements
        '401':
          description: Invalid old password

  # Catalog Endpoints
  /reportes/catalogs:
    get:
      tags: [Catalogs]
      summary: Get all catalog data (attack types, impacts, statuses)
      responses:
        '200':
          description: Catalog data retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CatalogData'

  # Incident Reporting Endpoints
  /reportes:
    post:
      tags: [Reporting]
      summary: Submit incident report (anonymous or identified)
      description: |
        Accepts JSON format for incident reporting using normalized catalog IDs.
        Evidence photos should be uploaded via /reportes/upload-photo first, then include the returned URL in evidence_url field.
      security:
        - BearerAuth: []
        - {} # Anonymous access allowed via AnonymousAuthGuard
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [attack_type, incident_date, impact]
              properties:
                is_anonymous:
                  type: boolean
                  default: true
                  description: If true and user is authenticated, user_id will be NULL for privacy
                attack_type:
                  type: integer
                  description: ID from attack_types catalog (1=email, 2=SMS, 3=whatsapp, 4=llamada, 5=redes_sociales, 6=otro)
                incident_date:
                  type: string
                  format: date-time
                  description: Combined date and time of incident
                attack_origin:
                  type: string
                  nullable: true
                  description: Phone number or email of attacker
                evidence_url:
                  type: string
                  nullable: true
                  description: Relative URL path from upload-photo endpoint (e.g., /uploads/filename.jpg)
                suspicious_url:
                  type: string
                  format: uri
                  nullable: true
                message_content:
                  type: string
                  nullable: true
                impact:
                  type: integer
                  description: ID from impacts catalog (1=ninguno, 2=robo_datos, 3=robo_dinero, 4=cuenta_comprometida)
                description:
                  type: string
                  nullable: true
      responses:
        '201':
          description: Report submitted successfully with victim support recommendations
          content:
            application/json:
              schema:
                type: object
                properties:
                  report:
                    $ref: '#/components/schemas/ReportWithDetails'
                  victimSupport:
                    type: object
                    nullable: true
                    description: Context-aware support resources (generated if impact != ninguno)
        '400':
          description: Invalid report data or invalid catalog IDs

    get:
      tags: [Reporting]
      summary: Get all reports with pagination and filters (admin only)
      description: Returns complete report list with full details for administrative purposes
      security:
        - AdminAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: integer
            description: Filter by status ID
        - name: attack_type
          in: query
          schema:
            type: integer
            description: Filter by attack type ID
        - name: impact
          in: query
          schema:
            type: integer
            description: Filter by impact ID
        - name: is_anonymous
          in: query
          schema:
            type: boolean
            description: Filter by anonymous flag
        - name: date_from
          in: query
          schema:
            type: string
            format: date
        - name: date_to
          in: query
          schema:
            type: string
            format: date
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Paginated list of reports
          content:
            application/json:
              schema:
                type: object
                properties:
                  reports:
                    type: array
                    items:
                      $ref: '#/components/schemas/ReportWithDetails'
                  pagination:
                    type: object
                    properties:
                      total:
                        type: integer
                      page:
                        type: integer
                      pages:
                        type: integer
        '401':
          description: Admin authentication required

  /reportes/upload-photo:
    post:
      tags: [Reporting]
      summary: Upload evidence photo
      description: |
        Upload a single photo file for use as evidence in a report.
        Supported formats: JPEG, PNG, HEIC, HEIF
        Returns a relative URL path to be used in the evidence_url field when creating a report.
      security:
        - BearerAuth: []
        - {} # Anonymous access allowed
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [photo]
              properties:
                photo:
                  type: string
                  format: binary
                  description: Image file (JPEG, PNG, HEIC, HEIF)
      responses:
        '201':
          description: Photo uploaded successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  url:
                    type: string
                    description: Relative URL path (e.g., /uploads/1234567890-abc-def.jpg)
                  message:
                    type: string
        '400':
          description: Invalid file format or no file provided

  /reportes/{id}:
    get:
      tags: [Reporting]
      summary: Get specific report details
      description: Returns report with catalog names. Privacy-filtered for regular users (shows only public fields).
      security:
        - BearerAuth: []
        - {} # Anonymous access allowed
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Report details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReportWithDetails'
        '404':
          description: Report not found

  /reportes/user/mis-reportes:
    get:
      tags: [Reporting]
      summary: Get authenticated user's own reports
      security:
        - BearerAuth: []
      responses:
        '200':
          description: User's reports list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ReportWithDetails'
        '401':
          description: Authentication required

  # Community Intelligence Endpoints
  /comunidad/tendencias:
    get:
      tags: [Community]
      summary: Get community threat trends with Spanish translations
      description: Returns attack type distribution for specified time period
      parameters:
        - name: period
          in: query
          schema:
            type: string
            enum: [7days, 30days, 90days]
            default: 30days
            description: Time period for trend analysis
      responses:
        '200':
          description: Community threat trends data
          content:
            application/json:
              schema:
                type: object
                properties:
                  trends:
                    type: array
                    items:
                      $ref: '#/components/schemas/TrendData'
                  total_reports:
                    type: integer
                  period:
                    type: string

  /comunidad/analytics:
    get:
      tags: [Community]
      summary: Get comprehensive community analytics
      description: Returns detailed analytics including attack types, impacts, and time-based distributions
      responses:
        '200':
          description: Community analytics data
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalReports:
                    type: integer
                  attackTypeDistribution:
                    type: array
                    items:
                      type: object
                      properties:
                        attack_type_id:
                          type: integer
                        attack_type_name:
                          type: string
                        count:
                          type: integer
                        percentage:
                          type: number
                  impactDistribution:
                    type: array
                    items:
                      type: object
                  timeBasedTrends:
                    type: object
                  anonymousUsage:
                    type: object

  /comunidad/alerta:
    get:
      tags: [Community]
      summary: Get community threat alert level
      description: Returns current community alert level (verde/amarillo/rojo) based on recent report volume
      responses:
        '200':
          description: Community alert status
          content:
            application/json:
              schema:
                type: object
                properties:
                  alertLevel:
                    type: string
                    enum: [verde, amarillo, rojo]
                  reportsLast24h:
                    type: integer
                  message:
                    type: string
                  recommendations:
                    type: array
                    items:
                      type: string

  # Admin Management Endpoints
  /admin/login:
    post:
      tags: [Admin]
      summary: Admin authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Admin login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
                  admin_id:
                    type: integer
        '401':
          description: Invalid admin credentials

  /admin/register:
    post:
      tags: [Admin]
      summary: Register new admin user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        '201':
          description: Admin registered successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
                  admin_id:
                    type: integer
        '409':
          description: Email already registered

  /admin/validate-token:
    get:
      tags: [Admin]
      summary: Validate admin JWT token
      security:
        - AdminAuth: []
      responses:
        '200':
          description: Token is valid
          content:
            application/json:
              schema:
                type: object
                properties:
                  valid:
                    type: boolean
                  admin_id:
                    type: integer
        '401':
          description: Invalid token

  /admin/dashboard:
    get:
      tags: [Admin]
      summary: Basic admin dashboard statistics
      security:
        - AdminAuth: []
      responses:
        '200':
          description: Dashboard statistics
          content:
            application/json:
              schema:
                type: object
                properties:
                  total_reports:
                    type: integer
                  reports_today:
                    type: integer
                  critical_reports:
                    type: integer

  /admin/dashboard/enhanced:
    get:
      tags: [Admin]
      summary: Enhanced dashboard with trends and distributions
      security:
        - AdminAuth: []
      responses:
        '200':
          description: Enhanced dashboard data
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalReports:
                    type: integer
                  reportsToday:
                    type: integer
                  criticalReports:
                    type: integer
                  weeklyTrend:
                    type: array
                  monthlyTrend:
                    type: array
                  statusDistribution:
                    type: array
                  attackTypeBreakdown:
                    type: array
                  impactDistribution:
                    type: array
                  averageResponseTime:
                    type: number

  /admin/users/list:
    get:
      tags: [Admin]
      summary: Get all users list
      security:
        - AdminAuth: []
      responses:
        '200':
          description: List of all users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
        '401':
          description: Admin authentication required

  /admin/users/{id}:
    get:
      tags: [Admin]
      summary: Get specific user details
      security:
        - AdminAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: User details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found

  /admin/reports:
    get:
      tags: [Admin]
      summary: Get filtered reports list with full details
      security:
        - AdminAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: integer
        - name: attack_type
          in: query
          schema:
            type: integer
        - name: impact
          in: query
          schema:
            type: integer
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Filtered reports list
          content:
            application/json:
              schema:
                type: object
                properties:
                  reports:
                    type: array
                    items:
                      $ref: '#/components/schemas/ReportWithDetails'
                  pagination:
                    type: object

  /admin/reports/search:
    get:
      tags: [Admin]
      summary: Advanced report search with highlighting
      security:
        - AdminAuth: []
      parameters:
        - name: query
          in: query
          required: true
          schema:
            type: string
            description: Search query string
      responses:
        '200':
          description: Search results with highlighted matches
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ReportWithDetails'

  /admin/reports/{id}:
    get:
      tags: [Admin]
      summary: Get specific report full details (admin view)
      security:
        - AdminAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Full report details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReportWithDetails'
        '404':
          description: Report not found

  /admin/reports/{id}/status:
    put:
      tags: [Admin]
      summary: Update report status with optional notes
      security:
        - AdminAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [status]
              properties:
                status:
                  type: integer
                  description: Status ID from status catalog (1=nuevo, 2=revisado, 3=en_investigacion, 4=cerrado)
                adminNotes:
                  type: string
                  nullable: true
      responses:
        '200':
          description: Report status updated
        '404':
          description: Report not found
        '401':
          description: Admin authentication required

  /admin/reports/{id}/notes:
    get:
      tags: [Admin]
      summary: Get report notes (STUB IMPLEMENTATION)
      description: Returns mock data - notes table not yet implemented
      security:
        - AdminAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Report notes (stub data)
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object

    post:
      tags: [Admin]
      summary: Add report note (STUB IMPLEMENTATION)
      description: Returns mock response - notes table not yet implemented
      security:
        - AdminAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [content]
              properties:
                content:
                  type: string
      responses:
        '201':
          description: Note added (stub response)

  /admin/notes/{id}:
    put:
      tags: [Admin]
      summary: Update note (STUB IMPLEMENTATION)
      description: Returns mock response - notes table not yet implemented
      security:
        - AdminAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [content]
              properties:
                content:
                  type: string
      responses:
        '200':
          description: Note updated (stub response)

    post:
      tags: [Admin]
      summary: Delete note (STUB IMPLEMENTATION)
      description: Returns mock response - notes table not yet implemented
      security:
        - AdminAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Note deleted (stub response)
```
