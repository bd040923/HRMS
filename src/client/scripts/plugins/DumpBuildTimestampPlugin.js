class DumpBuildTimestampPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('Cache Invalidate Plugin', () => {
      /* eslint-disable @typescript-eslint/no-var-requires */
      const path = require('path');
      const fs = require('fs');

      const buildFile = path.join(__dirname, '/../../../../web/dist/build');
      const buildDir = path.dirname(buildFile);
      
      try {
        // Create directory if it doesn't exist
        if (!fs.existsSync(buildDir)) {
          fs.mkdirSync(buildDir, { recursive: true });
        }
        
        const now = Date.now().toString();
        fs.writeFileSync(buildFile, now);
        console.info('Assets version: ', now);
      } catch (error) {
        // Silently fail in dev server mode if directory can't be created
        console.warn('Could not write build timestamp:', error.message);
      }
      /* eslint-enable @typescript-eslint/no-var-requires */
    });
  }
}

module.exports = DumpBuildTimestampPlugin;
