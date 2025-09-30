# Database Schema

This document describes the MySQL database schema for SafeTrade's cybersecurity incident reporting platform.

## Overview

The database uses **MySQL 8.0+** with **direct SQL queries** (via mysql2/promise) for optimal performance. The schema supports:
- Anonymous and identified incident reporting
- Normalized catalog tables for scalability and consistency
- Admin user management separate from regular users
- Evidence URL support for photo uploads (stored in `/public/uploads/`)

**Active Database:** `safetrade_dev2`

## Complete Schema

```sql
-- Regular users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    pass_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table (separate from regular users for security)
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    pass_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Catalog table for attack types
CREATE TABLE attack_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Catalog table for impact levels
CREATE TABLE impacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Catalog table for report status
CREATE TABLE status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Reports table (core incident reporting - normalized structure)
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, -- NULL for anonymous reports
    is_anonymous BOOLEAN DEFAULT TRUE,

    -- Attack details (normalized foreign keys)
    attack_type INT NOT NULL,
    incident_date DATETIME NOT NULL,
    attack_origin VARCHAR(255) NULL, -- Phone number or email of attacker

    -- Evidence and content
    evidence_url VARCHAR(500) NULL, -- Relative path to uploaded photo (e.g., /uploads/filename.jpg)
    suspicious_url TEXT NULL, -- Malicious URL related to attack
    message_content TEXT NULL, -- Original attack message
    description TEXT NULL, -- Free-text description

    -- Impact and status (normalized foreign keys)
    impact INT NOT NULL,
    status INT NOT NULL DEFAULT 1, -- Defaults to 'nuevo' (status ID 1)

    -- Administrative fields
    admin_notes TEXT NULL, -- Investigation notes (updated via status endpoint)

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (attack_type) REFERENCES attack_types(id),
    FOREIGN KEY (impact) REFERENCES impacts(id),
    FOREIGN KEY (status) REFERENCES status(id),

    -- Indexes for performance
    INDEX idx_attack_type (attack_type),
    INDEX idx_incident_date (incident_date),
    INDEX idx_status (status),
    INDEX idx_impact (impact),
    INDEX idx_anonymous (is_anonymous),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

## Initial Catalog Data

The catalog tables are populated with the following initial data:

```sql
-- Attack types
INSERT INTO attack_types (name) VALUES
('email'), ('SMS'), ('whatsapp'), ('llamada'), ('redes_sociales'), ('otro');

-- Impact levels
INSERT INTO impacts (name) VALUES
('ninguno'), ('robo_datos'), ('robo_dinero'), ('cuenta_comprometida');

-- Report statuses
INSERT INTO status (name) VALUES
('nuevo'), ('revisado'), ('en_investigacion'), ('cerrado');
```

## File Upload Implementation

**Storage Configuration:**
- **Upload Directory:** `/public/uploads/` (served as static files)
- **Filename Pattern:** `timestamp-uuid.extension` (e.g., `1234567890-abc-def-ghi.jpg`)
- **Supported Formats:** JPEG (.jpg, .jpeg), PNG (.png), HEIC (.heic), HEIF (.heif)
- **Max File Size:** 10MB (configurable via MAX_FILE_SIZE env variable)
- **Storage Type:** Disk storage via Multer

**Workflow:**
1. Client uploads photo to `POST /reportes/upload-photo`
2. Server saves to `/public/uploads/` with unique filename
3. Server returns relative URL path (e.g., `/uploads/1234567890-abc-def.jpg`)
4. Client includes URL in `evidence_url` field when creating report

## Schema Changes from Previous Version

### Key Improvements:
1. **Normalized Structure**: Replaced ENUMs with foreign key relationships for better scalability
2. **Catalog Tables**: Separate tables for attack_types, impacts, and status enable easier maintenance
3. **Simplified Evidence**: Single `evidence_url` field stores path to uploaded photo
4. **Updated Field Names**:
   - `password_hash` → `pass_hash` for consistency
   - `admin_users` → `admins` table name (actual implementation)
   - `incident_date` now DATETIME (includes both date and time)
   - TIMESTAMP → DATETIME for all timestamp fields (actual implementation)
5. **Photo Upload System**: Multer-based file upload with disk storage

### Benefits:
- **Scalability**: Easy to add new attack types, impacts, or statuses without schema changes
- **Consistency**: Centralized catalog management through dedicated tables
- **Performance**: Better query optimization with proper foreign keys and indexes
- **Maintainability**: No schema changes needed for new catalog values
- **Simplicity**: File storage handled at application level, not in database


