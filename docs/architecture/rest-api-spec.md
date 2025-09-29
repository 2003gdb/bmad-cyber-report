# REST API Spec

```yaml
openapi: 3.0.0
info:
  title: SafeTrade Cybersecurity Incident Reporting API
  version: 1.0.0
  description: RESTful API for SafeTrade platform supporting anonymous and identified cybersecurity incident reporting with community intelligence features
servers:
  - url: http://localhost:3000
    description: Local development server

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
  # Authentication Endpoints
  /auth/register:
    post:
      tags: [Authentication]
      summary: Register new user account
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
          description: User registered successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
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
        Accepts JSON-only format for text-based incident reporting using normalized IDs.
        Evidence is handled through URL field instead of file uploads.
      security:
        - BearerAuth: []
        - {} # Anonymous access allowed
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
                attack_type:
                  type: integer
                  description: ID from attack_types catalog
                incident_date:
                  type: string
                  format: date-time
                  description: Combined date and time of incident
                attack_origin:
                  type: string
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
                message_content:
                  type: string
                  nullable: true
                impact:
                  type: integer
                  description: ID from impacts catalog
                description:
                  type: string
                  nullable: true
      responses:
        '201':
          description: Report submitted successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  report:
                    $ref: '#/components/schemas/ReportWithDetails'
                  recommendations:
                    type: array
                    items:
                      type: string
                  victim_support:
                    type: object
                    nullable: true
        '400':
          description: Invalid report data or invalid catalog IDs
    
    get:
      tags: [Reporting]
      summary: Get reports (admin only)
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

  # Community Intelligence Endpoints
  /community/trends:
    get:
      tags: [Community]
      summary: Get community threat trends
      parameters:
        - name: period
          in: query
          schema:
            type: string
            enum: [7days, 30days, 90days]
            default: 30days
        - name: region
          in: query
          schema:
            type: string
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
  
  /community/recommendations/{reportId}:
    get:
      tags: [Community]
      summary: Get personalized security recommendations
      parameters:
        - name: reportId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Personalized security recommendations
          content:
            application/json:
              schema:
                type: object
                properties:
                  recommendations:
                    type: array
                    items:
                      type: object
                      properties:
                        title:
                          type: string
                        content:
                          type: string
                        priority:
                          type: string
                          enum: [alta, media, baja]

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
                  admin_id:
                    type: string
                    format: uuid
        '401':
          description: Invalid admin credentials

  /admin/dashboard:
    get:
      tags: [Admin]
      summary: Admin dashboard metrics
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
                  recent_trends:
                    type: array
                    items:
                      $ref: '#/components/schemas/TrendData'

  /admin/reports/{reportId}/status:
    put:
      tags: [Admin]
      summary: Update report status
      security:
        - AdminAuth: []
      parameters:
        - name: reportId
          in: path
          required: true
          schema:
            type: string
            format: uuid
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
                  description: Status ID from status catalog
                notes:
                  type: string
      responses:
        '200':
          description: Report status updated
        '404':
          description: Report not found
        '401':
          description: Admin authentication required
```
