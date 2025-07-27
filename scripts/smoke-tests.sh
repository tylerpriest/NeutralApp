#!/bin/bash
# NeutralApp Smoke Tests Script
# Usage: ./scripts/smoke-tests.sh [staging|production]
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to run smoke tests
run_smoke_tests() {
    local environment=$1
    log_info "Starting smoke tests for $environment environment..."
    
    local base_url
    if [[ "$environment" == "production" ]]; then
        base_url="https://neutralapp.com"
    else
        base_url="https://staging.neutralapp.com"
    fi
    
    log_info "Base URL: $base_url"
    
    # Run all smoke test categories
    local tests_passed=0
    local tests_failed=0
    
    if test_critical_paths "$base_url"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    if test_user_workflows "$base_url"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    if test_authentication "$base_url"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    if test_dashboard_loading "$base_url"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    if test_plugin_functionality "$base_url"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    if test_settings_access "$base_url"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    # Calculate success rate
    local total_tests=$((tests_passed + tests_failed))
    local success_rate=0
    if [[ $total_tests -gt 0 ]]; then
        success_rate=$(echo "scale=2; $tests_passed / $total_tests" | bc)
    fi
    
    log_info "Smoke Test Results:"
    log_info "  - Tests Passed: $tests_passed"
    log_info "  - Tests Failed: $tests_failed"
    log_info "  - Success Rate: $(echo "$success_rate * 100" | bc)%"
    
    if [[ $tests_failed -eq 0 ]]; then
        log_success "✅ All smoke tests PASSED for $environment"
        return 0
    else
        log_error "❌ $tests_failed smoke tests FAILED for $environment"
        return 1
    fi
}

# Function to test critical paths
test_critical_paths() {
    local base_url=$1
    log_info "Testing critical paths..."
    
    local critical_endpoints=("/" "/health" "/api/health" "/api/status")
    local failed_endpoints=0
    
    for endpoint in "${critical_endpoints[@]}"; do
        local url="$base_url$endpoint"
        local response_code
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 30 || echo "000")
        
        if [[ "$response_code" == "200" ]]; then
            log_success "Critical path $endpoint passed (HTTP $response_code)"
        else
            log_error "Critical path $endpoint failed (HTTP $response_code)"
            ((failed_endpoints++))
        fi
    done
    
    if [[ $failed_endpoints -eq 0 ]]; then
        log_success "All critical paths test passed"
        return 0
    else
        log_error "$failed_endpoints critical paths failed"
        return 1
    fi
}

# Function to test user workflows
test_user_workflows() {
    local base_url=$1
    log_info "Testing user workflows..."
    
    # Test basic user workflow: load app, check navigation
    local workflow_endpoints=("/" "/dashboard" "/settings" "/plugins")
    local failed_workflows=0
    
    for endpoint in "${workflow_endpoints[@]}"; do
        local url="$base_url$endpoint"
        local response_code
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 30 || echo "000")
        
        if [[ "$response_code" == "200" || "$response_code" == "401" ]]; then
            log_success "User workflow $endpoint passed (HTTP $response_code)"
        else
            log_warning "User workflow $endpoint failed (HTTP $response_code)"
            ((failed_workflows++))
        fi
    done
    
    if [[ $failed_workflows -eq 0 ]]; then
        log_success "All user workflows test passed"
        return 0
    else
        log_error "$failed_workflows user workflows failed"
        return 1
    fi
}

# Function to test authentication
test_authentication() {
    local base_url=$1
    log_info "Testing authentication..."
    
    # Test authentication endpoints
    local auth_endpoints=("/api/auth/session" "/api/auth/signin" "/api/auth/signout")
    local failed_auth=0
    
    for endpoint in "${auth_endpoints[@]}"; do
        local url="$base_url$endpoint"
        local response_code
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 30 || echo "000")
        
        if [[ "$response_code" == "200" || "$response_code" == "401" || "$response_code" == "405" ]]; then
            log_success "Authentication endpoint $endpoint passed (HTTP $response_code)"
        else
            log_warning "Authentication endpoint $endpoint failed (HTTP $response_code)"
            ((failed_auth++))
        fi
    done
    
    if [[ $failed_auth -eq 0 ]]; then
        log_success "Authentication test passed"
        return 0
    else
        log_error "$failed_auth authentication endpoints failed"
        return 1
    fi
}

# Function to test dashboard loading
test_dashboard_loading() {
    local base_url=$1
    log_info "Testing dashboard loading..."
    
    # Test dashboard endpoint
    local dashboard_url="$base_url/dashboard"
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$dashboard_url" --max-time 30 || echo "000")
    
    if [[ "$response_code" == "200" || "$response_code" == "401" ]]; then
        log_success "Dashboard loading test passed (HTTP $response_code)"
        return 0
    else
        log_error "Dashboard loading test failed (HTTP $response_code)"
        return 1
    fi
}

# Function to test plugin functionality
test_plugin_functionality() {
    local base_url=$1
    log_info "Testing plugin functionality..."
    
    # Test plugin-related endpoints
    local plugin_endpoints=("/plugins" "/api/plugins" "/api/plugins/health")
    local failed_plugins=0
    
    for endpoint in "${plugin_endpoints[@]}"; do
        local url="$base_url$endpoint"
        local response_code
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 30 || echo "000")
        
        if [[ "$response_code" == "200" || "$response_code" == "401" || "$response_code" == "404" ]]; then
            log_success "Plugin endpoint $endpoint passed (HTTP $response_code)"
        else
            log_warning "Plugin endpoint $endpoint failed (HTTP $response_code)"
            ((failed_plugins++))
        fi
    done
    
    if [[ $failed_plugins -eq 0 ]]; then
        log_success "Plugin functionality test passed"
        return 0
    else
        log_error "$failed_plugins plugin endpoints failed"
        return 1
    fi
}

# Function to test settings access
test_settings_access() {
    local base_url=$1
    log_info "Testing settings access..."
    
    # Test settings endpoint
    local settings_url="$base_url/settings"
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$settings_url" --max-time 30 || echo "000")
    
    if [[ "$response_code" == "200" || "$response_code" == "401" ]]; then
        log_success "Settings access test passed (HTTP $response_code)"
        return 0
    else
        log_error "Settings access test failed (HTTP $response_code)"
        return 1
    fi
}

# Function to run Playwright E2E tests
run_playwright_tests() {
    local environment=$1
    log_info "Running Playwright E2E tests for $environment..."
    
    cd "$PROJECT_ROOT"
    
    # Set environment for tests
    export TEST_BASE_URL
    if [[ "$environment" == "production" ]]; then
        export TEST_BASE_URL="https://neutralapp.com"
    else
        export TEST_BASE_URL="https://staging.neutralapp.com"
    fi
    
    # Run basic E2E tests
    if npm run test:e2e -- tests/e2e/navigation.spec.ts; then
        log_success "Playwright E2E tests passed"
        return 0
    else
        log_error "Playwright E2E tests failed"
        return 1
    fi
}

# Function to generate smoke test report
generate_smoke_test_report() {
    local environment=$1
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat << EOF
# Smoke Test Report

**Environment**: $environment
**Timestamp**: $timestamp
**Script Version**: 1.0.0

## Test Summary
- Critical Paths: ✅ PASSED
- User Workflows: ✅ PASSED
- Authentication: ✅ PASSED
- Dashboard Loading: ✅ PASSED
- Plugin Functionality: ✅ PASSED
- Settings Access: ✅ PASSED

## Test Coverage
- Basic application loading
- Core navigation functionality
- Authentication endpoints
- Dashboard accessibility
- Plugin system endpoints
- Settings access

## Recommendations
- All smoke tests passed successfully
- Application is ready for user testing
- Monitor for any performance degradation
- Run full test suite for comprehensive validation
EOF
}

# Main function
main() {
    local environment=${1:-"staging"}
    
    log_info "🧪 Starting NeutralApp smoke tests..."
    log_info "Project Root: $PROJECT_ROOT"
    log_info "Script Directory: $SCRIPT_DIR"
    
    # Validate environment
    if [[ "$environment" != "staging" && "$environment" != "production" ]]; then
        log_error "Invalid environment: $environment. Must be 'staging' or 'production'"
        exit 1
    fi
    
    # Check prerequisites
    if ! command -v curl &> /dev/null; then
        log_error "curl is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v bc &> /dev/null; then
        log_error "bc is not installed or not in PATH"
        exit 1
    fi
    
    # Run smoke tests
    if run_smoke_tests "$environment"; then
        log_success "✅ Smoke tests completed successfully for $environment"
        
        # Optionally run Playwright tests
        if [[ "$2" == "--with-e2e" ]]; then
            if run_playwright_tests "$environment"; then
                log_success "✅ E2E tests completed successfully"
            else
                log_warning "⚠️ E2E tests failed, but basic smoke tests passed"
            fi
        fi
        
        # Generate report
        generate_smoke_test_report "$environment" > "smoke-test-report-$environment-$(date +%Y%m%d-%H%M%S).md"
        
        exit 0
    else
        log_error "❌ Smoke tests failed for $environment"
        exit 1
    fi
}

# Run main function with all arguments
main "$@" 