# Database Schema

This document describes the MySQL database schema for SafeTrade's cybersecurity incident reporting platform.

## Overview

The database uses **MySQL** with **direct SQL queries** for optimal performance. The schema supports:
- Anonymous and identified incident reporting
- Normalized catalog tables for scalability and consistency
- Admin user management separate from regular users
- Evidence URL support for simplified file handling

## Complete Schema

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    pass_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin users table (separate from regular users for security)
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    pass_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Catalog table for attack types
CREATE TABLE attack_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
);

-- Catalog table for impact levels
CREATE TABLE impacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
);

-- Catalog table for report status
CREATE TABLE status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
);

-- Reports table (core incident reporting - normalized structure)
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, -- NULL for anonymous reports
    is_anonymous BOOLEAN DEFAULT TRUE,

    -- Attack details (normalized foreign keys)
    attack_type INT NOT NULL,
    incident_date TIMESTAMP NOT NULL,
    attack_origin VARCHAR(255) NULL, -- Phone number or email of attacker

    -- Evidence and content
    evidence_url TEXT NULL, -- URL to evidence files/screenshots
    suspicious_url TEXT NULL, -- Malicious URL related to attack
    message_content TEXT NULL, -- Original attack message
    description TEXT NULL, -- Free-text description

    -- Impact and status (normalized foreign keys)
    impact INT NOT NULL,
    status INT NOT NULL DEFAULT 1, -- Defaults to 'nuevo'

    -- Administrative fields
    admin_notes TEXT NULL, -- Investigation notes

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

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

## Schema Changes from Previous Version

### Key Improvements:
1. **Normalized Structure**: Replaced ENUMs with foreign key relationships for better scalability
2. **Catalog Tables**: Separate tables for attack_types, impacts, and status enable easier maintenance
3. **Simplified Evidence**: Single `evidence_url` field replaces separate attachment table
4. **Updated Field Names**:
   - `password_hash` → `pass_hash` for consistency
   - `reportes` → `reports` table name
   - `incident_date` now includes time (TIMESTAMP instead of separate DATE/TIME)
   - `suspicious_url` moved to separate field from evidence

### Benefits:
- **Scalability**: Easy to add new attack types, impacts, or statuses
- **Consistency**: Centralized catalog management
- **Performance**: Better query optimization with proper foreign keys
- **Maintainability**: No schema changes needed for new catalog values


