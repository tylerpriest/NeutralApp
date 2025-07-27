#!/bin/bash

# NeutralApp Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

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

# Function to deploy to specific environment
deploy_environment() {
    local environment=$1
    
    log_info "Starting deployment to $environment environment..."
    
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
    log_info "Docker Tag: $DOCKER_TAG"
    log_info "Environment File: $ENV_FILE"
    log_info "Deploy URL: $DEPLOY_URL"
}

# Function to build Docker image
build_docker_image() {
    local environment=$1
    
    log_info "Building Docker image for $environment..."
    
    # Build the application first
    log_info "Building application..."
    cd "$PROJECT_ROOT"
    npm run build:full
    
    # Build Docker image
    local image_name="$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_TAG"
    log_info "Building Docker image: $image_name"
    
    docker build -t "$image_name" .
    
    if [[ $? -eq 0 ]]; then
        log_success "Docker image built successfully: $image_name"
    else
        log_error "Failed to build Docker image"
        exit 1
    fi
}

# Function to deploy to environment
deploy_to_environment() {
    local environment=$1
    
    log_info "Deploying to $environment environment..."
    
    # Push Docker image to registry
    local image_name="$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_TAG"
    log_info "Pushing Docker image to registry..."
    
    docker push "$image_name"
    
    if [[ $? -eq 0 ]]; then
        log_success "Docker image pushed successfully"
    else
        log_error "Failed to push Docker image"
        exit 1
    fi
    
    # Deploy using docker-compose or Kubernetes
    if [[ "$environment" == "production" ]]; then
        deploy_to_production
    else
        deploy_to_staging
    fi
}

# Function to deploy to staging
deploy_to_staging() {
    log_info "Deploying to staging environment..."
    
    # Pull latest image
    docker pull "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_TAG"
    
    # Stop existing containers
    docker-compose -f docker-compose.yml down
    
    # Start new containers
    docker-compose -f docker-compose.yml up -d
    
    log_success "Staging deployment completed"
}

# Function to deploy to production
deploy_to_production() {
    log_info "Deploying to production environment..."
    
    # Pull latest image
    docker pull "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_TAG"
    
    # Deploy using docker-compose production configuration
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Production deployment completed"
}

# Function to run health checks
run_health_checks() {
    local environment=$1
    
    log_info "Running health checks for $environment environment..."
    
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

# Function to run smoke tests
run_smoke_tests() {
    local environment=$1
    
    log_info "Running smoke tests for $environment environment..."
    
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

# Function to send notifications
send_notification() {
    local environment=$1
    local status=$2
    local message=$3
    
    log_info "Sending $status notification for $environment deployment..."
    
    # This would integrate with your notification system
    # Examples: Slack, email, webhook, etc.
    echo "Deployment $status for $environment: $message"
}

# Main deployment function
main() {
    local environment=${1:-"staging"}
    
    log_info "🚀 Starting NeutralApp deployment process..."
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
    
    # Start deployment process
    deploy_environment "$environment"
    build_docker_image "$environment"
    deploy_to_environment "$environment"
    
    # Run health checks
    if run_health_checks "$environment"; then
        log_success "Health checks passed"
        
        # Run smoke tests
        if run_smoke_tests "$environment"; then
            log_success "Smoke tests passed"
            send_notification "$environment" "success" "Deployment completed successfully"
            log_success "✅ Deployment to $environment completed successfully!"
        else
            log_error "Smoke tests failed"
            send_notification "$environment" "failure" "Smoke tests failed"
            exit 1
        fi
    else
        log_error "Health checks failed"
        send_notification "$environment" "failure" "Health checks failed"
        exit 1
    fi
}

# Run main function with all arguments
main "$@" 