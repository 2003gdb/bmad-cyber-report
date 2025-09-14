# Database Backup and Recovery Procedures

## Overview

This document outlines the backup and recovery procedures for the SafeTrade MySQL database to ensure data integrity and business continuity.

## Database Information

- **Database Type**: MySQL 8.0+
- **Database Name**: `safetrade_dev` (development), `safetrade_prod` (production)
- **Default Port**: 3306
- **ORM**: Sequelize

## Backup Procedures

### 1. Manual Backup (Development)

```bash
# Create a backup of the entire database
mysqldump -u [username] -p[password] --single-transaction --routines --triggers safetrade_dev > backup_$(date +%Y%m%d_%H%M%S).sql

# Create a backup with compression
mysqldump -u [username] -p[password] --single-transaction --routines --triggers safetrade_dev | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup specific tables (if needed)
mysqldump -u [username] -p[password] safetrade_dev reports users report_attachments > specific_tables_backup.sql
```

### 2. Automated Backup Script

Create a backup script at `scripts/backup-database.sh`:

```bash
#!/bin/bash

# Database backup configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-safetrade_dev}"
DB_USER="${DB_USER}"
DB_PASSWORD="${DB_PASSWORD}"

# Backup directory
BACKUP_DIR="./backups/database"
mkdir -p "$BACKUP_DIR"

# Create timestamped backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/safetrade_backup_$TIMESTAMP.sql.gz"

# Perform backup
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  --add-drop-table \
  --disable-keys \
  --extended-insert \
  "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Database backup completed successfully: $BACKUP_FILE"

  # Keep only the last 7 days of backups
  find "$BACKUP_DIR" -name "safetrade_backup_*.sql.gz" -mtime +7 -delete

  echo "📁 Old backups cleaned up (keeping last 7 days)"
else
  echo "❌ Database backup failed!"
  exit 1
fi
```

### 3. Production Backup Schedule

For production environments, implement automated backups using cron:

```bash
# Add to crontab (crontab -e)
# Daily backup at 2:00 AM
0 2 * * * /path/to/safetrade-monorepo/scripts/backup-database.sh

# Weekly full backup on Sundays at 1:00 AM
0 1 * * 0 /path/to/safetrade-monorepo/scripts/backup-database-full.sh
```

## Recovery Procedures

### 1. Full Database Restore

```bash
# Restore from uncompressed backup
mysql -u [username] -p[password] safetrade_dev < backup_20250114_120000.sql

# Restore from compressed backup
gunzip -c backup_20250114_120000.sql.gz | mysql -u [username] -p[password] safetrade_dev

# Restore with database recreation
mysql -u [username] -p[password] -e "DROP DATABASE IF EXISTS safetrade_dev; CREATE DATABASE safetrade_dev;"
mysql -u [username] -p[password] safetrade_dev < backup_20250114_120000.sql
```

### 2. Point-in-Time Recovery

If binary logging is enabled:

```bash
# Restore to specific point in time
mysql -u [username] -p[password] safetrade_dev < last_full_backup.sql
mysqlbinlog --start-datetime="2025-01-14 12:00:00" --stop-datetime="2025-01-14 14:30:00" /var/log/mysql/mysql-bin.000001 | mysql -u [username] -p[password] safetrade_dev
```

### 3. Recovery Testing Script

Create `scripts/test-recovery.sh`:

```bash
#!/bin/bash

TEST_DB_NAME="safetrade_test_recovery"
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

echo "🧪 Testing recovery with backup: $BACKUP_FILE"

# Create test database
mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS $TEST_DB_NAME; CREATE DATABASE $TEST_DB_NAME;"

# Restore backup to test database
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | mysql -u "$DB_USER" -p"$DB_PASSWORD" "$TEST_DB_NAME"
else
  mysql -u "$DB_USER" -p"$DB_PASSWORD" "$TEST_DB_NAME" < "$BACKUP_FILE"
fi

# Verify table count and basic structure
TABLE_COUNT=$(mysql -u "$DB_USER" -p"$DB_PASSWORD" -se "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$TEST_DB_NAME';" 2>/dev/null)

if [ "$TABLE_COUNT" -gt 0 ]; then
  echo "✅ Recovery test successful! Restored $TABLE_COUNT tables."
  mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "SHOW TABLES;" "$TEST_DB_NAME"
else
  echo "❌ Recovery test failed! No tables found."
fi

# Cleanup test database
mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE $TEST_DB_NAME;"
```

## Backup Storage Strategy

### Local Development
- Store backups in `./backups/database/` directory
- Keep last 7 days of daily backups
- Exclude from git (already in .gitignore)

### Production
- **Primary**: Local server storage with daily rotation
- **Secondary**: Cloud storage (AWS S3, Google Cloud Storage)
- **Tertiary**: Offsite backup location
- **Retention**: 30 daily, 12 monthly, 7 yearly backups

## Monitoring and Alerts

### Backup Verification
```bash
# Verify backup file integrity
gzip -t backup_20250114_120000.sql.gz

# Check backup file size (should not be suspiciously small)
ls -lh backup_20250114_120000.sql.gz
```

### Alert Configuration
- Email notifications on backup failures
- Monitor backup file sizes for anomalies
- Slack/Discord notifications for production backup status

## Security Considerations

1. **Encryption**: Encrypt backup files for production
2. **Access Control**: Limit backup file access to authorized personnel
3. **Secure Transfer**: Use secure protocols (SFTP, SCP) for remote backups
4. **Password Protection**: Store database credentials securely (environment variables)

## Emergency Contacts

- **Database Administrator**: [Your Team Lead]
- **DevOps Team**: [DevOps Contact]
- **Emergency Escalation**: [Emergency Contact]

## Testing Schedule

- **Weekly**: Test backup creation process
- **Monthly**: Test full database recovery
- **Quarterly**: Test point-in-time recovery
- **Annually**: Test complete disaster recovery scenario

---

**Last Updated**: January 14, 2025
**Next Review**: February 14, 2025