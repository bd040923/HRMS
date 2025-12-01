# Arithwise HRM Setup Guide

This project is structured with a clear separation between **Frontend** (React.js) and **Backend** (PHP/Symfony).

## Project Structure

```
arithwise/
├── src/                    # Backend (PHP)
│   ├── client/            # Frontend (React.js)
│   │   ├── src/           # React source code
│   │   ├── public/        # Public assets
│   │   ├── .env           # Frontend environment variables
│   │   └── package.json   # Frontend dependencies
│   ├── plugins/           # PHP plugins
│   └── lib/              # PHP core libraries
├── web/                   # Web server root
│   └── dist/             # Built frontend assets (generated)
├── .env                   # Backend environment variables
└── composer.json         # Backend dependencies
```

## Prerequisites

### Backend Requirements
- PHP 7.4 or 8.0+
- Composer
- MySQL/MariaDB
- Web server (Apache/Nginx) or PHP built-in server

### Frontend Requirements
- Node.js 16+ 
- Yarn 4.1.0 (or npm)

## Setup Instructions

### 1. Backend Setup

#### Step 1: Install PHP Dependencies
```bash
cd orangehrm/src
composer install
```

#### Step 2: Configure Environment Variables
Copy the example environment file and configure it:
```bash
cd orangehrm
# If .env doesn't exist, create it from .env.example
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Application Environment
APP_ENV=dev
APP_DEBUG=true

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=orangehrm_mysql
DB_USER=root
DB_PASS=your_password

# Application URL
APP_URL=http://localhost
APP_BASE_URL=/arithwise
```

#### Step 3: Database Setup
1. Create a MySQL database
2. Run the installer or configure the database connection in `.env`
3. The application will use the database configuration from `.env`

### 2. Frontend Setup

#### Step 1: Install Node Dependencies
```bash
cd orangehrm/src/client
yarn install
# or
npm install
```

#### Step 2: Configure Frontend Environment Variables
Copy the example environment file:
```bash
cd arithwise/src/client
# If .env doesn't exist, create it from .env.example
cp .env.example .env
```

Edit `.env` file:
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost/arithwise/web
REACT_APP_API_VERSION=v1

# Application Configuration
REACT_APP_NAME=Arithwise HRM
REACT_APP_VERSION=5.0.0

# Environment
REACT_APP_ENV=development
```

## Running the Application

### Development Mode

#### Backend (PHP)
```bash
# Using PHP built-in server
cd arithwise
php -S localhost:8000 -t web web/index.php

# Or configure your web server (Apache/Nginx) to point to arithwise/web/
```

#### Frontend (React)
```bash
cd orangehrm/src/client

# Development server (with hot reload)
yarn serve
# Runs on http://localhost:3000

# Or build in watch mode (outputs to web/dist)
yarn dev
```

### Production Mode

#### Build Frontend
```bash
cd orangehrm/src/client
yarn build
# Outputs to arithwise/web/dist/
```

#### Configure Backend
Set in `.env`:
```env
APP_ENV=prod
APP_DEBUG=false
```

## Environment Variables

### Backend (.env in root)
- `APP_ENV`: Application environment (dev, prod, test, demo)
- `APP_DEBUG`: Enable/disable debug mode
- `APP_URL`: Base URL of the application
- `APP_BASE_URL`: Base path for the application
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`: Database configuration
- `FRONTEND_URL`: Frontend application URL
- `API_VERSION`: API version
- And more... (see .env.example for full list)

### Frontend (.env in src/client)
- `REACT_APP_API_BASE_URL`: Backend API base URL
- `REACT_APP_API_VERSION`: API version
- `REACT_APP_NAME`: Application name
- `REACT_APP_ENV`: Environment (development, production, test)
- `REACT_APP_ENABLE_I18N`: Enable internationalization
- `REACT_APP_ENABLE_DEBUG`: Enable debug mode
- And more... (see src/client/.env.example for full list)

## Important Notes

1. **Frontend and Backend are Separate**
   - Frontend runs on React.js (port 3000 in dev)
   - Backend runs on PHP (port 8000 or your web server)
   - Frontend communicates with backend via API calls

2. **Environment Files**
   - Backend uses `.env` in the root directory
   - Frontend uses `.env` in `src/client/` directory
   - Never commit `.env` files to version control
   - Always use `.env.example` as a template

3. **Build Process**
   - Frontend must be built before production deployment
   - Built files go to `web/dist/`
   - Backend serves the built frontend from `web/dist/`

4. **Development Workflow**
   - Run backend server
   - Run frontend dev server (or use watch mode)
   - Frontend proxies API calls to backend
   - Changes in frontend code hot-reload automatically

## Troubleshooting

### Frontend not connecting to backend
- Check `REACT_APP_API_BASE_URL` in `src/client/.env`
- Ensure backend server is running
- Check CORS settings if needed

### Environment variables not loading
- Ensure `.env` files are in the correct locations
- Restart dev server after changing `.env` files
- Check that variable names start with `REACT_APP_` for frontend

### Build errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && yarn install`
- Check Node.js version compatibility
- Ensure all environment variables are set

## Additional Resources

- Backend API Documentation: Check API endpoints in `src/plugins/`
- Frontend Components: Located in `src/client/src/`
- Configuration Files: See `src/lib/config/` for backend config

