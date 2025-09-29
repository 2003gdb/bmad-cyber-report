# Cross-Functional Data Requirements

## Data Entities and Relationships

**Core Database Schema:**

**Users Table (Optional):**
- user_id (Primary Key)
- email (Unique)
- password_hash
- jwt_token (current session)
- created_at
- updated_at

**Reports Table:**
- report_id (Primary Key)
- user_id (Foreign Key to Users, NULL for anonymous reports)
- is_anonymous (Boolean - true for anonymous, false for identified)
- attack_type (email, SMS, WhatsApp, llamada, redes_sociales, otro)
- incident_date
- incident_time
- attack_origin (phone/email of attacker)
- suspicious_url
- message_content (TEXT)
- impact_level (ninguno, robo_datos, robo_dinero, cuenta_comprometida)
- description (TEXT)
- status (nuevo, revisado, en_investigacion, cerrado)
- created_at
- updated_at

**Report_Attachments Table:**
- attachment_id (Primary Key)
- report_id (Foreign Key to Reports)
- file_name
- file_path
- uploaded_at

**Admin_Users Table:**
- admin_id (Primary Key)
- email (Unique)
- password_hash
- created_at

## Data Storage Requirements
- Encrypted storage for sensitive user data
- Secure file storage for uploaded screenshots and attachments
- Regular automated backups with 30-day retention
- Data archiving strategy for reports older than 2 years
