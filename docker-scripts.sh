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
    echo ""
    echo "Database Commands:"
    echo "  db-start    Start database service only"
    echo "  db-stop     Stop database service only"
    echo "  db-logs     Show database logs"
    echo "  db-shell    Connect to database shell (psql)"
    echo "  db-reset    Reset database (WARNING: deletes all data)"
    echo "  db-migrate  Run pending database migrations"
    echo "  db-status   Show migration status"
    echo ""
    echo "Seed Commands:"
    echo "  up-with-seeds     Start services with seeds enabled"
    echo "  restart-with-seeds Restart backend with seeds enabled"
    echo "  seeds-on          Set APPLY_SEEDS=true and restart backend"
    echo "  seeds-off         Set APPLY_SEEDS=false and restart backend"
    echo ""
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

# Database functions
start_database() {
    print_status "Starting database service..."
    docker compose up database -d
    print_success "Database service started!"
    print_status "Database: postgresql://homeaccount_user:homeaccount_password@localhost:5432/homeaccount"
}

stop_database() {
    print_status "Stopping database service..."
    docker compose stop database
    print_success "Database service stopped!"
}

show_database_logs() {
    print_status "Showing database logs..."
    docker compose logs database -f
}

database_shell() {
    print_status "Connecting to database shell..."
    print_warning "Use \\q to quit the PostgreSQL shell"
    docker compose exec database psql -U homeaccount_user -d homeaccount
}

reset_database() {
    print_warning "This will DELETE ALL database data! Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Resetting database..."
        docker compose down database
        docker volume rm homeaccount_postgres_data 2>/dev/null || true
        docker compose up database -d
        print_success "Database reset complete!"
    else
        print_status "Database reset cancelled"
    fi
}

migrate_database() {
    print_status "Running database migrations..."
    cd database && node migrate.js run
    print_success "Database migrations completed!"
}

migration_status() {
    print_status "Checking migration status..."
    cd database && node migrate.js status
}

# Seed functions
start_with_seeds() {
    print_status "Starting all services with seeds enabled..."
    APPLY_SEEDS=true docker compose up -d
    print_success "All services started with seeds enabled!"
    print_status "Backend API: http://localhost:3000/api/ (via frontend proxy)"
    print_status "Frontend: http://localhost:3000"
    print_warning "Seeds will be applied automatically during migrations"
}

restart_with_seeds() {
    print_status "Restarting backend with seeds enabled..."
    docker compose stop backend
    APPLY_SEEDS=true docker compose up backend -d
    print_success "Backend restarted with seeds enabled!"
    print_warning "Seeds will be applied to any pending migrations"
}

enable_seeds() {
    print_status "Enabling seeds and restarting backend..."
    
    # Update the docker-compose.yml to enable seeds
    if command -v sed >/dev/null 2>&1; then
        # Create backup
        cp docker-compose.yml docker-compose.yml.bak
        
        # Update APPLY_SEEDS to true
        sed -i.tmp 's/APPLY_SEEDS=false/APPLY_SEEDS=true/' docker-compose.yml
        rm -f docker-compose.yml.tmp
        
        print_success "Updated APPLY_SEEDS=true in docker-compose.yml"
    else
        print_warning "sed not available. Please manually set APPLY_SEEDS=true in docker-compose.yml"
    fi
    
    # Restart backend
    docker compose stop backend
    docker compose up backend -d
    print_success "Backend restarted with seeds enabled!"
}

disable_seeds() {
    print_status "Disabling seeds and restarting backend..."
    
    # Update the docker-compose.yml to disable seeds
    if command -v sed >/dev/null 2>&1; then
        # Create backup
        cp docker-compose.yml docker-compose.yml.bak
        
        # Update APPLY_SEEDS to false
        sed -i.tmp 's/APPLY_SEEDS=true/APPLY_SEEDS=false/' docker-compose.yml
        rm -f docker-compose.yml.tmp
        
        print_success "Updated APPLY_SEEDS=false in docker-compose.yml"
    else
        print_warning "sed not available. Please manually set APPLY_SEEDS=false in docker-compose.yml"
    fi
    
    # Restart backend
    docker compose stop backend
    docker compose up backend -d
    print_success "Backend restarted with seeds disabled!"
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
    "db-start")
        start_database
        ;;
    "db-stop")
        stop_database
        ;;
    "db-logs")
        show_database_logs
        ;;
    "db-shell")
        database_shell
        ;;
    "db-reset")
        reset_database
        ;;
    "db-migrate")
        migrate_database
        ;;
    "db-status")
        migration_status
        ;;
    "up-with-seeds")
        start_with_seeds
        ;;
    "restart-with-seeds")
        restart_with_seeds
        ;;
    "seeds-on")
        enable_seeds
        ;;
    "seeds-off")
        disable_seeds
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