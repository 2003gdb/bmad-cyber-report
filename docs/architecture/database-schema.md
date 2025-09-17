# Database Schema

This document describes the MySQL database schema for SafeTrade's cybersecurity incident reporting platform.

## Overview

The database uses **MySQL** with **direct SQL queries**  for optimal performance. The schema supports:
- Anonymous and identified incident reporting
- Spanish localization with ENUM values
- Admin user management separate from regular users
- File attachment support for evidence uploads

## Complete Schema

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin users table (separate from regular users for security)
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table (core incident reporting - Spanish field names where appropriate)
CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, -- NULL for anonymous reports
    is_anonymous BOOLEAN DEFAULT TRUE,

    -- Attack details
    attack_type ENUM('email', 'SMS', 'whatsapp', 'llamada', 'redes_sociales', 'otro') NOT NULL,
    incident_date DATE NOT NULL,
    incident_time TIME NULL,
    attack_origin VARCHAR(255) NOT NULL, -- Phone number or email of attacker

    -- Optional evidence
    suspicious_url TEXT NULL,
    message_content TEXT NULL, -- Original attack message
    description TEXT NULL, -- Free-text description

    -- Impact assessment
    impact_level ENUM('ninguno', 'robo_datos', 'robo_dinero', 'cuenta_comprometida') NOT NULL,

    -- Administrative fields
    status ENUM('nuevo', 'revisado', 'en_investigacion', 'cerrado') DEFAULT 'nuevo',
    admin_notes TEXT NULL, -- Investigation notes

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

    -- Indexes for performance
    INDEX idx_attack_type (attack_type),
    INDEX idx_incident_date (incident_date),
    INDEX idx_status (status),
    INDEX idx_impact_level (impact_level),
    INDEX idx_anonymous (is_anonymous),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Report attachments table (screenshots and evidence files)
CREATE TABLE reporte_adjuntos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporte_id INT NOT NULL,

    file_path VARCHAR(500) NOT NULL, -- Server storage path

    -- Security and integrity
    file_hash VARCHAR(64) NULL, -- SHA-256 for integrity

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE,
);


