#!/bin/bash
# =============================================================================
# LOCKON Workspace — Backup Script
# =============================================================================
# Creates timestamped backups of:
#   - PostgreSQL database (pg_dump → .sql.gz)
#   - Mattermost config directory
#
# Usage:
#   ./scripts/backup.sh              # Default: 7-day retention
#   ./scripts/backup.sh 30           # Custom: 30-day retention
#
# Backups are stored in ./backups/
# =============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups"
RETENTION_DAYS="${1:-7}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Load environment variables
if [ -f "${PROJECT_DIR}/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    source "${PROJECT_DIR}/.env"
    set +a
else
    echo "ERROR: .env file not found at ${PROJECT_DIR}/.env"
    exit 1
fi

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$msg"
    echo "$msg" >> "$LOG_FILE"
}

log "=========================================="
log "LOCKON Backup Started"
log "=========================================="

# --- 1. Database Backup ---
DB_BACKUP_FILE="${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"
log "Backing up PostgreSQL database..."

if docker compose -f "${PROJECT_DIR}/docker-compose.yml" exec -T postgres \
    pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists \
    | gzip > "${DB_BACKUP_FILE}"; then
    DB_SIZE=$(du -h "${DB_BACKUP_FILE}" | cut -f1)
    log "✅ Database backup successful: ${DB_BACKUP_FILE} (${DB_SIZE})"
else
    log "❌ Database backup FAILED!"
    rm -f "${DB_BACKUP_FILE}"
    exit 1
fi

# --- 2. Config Backup ---
CONFIG_BACKUP_FILE="${BACKUP_DIR}/config_${TIMESTAMP}.tar.gz"
log "Backing up Mattermost config..."

if tar -czf "${CONFIG_BACKUP_FILE}" \
    -C "${PROJECT_DIR}" \
    volumes/app/mattermost/config \
    .env 2>/dev/null; then
    CONFIG_SIZE=$(du -h "${CONFIG_BACKUP_FILE}" | cut -f1)
    log "✅ Config backup successful: ${CONFIG_BACKUP_FILE} (${CONFIG_SIZE})"
else
    log "⚠️  Config backup failed (config dir may not exist yet)"
fi

# --- 3. Prune Old Backups ---
log "Pruning backups older than ${RETENTION_DAYS} days..."

PRUNED_COUNT=$(find "${BACKUP_DIR}" \( -name "db_*.sql.gz" -o -name "config_*.tar.gz" \) -mtime +"${RETENTION_DAYS}" -print -delete 2>/dev/null | wc -l)

log "Pruned ${PRUNED_COUNT} old backup(s)"

# --- Summary ---
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" 2>/dev/null | cut -f1)
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "*.gz" | wc -l)

log "=========================================="
log "Backup Complete!"
log "  Total backups: ${BACKUP_COUNT}"
log "  Total size:    ${TOTAL_SIZE}"
log "  Retention:     ${RETENTION_DAYS} days"
log "=========================================="
