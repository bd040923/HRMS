# Running the Project with npm

## Quick Start with npm

### Step 1: Install Dependencies

```bash
cd orangehrm\src\client
npm install
```

### Step 2: Start Development Server

```bash
npm run serve
```

The application will start on **http://localhost:3000**

## Available npm Commands

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
# Outputs to orangehrm/web/dist/
```

### Other Commands

```bash
# Run tests
npm run test:unit

# Lint code
npm run lint
```

## Troubleshooting with npm

### If you see "command not found" errors:

Make sure you're in the correct directory:
```bash
cd orangehrm\src\client
```

### If dependencies fail to install:

```bash
# Delete node_modules and package-lock.json
rm -rf node_modules
rm -rf package-lock.json

# Reinstall
npm install
```

### If port 3000 is busy:

The webpack dev server will automatically try the next available port (3001, 3002, etc.)

### Check npm version:

```bash
npm --version
```

Should be 6.0.0 or higher.

## Common npm Issues

### Issue: "npm ERR! code ELIFECYCLE"
**Solution:** Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Issue: "Cannot find module"
**Solution:** Run `npm install` to install missing dependencies

### Issue: "Port already in use"
**Solution:** Kill the process using port 3000 or change port in webpack.config.js

## Next Steps

1. Run `npm install` (if you haven't already)
2. Run `npm run serve`
3. Open http://localhost:3000 in your browser
4. Check browser console (F12) for any errors

