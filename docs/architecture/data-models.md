# Data Models

## User Model
**Purpose:** Optional user registration for identified reporting and report history tracking

**Key Attributes:**
- id: INT AUTO_INCREMENT (Primary Key) - Unique user identifier
- email: VARCHAR(255) - User email address for authentication
- name: VARCHAR(255) - User display name
- pass_hash: VARCHAR(255) - bcrypt hashed password
- salt: VARCHAR(255) - Unique cryptographic salt for password hashing
- created_at: TIMESTAMP - Account creation timestamp
- updated_at: TIMESTAMP - Last account modification timestamp

**Relationships:**
- One-to-Many with Reports (for identified reports only)
- Reports can exist without User (anonymous reporting)

## Catalog Models
**Purpose:** Normalized reference tables for consistent data management

### AttackType Model
**Key Attributes:**
- id: INT AUTO_INCREMENT (Primary Key) - Unique attack type identifier
- name: VARCHAR(100) - Attack type name ('email', 'SMS', 'whatsapp', etc.)
- created_at: TIMESTAMP - Creation timestamp

**Relationships:**
- One-to-Many with Reports

### Impact Model
**Key Attributes:**
- id: INT AUTO_INCREMENT (Primary Key) - Unique impact identifier
- name: VARCHAR(100) - Impact level name ('ninguno', 'robo_datos', etc.)
- created_at: TIMESTAMP - Creation timestamp

**Relationships:**
- One-to-Many with Reports

### Status Model
**Key Attributes:**
- id: INT AUTO_INCREMENT (Primary Key) - Unique status identifier
- name: VARCHAR(100) - Status name ('nuevo', 'revisado', 'en_investigacion', 'cerrado')
- created_at: TIMESTAMP - Creation timestamp

**Relationships:**
- One-to-Many with Reports

## Report Model
**Purpose:** Core incident reporting data supporting both anonymous and identified submissions

**Key Attributes:**
- id: INT AUTO_INCREMENT (Primary Key) - Unique report identifier
- user_id: INT (Foreign Key, nullable) - Links to User for identified reports, NULL for anonymous
- is_anonymous: BOOLEAN - Explicit flag for report type (true = anonymous, false = identified)
- attack_type: INT (Foreign Key) - References attack_types.id
- incident_date: TIMESTAMP - When the attack occurred (includes date and time)
- attack_origin: VARCHAR(255) (nullable) - Phone number or email address of attacker
- evidence_url: TEXT (nullable) - URL to evidence files/screenshots
- suspicious_url: TEXT (nullable) - Malicious URL related to the attack
- message_content: TEXT (nullable) - Original attack message content
- description: TEXT (nullable) - Free-text detailed description
- impact: INT (Foreign Key) - References impacts.id
- status: INT (Foreign Key) - References status.id (defaults to 1 for 'nuevo')
- admin_notes: TEXT (nullable) - Investigation notes
- created_at: TIMESTAMP - Report submission timestamp
- updated_at: TIMESTAMP - Last report modification

**Relationships:**
- Many-to-One with User (nullable for anonymous reports)
- Many-to-One with AttackType
- Many-to-One with Impact
- Many-to-One with Status

## Admin Model
**Purpose:** Administrative portal access for SafeTrade company users

**Table Name:** `admins` (not `admin_users`)

**Key Attributes:**
- id: INT AUTO_INCREMENT (Primary Key) - Unique admin identifier
- email: VARCHAR(255) - Admin email address
- pass_hash: VARCHAR(255) - bcrypt hashed password
- salt: VARCHAR(255) - Unique cryptographic salt for password hashing
- created_at: DATETIME - Account creation timestamp

**Relationships:**
- Independent entity (no direct relationships with user reports for privacy)

**Authentication:**
- Separate JWT tokens from regular users (AdminAuthGuard)
- Admin registration endpoint available (`POST /admin/register`)
- Token validation endpoint (`GET /admin/validate-token`)

## Implementation Notes

### Functional Features:
- ✅ **User profile management** fully implemented (email, name, password updates)
- ✅ **Anonymous reporting** via dual-mode (`is_anonymous` flag + `user_id` NULL handling)
- ✅ **Photo upload system** using Multer with disk storage
- ✅ **Victim support system** with context-aware recommendations
- ✅ **Community intelligence** with trend analysis and alert levels
- ✅ **Admin dashboard** with basic and enhanced statistics

### Stub Implementations:
- ⚠️ **Admin notes endpoints** exist but return mock data (notes table not yet created)

## Data Model Changes

### Key Improvements from Previous Version:

1. **Normalized Catalog Structure**: Replaced ENUM fields with foreign key relationships to separate catalog tables
2. **Simplified Evidence Handling**: Single `evidence_url` field stores path to uploaded photos
3. **Enhanced Timestamp Handling**: Combined `incident_date` and `incident_time` into single DATETIME field
4. **Consistent Naming**:
   - Updated `password_hash` to `pass_hash` across User and Admin models
   - Updated `admin_users` to `admins` table name (actual implementation)
   - TIMESTAMP → DATETIME for all timestamp fields
5. **Photo Upload Integration**: Multer-based file upload with `/public/uploads/` storage

### Benefits:

- **Scalability**: Easy addition of new attack types, impacts, or statuses without schema changes
- **Data Integrity**: Foreign key constraints ensure referential integrity
- **Query Performance**: Optimized indexes on foreign key relationships
- **Maintainability**: Centralized catalog management through dedicated tables
- **Flexibility**: Support for future internationalization through catalog table extensions
- **Simplicity**: File storage at application level, not in database

### Catalog Mapping System:

The `CatalogMappingService` provides bidirectional conversion between database IDs and string values:
- **Database storage**: Integer foreign keys (e.g., `attack_type: 1`)
- **API interface**: String values for legacy compatibility (e.g., `attack_type: "email"`)
- **Automatic transformation**: Repositories handle conversion transparently

**Catalog ID Mappings:**
- **Attack Types**: 1=email, 2=SMS, 3=whatsapp, 4=llamada, 5=redes_sociales, 6=otro
- **Impacts**: 1=ninguno, 2=robo_datos, 3=robo_dinero, 4=cuenta_comprometida
- **Status**: 1=nuevo, 2=revisado, 3=en_investigacion, 4=cerrado
