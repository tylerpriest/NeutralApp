#!/bin/bash

# NeutralApp Rollback Script
# Usage: ./scripts/rollback.sh [staging|production] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_IMAGE_NAME="neutral-app"
DOCKER_REGISTRY="your-registry.com" # Change this to your registry

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to rollback deployment
rollback_deployment() {
    local environment=$1
    local version=$2
    
    log_info "Starting rollback for $environment environment..."
    
    # Validate environment
    if [[ "$environment" != "staging" && "$environment" != "production" ]]; then
        log_error "Invalid environment: $environment. Must be 'staging' or 'production'"
        exit 1
    fi
    
    # Set environment-specific variables
    if [[ "$environment" == "production" ]]; then
        DOCKER_TAG="latest"
        ENV_FILE="production.env"
        DEPLOY_URL="https://neutralapp.com"
    else
        DOCKER_TAG="staging"
        ENV_FILE="staging.env"
        DEPLOY_URL="https://staging.neutralapp.com"
    fi
    
    log_info "Environment: $environment"
    log_info "Rollback Version: $version"
    log_info "Docker Tag: $DOCKER_TAG"
    log_info "Environment File: $ENV_FILE"
    log_info "Deploy URL: $DEPLOY_URL"
}

# Function to restore previous version
restore_previous_version() {
    local environment=$1
    local version=$2
    
    log_info "Restoring to version: $version"
    
    # Determine the image to rollback to
    local rollback_image
    if [[ -n "$version" ]]; then
        rollback_image="$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$version"
    else
        # Get the previous version from registry
        rollback_image="$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:previous"
    fi
    
    log_info "Rollback image: $rollback_image"
    
    # Pull the rollback image
    log_info "Pulling rollback image..."
    if docker pull "$rollback_image"; then
        log_success "Rollback image pulled successfully"
    else
        log_error "Failed to pull rollback image"
        exit 1
    fi
    
    # Stop current deployment
    log_info "Stopping current deployment..."
    if [[ "$environment" == "production" ]]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose -f docker-compose.yml down
    fi
    
    # Tag the rollback image as current
    local current_image="$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_TAG"
    docker tag "$rollback_image" "$current_image"
    
    # Start deployment with rollback image
    log_info "Starting deployment with rollback image..."
    if [[ "$environment" == "production" ]]; then
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker-compose -f docker-compose.yml up -d
    fi
    
    log_success "Rollback deployment completed"
}

    # Function to run health checks after rollback
    run_health_checks() {
        local environment=$1
        
        log_info "Running health checks after rollback for $environment environment..."
        
        # Wait for application to start
        sleep 10
        
        # Check application health endpoint
        local health_url
        if [[ "$environment" == "production" ]]; then
            health_url="https://neutralapp.com/health"
        else
            health_url="https://staging.neutralapp.com/health"
        fi
        
        # Retry health check multiple times
        local max_attempts=5
        local attempt=1
        
        while [[ $attempt -le $max_attempts ]]; do
            log_info "Health check attempt $attempt/$max_attempts"
            
            if curl -f -s "$health_url" > /dev/null; then
                log_success "Health check passed"
                return 0
            else
                log_warning "Health check failed (attempt $attempt/$max_attempts)"
                if [[ $attempt -lt $max_attempts ]]; then
                    sleep 10
                fi
            fi
            
            ((attempt++))
        done
        
        log_error "Health check failed after $max_attempts attempts"
        return 1
    }

    # Function to verify rollback health
    verify_rollback_health() {
        local environment=$1
        log_info "Verifying rollback health for $environment..."
        
        # Run comprehensive health checks
        if run_health_checks "$environment"; then
            log_success "Rollback health verification passed"
            return 0
        else
            log_error "Rollback health verification failed"
            return 1
        fi
    }

    # Function to run rollback smoke tests
    run_rollback_smoke_tests() {
        local environment=$1
        log_info "Running rollback smoke tests for $environment..."
        
        # Run basic smoke tests after rollback
        cd "$PROJECT_ROOT"
        
        if npm run test:e2e -- tests/e2e/navigation.spec.ts; then
            log_success "Rollback smoke tests passed"
            return 0
        else
            log_error "Rollback smoke tests failed"
            return 1
        fi
    }

    # Function to notify rollback completion
    notify_rollback_completion() {
        local environment=$1
        local status=$2
        local version=$3
        local message=$4
        
        log_info "Notifying rollback completion for $environment..."
        
        # This would integrate with notification systems
        # For now, we'll log the notification
        log_info "Rollback notification: $status for $environment to version $version - $message"
        
        # Send notification based on configuration
        if [[ "$status" == "success" ]]; then
            log_success "Rollback notification sent successfully"
        else
            log_error "Rollback notification sent for failure"
        fi
    }

# Function to run smoke tests after rollback
run_smoke_tests() {
    local environment=$1
    
    log_info "Running smoke tests after rollback for $environment environment..."
    
    # Run basic smoke tests
    cd "$PROJECT_ROOT"
    
    # Test basic functionality
    if npm run test:e2e -- tests/e2e/navigation.spec.ts; then
        log_success "Smoke tests passed"
    else
        log_error "Smoke tests failed"
        return 1
    fi
}

# Function to send rollback notifications
send_notification() {
    local environment=$1
    local status=$2
    local version=$3
    local message=$4
    
    log_info "Sending $status notification for $environment rollback..."
    
    # This would integrate with your notification system
    # Examples: Slack, email, webhook, etc.
    echo "Rollback $status for $environment to version $version: $message"
}

    # Function to get available versions
    list_available_versions() {
        local environment=$1
        
        log_info "Available versions for $environment:"
        
        # This would query your Docker registry for available tags
        # For now, we'll show a placeholder
        echo "Available versions:"
        echo "  - v1.0.0"
        echo "  - v1.0.1"
        echo "  - v1.0.2"
        echo "  - latest"
        echo "  - previous"
    }

    # Function to get current version
    get_current_version() {
        local environment=$1
        
        log_info "Getting current version for $environment..."
        
        # Get current version from Docker image
        local current_image
        if [[ "$environment" == "production" ]]; then
            current_image="$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest"
        else
            current_image="$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:staging"
        fi
        
        # Extract version from image
        local version=$(docker inspect "$current_image" --format='{{.Config.Labels.version}}' 2>/dev/null || echo "unknown")
        
        if [[ "$version" == "unknown" ]]; then
            log_warning "Could not determine current version"
            version="latest"
        fi
        
        log_info "Current version: $version"
        echo "$version"
    }

    # Function to backup current version
    backup_current_version() {
        local environment=$1
        local backup_dir="/var/backups/deployments"
        
        log_info "Backing up current version for $environment..."
        
        # Create backup directory
        mkdir -p "$backup_dir"
        
        # Get current version
        local current_version=$(get_current_version "$environment")
        local timestamp=$(date +%Y%m%d-%H%M%S)
        local backup_name="backup-$environment-$current_version-$timestamp"
        
        # Create backup
        if [[ "$environment" == "production" ]]; then
            docker save "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest" -o "$backup_dir/$backup_name.tar"
        else
            docker save "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:staging" -o "$backup_dir/$backup_name.tar"
        fi
        
        if [[ $? -eq 0 ]]; then
            log_success "Backup created: $backup_name.tar"
            echo "$backup_name.tar"
        else
            log_error "Failed to create backup"
            return 1
        fi
    }

    # Function to verify rollback success
    verify_rollback_success() {
        local environment=$1
        local target_version=$2
        
        log_info "Verifying rollback success for $environment to version $target_version..."
        
        # Run comprehensive verification
        local verification_passed=true
        
        # Health check verification
        if ! run_health_checks "$environment"; then
            log_error "Health check verification failed"
            verification_passed=false
        fi
        
        # Smoke test verification
        if ! run_smoke_tests "$environment"; then
            log_error "Smoke test verification failed"
            verification_passed=false
        fi
        
        # Version verification
        local current_version=$(get_current_version "$environment")
        if [[ "$current_version" != "$target_version" ]]; then
            log_error "Version verification failed (expected: $target_version, actual: $current_version)"
            verification_passed=false
        fi
        
        if [[ "$verification_passed" == "true" ]]; then
            log_success "Rollback verification passed"
            return 0
        else
            log_error "Rollback verification failed"
            return 1
        fi
    }

# Main rollback function
main() {
    local environment=${1:-"staging"}
    local version=$2
    
    log_info "🔄 Starting NeutralApp rollback process..."
    log_info "Project Root: $PROJECT_ROOT"
    log_info "Script Directory: $SCRIPT_DIR"
    
    # Validate prerequisites
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    # If no version specified, show available versions
    if [[ -z "$version" ]]; then
        log_warning "No version specified for rollback"
        list_available_versions "$environment"
        log_info "Usage: $0 [staging|production] [version]"
        log_info "Example: $0 production v1.0.1"
        exit 1
    fi
    
    # Start rollback process
    rollback_deployment "$environment" "$version"
    restore_previous_version "$environment" "$version"
    
    # Run health checks
    if run_health_checks "$environment"; then
        log_success "Health checks passed after rollback"
        
        # Run smoke tests
        if run_smoke_tests "$environment"; then
            log_success "Smoke tests passed after rollback"
            send_notification "$environment" "success" "$version" "Rollback completed successfully"
            log_success "✅ Rollback to $environment version $version completed successfully!"
        else
            log_error "Smoke tests failed after rollback"
            send_notification "$environment" "failure" "$version" "Smoke tests failed after rollback"
            exit 1
        fi
    else
        log_error "Health checks failed after rollback"
        send_notification "$environment" "failure" "$version" "Health checks failed after rollback"
        exit 1
    fi
}

# Run main function with all arguments
main "$@" 