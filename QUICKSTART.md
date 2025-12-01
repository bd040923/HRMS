# Quick Start Guide - Arithwise HRM (React Frontend)

Since all PHP files have been removed, this is now a **React.js frontend-only** application.

## Prerequisites

- **Node.js** 16+ (Download from [nodejs.org](https://nodejs.org/))
- **Yarn** 4.1.0 or **npm** (npm comes with Node.js)

## Quick Start

### Step 1: Install Dependencies

Open a terminal/command prompt and navigate to the client directory:

```bash
cd orangehrm/src/client
```

Install all required packages:

```bash
npm install
```

### Step 2: Run the Development Server

Start the development server with hot-reload:

```bash
npm run serve
```

The application will start on **http://localhost:3000**

Open your browser and navigate to that URL.

## Available Commands

### Development

```bash
# Start development server (with hot reload)
npm run serve

# Build in watch mode (for development)
npm run dev
```

### Production

```bash
# Build for production
npm run build

# The built files will be in: orangehrm/web/dist/
```

### Other Commands

```bash
# Run tests
npm run test:unit

# Lint code
npm run lint
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can change it in `webpack.config.js`:

```javascript
devServer: {
  port: 3001, // Change to any available port
  // ...
}
```

### Module Not Found Errors

If you get module errors, try:

```bash
# Delete node_modules and package-lock.json, then reinstall
rm -rf node_modules
rm -rf package-lock.json
npm install
```

### Build Errors

Make sure you have the correct Node.js version:
```bash
node --version  # Should be 16 or higher
```

## Project Structure

```
orangehrm/src/client/
├── src/
│   ├── index.tsx      # Entry point
│   ├── App.tsx       # Main App component
│   └── ...           # Other React components
├── public/
│   └── index.html    # HTML template
├── package.json      # Dependencies
└── webpack.config.js # Build configuration
```

## Next Steps

1. The app is now running on http://localhost:3000
2. Start building your React components in `src/`
3. Add routes in `src/App.tsx`
4. Customize the UI as needed

## Note

Since the PHP backend has been removed, you'll need to:
- Set up a new backend API (Node.js, Python, etc.) if you need one
- Or use mock data for frontend development
- Update API endpoints in your React components to point to your new backend

