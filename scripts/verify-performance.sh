#!/bin/bash
# NeutralApp Performance Verification Script
# Usage: ./scripts/verify-performance.sh [staging|production]
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

# Performance thresholds
MAX_RESPONSE_TIME=500
MIN_THROUGHPUT=10
MAX_ERROR_RATE=0.05

# Function to verify performance
verify_performance() {
    local environment=$1
    log_info "Starting performance verification for $environment environment..."
    
    local base_url
    if [[ "$environment" == "production" ]]; then
        base_url="https://neutralapp.com"
    else
        base_url="https://staging.neutralapp.com"
    fi
    
    log_info "Base URL: $base_url"
    
    # Run all performance checks
    local checks_passed=0
    local checks_failed=0
    
    if check_response_times "$base_url"; then
        ((checks_passed++))
    else
        ((checks_failed++))
    fi
    
    if check_throughput "$base_url"; then
        ((checks_passed++))
    else
        ((checks_failed++))
    fi
    
    if check_error_rates "$base_url"; then
        ((checks_passed++))
    else
        ((checks_failed++))
    fi
    
    # Calculate success rate
    local total_checks=$((checks_passed + checks_failed))
    local success_rate=0
    if [[ $total_checks -gt 0 ]]; then
        success_rate=$(echo "scale=2; $checks_passed / $total_checks" | bc)
    fi
    
    log_info "Performance Verification Results:"
    log_info "  - Checks Passed: $checks_passed"
    log_info "  - Checks Failed: $checks_failed"
    log_info "  - Success Rate: $(echo "$success_rate * 100" | bc)%"
    
    if [[ $checks_failed -eq 0 ]]; then
        log_success "✅ Performance verification PASSED for $environment"
        return 0
    else
        log_error "❌ Performance verification FAILED for $environment"
        return 1
    fi
}

# Function to check response times
check_response_times() {
    local base_url=$1
    log_info "Checking response times..."
    
    local endpoints=("/health" "/api/health" "/api/status")
    local total_response_time=0
    local request_count=0
    
    for endpoint in "${endpoints[@]}"; do
        local url="$base_url$endpoint"
        
        # Make multiple requests to get average response time
        for i in {1..5}; do
            local start_time=$(date +%s%N)
            curl -s -o /dev/null "$url" --max-time 30 > /dev/null 2>&1
            local end_time=$(date +%s%N)
            
            local response_time_ms=$(( (end_time - start_time) / 1000000 ))
            total_response_time=$((total_response_time + response_time_ms))
            ((request_count++))
            
            log_info "  $endpoint request $i: ${response_time_ms}ms"
        done
    done
    
    local average_response_time=$((total_response_time / request_count))
    
    if [[ $average_response_time -le $MAX_RESPONSE_TIME ]]; then
        log_success "Response time check passed (Average: ${average_response_time}ms, Max: ${MAX_RESPONSE_TIME}ms)"
        return 0
    else
        log_error "Response time check failed (Average: ${average_response_time}ms, Max: ${MAX_RESPONSE_TIME}ms)"
        return 1
    fi
}

# Function to check throughput
check_throughput() {
    local base_url=$1
    log_info "Checking throughput..."
    
    local test_duration=10  # seconds
    local start_time=$(date +%s)
    local request_count=0
    
    # Make requests for the specified duration
    while [[ $(($(date +%s) - start_time)) -lt $test_duration ]]; do
        curl -s -o /dev/null "$base_url/health" --max-time 5 > /dev/null 2>&1
        ((request_count++))
        sleep 0.1  # Small delay between requests
    done
    
    local actual_duration=$(($(date +%s) - start_time))
    local throughput=$(echo "scale=2; $request_count / $actual_duration" | bc)
    
    if (( $(echo "$throughput >= $MIN_THROUGHPUT" | bc -l) )); then
        log_success "Throughput check passed (${throughput} req/s, Min: ${MIN_THROUGHPUT} req/s)"
        return 0
    else
        log_error "Throughput check failed (${throughput} req/s, Min: ${MIN_THROUGHPUT} req/s)"
        return 1
    fi
}

# Function to check error rates
check_error_rates() {
    local base_url=$1
    log_info "Checking error rates..."
    
    local total_requests=20
    local error_count=0
    
    # Make requests and count errors
    for i in {1..$total_requests}; do
        local response_code
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/health" --max-time 10 || echo "000")
        
        if [[ "$response_code" != "200" ]]; then
            ((error_count++))
        fi
    done
    
    local error_rate=$(echo "scale=4; $error_count / $total_requests" | bc)
    local max_error_rate_decimal=$(echo "scale=4; $MAX_ERROR_RATE" | bc)
    
    if (( $(echo "$error_rate <= $max_error_rate_decimal" | bc -l) )); then
        log_success "Error rate check passed (${error_rate}, Max: ${MAX_ERROR_RATE})"
        return 0
    else
        log_error "Error rate check failed (${error_rate}, Max: ${MAX_ERROR_RATE})"
        return 1
    fi
}

# Function to run load test
run_load_test() {
    local base_url=$1
    local duration=${2:-60}  # Default 60 seconds
    local concurrency=${3:-10}  # Default 10 concurrent users
    
    log_info "Running load test for ${duration}s with ${concurrency} concurrent users..."
    
    # This would use a proper load testing tool like Apache Bench or wrk
    # For now, we'll simulate a basic load test
    local start_time=$(date +%s)
    local total_requests=0
    local successful_requests=0
    local failed_requests=0
    
    # Simulate concurrent requests
    for ((i=1; i<=concurrency; i++)); do
        (
            while [[ $(($(date +%s) - start_time)) -lt $duration ]]; do
                local response_code
                response_code=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/health" --max-time 5 || echo "000")
                
                if [[ "$response_code" == "200" ]]; then
                    ((successful_requests++))
                else
                    ((failed_requests++))
                fi
                
                ((total_requests++))
                sleep 0.1
            done
        ) &
    done
    
    # Wait for all background processes
    wait
    
    local actual_duration=$(($(date +%s) - start_time))
    local requests_per_second=$(echo "scale=2; $total_requests / $actual_duration" | bc)
    local success_rate=$(echo "scale=2; $successful_requests / $total_requests" | bc)
    
    log_info "Load Test Results:"
    log_info "  - Duration: ${actual_duration}s"
    log_info "  - Total Requests: $total_requests"
    log_info "  - Successful Requests: $successful_requests"
    log_info "  - Failed Requests: $failed_requests"
    log_info "  - Requests per Second: $requests_per_second"
    log_info "  - Success Rate: $(echo "$success_rate * 100" | bc)%"
    
    if (( $(echo "$success_rate >= 0.95" | bc -l) )); then
        log_success "Load test passed"
        return 0
    else
        log_error "Load test failed"
        return 1
    fi
}

# Function to generate performance report
generate_performance_report() {
    local environment=$1
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat << EOF
# Performance Verification Report

**Environment**: $environment
**Timestamp**: $timestamp
**Script Version**: 1.0.0

## Performance Summary
- Response Times: ✅ PASSED
- Throughput: ✅ PASSED
- Error Rates: ✅ PASSED

## Thresholds
- Max Response Time: ${MAX_RESPONSE_TIME}ms
- Min Throughput: ${MIN_THROUGHPUT} req/s
- Max Error Rate: $(echo "$MAX_ERROR_RATE * 100" | bc)%

## Recommendations
- All performance checks passed successfully
- Application is performing within acceptable limits
- Monitor performance metrics for the next 24 hours
- Consider load testing for peak traffic scenarios
EOF
}

# Main function
main() {
    local environment=${1:-"staging"}
    local load_test=${2:-false}
    
    log_info "⚡ Starting NeutralApp performance verification..."
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
    
    # Run performance verification
    if verify_performance "$environment"; then
        log_success "✅ Performance verification completed successfully for $environment"
        
        # Optionally run load test
        if [[ "$load_test" == "true" ]]; then
            local base_url
            if [[ "$environment" == "production" ]]; then
                base_url="https://neutralapp.com"
            else
                base_url="https://staging.neutralapp.com"
            fi
            
            if run_load_test "$base_url"; then
                log_success "✅ Load test completed successfully"
            else
                log_warning "⚠️ Load test failed, but basic performance checks passed"
            fi
        fi
        
        # Generate report
        generate_performance_report "$environment" > "performance-report-$environment-$(date +%Y%m%d-%H%M%S).md"
        
        exit 0
    else
        log_error "❌ Performance verification failed for $environment"
        exit 1
    fi
}

# Run main function with all arguments
main "$@" 