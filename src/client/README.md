# Arithwise HRM Frontend (React.js)

This is the React.js frontend for Arithwise HRM.

## Quick Start

```bash
# Install dependencies
yarn install

# Development server
yarn serve

# Build for production
yarn build

# Build in watch mode (for development)
yarn dev
```

## Environment Variables

All environment variables must be prefixed with `REACT_APP_` to be available in the React application.

Create a `.env` file in this directory (see `.env.example`):

```env
REACT_APP_API_BASE_URL=http://localhost/arithwise/web
REACT_APP_API_VERSION=v1
REACT_APP_ENV=development
```

## Project Structure

```
src/
├── index.tsx          # Entry point
├── App.tsx           # Main App component
├── core/             # Core utilities and components
│   ├── components/   # Reusable components
│   ├── plugins/     # Plugins (i18n, toaster, etc.)
│   └── styles/      # Global styles
└── [plugin-name]/   # Feature modules
```

## Development

The frontend is completely separate from the backend. It communicates with the backend via REST API calls.

### API Configuration
Configure the backend API URL in `.env`:
```env
REACT_APP_API_BASE_URL=http://localhost/arithwise/web
```

### Building
- Development: `yarn dev` (watch mode, outputs to `../../web/dist`)
- Production: `yarn build` (optimized build, outputs to `../../web/dist`)

## Dependencies

- React 18.2.0
- React Router DOM 6.20.0
- TypeScript 4.5.5
- Webpack 5.89.0
- And more... (see package.json)
