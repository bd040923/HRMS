/**
 * Arithwise HRM Theme Colors
 * 
 * Brand Color Palette
 */

export const theme = {
  colors: {
    // Primary Brand Color
    primary: '#78176b',
    
    // Hover/Dark Variant
    primaryHover: '#590a4f',
    
    // Light Background Shades
    lightBg: '#faf3ff',        // Main light background for sections/cards
    lightBgAlt: '#fffafe',    // Alternative light background for contrast
    
    // Neutral Colors
    white: '#ffffff',
    black: '#000000',
    text: '#333333',
    textLight: '#666666',
    textLighter: '#999999',
    
    // UI Colors
    border: '#e0e0e0',
    borderLight: '#f0f0f0',
    shadow: 'rgba(120, 23, 107, 0.1)',
    shadowHover: 'rgba(120, 23, 107, 0.2)',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '40px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  
  typography: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: {
      heading: '2rem',      // 32px - for main headings
      subheading: '20px',   // for subheadings
      textImportant: '16px', // for important text
      textNote: '14px',     // for notes and less important text
    },
    fontWeight: {
      normal: 400,
      medium: 500,          // for headings
      semibold: 600,
      bold: 700,
    },
  },
  
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease',
  },
};

export default theme;

