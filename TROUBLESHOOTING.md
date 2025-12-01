# Troubleshooting - Blank Page Issue

If you're seeing a blank page on localhost:3000, try these steps:

## Step 1: Check Browser Console

1. Open Developer Tools (F12)
2. Go to the Console tab
3. Look for any red error messages
4. Share the error messages if you see any

## Step 2: Check Terminal/Command Prompt

Look at the terminal where you ran `yarn serve`:
- Are there any error messages?
- Does it say "Compiled successfully"?
- Are there any webpack errors?

## Step 3: Common Issues and Fixes

### Issue: Module not found errors

**Fix:**
```bash
cd orangehrm/src/client
rm -rf node_modules
yarn install
yarn serve
```

### Issue: Port already in use

**Fix:** Change the port in `webpack.config.js`:
```javascript
devServer: {
  port: 3001, // Change from 3000 to 3001
  // ...
}
```

### Issue: SCSS compilation errors

**Fix:** The SCSS imports have been commented out. If you still see errors:
1. Check `src/index.tsx` - make sure SCSS imports are commented
2. Check `src/core/styles/index.scss` - OXD import is commented

### Issue: Build succeeds but page is blank

**Possible causes:**
1. JavaScript errors in console
2. React Router basename issue
3. Missing root element

**Quick test:** Open browser console and type:
```javascript
document.getElementById('app')
```

If it returns `null`, the HTML isn't loading properly.

## Step 4: Verify Files

Make sure these files exist:
- `orangehrm/src/client/src/index.tsx`
- `orangehrm/src/client/src/App.tsx`
- `orangehrm/src/client/public/index.html`

## Step 5: Simple Test

Try creating a minimal test:

1. Edit `src/App.tsx` and replace with:
```tsx
import React from 'react';

const App: React.FC = () => {
  return <div><h1>Hello World!</h1></div>;
};

export default App;
```

2. Restart the dev server
3. Check if "Hello World!" appears

If this works, the issue is with the original App component.

## Still Not Working?

1. Check Node.js version: `node --version` (should be 16+)
2. Check Yarn version: `yarn --version`
3. Try with npm instead: `npm install` then `npm run serve`
4. Clear browser cache (Ctrl+Shift+Delete)
5. Try a different browser
6. Check if antivirus/firewall is blocking localhost:3000

