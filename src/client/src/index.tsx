/**
 * Arithwise HRM is a comprehensive Human Resource Management (HRM) System that captures
 * all the essential functionalities required for any enterprise.
 * Copyright (C) 2024 Arithwise Inc.
 *
 * Arithwise HRM is free software: you can redistribute it and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *
 * Arithwise HRM is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with Arithwise HRM.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import App from './App';

console.log('index.tsx loaded!');
console.log('React version:', React.version);

// @ts-expect-error: appGlobal is not in window object by default
const baseUrl = (window as any).appGlobal?.baseUrl || '';

// Wait for DOM to be ready
const initApp = () => {
  console.log('Initializing React app...');
  const container = document.getElementById('app');
  
  if (!container) {
    console.error('❌ Failed to find the root element with id "app"');
    document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: Cannot find app div</h1><p>Please check the HTML file.</p></div>';
    return;
  }

  console.log('✅ App container found:', container);
  
  try {
    const root = createRoot(container);
    console.log('✅ React root created');

    root.render(
      <React.StrictMode>
        <BrowserRouter basename={baseUrl}>
          <AuthProvider>
            <SidebarProvider>
              <App />
            </SidebarProvider>
          </AuthProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
    console.log('✅ React app rendered successfully!');
  } catch (error) {
    console.error('❌ Error rendering React app:', error);
    container.innerHTML = `<div style="padding: 20px; color: red;"><h1>React Error</h1><pre>${error}</pre></div>`;
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  console.log('DOM is loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  console.log('DOM already ready, initializing immediately...');
  initApp();
}
