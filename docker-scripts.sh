#!/bin/bash

# HomeAccount Docker Helper Scripts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    echo "HomeAccount Docker Helper Scripts"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build       Build all Docker images"
    echo "  build-be    Build backend Docker image only"
    echo "  build-fe    Build frontend Docker image only"
    echo "  up          Start all services with docker compose"
    echo "  down        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Show logs for all services"
    echo "  logs-be     Show backend logs only"
    echo "  logs-fe     Show frontend logs only"
    echo "  clean       Remove all containers and images"
    echo "  status      Show status of all services"
    echo "  help        Show this help message"
    echo ""
}

# Build functions
build_all() {
    print_status "Building all Docker images..."
    docker compose build --no-cache
    print_success "All images built successfully!"
}

build_backend() {
    print_status "Building backend Docker image..."
    docker compose build --no-cache backend
    print_success "Backend image built successfully!"
}

build_frontend() {
    print_status "Building frontend Docker image..."
    docker compose build --no-cache frontend
    print_success "Frontend image built successfully!"
}

# Service management functions
start_services() {
    print_status "Starting all services..."
    docker compose up -d
    print_success "All services started!"
    print_status "Backend API: http://localhost:3000/api/ (via frontend proxy)"
    print_status "Frontend: http://localhost:3000"
}

stop_services() {
    print_status "Stopping all services..."
    docker compose down
    print_success "All services stopped!"
}

restart_services() {
    print_status "Restarting all services..."
    docker compose restart
    print_success "All services restarted!"
}

# Logging functions
show_logs() {
    print_status "Showing logs for all services..."
    docker compose logs -f
}

show_backend_logs() {
    print_status "Showing backend logs..."
    docker compose logs -f backend
}

show_frontend_logs() {
    print_status "Showing frontend logs..."
    docker compose logs -f frontend
}

# Cleanup function
clean_all() {
    print_warning "This will remove all containers and images. Continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Stopping and removing containers..."
        docker compose down -v --remove-orphans
        
        print_status "Removing images..."
        docker rmi $(docker images "homeaccount*" -q) 2>/dev/null || true
        
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Status function
show_status() {
    print_status "Service status:"
    docker compose ps
}

# Main script logic
case "$1" in
    "build")
        build_all
        ;;
    "build-be")
        build_backend
        ;;
    "build-fe")
        build_frontend
        ;;
    "up")
        start_services
        ;;
    "down")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "logs")
        show_logs
        ;;
    "logs-be")
        show_backend_logs
        ;;
    "logs-fe")
        show_frontend_logs
        ;;
    "clean")
        clean_all
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 