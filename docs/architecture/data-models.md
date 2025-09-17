# Data Models

## User Model
**Purpose:** Optional user registration for identified reporting and report history tracking

**Key Attributes:**
- id: INT AUTO_INCREMENT (Primary Key) - Unique user identifier
- email: VARCHAR(255) - User email address for authentication
- name: VARCHAR(255) - User display name
- password_hash: VARCHAR(255) - bcrypt hashed password
- salt: VARCHAR(255) - Unique cryptographic salt for password hashing
- last_login: TIMESTAMP (nullable) - Last successful login timestamp
- created_at: TIMESTAMP - Account creation timestamp
- updated_at: TIMESTAMP - Last account modification timestamp

**Relationships:**
- One-to-Many with Reports (for identified reports only)
- Reports can exist without User (anonymous reporting)

## Report Model
**Purpose:** Core incident reporting data supporting both anonymous and identified submissions

**Key Attributes:**
- id: INT AUTO_INCREMENT (Primary Key) - Unique report identifier
- user_id: INT (Foreign Key, nullable) - Links to User for identified reports, NULL for anonymous
- is_anonymous: BOOLEAN - Explicit flag for report type (true = anonymous, false = identified)
- attack_type: ENUM - ['email', 'SMS', 'whatsapp', 'llamada', 'redes_sociales', 'otro']
- incident_date: DATE - When the attack occurred
- incident_time: TIME (nullable) - Time of attack occurrence
- attack_origin: VARCHAR(255) - Phone number or email address of attacker
- suspicious_url: TEXT (nullable) - Malicious URL if applicable
- message_content: TEXT (nullable) - Original attack message content
- description: TEXT (nullable) - Free-text detailed description
- impact_level: ENUM - ['ninguno', 'robo_datos', 'robo_dinero', 'cuenta_comprometida']
- status: ENUM - ['nuevo', 'revisado', 'en_investigacion', 'cerrado']
- admin_notes: TEXT (nullable) - Investigation notes
- created_at: TIMESTAMP - Report submission timestamp
- updated_at: TIMESTAMP - Last report modification

**Relationships:**
- Many-to-One with User (nullable for anonymous reports)
- One-to-Many with ReportAttachments

## ReportAttachment Model
**Purpose:** File uploads (screenshots, evidence) associated with incident reports

**Key Attributes:**
- id: INT AUTO_INCREMENT (Primary Key) - Unique attachment identifier
- reporte_id: INT (Foreign Key) - Links to parent Report
- file_path: VARCHAR(500) - Server storage path
- file_hash: VARCHAR(64) (nullable) - SHA-256 for integrity verification
- uploaded_at: TIMESTAMP - Upload timestamp

**Relationships:**
- Many-to-One with Report

## AdminUser Model
**Purpose:** Administrative portal access for SafeTrade company users

**Key Attributes:**
- id: INT AUTO_INCREMENT (Primary Key) - Unique admin identifier
- email: VARCHAR(255) - Admin email address
- password_hash: VARCHAR(255) - bcrypt hashed password
- salt: VARCHAR(255) - Unique cryptographic salt for password hashing
- last_login: TIMESTAMP (nullable) - Last login timestamp
- created_at: TIMESTAMP - Account creation timestamp

**Relationships:**
- Independent entity (no direct relationships with user reports for privacy)
