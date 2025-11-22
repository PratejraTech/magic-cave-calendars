#!/bin/bash

# Magic Cave Calendars - Development Environment Setup Script
# This script sets up the complete development environment for new team members

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_nodejs() {
    if command_exists node; then
        NODE_VERSION=$(node --version | sed 's/v//')
        REQUIRED_VERSION="18.0.0"

        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
        else
            print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+ or downgrade to 20.x LTS"
            print_error "Current recommendation: Node.js 20.x LTS"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 20.x LTS from https://nodejs.org/"
        exit 1
    fi
}

# Function to check Docker
check_docker() {
    if command_exists docker; then
        if docker info >/dev/null 2>&1; then
            print_success "Docker is running"
        else
            print_error "Docker is installed but not running. Please start Docker."
            exit 1
        fi
    else
        print_error "Docker is not installed. Please install Docker from https://docker.com/"
        exit 1
    fi
}

# Function to check Docker Compose
check_docker_compose() {
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose is available"
    else
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
}

# Function to setup environment variables
setup_env() {
    print_status "Setting up environment variables..."

    # Copy environment template if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from template"
        else
            print_warning ".env.example not found, creating basic .env file"
            cat > .env << EOF
# Development Environment Variables
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# OpenAI API Key (required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:54321/magic_cave_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret for development
JWT_SECRET=development-jwt-secret-key
EOF
            print_success "Created basic .env file"
        fi
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Function to install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    if [ -d "apps/web" ]; then
        cd apps/web
        npm install
        print_success "Frontend dependencies installed"
        cd ../..
    else
        print_warning "Frontend directory not found, skipping"
    fi
}

# Function to install API dependencies
install_api_deps() {
    print_status "Installing API dependencies..."
    if [ -d "services/api" ]; then
        cd services/api
        npm install
        print_success "API dependencies installed"
        cd ../..
    else
        print_warning "API directory not found, skipping"
    fi
}

# Function to install intelligence service dependencies
install_intelligence_deps() {
    print_status "Installing intelligence service dependencies..."
    if [ -d "services/intelligence" ]; then
        cd services/intelligence
        if command_exists python3; then
            python3 -m pip install --upgrade pip
            pip install -r requirements.txt
            print_success "Intelligence service dependencies installed"
        else
            print_error "Python3 is not installed. Please install Python 3.8+"
            exit 1
        fi
        cd ../..
    else
        print_warning "Intelligence service directory not found, skipping"
    fi
}

# Function to setup Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    if [ -d ".husky" ]; then
        npm run prepare
        print_success "Git hooks configured"
    else
        print_warning "Husky not found, skipping Git hooks setup"
    fi
}

# Main setup function
main() {
    echo "🚀 Magic Cave Calendars - Development Environment Setup"
    echo "=================================================="

    print_status "Checking system requirements..."

    # Check prerequisites
    check_nodejs
    check_docker
    check_docker_compose

    # Setup environment
    setup_env

    # Install dependencies
    install_frontend_deps
    install_api_deps
    install_intelligence_deps

    # Setup Git hooks
    setup_git_hooks

    echo ""
    print_success "🎉 Development environment setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Add your OpenAI API key to the .env file"
    echo "2. Start the development environment:"
    echo "   docker-compose up -d"
    echo "3. Wait for all services to be healthy, then:"
    echo "   npm run dev"
    echo ""
    echo "Services will be available at:"
    echo "- Frontend: http://localhost:5173"
    echo "- API: http://localhost:3001"
    echo "- Intelligence: http://localhost:8000"
    echo "- Supabase Studio: http://localhost:54323"
    echo "- Database: localhost:54321"
    echo ""
    echo "For more information, see the README.md file."
}

# Run main function
main "$@"