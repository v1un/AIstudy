#!/bin/bash

# Genkit + Gemini Go Backend Setup Script
# This script automates the setup process for the backend

set -e

echo "🚀 Setting up Genkit + Gemini Go Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Go is installed
check_go() {
    print_header "Checking Go installation..."
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go 1.21 or higher."
        exit 1
    fi
    
    GO_VERSION=$(go version | cut -d' ' -f3 | sed 's/go//')
    print_status "Found Go version: $GO_VERSION"
}

# Initialize Go module
init_go_module() {
    print_header "Initializing Go module..."
    if [ ! -f "go.mod" ]; then
        go mod init genkit-backend
        print_status "Go module initialized"
    else
        print_status "Go module already exists"
    fi
}

# Download dependencies
download_dependencies() {
    print_header "Downloading dependencies..."
    
    go get github.com/gorilla/mux@v1.8.1
    go get github.com/joho/godotenv@v1.5.1
    go get github.com/google/generative-ai-go@v0.15.0
    go get google.golang.org/api@v0.169.0
    
    go mod tidy
    print_status "Dependencies downloaded successfully"
}

# Setup environment file
setup_env() {
    print_header "Setting up environment file..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_status "Created .env file from .env.example"
        else
            cat > .env << EOF
# Google AI API Key - Get this from https://makersuite.google.com/app/apikey
GOOGLE_GENAI_API_KEY=your_api_key_here

# Server port (optional, defaults to 8080)
PORT=8080

# Optional: Google Cloud Project ID for Vertex AI
# GOOGLE_CLOUD_PROJECT=your-project-id

# Optional: Google Cloud Region for Vertex AI
# GOOGLE_CLOUD_REGION=us-central1
EOF
            print_status "Created .env file with default values"
        fi
        
        print_warning "Please edit .env file and add your Google AI API key"
        print_warning "Get your API key from: https://makersuite.google.com/app/apikey"
    else
        print_status ".env file already exists"
    fi
}

# Build the application
build_app() {
    print_header "Building the application..."
    
    if go build -o genkit-backend main.go; then
        print_status "Application built successfully"
    else
        print_error "Failed to build application"
        exit 1
    fi
}

# Run tests (if any)
run_tests() {
    print_header "Running tests..."
    
    if go test ./...; then
        print_status "All tests passed"
    else
        print_warning "Some tests failed or no tests found"
    fi
}

# Create logs directory
create_logs_dir() {
    print_header "Creating logs directory..."
    
    if [ ! -d "logs" ]; then
        mkdir logs
        print_status "Logs directory created"
    else
        print_status "Logs directory already exists"
    fi
}

# Setup systemd service (optional)
setup_systemd() {
    if [ "$EUID" -eq 0 ] && [ "$1" = "--systemd" ]; then
        print_header "Setting up systemd service..."
        
        cat > /etc/systemd/system/genkit-backend.service << EOF
[Unit]
Description=Genkit + Gemini Go Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/genkit-backend
Restart=always
RestartSec=5
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
EnvironmentFile=$(pwd)/.env

[Install]
WantedBy=multi-user.target
EOF
        
        systemctl daemon-reload
        systemctl enable genkit-backend
        print_status "Systemd service configured"
    fi
}

# Main setup function
main() {
    echo "=================================="
    echo "  Genkit + Gemini Backend Setup  "
    echo "=================================="
    echo ""
    
    check_go
    init_go_module
    download_dependencies
    setup_env
    create_logs_dir
    build_app
    run_tests
    setup_systemd "$@"
    
    echo ""
    echo "=================================="
    echo -e "${GREEN}✅ Setup completed successfully!${NC}"
    echo "=================================="
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file and add your Google AI API key"
    echo "2. Run: ./genkit-backend (or go run main.go)"
    echo "3. Visit: http://localhost:8080/health"
    echo ""
    echo "For more information, see README.md"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --systemd)
            SETUP_SYSTEMD=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "OPTIONS:"
            echo "  --systemd    Setup systemd service (requires root)"
            echo "  --help, -h   Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@" 