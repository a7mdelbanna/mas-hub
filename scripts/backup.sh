#!/bin/bash

# MAS Hub Backup Script
# Usage: ./scripts/backup.sh <environment> [options]

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${2:-$NC}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1" "$RED"
    exit 1
}

# Show usage
show_usage() {
    cat << EOF
MAS Hub Backup Script

Usage: $0 <environment> [options]

Environments:
  dev         Backup development environment
  staging     Backup staging environment
  prod        Backup production environment

Options:
  --firestore-only    Backup only Firestore database
  --storage-only      Backup only Firebase Storage
  --full             Full backup (default)
  --retention-days N  Set backup retention period (default: 30)
  --output-dir DIR   Custom backup output directory
  --compress         Compress backup files
  --encrypt          Encrypt backup files
  --help             Show this help message

Examples:
  $0 prod --full --compress --encrypt
  $0 staging --firestore-only
  $0 dev --retention-days 7
EOF
}

# Parse command line arguments
parse_arguments() {
    ENVIRONMENT=""
    FIRESTORE_ONLY=false
    STORAGE_ONLY=false
    FULL_BACKUP=true
    RETENTION_DAYS=30
    OUTPUT_DIR=""
    COMPRESS=false
    ENCRYPT=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            dev|staging|prod)
                ENVIRONMENT="$1"
                shift
                ;;
            --firestore-only)
                FIRESTORE_ONLY=true
                STORAGE_ONLY=false
                FULL_BACKUP=false
                shift
                ;;
            --storage-only)
                STORAGE_ONLY=true
                FIRESTORE_ONLY=false
                FULL_BACKUP=false
                shift
                ;;
            --full)
                FULL_BACKUP=true
                FIRESTORE_ONLY=false
                STORAGE_ONLY=false
                shift
                ;;
            --retention-days)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            --output-dir)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            --compress)
                COMPRESS=true
                shift
                ;;
            --encrypt)
                ENCRYPT=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                error_exit "Unknown option: $1"
                ;;
        esac
    done

    if [[ -z "$ENVIRONMENT" ]]; then
        error_exit "Environment is required. Use --help for usage information."
    fi
}

# Set environment-specific variables
set_environment_config() {
    case $ENVIRONMENT in
        dev)
            FIREBASE_PROJECT_ID="mashub-dev-a0725"
            BACKUP_BUCKET="mashub-dev-a0725-backups"
            ;;
        staging)
            FIREBASE_PROJECT_ID="mashub-staging-a0725"
            BACKUP_BUCKET="mashub-staging-a0725-backups"
            ;;
        prod)
            FIREBASE_PROJECT_ID="mashub-a0725"
            BACKUP_BUCKET="mashub-a0725-backups"
            ;;
        *)
            error_exit "Invalid environment: $ENVIRONMENT"
            ;;
    esac

    # Set default output directory
    if [[ -z "$OUTPUT_DIR" ]]; then
        OUTPUT_DIR="$PROJECT_ROOT/backups/$ENVIRONMENT"
    fi

    # Create timestamp for backup
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="$OUTPUT_DIR/$BACKUP_TIMESTAMP"

    log "Environment: $ENVIRONMENT" "$BLUE"
    log "Firebase Project: $FIREBASE_PROJECT_ID" "$BLUE"
    log "Backup Directory: $BACKUP_DIR" "$BLUE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..." "$BLUE"

    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        error_exit "Firebase CLI is not installed. Run: npm install -g firebase-tools"
    fi

    # Check if gcloud CLI is installed
    if ! command -v gcloud &> /dev/null; then
        error_exit "Google Cloud CLI is not installed. Please install from https://cloud.google.com/sdk"
    fi

    # Check authentication
    if [[ -z "$FIREBASE_TOKEN" ]] && ! firebase projects:list &> /dev/null; then
        error_exit "Not authenticated with Firebase. Run: firebase login"
    fi

    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 &> /dev/null; then
        error_exit "Not authenticated with Google Cloud. Run: gcloud auth login"
    fi

    # Check if jq is installed for JSON processing
    if ! command -v jq &> /dev/null; then
        log "jq not found, installing..." "$YELLOW"
        if command -v brew &> /dev/null; then
            brew install jq
        elif command -v apt-get &> /dev/null; then
            sudo apt-get install -y jq
        else
            error_exit "Please install jq manually"
        fi
    fi

    log "Prerequisites check passed" "$GREEN"
}

# Create backup directory
create_backup_directory() {
    log "Creating backup directory..." "$BLUE"

    mkdir -p "$BACKUP_DIR"

    # Create metadata file
    cat > "$BACKUP_DIR/backup_metadata.json" << EOF
{
  "timestamp": "$BACKUP_TIMESTAMP",
  "environment": "$ENVIRONMENT",
  "project_id": "$FIREBASE_PROJECT_ID",
  "backup_type": "$([[ "$FULL_BACKUP" == true ]] && echo "full" || ([[ "$FIRESTORE_ONLY" == true ]] && echo "firestore" || echo "storage"))",
  "created_by": "$(whoami)",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
}
EOF

    log "Backup directory created: $BACKUP_DIR" "$GREEN"
}

# Backup Firestore database
backup_firestore() {
    if [[ "$FIRESTORE_ONLY" == true || "$FULL_BACKUP" == true ]]; then
        log "Starting Firestore backup..." "$BLUE"

        # Set the project
        gcloud config set project "$FIREBASE_PROJECT_ID"

        # Export Firestore database
        FIRESTORE_BACKUP_DIR="$BACKUP_DIR/firestore"
        mkdir -p "$FIRESTORE_BACKUP_DIR"

        log "Exporting Firestore database..." "$BLUE"

        # Create a Cloud Storage bucket path for the export
        GCS_EXPORT_PATH="gs://$BACKUP_BUCKET/firestore-exports/$BACKUP_TIMESTAMP"

        # Export Firestore to Cloud Storage
        EXPORT_OPERATION=$(gcloud firestore export "$GCS_EXPORT_PATH" --project="$FIREBASE_PROJECT_ID" --format="value(name)")

        log "Firestore export operation: $EXPORT_OPERATION" "$BLUE"

        # Wait for export to complete
        log "Waiting for Firestore export to complete..." "$YELLOW"
        while true; do
            STATUS=$(gcloud firestore operations describe "$EXPORT_OPERATION" --format="value(done)" --project="$FIREBASE_PROJECT_ID")
            if [[ "$STATUS" == "True" ]]; then
                break
            fi
            log "Export still in progress..." "$YELLOW"
            sleep 10
        done

        # Download the export from Cloud Storage
        log "Downloading Firestore export..." "$BLUE"
        gsutil -m cp -r "$GCS_EXPORT_PATH" "$FIRESTORE_BACKUP_DIR/"

        # Clean up Cloud Storage export (optional)
        # gsutil -m rm -r "$GCS_EXPORT_PATH"

        # Create a local copy of Firestore data for quick restore
        log "Creating Firestore metadata backup..." "$BLUE"

        # Export collection schemas
        firebase firestore:indexes --project="$FIREBASE_PROJECT_ID" > "$FIRESTORE_BACKUP_DIR/indexes.json" || log "Could not export indexes" "$YELLOW"

        log "Firestore backup completed" "$GREEN"
    fi
}

# Backup Firebase Storage
backup_storage() {
    if [[ "$STORAGE_ONLY" == true || "$FULL_BACKUP" == true ]]; then
        log "Starting Firebase Storage backup..." "$BLUE"

        STORAGE_BACKUP_DIR="$BACKUP_DIR/storage"
        mkdir -p "$STORAGE_BACKUP_DIR"

        # Backup all files from Firebase Storage
        STORAGE_BUCKET="$FIREBASE_PROJECT_ID.appspot.com"

        log "Backing up Firebase Storage from gs://$STORAGE_BUCKET..." "$BLUE"

        # Use gsutil to sync all files
        if gsutil ls "gs://$STORAGE_BUCKET" &> /dev/null; then
            gsutil -m rsync -r "gs://$STORAGE_BUCKET" "$STORAGE_BACKUP_DIR/"

            # Create storage metadata
            gsutil ls -la "gs://$STORAGE_BUCKET/**" > "$STORAGE_BACKUP_DIR/storage_manifest.txt" 2>/dev/null || log "Could not create storage manifest" "$YELLOW"

            log "Firebase Storage backup completed" "$GREEN"
        else
            log "Firebase Storage bucket not found or empty" "$YELLOW"
        fi
    fi
}

# Backup Firebase Functions configurations
backup_functions_config() {
    if [[ "$FULL_BACKUP" == true ]]; then
        log "Backing up Firebase Functions configuration..." "$BLUE"

        FUNCTIONS_BACKUP_DIR="$BACKUP_DIR/functions"
        mkdir -p "$FUNCTIONS_BACKUP_DIR"

        # Export functions configuration (without secrets)
        firebase functions:config:get --project="$FIREBASE_PROJECT_ID" > "$FUNCTIONS_BACKUP_DIR/functions_config.json" 2>/dev/null || log "Could not export functions config" "$YELLOW"

        # Copy functions source code
        if [[ -d "$PROJECT_ROOT/functions" ]]; then
            cp -r "$PROJECT_ROOT/functions" "$FUNCTIONS_BACKUP_DIR/source"
            # Remove node_modules and build artifacts
            rm -rf "$FUNCTIONS_BACKUP_DIR/source/node_modules"
            rm -rf "$FUNCTIONS_BACKUP_DIR/source/lib"
        fi

        log "Functions configuration backup completed" "$GREEN"
    fi
}

# Backup project configuration
backup_project_config() {
    if [[ "$FULL_BACKUP" == true ]]; then
        log "Backing up project configuration..." "$BLUE"

        CONFIG_BACKUP_DIR="$BACKUP_DIR/config"
        mkdir -p "$CONFIG_BACKUP_DIR"

        # Copy Firebase configuration files
        cp "$PROJECT_ROOT/firebase.json" "$CONFIG_BACKUP_DIR/" 2>/dev/null || log "firebase.json not found" "$YELLOW"
        cp "$PROJECT_ROOT/.firebaserc" "$CONFIG_BACKUP_DIR/" 2>/dev/null || log ".firebaserc not found" "$YELLOW"
        cp "$PROJECT_ROOT/firestore.rules" "$CONFIG_BACKUP_DIR/" 2>/dev/null || log "firestore.rules not found" "$YELLOW"
        cp "$PROJECT_ROOT/storage.rules" "$CONFIG_BACKUP_DIR/" 2>/dev/null || log "storage.rules not found" "$YELLOW"
        cp "$PROJECT_ROOT/firestore.indexes.json" "$CONFIG_BACKUP_DIR/" 2>/dev/null || log "firestore.indexes.json not found" "$YELLOW"

        # Backup package.json files
        cp "$PROJECT_ROOT/package.json" "$CONFIG_BACKUP_DIR/" 2>/dev/null || log "package.json not found" "$YELLOW"
        cp "$PROJECT_ROOT/functions/package.json" "$CONFIG_BACKUP_DIR/functions_package.json" 2>/dev/null || log "functions/package.json not found" "$YELLOW"

        log "Project configuration backup completed" "$GREEN"
    fi
}

# Compress backup
compress_backup() {
    if [[ "$COMPRESS" == true ]]; then
        log "Compressing backup..." "$BLUE"

        cd "$OUTPUT_DIR"
        tar -czf "${BACKUP_TIMESTAMP}.tar.gz" "$BACKUP_TIMESTAMP/"

        # Verify compression was successful
        if [[ -f "${BACKUP_TIMESTAMP}.tar.gz" ]]; then
            # Remove uncompressed directory
            rm -rf "$BACKUP_TIMESTAMP/"
            BACKUP_DIR="$OUTPUT_DIR/${BACKUP_TIMESTAMP}.tar.gz"
            log "Backup compressed successfully: ${BACKUP_TIMESTAMP}.tar.gz" "$GREEN"
        else
            error_exit "Backup compression failed"
        fi
    fi
}

# Encrypt backup
encrypt_backup() {
    if [[ "$ENCRYPT" == true ]]; then
        log "Encrypting backup..." "$BLUE"

        # Check if gpg is installed
        if ! command -v gpg &> /dev/null; then
            error_exit "GPG is not installed. Please install GPG to encrypt backups."
        fi

        # Use symmetric encryption for simplicity
        read -s -p "Enter encryption passphrase: " PASSPHRASE
        echo

        if [[ "$COMPRESS" == true ]]; then
            gpg --batch --yes --passphrase "$PASSPHRASE" --symmetric --cipher-algo AES256 "$BACKUP_DIR"
            rm "$BACKUP_DIR"
            BACKUP_DIR="${BACKUP_DIR}.gpg"
        else
            cd "$OUTPUT_DIR"
            tar -c "$BACKUP_TIMESTAMP/" | gpg --batch --yes --passphrase "$PASSPHRASE" --symmetric --cipher-algo AES256 > "${BACKUP_TIMESTAMP}.tar.gpg"
            rm -rf "$BACKUP_TIMESTAMP/"
            BACKUP_DIR="$OUTPUT_DIR/${BACKUP_TIMESTAMP}.tar.gpg"
        fi

        log "Backup encrypted successfully" "$GREEN"
    fi
}

# Clean old backups
clean_old_backups() {
    log "Cleaning old backups (retention: $RETENTION_DAYS days)..." "$BLUE"

    # Find and remove backups older than retention period
    find "$OUTPUT_DIR" -name "*.tar.gz" -o -name "*.tar.gpg" -o -type d -name "20*" | while read -r backup_path; do
        if [[ -f "$backup_path" ]]; then
            # For files, check modification time
            if [[ $(find "$backup_path" -mtime +$RETENTION_DAYS -print) ]]; then
                log "Removing old backup file: $backup_path" "$YELLOW"
                rm -f "$backup_path"
            fi
        elif [[ -d "$backup_path" ]]; then
            # For directories, check if older than retention period
            if [[ $(find "$backup_path" -maxdepth 0 -mtime +$RETENTION_DAYS -print) ]]; then
                log "Removing old backup directory: $backup_path" "$YELLOW"
                rm -rf "$backup_path"
            fi
        fi
    done

    log "Old backup cleanup completed" "$GREEN"
}

# Generate backup report
generate_backup_report() {
    log "Generating backup report..." "$BLUE"

    REPORT_FILE="$OUTPUT_DIR/backup_report_${BACKUP_TIMESTAMP}.txt"

    cat > "$REPORT_FILE" << EOF
MAS Hub Backup Report
====================

Backup Details:
- Timestamp: $BACKUP_TIMESTAMP
- Environment: $ENVIRONMENT
- Project ID: $FIREBASE_PROJECT_ID
- Backup Type: $([[ "$FULL_BACKUP" == true ]] && echo "Full Backup" || ([[ "$FIRESTORE_ONLY" == true ]] && echo "Firestore Only" || echo "Storage Only"))
- Created By: $(whoami)
- Git Commit: $(git rev-parse HEAD 2>/dev/null || echo 'unknown')

Backup Location:
- Directory: $BACKUP_DIR
- Compressed: $([[ "$COMPRESS" == true ]] && echo "Yes" || echo "No")
- Encrypted: $([[ "$ENCRYPT" == true ]] && echo "Yes" || echo "No")

Backup Size:
$(if [[ -f "$BACKUP_DIR" ]]; then
    du -h "$BACKUP_DIR"
elif [[ -d "$BACKUP_DIR" ]]; then
    du -sh "$BACKUP_DIR"
fi)

Components Backed Up:
$([[ "$FIRESTORE_ONLY" == true || "$FULL_BACKUP" == true ]] && echo "✅ Firestore Database" || echo "❌ Firestore Database")
$([[ "$STORAGE_ONLY" == true || "$FULL_BACKUP" == true ]] && echo "✅ Firebase Storage" || echo "❌ Firebase Storage")
$([[ "$FULL_BACKUP" == true ]] && echo "✅ Functions Configuration" || echo "❌ Functions Configuration")
$([[ "$FULL_BACKUP" == true ]] && echo "✅ Project Configuration" || echo "❌ Project Configuration")

Retention Policy: $RETENTION_DAYS days

Restore Command:
./scripts/restore.sh $ENVIRONMENT --backup-file="$BACKUP_DIR"

EOF

    log "Backup report generated: $REPORT_FILE" "$GREEN"
}

# Update backup inventory
update_backup_inventory() {
    log "Updating backup inventory..." "$BLUE"

    INVENTORY_FILE="$OUTPUT_DIR/backup_inventory.json"

    # Create inventory file if it doesn't exist
    if [[ ! -f "$INVENTORY_FILE" ]]; then
        echo "[]" > "$INVENTORY_FILE"
    fi

    # Add current backup to inventory
    TEMP_FILE=$(mktemp)
    jq ". += [{
        \"timestamp\": \"$BACKUP_TIMESTAMP\",
        \"environment\": \"$ENVIRONMENT\",
        \"project_id\": \"$FIREBASE_PROJECT_ID\",
        \"backup_type\": \"$([[ "$FULL_BACKUP" == true ]] && echo "full" || ([[ "$FIRESTORE_ONLY" == true ]] && echo "firestore" || echo "storage"))\",
        \"backup_path\": \"$BACKUP_DIR\",
        \"compressed\": $([[ "$COMPRESS" == true ]] && echo "true" || echo "false"),
        \"encrypted\": $([[ "$ENCRYPT" == true ]] && echo "true" || echo "false"),
        \"created_by\": \"$(whoami)\",
        \"git_commit\": \"$(git rev-parse HEAD 2>/dev/null || echo 'unknown')\"
    }]" "$INVENTORY_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$INVENTORY_FILE"

    log "Backup inventory updated" "$GREEN"
}

# Main backup function
main() {
    log "Starting MAS Hub backup process..." "$BLUE"

    parse_arguments "$@"
    set_environment_config
    check_prerequisites
    create_backup_directory
    backup_firestore
    backup_storage
    backup_functions_config
    backup_project_config
    compress_backup
    encrypt_backup
    clean_old_backups
    generate_backup_report
    update_backup_inventory

    log "Backup completed successfully!" "$GREEN"
    log "Backup location: $BACKUP_DIR" "$GREEN"

    if [[ "$ENVIRONMENT" == "prod" ]]; then
        log "🔒 Production backup completed!" "$GREEN"
    fi
}

# Run main function with all arguments
main "$@"