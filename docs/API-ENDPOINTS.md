# API Endpoints Documentation

## Base URL
All endpoints are prefixed with `/api/v1` unless otherwise specified.

---

## Table of Contents
1. [Health & Root Endpoints](#health--root-endpoints)
2. [Authentication](#authentication)
3. [Users](#users)
4. [Reports (Reportes)](#reports-reportes)
5. [Community & Threat Intelligence (Comunidad)](#community--threat-intelligence-comunidad)
6. [Admin](#admin)

---

## Health & Root Endpoints

### Get Root
- **Endpoint:** `GET /`
- **Description:** Returns basic API information
- **Authentication:** None
- **Response:** String with API info

### Get Health
- **Endpoint:** `GET /health`
- **Description:** Returns health status of the API
- **Authentication:** None
- **Response:** Object with health information

---

## Authentication

### Login
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticate a user and receive access tokens
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "usuario@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Inicio de sesión exitoso",
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
  ```
- **Error Response (401):** Credenciales inválidas

### Refresh Token
- **Endpoint:** `POST /auth/refresh`
- **Description:** Refresh access token using refresh token
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Token renovado exitosamente",
    "access_token": "eyJhbGc..."
  }
  ```
- **Error Response (401):** Token de renovación inválido

### Get Profile (Auth)
- **Endpoint:** `GET /auth/profile`
- **Description:** Get authenticated user's profile
- **Authentication:** Bearer Token (Required)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "profile": {
      "id": 1,
      "email": "usuario@example.com",
      "name": "Juan Pérez"
    }
  }
  ```
- **Error Response (401):** Token inválido o no proporcionado

---

## Users

### Register User
- **Endpoint:** `POST /users/register`
- **Description:** Register a new user account
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "password": "password123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Usuario registrado exitosamente",
    "user": {
      "id": 1,
      "email": "juan@example.com",
      "name": "Juan Pérez",
      "created_at": "2025-01-15T10:00:00.000Z"
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
  ```
- **Error Response (409):** El correo electrónico ya está registrado

### Get User Profile
- **Endpoint:** `GET /users/profile`
- **Description:** Get current user's profile
- **Authentication:** Bearer Token (Required)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "profile": {
      "id": 1,
      "email": "juan@example.com",
      "name": "Juan Pérez"
    }
  }
  ```

### Update Email
- **Endpoint:** `PUT /users/profile/email`
- **Description:** Update user's email address
- **Authentication:** Bearer Token (Required)
- **Request Body:**
  ```json
  {
    "new_email": "nuevo@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Correo actualizado exitosamente",
    "user": {
      "id": 1,
      "email": "nuevo@example.com",
      "name": "Juan Pérez"
    }
  }
  ```
- **Error Responses:**
  - (401): Contraseña incorrecta
  - (409): El correo electrónico ya está registrado

### Update Name
- **Endpoint:** `PUT /users/profile/name`
- **Description:** Update user's name
- **Authentication:** Bearer Token (Required)
- **Request Body:**
  ```json
  {
    "new_name": "Carlos Nuevo",
    "password": "password123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Nombre actualizado exitosamente",
    "user": {
      "id": 1,
      "email": "juan@example.com",
      "name": "Carlos Nuevo"
    }
  }
  ```
- **Error Response (401):** Contraseña incorrecta

### Change Password
- **Endpoint:** `PUT /users/profile/password`
- **Description:** Change user's password
- **Authentication:** Bearer Token (Required)
- **Request Body:**
  ```json
  {
    "current_password": "password123",
    "new_password": "newPassword123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Contraseña cambiada exitosamente"
  }
  ```
- **Error Response (401):** Contraseña actual incorrecta

---

## Reports (Reportes)

### Create Report
- **Endpoint:** `POST /reportes`
- **Description:** Create a new incident report (anonymous or authenticated)
- **Authentication:** Optional (Bearer Token or Anonymous)
- **Request Body:**
  ```json
  {
    "is_anonymous": true,
    "attack_type": "email",
    "incident_date": "2025-01-15",
    "incident_time": "14:30:00",
    "attack_origin": "email@sospechoso.com",
    "suspicious_url": "https://phishing-site.com",
    "message_content": "Contenido del mensaje sospechoso",
    "impact_level": "robo_dinero",
    "description": "Descripción detallada del incidente"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "Reporte creado exitosamente",
    "reporte": {
      "id": 1,
      "user_id": null,
      "is_anonymous": true,
      "attack_type": "email",
      "incident_date": "2025-01-15",
      "impact_level": "robo_dinero",
      "status": "nuevo",
      "created_at": "2025-01-15T14:30:00.000Z"
    },
    "victim_support": {
      "immediate_actions": [...],
      "resources": [...]
    }
  }
  ```

### Get All Reports
- **Endpoint:** `GET /reportes`
- **Description:** Get paginated list of all reports with optional filters
- **Authentication:** Optional (Bearer Token or Anonymous)
- **Query Parameters:**
  - `status` (optional): Filter by status (e.g., "nuevo", "revisado")
  - `attack_type` (optional): Filter by attack type
  - `is_anonymous` (optional): Filter by anonymous status ("true"/"false")
  - `date_from` (optional): Start date (YYYY-MM-DD)
  - `date_to` (optional): End date (YYYY-MM-DD)
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)
- **Success Response (200):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "attack_type": "email",
        "impact_level": "robo_dinero",
        "status": "nuevo",
        "is_anonymous": true,
        "created_at": "2025-01-15T14:30:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
  ```

### Get Report by ID
- **Endpoint:** `GET /reportes/:id`
- **Description:** Get specific report details
- **Authentication:** Optional (Bearer Token or Anonymous)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "reporte": {
      "id": 1,
      "attack_type": "email",
      "incident_date": "2025-01-15",
      "incident_time": "14:30:00",
      "impact_level": "robo_dinero",
      "description": "Descripción del incidente",
      "status": "nuevo",
      "created_at": "2025-01-15T14:30:00.000Z",
      "user_info": null
    }
  }
  ```
- **Error Response (404):** Reporte no encontrado

### Get User's Reports
- **Endpoint:** `GET /reportes/user/mis-reportes`
- **Description:** Get all reports created by authenticated user
- **Authentication:** Bearer Token (Required)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Reportes obtenidos exitosamente",
    "reportes": [
      {
        "id": 1,
        "attack_type": "email",
        "is_anonymous": false,
        "status": "nuevo",
        "created_at": "2025-01-15T14:30:00.000Z"
      }
    ],
    "total": 3
  }
  ```

### Get Catalog Data
- **Endpoint:** `GET /reportes/catalogs`
- **Description:** Get catalog data for form dropdowns (attack types, impact levels, etc.)
- **Authentication:** Optional (Bearer Token or Anonymous)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "attack_types": [...],
      "impact_levels": [...],
      "status_options": [...]
    }
  }
  ```

---

## Community & Threat Intelligence (Comunidad)

### Get Community Trends
- **Endpoint:** `GET /comunidad/tendencias`
- **Description:** Get community trends for specified time period
- **Authentication:** Optional (Bearer Token or Anonymous)
- **Query Parameters:**
  - `period` (optional): Time period ("7days", "30days", "90days", default: "30days")
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Tendencias comunitarias de los últimos 30 días",
    "data": {
      "community_stats": {
        "total_reports": 150,
        "anonymous_reports": 80,
        "registered_reports": 70
      },
      "attack_trends": [
        {
          "attack_type": "email",
          "count": 45,
          "percentage": 30
        }
      ],
      "summary": {
        "main_threat": "Phishing por correo electrónico"
      }
    },
    "user_context": {
      "access_type": "anónimo",
      "viewing_period": "30days"
    }
  }
  ```

### Get Community Analytics
- **Endpoint:** `GET /comunidad/analytics`
- **Description:** Get comprehensive community analytics
- **Authentication:** Optional (Bearer Token or Anonymous)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Analytics comunitarios obtenidos exitosamente",
    "data": {
      "community_overview": {
        "total_reports": 500,
        "highest_impact_count": 120,
        "critical_threats": 45
      },
      "temporal_analysis": [...]
    },
    "metadata": {
      "generated_at": "2025-01-15T14:30:00.000Z",
      "user_access": "público"
    }
  }
  ```

### Get Community Alert
- **Endpoint:** `GET /comunidad/alerta`
- **Description:** Get current community threat alert level
- **Authentication:** Optional (Bearer Token or Anonymous)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "alerta": {
      "nivel": "amarillo",
      "mensaje": "⚠️ PRECAUCIÓN: Actividad cibernética elevada detectada...",
      "recomendaciones_generales": [
        "Mantente alerta ante comunicaciones inusuales",
        "Verifica la autenticidad de mensajes importantes"
      ],
      "ultima_actualizacion": "2025-01-15T14:30:00.000Z"
    },
    "stats": {
      "reportes_recientes": 85,
      "amenaza_principal": "Phishing por correo electrónico"
    }
  }
  ```

---

## Admin

### Admin Login
- **Endpoint:** `POST /admin/login`
- **Description:** Authenticate an admin user
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "admin@safetrade.com",
    "password": "admin123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "admin": {
      "id": 1,
      "email": "admin@safetrade.com"
    }
  }
  ```
- **Error Response (401):** Credenciales de administrador inválidas

### Admin Register
- **Endpoint:** `POST /admin/register`
- **Description:** Register a new admin account
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "admin@safetrade.com",
    "password": "securePassword123",
    "passwordConfirm": "securePassword123"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "Administrador registrado exitosamente",
    "admin": {
      "id": 1,
      "email": "admin@safetrade.com"
    }
  }
  ```
- **Error Response (400):** Las contraseñas no coinciden

### Validate Admin Token
- **Endpoint:** `GET /admin/validate-token`
- **Description:** Validate admin authentication token
- **Authentication:** Bearer Token (Admin Required)
- **Success Response (200):**
  ```json
  {
    "valid": true,
    "message": "Token válido"
  }
  ```

### Get Dashboard Stats
- **Endpoint:** `GET /admin/dashboard`
- **Description:** Get basic dashboard statistics
- **Authentication:** Bearer Token (Admin Required)
- **Success Response (200):**
  ```json
  {
    "total_reports": 500,
    "reports_today": 15,
    "critical_reports": 45,
    "recent_trends": [...]
  }
  ```

### Get Enhanced Dashboard Stats
- **Endpoint:** `GET /admin/dashboard/enhanced`
- **Description:** Get detailed dashboard statistics
- **Authentication:** Bearer Token (Admin Required)
- **Success Response (200):** Enhanced statistics with detailed breakdowns

### Get All Users
- **Endpoint:** `GET /admin/users/list`
- **Description:** Get list of all registered users
- **Authentication:** Bearer Token (Admin Required)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Lista de usuarios obtenida exitosamente",
    "users": [
      {
        "id": 1,
        "email": "usuario@example.com",
        "name": "Juan Pérez",
        "created_at": "2025-01-15T10:00:00.000Z"
      }
    ],
    "total": 50
  }
  ```

### Get User by ID
- **Endpoint:** `GET /admin/users/:id`
- **Description:** Get specific user details
- **Authentication:** Bearer Token (Admin Required)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "email": "usuario@example.com",
      "name": "Juan Pérez",
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  }
  ```
- **Error Response (404):** Usuario no encontrado

### Get Reports (Admin)
- **Endpoint:** `GET /admin/reports`
- **Description:** Get filtered and paginated reports list
- **Authentication:** Bearer Token (Admin Required)
- **Query Parameters:**
  - `status` (optional): Filter by status
  - `attack_type` (optional): Filter by attack type
  - `is_anonymous` (optional): Filter by anonymous status
  - `date_from` (optional): Start date
  - `date_to` (optional): End date
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)
- **Success Response (200):**
  ```json
  {
    "data": [...],
    "total": 500,
    "page": 1,
    "limit": 10,
    "totalPages": 50
  }
  ```

### Search Reports (Admin)
- **Endpoint:** `GET /admin/reports/search`
- **Description:** Search reports with advanced filters
- **Authentication:** Bearer Token (Admin Required)
- **Query Parameters:**
  - `q` (optional): Search query
  - `status` (optional): Filter by status
  - `attack_type` (optional): Filter by attack type
  - `impact_level` (optional): Filter by impact level
  - `is_anonymous` (optional): Filter by anonymous status
  - `date_from` (optional): Start date
  - `date_to` (optional): End date
  - `location` (optional): Filter by location
  - `page` (optional): Page number
  - `limit` (optional): Results per page
- **Success Response (200):** Paginated search results

### Get Report by ID (Admin)
- **Endpoint:** `GET /admin/reports/:id`
- **Description:** Get detailed report information (admin view)
- **Authentication:** Bearer Token (Admin Required)
- **Success Response (200):** Full report details including admin-specific fields
- **Error Response (404):** Reporte no encontrado

### Update Report Status
- **Endpoint:** `PUT /admin/reports/:id/status`
- **Description:** Update status of a report
- **Authentication:** Bearer Token (Admin Required)
- **Request Body:**
  ```json
  {
    "status": "revisado",
    "adminNotes": "Updated by admin"
  }
  ```
- **Success Response (200):** Updated report object
- **Error Response (404):** Reporte no encontrado

### Get Report Notes
- **Endpoint:** `GET /admin/reports/:id/notes`
- **Description:** Get all notes for a specific report
- **Authentication:** Bearer Token (Admin Required)
- **Success Response (200):** Array of notes

### Add Report Note
- **Endpoint:** `POST /admin/reports/:id/notes`
- **Description:** Add a note to a report
- **Authentication:** Bearer Token (Admin Required)
- **Request Body:**
  ```json
  {
    "content": "Investigation note",
    "isTemplate": false,
    "templateName": "Investigation Template"
  }
  ```
- **Success Response (201):** Created note object

### Update Note
- **Endpoint:** `PUT /admin/notes/:id`
- **Description:** Update an existing note
- **Authentication:** Bearer Token (Admin Required)
- **Request Body:**
  ```json
  {
    "content": "Updated note content"
  }
  ```
- **Success Response (200):** Updated note object

### Delete Note
- **Endpoint:** `POST /admin/notes/:id`
- **Description:** Delete a note
- **Authentication:** Bearer Token (Admin Required)
- **Success Response (200):**
  ```json
  {
    "message": "Nota eliminada exitosamente"
  }
  ```

---

## Authentication Details

### Bearer Token Format
All authenticated requests require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Token Types
- **Access Token**: Short-lived token for API requests (expires in 15 minutes)
- **Refresh Token**: Long-lived token for refreshing access tokens (expires in 7 days)
- **Admin Token**: Special access token with admin privileges

### Token Refresh Flow
1. Use refresh token at `/auth/refresh` endpoint
2. Receive new access token
3. Use new access token for subsequent requests

---

## Error Response Format

All error responses follow this structure:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development mode)"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **500**: Internal Server Error

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Anonymous access is allowed for: community endpoints, report viewing, and report creation
- Authenticated access (Bearer Token) is required for: user profile operations, user reports
- Admin access is required for: all `/admin/*` endpoints
- Pagination defaults: page=1, limit=10