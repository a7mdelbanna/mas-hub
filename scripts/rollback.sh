#!/bin/bash

# MAS Hub Rollback Script
# Usage: ./scripts/rollback.sh <environment> [options]

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/rollback.log"

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
MAS Hub Rollback Script

Usage: $0 <environment> [options]

Environments:
  dev         Rollback development environment
  staging     Rollback staging environment
  prod        Rollback production environment

Options:
  --backup-id ID         Rollback to specific backup ID
  --previous-version     Rollback to previous deployment
  --list-backups         List available backups
  --functions-only       Rollback only Firebase functions
  --frontend-only        Rollback only frontend application
  --database-only        Rollback only database
  --dry-run              Show what would be rolled back
  --force                Skip confirmation prompts
  --help                 Show this help message

Examples:
  $0 prod --previous-version
  $0 staging --backup-id 20241125_143022
  $0 prod --list-backups
  $0 dev --functions-only --force
EOF
}

# Parse command line arguments
parse_arguments() {
    ENVIRONMENT=""
    BACKUP_ID=""
    PREVIOUS_VERSION=false
    LIST_BACKUPS=false
    FUNCTIONS_ONLY=false
    FRONTEND_ONLY=false
    DATABASE_ONLY=false
    DRY_RUN=false
    FORCE=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            dev|staging|prod)
                ENVIRONMENT="$1"
                shift
                ;;
            --backup-id)
                BACKUP_ID="$2"
                shift 2
                ;;
            --previous-version)
                PREVIOUS_VERSION=true
                shift
                ;;
            --list-backups)
                LIST_BACKUPS=true
                shift
                ;;
            --functions-only)
                FUNCTIONS_ONLY=true
                shift
                ;;
            --frontend-only)
                FRONTEND_ONLY=true
                shift
                ;;
            --database-only)
                DATABASE_ONLY=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
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
            TARGET_URL="https://mashub-dev-a0725.web.app"
            FUNCTIONS_URL="https://us-central1-mashub-dev-a0725.cloudfunctions.net"
            BACKUP_BUCKET="mashub-dev-a0725-backups"
            ;;
        staging)
            FIREBASE_PROJECT_ID="mashub-staging-a0725"
            TARGET_URL="https://mashub-staging-a0725.web.app"
            FUNCTIONS_URL="https://us-central1-mashub-staging-a0725.cloudfunctions.net"
            BACKUP_BUCKET="mashub-staging-a0725-backups"
            ;;
        prod)
            FIREBASE_PROJECT_ID="mashub-a0725"
            TARGET_URL="https://mashub-a0725.web.app"
            FUNCTIONS_URL="https://us-central1-mashub-a0725.cloudfunctions.net"
            BACKUP_BUCKET="mashub-a0725-backups"
            ;;
        *)
            error_exit "Invalid environment: $ENVIRONMENT"
            ;;
    esac

    BACKUP_DIR="$PROJECT_ROOT/backups/$ENVIRONMENT"

    log "Environment: $ENVIRONMENT" "$BLUE"
    log "Firebase Project: $FIREBASE_PROJECT_ID" "$BLUE"
    log "Target URL: $TARGET_URL" "$BLUE"
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

    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        error_exit "jq is not installed. Please install jq for JSON processing."
    fi

    log "Prerequisites check passed" "$GREEN"
}

# List available backups
list_available_backups() {
    log "Listing available backups for $ENVIRONMENT environment..." "$BLUE"

    INVENTORY_FILE="$BACKUP_DIR/backup_inventory.json"

    if [[ ! -f "$INVENTORY_FILE" ]]; then
        log "No backup inventory found for $ENVIRONMENT environment" "$YELLOW"
        return 1
    fi

    echo
    echo "Available Backups for $ENVIRONMENT Environment:"
    echo "================================================"

    jq -r '.[] | select(.environment == "'$ENVIRONMENT'") |
        "ID: " + .timestamp +
        " | Type: " + .backup_type +
        " | Created: " + .timestamp +
        " | By: " + .created_by +
        " | Commit: " + .git_commit[:8]' "$INVENTORY_FILE" |
    column -t -s '|'

    echo
    echo "Usage: ./scripts/rollback.sh $ENVIRONMENT --backup-id <ID>"
    echo
}

# Get deployment history
get_deployment_history() {
    log "Getting deployment history..." "$BLUE"

    DEPLOYMENT_HISTORY="$PROJECT_ROOT/deployment-history.json"

    if [[ ! -f "$DEPLOYMENT_HISTORY" ]]; then
        log "No deployment history found" "$YELLOW"
        return 1
    fi

    # Get last 5 deployments for this environment
    jq -r '.[] | select(.environment == "'$ENVIRONMENT'") |
        "Version: " + (.version // "unknown") +
        " | Deployed: " + .timestamp +
        " | By: " + .deployer +
        " | Commit: " + (.commit[:8] // "unknown")' "$DEPLOYMENT_HISTORY" |
    tail -5 | column -t -s '|'
}

# Find backup to rollback to
find_rollback_target() {
    if [[ "$LIST_BACKUPS" == true ]]; then
        list_available_backups
        exit 0
    fi

    if [[ -n "$BACKUP_ID" ]]; then
        # Use specified backup ID
        ROLLBACK_BACKUP_ID="$BACKUP_ID"
        log "Using specified backup ID: $ROLLBACK_BACKUP_ID" "$BLUE"
    elif [[ "$PREVIOUS_VERSION" == true ]]; then
        # Find the most recent backup
        INVENTORY_FILE="$BACKUP_DIR/backup_inventory.json"

        if [[ ! -f "$INVENTORY_FILE" ]]; then
            error_exit "No backup inventory found. Cannot determine previous version."
        fi

        ROLLBACK_BACKUP_ID=$(jq -r '.[] | select(.environment == "'$ENVIRONMENT'") | .timestamp' "$INVENTORY_FILE" | sort -r | head -1)

        if [[ -z "$ROLLBACK_BACKUP_ID" || "$ROLLBACK_BACKUP_ID" == "null" ]]; then
            error_exit "No previous backup found for $ENVIRONMENT environment"
        fi

        log "Using most recent backup: $ROLLBACK_BACKUP_ID" "$BLUE"
    else
        error_exit "Either --backup-id or --previous-version must be specified"
    fi

    # Validate backup exists
    ROLLBACK_BACKUP_PATH="$BACKUP_DIR/$ROLLBACK_BACKUP_ID"

    if [[ ! -d "$ROLLBACK_BACKUP_PATH" ]]; then
        # Check for compressed/encrypted versions
        if [[ -f "${ROLLBACK_BACKUP_PATH}.tar.gz" ]]; then
            ROLLBACK_BACKUP_PATH="${ROLLBACK_BACKUP_PATH}.tar.gz"
        elif [[ -f "${ROLLBACK_BACKUP_PATH}.tar.gpg" ]]; then
            ROLLBACK_BACKUP_PATH="${ROLLBACK_BACKUP_PATH}.tar.gpg"
            error_exit "Encrypted backups are not yet supported for rollback. Please decrypt manually first."
        else
            error_exit "Backup not found: $ROLLBACK_BACKUP_PATH"
        fi
    fi

    log "Rollback target: $ROLLBACK_BACKUP_PATH" "$GREEN"
}

# Confirm rollback
confirm_rollback() {
    if [[ "$FORCE" == false ]]; then
        echo
        log "⚠️  ROLLBACK CONFIRMATION REQUIRED ⚠️" "$YELLOW"
        echo
        echo "Environment: $ENVIRONMENT"
        echo "Backup ID: $ROLLBACK_BACKUP_ID"
        echo "Target URL: $TARGET_URL"
        echo

        if [[ "$ENVIRONMENT" == "prod" ]]; then
            log "🚨 THIS IS A PRODUCTION ROLLBACK! 🚨" "$RED"
            echo
        fi

        read -p "Are you sure you want to proceed with the rollback? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log "Rollback cancelled by user" "$YELLOW"
            exit 0
        fi
    fi
}

# Create emergency backup before rollback
create_emergency_backup() {
    log "Creating emergency backup before rollback..." "$BLUE"

    EMERGENCY_BACKUP_ID="emergency_$(date +%Y%m%d_%H%M%S)"

    # Create quick backup using existing backup script
    if [[ -x "$SCRIPT_DIR/backup.sh" ]]; then
        "$SCRIPT_DIR/backup.sh" "$ENVIRONMENT" \
            --output-dir "$BACKUP_DIR/$EMERGENCY_BACKUP_ID" \
            --compress || log "Emergency backup failed" "$YELLOW"
    else
        log "Backup script not found, skipping emergency backup" "$YELLOW"
    fi
}

# Extract backup if needed
extract_backup() {
    if [[ "$ROLLBACK_BACKUP_PATH" == *.tar.gz ]]; then
        log "Extracting compressed backup..." "$BLUE"

        cd "$(dirname "$ROLLBACK_BACKUP_PATH")"
        tar -xzf "$(basename "$ROLLBACK_BACKUP_PATH")"

        # Update path to extracted directory
        ROLLBACK_BACKUP_PATH="${ROLLBACK_BACKUP_PATH%.tar.gz}"

        log "Backup extracted to: $ROLLBACK_BACKUP_PATH" "$GREEN"
    fi
}

# Rollback Firestore database
rollback_firestore() {
    if [[ "$DATABASE_ONLY" == true || ( "$FUNCTIONS_ONLY" == false && "$FRONTEND_ONLY" == false ) ]]; then
        log "Rolling back Firestore database..." "$BLUE"

        FIRESTORE_BACKUP="$ROLLBACK_BACKUP_PATH/firestore"

        if [[ ! -d "$FIRESTORE_BACKUP" ]]; then
            log "Firestore backup not found in rollback target" "$YELLOW"
            return 0
        fi

        if [[ "$DRY_RUN" == true ]]; then
            log "DRY RUN: Would restore Firestore from $FIRESTORE_BACKUP" "$YELLOW"
            return 0
        fi

        # Set the project
        gcloud config set project "$FIREBASE_PROJECT_ID"

        # Find the export files
        EXPORT_FILES=$(find "$FIRESTORE_BACKUP" -name "*.overall_export_metadata" | head -1)

        if [[ -z "$EXPORT_FILES" ]]; then
            error_exit "No valid Firestore export found in backup"
        fi

        EXPORT_DIR=$(dirname "$EXPORT_FILES")

        log "Restoring Firestore from: $EXPORT_DIR" "$BLUE"

        # Import the Firestore backup
        IMPORT_OPERATION=$(gcloud firestore import "$EXPORT_DIR" --project="$FIREBASE_PROJECT_ID" --format="value(name)")

        log "Firestore import operation: $IMPORT_OPERATION" "$BLUE"

        # Wait for import to complete
        log "Waiting for Firestore import to complete..." "$YELLOW"
        while true; do
            STATUS=$(gcloud firestore operations describe "$IMPORT_OPERATION" --format="value(done)" --project="$FIREBASE_PROJECT_ID")
            if [[ "$STATUS" == "True" ]]; then
                break
            fi
            log "Import still in progress..." "$YELLOW"
            sleep 10
        done

        # Restore indexes if available
        if [[ -f "$FIRESTORE_BACKUP/indexes.json" ]]; then
            log "Restoring Firestore indexes..." "$BLUE"
            firebase deploy --only firestore:indexes --project="$FIREBASE_PROJECT_ID" || log "Index restore failed" "$YELLOW"
        fi

        log "Firestore rollback completed" "$GREEN"
    fi
}

# Rollback Firebase Storage
rollback_storage() {
    if [[ "$DATABASE_ONLY" == false && ( "$FUNCTIONS_ONLY" == false && "$FRONTEND_ONLY" == false ) ]]; then
        log "Rolling back Firebase Storage..." "$BLUE"

        STORAGE_BACKUP="$ROLLBACK_BACKUP_PATH/storage"

        if [[ ! -d "$STORAGE_BACKUP" ]]; then
            log "Storage backup not found in rollback target" "$YELLOW"
            return 0
        fi

        if [[ "$DRY_RUN" == true ]]; then
            log "DRY RUN: Would restore Firebase Storage from $STORAGE_BACKUP" "$YELLOW"
            return 0
        fi

        STORAGE_BUCKET="$FIREBASE_PROJECT_ID.appspot.com"

        log "Restoring Firebase Storage to gs://$STORAGE_BUCKET..." "$BLUE"

        # WARNING: This will overwrite all storage files
        log "⚠️  This will overwrite all current storage files!" "$YELLOW"

        # Sync backup to storage bucket
        gsutil -m rsync -r -d "$STORAGE_BACKUP/" "gs://$STORAGE_BUCKET/"

        log "Firebase Storage rollback completed" "$GREEN"
    fi
}

# Rollback Firebase Functions
rollback_functions() {
    if [[ "$FUNCTIONS_ONLY" == true || ( "$DATABASE_ONLY" == false && "$FRONTEND_ONLY" == false ) ]]; then
        log "Rolling back Firebase Functions..." "$BLUE"

        FUNCTIONS_BACKUP="$ROLLBACK_BACKUP_PATH/functions"

        if [[ ! -d "$FUNCTIONS_BACKUP" ]]; then
            log "Functions backup not found in rollback target" "$YELLOW"
            return 0
        fi

        if [[ "$DRY_RUN" == true ]]; then
            log "DRY RUN: Would restore Firebase Functions from $FUNCTIONS_BACKUP" "$YELLOW"
            return 0
        fi

        # Restore functions source code
        if [[ -d "$FUNCTIONS_BACKUP/source" ]]; then
            log "Restoring functions source code..." "$BLUE"

            # Backup current functions
            if [[ -d "$PROJECT_ROOT/functions" ]]; then
                mv "$PROJECT_ROOT/functions" "$PROJECT_ROOT/functions.backup.$(date +%s)"
            fi

            # Copy backed up functions
            cp -r "$FUNCTIONS_BACKUP/source" "$PROJECT_ROOT/functions"

            # Install dependencies and build
            cd "$PROJECT_ROOT/functions"
            npm ci
            npm run build
        fi

        # Restore functions configuration
        if [[ -f "$FUNCTIONS_BACKUP/functions_config.json" ]]; then
            log "Restoring functions configuration..." "$BLUE"

            # Parse and restore configuration (excluding secrets)
            jq -r 'to_entries | .[] | select(.key != "secrets") | "firebase functions:config:set " + .key + "=\"" + (.value | tostring) + "\""' \
                "$FUNCTIONS_BACKUP/functions_config.json" | \
            while read -r config_cmd; do
                eval "$config_cmd --project=$FIREBASE_PROJECT_ID" || log "Failed to restore config: $config_cmd" "$YELLOW"
            done
        fi

        # Deploy functions
        log "Deploying restored functions..." "$BLUE"
        firebase deploy --only functions --project="$FIREBASE_PROJECT_ID" --force

        log "Firebase Functions rollback completed" "$GREEN"
    fi
}

# Rollback frontend application
rollback_frontend() {
    if [[ "$FRONTEND_ONLY" == true || ( "$DATABASE_ONLY" == false && "$FUNCTIONS_ONLY" == false ) ]]; then
        log "Rolling back frontend application..." "$BLUE"

        if [[ "$DRY_RUN" == true ]]; then
            log "DRY RUN: Would rollback frontend using Firebase Hosting" "$YELLOW"
            return 0
        fi

        # Use Firebase Hosting rollback feature
        log "Rolling back to previous hosting version..." "$BLUE"

        if firebase hosting:channel:deploy live --project="$FIREBASE_PROJECT_ID" --previous 2>/dev/null; then
            log "Frontend rollback completed using Firebase Hosting" "$GREEN"
        else
            log "Firebase Hosting rollback not available, using backup..." "$YELLOW"

            # Deploy from backup configuration if available
            CONFIG_BACKUP="$ROLLBACK_BACKUP_PATH/config"

            if [[ -d "$CONFIG_BACKUP" ]]; then
                # Restore configuration files
                cp "$CONFIG_BACKUP/firebase.json" "$PROJECT_ROOT/" 2>/dev/null || true
                cp "$CONFIG_BACKUP/.firebaserc" "$PROJECT_ROOT/" 2>/dev/null || true
                cp "$CONFIG_BACKUP/firestore.rules" "$PROJECT_ROOT/" 2>/dev/null || true
                cp "$CONFIG_BACKUP/storage.rules" "$PROJECT_ROOT/" 2>/dev/null || true

                # Deploy restored configuration
                firebase deploy --only hosting,firestore:rules,storage --project="$FIREBASE_PROJECT_ID"

                log "Frontend and configuration rollback completed" "$GREEN"
            else
                error_exit "No configuration backup found and Firebase Hosting rollback failed"
            fi
        fi
    fi
}

# Post-rollback verification
verify_rollback() {
    log "Verifying rollback..." "$BLUE"

    # Health check
    log "Performing post-rollback health check..." "$BLUE"

    # Check frontend
    if [[ "$FUNCTIONS_ONLY" == false ]]; then
        if curl -f -s "$TARGET_URL" > /dev/null; then
            log "✅ Frontend health check passed" "$GREEN"
        else
            log "❌ Frontend health check failed" "$RED"
        fi
    fi

    # Check functions
    if [[ "$FRONTEND_ONLY" == false ]]; then
        if curl -f -s "$FUNCTIONS_URL/api/health" > /dev/null; then
            log "✅ Functions health check passed" "$GREEN"
        else
            log "❌ Functions health check failed" "$RED"
        fi
    fi

    # Run smoke tests if available
    if [[ -f "$PROJECT_ROOT/package.json" ]] && npm run | grep -q "test:smoke"; then
        log "Running post-rollback smoke tests..." "$BLUE"
        npm run test:smoke -- --baseUrl="$TARGET_URL" || log "Smoke tests failed" "$YELLOW"
    fi

    log "Rollback verification completed" "$GREEN"
}

# Update rollback record
update_rollback_record() {
    log "Recording rollback operation..." "$BLUE"

    ROLLBACK_HISTORY="$PROJECT_ROOT/rollback-history.json"

    # Create record if it doesn't exist
    if [[ ! -f "$ROLLBACK_HISTORY" ]]; then
        echo "[]" > "$ROLLBACK_HISTORY"
    fi

    # Add rollback entry
    TEMP_FILE=$(mktemp)
    jq ". += [{
        \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
        \"environment\": \"$ENVIRONMENT\",
        \"backup_id\": \"$ROLLBACK_BACKUP_ID\",
        \"rollback_type\": \"$([[ "$FUNCTIONS_ONLY" == true ]] && echo "functions" || ([[ "$FRONTEND_ONLY" == true ]] && echo "frontend" || ([[ "$DATABASE_ONLY" == true ]] && echo "database" || echo "full")))\",
        \"performed_by\": \"$(whoami)\",
        \"reason\": \"Manual rollback operation\"
    }]" "$ROLLBACK_HISTORY" > "$TEMP_FILE" && mv "$TEMP_FILE" "$ROLLBACK_HISTORY"

    log "Rollback record updated" "$GREEN"
}

# Main rollback function
main() {
    log "Starting MAS Hub rollback process..." "$BLUE"

    parse_arguments "$@"
    set_environment_config
    check_prerequisites
    find_rollback_target
    confirm_rollback
    create_emergency_backup
    extract_backup
    rollback_firestore
    rollback_storage
    rollback_functions
    rollback_frontend
    verify_rollback
    update_rollback_record

    log "Rollback completed successfully!" "$GREEN"
    log "Application URL: $TARGET_URL" "$GREEN"

    if [[ "$ENVIRONMENT" == "prod" ]]; then
        log "🔄 Production rollback completed!" "$GREEN"
        log "⚠️  Remember to investigate the root cause of the issue that required rollback" "$YELLOW"
    fi
}

# Run main function with all arguments
main "$@"