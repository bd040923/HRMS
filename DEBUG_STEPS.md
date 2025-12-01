# Debug Steps for Blank Screen

## Step 1: Check Browser Console

1. Open your browser (Chrome/Firefox/Edge)
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab
4. Look for any **red error messages**
5. **Take a screenshot** or copy the error messages

## Step 2: Check Terminal Output

Look at the terminal/command prompt where you ran `yarn serve`:

1. Does it say **"Compiled successfully"**?
2. Are there any **red error messages**?
3. What port is it running on? (Should show something like "Local: http://localhost:3000")

## Step 3: Verify the Page is Loading

1. Right-click on the blank page
2. Select **"Inspect"** or **"Inspect Element"**
3. In the Elements/Inspector tab, look for:
   - Is there a `<div id="app"></div>` element?
   - Is it empty or does it have content inside?

## Step 4: Check Network Tab

1. In Developer Tools, go to **Network** tab
2. Refresh the page (F5)
3. Look for:
   - Are JavaScript files loading? (main.js, bundle.js, etc.)
   - Are there any **404 errors** (red entries)?
   - Are files showing as **failed** or **blocked**?

## Step 5: Try These Commands

Stop the current server (Ctrl+C) and try:

```bash
cd orangehrm\src\client

# Clear cache and reinstall
rm -rf node_modules
rm -rf package-lock.json
npm install

# Try running again
npm run serve
```

## Step 6: Check if React is Actually Loading

In the browser console, type:
```javascript
React
```

If it says `undefined`, React is not loading.

## Step 7: Check the HTML Source

1. Right-click on the page
2. Select **"View Page Source"**
3. Look for:
   - Is there a `<div id="app"></div>`?
   - Are there any `<script>` tags?
   - What do the script tags point to?

## Common Issues:

### Issue: "Cannot find module" errors
**Solution:** Run `yarn install` again

### Issue: Port 3000 already in use
**Solution:** Change port in webpack.config.js or kill the process using port 3000

### Issue: Webpack compilation errors
**Solution:** Check the terminal output for specific errors

### Issue: React not rendering
**Solution:** Check browser console for JavaScript errors

## What to Share:

Please share:
1. **Browser console errors** (screenshot or copy text)
2. **Terminal output** from `yarn serve` (especially any errors)
3. **Network tab** - are files loading?
4. **What you see** when you inspect the `<div id="app">` element

This will help identify the exact problem!

