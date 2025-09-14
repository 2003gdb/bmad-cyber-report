# Data Models

## User Model
**Purpose:** Optional user registration for identified reporting and report history tracking

**Key Attributes:**
- user_id: UUID (Primary Key) - Unique user identifier
- email: string - User email address for authentication
- password_hash: string - bcrypt hashed password
- salt: string - Unique cryptographic salt for password hashing
- jwt_token: string (nullable) - Current active session token
- created_at: datetime - Account creation timestamp
- updated_at: datetime - Last account modification timestamp

**Relationships:**
- One-to-Many with Reports (for identified reports only)
- Reports can exist without User (anonymous reporting)

## Report Model  
**Purpose:** Core incident reporting data supporting both anonymous and identified submissions

**Key Attributes:**
- report_id: UUID (Primary Key) - Unique report identifier
- user_id: UUID (Foreign Key, nullable) - Links to User for identified reports, NULL for anonymous
- is_anonymous: boolean - Explicit flag for report type (true = anonymous, false = identified)
- attack_type: enum - ['email', 'SMS', 'whatsapp', 'llamada', 'redes_sociales', 'otro']
- incident_date: date - When the attack occurred
- incident_time: time - Time of attack occurrence
- attack_origin: string - Phone number or email address of attacker
- suspicious_url: string (nullable) - Malicious URL if applicable
- message_content: text (nullable) - Original attack message content
- impact_level: enum - ['ninguno', 'robo_datos', 'robo_dinero', 'cuenta_comprometida']
- description: text - Free-text detailed description
- status: enum - ['nuevo', 'revisado', 'en_investigacion', 'cerrado']
- created_at: datetime - Report submission timestamp
- updated_at: datetime - Last report modification

**Relationships:**
- Many-to-One with User (nullable for anonymous reports)
- One-to-Many with ReportAttachments

## ReportAttachment Model
**Purpose:** File uploads (screenshots, evidence) associated with incident reports

**Key Attributes:**
- attachment_id: UUID (Primary Key) - Unique attachment identifier
- report_id: UUID (Foreign Key) - Links to parent Report
- file_name: string - Original uploaded filename
- file_path: string - Server storage path
- file_size: integer - File size in bytes
- mime_type: string - File type validation
- uploaded_at: datetime - Upload timestamp

**Relationships:**
- Many-to-One with Report

## AdminUser Model
**Purpose:** Administrative portal access for SafeTrade company users

**Key Attributes:**
- admin_id: UUID (Primary Key) - Unique admin identifier
- email: string - Admin email address
- password_hash: string - bcrypt hashed password
- salt: string - Unique cryptographic salt for password hashing
- last_login: datetime (nullable) - Last login timestamp
- created_at: datetime - Account creation timestamp

**Relationships:**
- Independent entity (no direct relationships with user reports for privacy)
