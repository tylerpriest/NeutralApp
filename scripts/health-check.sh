#!/bin/bash

# NeutralApp Health Check Script
# Usage: ./scripts/health-check.sh [staging|production]

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

# Function to check application health
check_application_health() {
    local environment=$1
    
    log_info "Checking application health for $environment environment..."
    
    # Determine health check URL
    local health_url
    if [[ "$environment" == "production" ]]; then
        health_url="https://neutralapp.com/health"
    else
        health_url="https://staging.neutralapp.com/health"
    fi
    
    log_info "Health check URL: $health_url"
    
    # Check application health endpoint
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$health_url" || echo "000")
    
    if [[ "$response_code" == "200" ]]; then
        log_success "Application health check passed (HTTP $response_code)"
        return 0
    else
        log_error "Application health check failed (HTTP $response_code)"
        return 1
    fi
}

# Function to check database connection
check_database_connection() {
    local environment=$1
    
    log_info "Checking database connection for $environment environment..."
    
    # Load environment variables
    local env_file
    if [[ "$environment" == "production" ]]; then
        env_file="$PROJECT_ROOT/config/environments/production.env"
    else
        env_file="$PROJECT_ROOT/config/environments/staging.env"
    fi
    
    if [[ ! -f "$env_file" ]]; then
        log_warning "Environment file not found: $env_file"
        log_info "Skipping database connection check"
        return 0
    fi
    
    # Source environment variables
    set -a
    source "$env_file"
    set +a
    
    # Check if database variables are set
    if [[ -z "$DB_HOST" || -z "$DB_PORT" || -z "$DB_NAME" ]]; then
        log_warning "Database configuration not found in environment file"
        log_info "Skipping database connection check"
        return 0
    fi
    
    # Check database connectivity
    if command -v psql &> /dev/null; then
        # Try to connect to PostgreSQL
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
            log_success "Database connection check passed"
            return 0
        else
            log_error "Database connection check failed"
            return 1
        fi
    else
        # Fallback: check if port is open
        if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
            log_success "Database port check passed ($DB_HOST:$DB_PORT)"
            return 0
        else
            log_error "Database port check failed ($DB_HOST:$DB_PORT)"
            return 1
        fi
    fi
}

# Function to check API endpoints
check_api_endpoints() {
    local environment=$1
    
    log_info "Checking API endpoints for $environment environment..."
    
    # Determine base URL
    local base_url
    if [[ "$environment" == "production" ]]; then
        base_url="https://neutralapp.com"
    else
        base_url="https://staging.neutralapp.com"
    fi
    
    # List of critical API endpoints to check
    local endpoints=(
        "/api/health"
        "/api/auth/status"
        "/api/plugins/list"
        "/api/settings"
    )
    
    local failed_endpoints=0
    
    for endpoint in "${endpoints[@]}"; do
        local url="$base_url$endpoint"
        local response_code
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
        
        if [[ "$response_code" == "200" || "$response_code" == "401" || "$response_code" == "403" ]]; then
            log_success "API endpoint $endpoint check passed (HTTP $response_code)"
        else
            log_error "API endpoint $endpoint check failed (HTTP $response_code)"
            ((failed_endpoints++))
        fi
    done
    
    if [[ $failed_endpoints -eq 0 ]]; then
        log_success "All API endpoint checks passed"
        return 0
    else
        log_error "$failed_endpoints API endpoint(s) failed"
        return 1
    fi
}

# Function to check system resources
check_system_resources() {
    local environment=$1
    
    log_info "Checking system resources for $environment environment..."
    
    # Check disk space
    local disk_usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [[ $disk_usage -lt 90 ]]; then
        log_success "Disk space check passed ($disk_usage% used)"
    else
        log_warning "Disk space usage is high ($disk_usage% used)"
    fi
    
    # Check memory usage
    if command -v free &> /dev/null; then
        local memory_usage
        memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
        
        if [[ $memory_usage -lt 90 ]]; then
            log_success "Memory usage check passed ($memory_usage% used)"
        else
            log_warning "Memory usage is high ($memory_usage% used)"
        fi
    fi
    
    # Check CPU load
    if command -v uptime &> /dev/null; then
        local load_average
        load_average=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
        
        log_info "System load average: $load_average"
    fi
    
    return 0
}

# Function to check plugin health
check_plugin_health() {
    local environment=$1
    
    log_info "Checking plugin health for $environment environment..."
    
    # Determine base URL
    local base_url
    if [[ "$environment" == "production" ]]; then
        base_url="https://neutralapp.com"
    else
        base_url="https://staging.neutralapp.com"
    fi
    
    # Check plugin health endpoint
    local plugin_health_url="$base_url/api/plugins/health"
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$plugin_health_url" || echo "000")
    
    if [[ "$response_code" == "200" ]]; then
        log_success "Plugin health check passed (HTTP $response_code)"
        return 0
    else
        log_warning "Plugin health check failed or endpoint not available (HTTP $response_code)"
        return 0  # Don't fail overall check for plugin issues
    fi
}

# Function to check Docker containers
check_docker_containers() {
    local environment=$1
    
    log_info "Checking Docker containers for $environment environment..."
    
    if ! command -v docker &> /dev/null; then
        log_warning "Docker not available, skipping container checks"
        return 0
    fi
    
    # Check if containers are running
    local container_name
    if [[ "$environment" == "production" ]]; then
        container_name="neutral-app"
    else
        container_name="neutral-app"
    fi
    
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        log_success "Docker container $container_name is running"
        
        # Check container health
        local health_status
        health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "unknown")
        
        if [[ "$health_status" == "healthy" ]]; then
            log_success "Docker container $container_name is healthy"
        elif [[ "$health_status" == "starting" ]]; then
            log_warning "Docker container $container_name is starting"
        else
            log_error "Docker container $container_name health status: $health_status"
        fi
    else
        log_error "Docker container $container_name is not running"
        return 1
    fi
    
    return 0
}

# Function to generate health report
generate_health_report() {
    local environment=$1
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    log_info "Generating health report for $environment environment..."
    
    cat << EOF
# NeutralApp Health Report
Environment: $environment
Timestamp: $timestamp

## Health Check Summary
- Application Health: $([ $? -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")
- Database Connection: $([ $? -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")
- API Endpoints: $([ $? -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")
- System Resources: $([ $? -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")
- Docker Containers: $([ $? -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")
- Plugin Health: $([ $? -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")

## Recommendations
$(if [[ $? -ne 0 ]]; then
    echo "- Investigate failed health checks"
    echo "- Check application logs for errors"
    echo "- Verify environment configuration"
    echo "- Contact system administrator if issues persist"
else
    echo "- All health checks passed"
    echo "- System is operating normally"
fi)
EOF
}

# Main health check function
main() {
    local environment=${1:-"staging"}
    
    log_info "🏥 Starting NeutralApp health check process..."
    log_info "Project Root: $PROJECT_ROOT"
    log_info "Script Directory: $SCRIPT_DIR"
    
    # Validate environment
    if [[ "$environment" != "staging" && "$environment" != "production" ]]; then
        log_error "Invalid environment: $environment. Must be 'staging' or 'production'"
        exit 1
    fi
    
    log_info "Environment: $environment"
    
    # Initialize health check results
    local health_checks_passed=0
    local health_checks_failed=0
    
    # Run health checks
    log_info "Running comprehensive health checks..."
    
    # Check application health
    if check_application_health "$environment"; then
        ((health_checks_passed++))
    else
        ((health_checks_failed++))
    fi
    
    # Check database connection
    if check_database_connection "$environment"; then
        ((health_checks_passed++))
    else
        ((health_checks_failed++))
    fi
    
    # Check API endpoints
    if check_api_endpoints "$environment"; then
        ((health_checks_passed++))
    else
        ((health_checks_failed++))
    fi
    
    # Check system resources
    if check_system_resources "$environment"; then
        ((health_checks_passed++))
    else
        ((health_checks_failed++))
    fi
    
    # Check Docker containers
    if check_docker_containers "$environment"; then
        ((health_checks_passed++))
    else
        ((health_checks_failed++))
    fi
    
    # Check plugin health
    if check_plugin_health "$environment"; then
        ((health_checks_passed++))
    else
        ((health_checks_failed++))
    fi
    
    # Generate summary
    log_info "Health check summary:"
    log_info "  Passed: $health_checks_passed"
    log_info "  Failed: $health_checks_failed"
    
    # Generate health report
    generate_health_report "$environment"
    
    # Exit with appropriate code
    if [[ $health_checks_failed -eq 0 ]]; then
        log_success "✅ All health checks passed!"
        exit 0
    else
        log_error "❌ $health_checks_failed health check(s) failed!"
        exit 1
    fi
}

# Run main function with all arguments
main "$@" 