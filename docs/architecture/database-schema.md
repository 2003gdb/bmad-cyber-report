# Database Schema

```sql
-- SafeTrade Database Schema for MySQL
-- Academic Project - Open source database solution

-- Users Table (Optional Registration)
CREATE TABLE Users (
    user_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL, 
    jwt_token VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    KEY IX_Users_Email (email),
    KEY IX_Users_JwtToken (jwt_token)
);

-- Reports Table (Core Incident Data)
CREATE TABLE Reports (
    report_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NULL, -- NULL for anonymous reports
    is_anonymous BOOLEAN NOT NULL DEFAULT 1, -- Explicit anonymous flag
    
    -- Attack Details
    attack_type VARCHAR(20) NOT NULL 
        CHECK (attack_type IN ('email', 'SMS', 'whatsapp', 'llamada', 'redes_sociales', 'otro')),
    incident_date DATE NOT NULL,
    incident_time TIME NULL,
    attack_origin VARCHAR(255) NOT NULL, -- Phone/email of attacker
    
    -- Optional Evidence
    suspicious_url VARCHAR(2048) NULL,
    message_content TEXT NULL, -- Original attack message
    description TEXT NULL, -- Free-text description
    
    -- Impact Assessment
    impact_level VARCHAR(30) NOT NULL 
        CHECK (impact_level IN ('ninguno', 'robo_datos', 'robo_dinero', 'cuenta_comprometida')),
    
    -- Administrative
    status VARCHAR(20) NOT NULL DEFAULT 'nuevo'
        CHECK (status IN ('nuevo', 'revisado', 'en_investigacion', 'cerrado')),
    admin_notes TEXT NULL, -- Investigation notes
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key (nullable for anonymous)
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    
    -- Performance Indexes
    KEY IX_Reports_AttackType (attack_type),
    KEY IX_Reports_IncidentDate (incident_date),
    KEY IX_Reports_Status (status),
    KEY IX_Reports_ImpactLevel (impact_level),
    KEY IX_Reports_Anonymous (is_anonymous),
    KEY IX_Reports_UserId (user_id), -- For user report history
    KEY IX_Reports_CreatedAt (created_at) -- For trends analysis
);

-- Report Attachments (File Uploads)
CREATE TABLE ReportAttachments (
    attachment_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id VARCHAR(36) NOT NULL,
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL, -- User's original filename
    file_path VARCHAR(500) NOT NULL, -- Server storage path
    file_size BIGINT NOT NULL, -- Size in bytes
    mime_type VARCHAR(100) NOT NULL, -- Content type validation
    
    -- Security
    file_hash VARCHAR(64) NULL, -- SHA-256 for integrity
    scan_status VARCHAR(20) DEFAULT 'pending' -- For malware scanning
        CHECK (scan_status IN ('pending', 'clean', 'quarantined')),
    
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (report_id) REFERENCES Reports(report_id) ON DELETE CASCADE,
    
    -- Performance Index
    KEY IX_Attachments_ReportId (report_id)
);

-- Admin Users (Separate from regular users)
CREATE TABLE AdminUsers (
    admin_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL, -- Unique cryptographic salt for password hashing
    
    -- Admin Metadata
    role VARCHAR(50) DEFAULT 'admin' -- Future role expansion
        CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT 1,
    last_login TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    KEY IX_AdminUsers_Email (email),
    KEY IX_AdminUsers_Active (is_active)
);

-- Community Analytics Cache (Performance Optimization)
CREATE TABLE CommunityTrends (
    trend_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Trend Data
    attack_type VARCHAR(20) NOT NULL,
    time_period VARCHAR(10) NOT NULL -- '7days', '30days', '90days'
        CHECK (time_period IN ('7days', '30days', '90days')),
    region VARCHAR(100) NULL, -- For future regional analysis
    
    -- Calculated Statistics
    report_count INT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    trend_direction VARCHAR(10) NULL -- 'increasing', 'decreasing', 'stable'
        CHECK (trend_direction IN ('increasing', 'decreasing', 'stable')),
    
    -- Cache Management
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL, -- TTL for cache invalidation
    
    -- Performance Indexes
    KEY IX_Trends_Period_Type (time_period, attack_type),
    KEY IX_Trends_Expiry (expires_at)
);

-- Note: MySQL handles updated_at timestamps automatically with
-- "ON UPDATE CURRENT_TIMESTAMP" clause in column definitions

-- Views for Common Queries

-- Anonymous Reports View (Privacy Protection)
CREATE VIEW AnonymousReports AS
SELECT 
    report_id,
    attack_type,
    incident_date,
    impact_level,
    status,
    created_at
FROM Reports
WHERE is_anonymous = 1;

-- User Report History View (Identified Reports Only)
CREATE VIEW UserReportHistory AS
SELECT 
    r.report_id,
    r.user_id,
    r.attack_type,
    r.incident_date,
    r.impact_level,
    r.status,
    r.created_at,
    COUNT(a.attachment_id) as attachment_count
FROM Reports r
LEFT JOIN ReportAttachments a ON r.report_id = a.report_id
WHERE r.is_anonymous = 0 AND r.user_id IS NOT NULL
GROUP BY r.report_id, r.user_id, r.attack_type, r.incident_date, 
         r.impact_level, r.status, r.created_at;

-- Admin Dashboard Summary View
CREATE VIEW AdminDashboard AS
SELECT 
    COUNT(*) as total_reports,
    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as reports_today,
    COUNT(CASE WHEN impact_level IN ('robo_dinero', 'robo_datos') THEN 1 END) as critical_reports,
    COUNT(CASE WHEN status = 'nuevo' THEN 1 END) as pending_review
FROM Reports;
```
