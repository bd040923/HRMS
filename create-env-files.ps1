# PowerShell script to create .env files for Arithwise HRM
# Run this script from the arithwise directory

Write-Host "Creating .env files for Arithwise HRM..." -ForegroundColor Green

# Backend .env file
$backendEnv = @"
# Arithwise HRM Backend Environment Configuration
# Copy this file and update with your actual values

# Application Environment
APP_ENV=dev
# Options: dev, prod, test, demo
APP_DEBUG=true

# Application URL
APP_URL=http://localhost
APP_BASE_URL=/arithwise

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=arithwise_mysql
DB_USER=root
DB_PASS=root

# Session Configuration
SESSION_LIFETIME=1800
SESSION_DRIVER=file

# Logging
LOG_LEVEL=debug
# Options: debug, info, warning, error

# Cache Configuration
CACHE_DRIVER=file
CACHE_PREFIX=arithwise_

# Security
APP_KEY=
ENCRYPTION_ENABLED=false

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
FRONTEND_BUILD_PATH=web/dist

# API Configuration
API_VERSION=2.7.0
API_PREFIX=/api/v1

# Email Configuration (Optional)
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@arithwise.com
MAIL_FROM_NAME=Arithwise HRM

# LDAP Configuration (Optional)
LDAP_ENABLED=false
LDAP_HOST=
LDAP_PORT=389
LDAP_BASE_DN=
LDAP_BIND_USER=
LDAP_BIND_PASSWORD=

# OAuth Configuration (Optional)
OAUTH_ENABLED=false
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
# 10MB in bytes

# Timezone
APP_TIMEZONE=UTC
"@

# Frontend .env file
$frontendEnv = @"
# Arithwise HRM Frontend Environment Configuration
# React.js Frontend Settings

# API Configuration
REACT_APP_API_BASE_URL=http://localhost/arithwise/web
REACT_APP_API_VERSION=v1

# Application Configuration
REACT_APP_NAME=Arithwise HRM
REACT_APP_VERSION=5.0.0

# Environment
REACT_APP_ENV=development
# Options: development, production, test

# Build Configuration
REACT_APP_BUILD_PATH=../../web/dist
REACT_APP_PUBLIC_PATH=.

# Feature Flags
REACT_APP_ENABLE_I18N=true
REACT_APP_ENABLE_DEBUG=true

# OAuth/Social Login (Optional)
REACT_APP_OAUTH_ENABLED=false
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_MICROSOFT_CLIENT_ID=
REACT_APP_AUTH0_DOMAIN=
REACT_APP_AUTH0_CLIENT_ID=

# WebSocket Configuration (Optional)
REACT_APP_WS_URL=ws://localhost:8080

# Analytics (Optional)
REACT_APP_GA_TRACKING_ID=

# Sentry Error Tracking (Optional)
REACT_APP_SENTRY_DSN=
"@

# Create backend .env
$backendPath = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $backendPath)) {
    $backendEnv | Out-File -FilePath $backendPath -Encoding utf8
    Write-Host "Created: $backendPath" -ForegroundColor Green
} else {
    Write-Host "Skipped: $backendPath (already exists)" -ForegroundColor Yellow
}

# Create backend .env.example
$backendExamplePath = Join-Path $PSScriptRoot ".env.example"
$backendEnv | Out-File -FilePath $backendExamplePath -Encoding utf8
Write-Host "Created: $backendExamplePath" -ForegroundColor Green

# Create frontend .env
$frontendPath = Join-Path $PSScriptRoot "src\client\.env"
if (-not (Test-Path $frontendPath)) {
    $frontendEnv | Out-File -FilePath $frontendPath -Encoding utf8
    Write-Host "Created: $frontendPath" -ForegroundColor Green
} else {
    Write-Host "Skipped: $frontendPath (already exists)" -ForegroundColor Yellow
}

# Create frontend .env.example
$frontendExamplePath = Join-Path $PSScriptRoot "src\client\.env.example"
$frontendEnv | Out-File -FilePath $frontendExamplePath -Encoding utf8
Write-Host "Created: $frontendExamplePath" -ForegroundColor Green

Write-Host "`n.env files created successfully!" -ForegroundColor Green
Write-Host "Please edit the .env files with your actual configuration values." -ForegroundColor Cyan

