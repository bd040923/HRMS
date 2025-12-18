/**
 * arithwise_hrms Corporate Branding Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const COLORS = {
  primary: '#78176b',
  success: '#28a745',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  lightBg: '#faf3ff',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

const CorporateBranding: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState('#00ff00');
  const [secondaryColor, setSecondaryColor] = useState('#7ab800');
  const [primaryFontColor, setPrimaryFontColor] = useState('#ffffff');
  const [secondaryFontColor, setSecondaryFontColor] = useState('#800000');
  const [gradientColor1, setGradientColor1] = useState('#00ffff');
  const [gradientColor2, setGradientColor2] = useState('#0000ff');
  const [socialMediaEnabled, setSocialMediaEnabled] = useState(true);
  
  const [clientLogo, setClientLogo] = useState<File | null>(null);
  const [clientBanner, setClientBanner] = useState<File | null>(null);
  const [loginBanner, setLoginBanner] = useState<File | null>(null);

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all branding settings to default?')) {
      setPrimaryColor('#78176b');
      setSecondaryColor('#590a4f');
      setPrimaryFontColor('#ffffff');
      setSecondaryFontColor('#333333');
      setGradientColor1('#faf3ff');
      setGradientColor2('#fffafe');
      setSocialMediaEnabled(true);
      setClientLogo(null);
      setClientBanner(null);
      setLoginBanner(null);
      alert('Branding settings reset to default!');
    }
  };

  const handlePreview = () => {
    alert('Preview feature coming soon!\n\nThis will show a live preview of your branding changes before publishing.');
  };

  const handlePublish = () => {
    if (window.confirm('Are you sure you want to publish these branding changes?')) {
      alert('Branding settings published successfully!\n\nChanges will be reflected across the application.');
    }
  };

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Corporate Branding" breadcrumbs={['Admin', 'Corporate Branding']}>
        <div style={{
          backgroundColor: COLORS.white,
          padding: '32px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {/* Color Settings */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '32px',
            marginBottom: '40px'
          }}>
            {/* Primary Color */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontSize: '14px',
              }}>
                Primary Color*
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontSize: '14px',
              }}>
                Secondary Color*
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                />
              </div>
            </div>

            {/* Primary Font Color */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontSize: '14px',
              }}>
                Primary Font Color*
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={primaryFontColor}
                  onChange={(e) => setPrimaryFontColor(e.target.value)}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  value={primaryFontColor}
                  onChange={(e) => setPrimaryFontColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                />
              </div>
            </div>

            {/* Secondary Font Color */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontSize: '14px',
              }}>
                Secondary Font Color*
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={secondaryFontColor}
                  onChange={(e) => setSecondaryFontColor(e.target.value)}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  value={secondaryFontColor}
                  onChange={(e) => setSecondaryFontColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                />
              </div>
            </div>

            {/* Primary Gradient Color 1 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontSize: '14px',
              }}>
                Primary Gradient Color 1*
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={gradientColor1}
                  onChange={(e) => setGradientColor1(e.target.value)}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  value={gradientColor1}
                  onChange={(e) => setGradientColor1(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                />
              </div>
            </div>

            {/* Primary Gradient Color 2 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontSize: '14px',
              }}>
                Primary Gradient Color 2*
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={gradientColor2}
                  onChange={(e) => setGradientColor2(e.target.value)}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  value={gradientColor2}
                  onChange={(e) => setGradientColor2(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Separator */}
          <div style={{ height: '1px', backgroundColor: COLORS.border, margin: '40px 0' }} />

          {/* Logo & Banner Uploads */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '32px',
            marginBottom: '40px'
          }}>
            {/* Client Logo */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontSize: '14px',
                fontWeight: 500,
              }}>
                Client Logo
              </label>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <button
                  onClick={() => document.getElementById('clientLogo')?.click()}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: COLORS.lightBg,
                    color: COLORS.text,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  Browse
                </button>
                <span style={{
                  padding: '10px',
                  color: COLORS.textLight,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                }}>
                  {clientLogo ? clientLogo.name : 'No file selected'}
                </span>
                <input
                  id="clientLogo"
                  type="file"
                  accept=".jpg,.png,.gif,.svg"
                  onChange={(e) => setClientLogo(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
              </div>
              <p style={{ 
                fontSize: '12px', 
                color: COLORS.textLight, 
                fontFamily: TYPOGRAPHY.fontFamily,
                margin: 0
              }}>
                Accepts .jpg, .png, .gif, .svg up to 1MB. Recommended dimensions: 50px X 50px
              </p>
            </div>

            {/* Client Banner */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontSize: '14px',
                fontWeight: 500,
              }}>
                Client Banner
              </label>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <button
                  onClick={() => document.getElementById('clientBanner')?.click()}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: COLORS.lightBg,
                    color: COLORS.text,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  Browse
                </button>
                <span style={{
                  padding: '10px',
                  color: COLORS.textLight,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                }}>
                  {clientBanner ? clientBanner.name : 'No file selected'}
                </span>
                <input
                  id="clientBanner"
                  type="file"
                  accept=".jpg,.png,.gif,.svg"
                  onChange={(e) => setClientBanner(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
              </div>
              <p style={{ 
                fontSize: '12px', 
                color: COLORS.textLight, 
                fontFamily: TYPOGRAPHY.fontFamily,
                margin: 0
              }}>
                Accepts .jpg, .png, .gif, .svg up to 1MB. Recommended dimensions: 182px X 50px
              </p>
            </div>
          </div>

          {/* Login Banner */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontFamily: TYPOGRAPHY.fontFamily,
              color: COLORS.text,
              fontSize: '14px',
              fontWeight: 500,
            }}>
              Login Banner
            </label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
              <button
                onClick={() => document.getElementById('loginBanner')?.click()}
                style={{
                  padding: '10px 24px',
                  backgroundColor: COLORS.lightBg,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                }}
              >
                Browse
              </button>
              <span style={{
                padding: '10px',
                color: COLORS.textLight,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}>
                {loginBanner ? loginBanner.name : 'No file selected'}
              </span>
              <input
                id="loginBanner"
                type="file"
                accept=".jpg,.png,.gif,.svg"
                onChange={(e) => setLoginBanner(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
            </div>
            <p style={{ 
              fontSize: '12px', 
              color: COLORS.textLight, 
              fontFamily: TYPOGRAPHY.fontFamily,
              margin: 0
            }}>
              Accepts .jpg, .png, .gif, .svg up to 1MB. Recommended dimensions: 340px X 65px
            </p>
          </div>

          {/* Social Media Toggle */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: TYPOGRAPHY.fontFamily,
              color: COLORS.text,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={socialMediaEnabled}
                onChange={(e) => setSocialMediaEnabled(e.target.checked)}
                style={{
                  width: '40px',
                  height: '20px',
                  cursor: 'pointer',
                }}
              />
              Social Media Images
            </label>
          </div>

          {/* Required Note */}
          <div style={{ 
            marginBottom: '24px',
            color: COLORS.textLight,
            fontSize: '12px',
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            * Required
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleResetToDefault}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}
            >
              Reset to Default
            </button>
            <button
              onClick={handlePreview}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}
            >
              Preview
            </button>
            <button
              onClick={handlePublish}
              style={{
                padding: '12px 24px',
                backgroundColor: COLORS.success,
                color: COLORS.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Publish
            </button>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default CorporateBranding;
