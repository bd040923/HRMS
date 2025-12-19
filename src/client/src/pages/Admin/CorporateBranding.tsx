/**
 * arithwise_hrms Corporate Branding Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiService } from '../../services/api';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  success: '#76c043',
  white: '#ffffff',
  text: '#222222',
  textLight: '#666666',
  border: '#e0e0e0',
  lightBg: '#f9f9f9',
  lightBgMain: '#faf3ff',
  lightBgAlt: '#fffafe',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

const CorporateBranding: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState('#78176b');
  const [secondaryColor, setSecondaryColor] = useState('#590a4f');
  const [primaryFontColor, setPrimaryFontColor] = useState('#ffffff');
  const [secondaryFontColor, setSecondaryFontColor] = useState('#222222');
  const [gradientColor1, setGradientColor1] = useState('#faf3ff');
  const [gradientColor2, setGradientColor2] = useState('#fffafe');
  const [socialMediaEnabled, setSocialMediaEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [clientLogo, setClientLogo] = useState<File | null>(null);
  const [clientBanner, setClientBanner] = useState<File | null>(null);
  const [loginBanner, setLoginBanner] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCorporateBranding();
      if (data) {
        setPrimaryColor(data.primary_color || '#78176b');
        setSecondaryColor(data.secondary_color || '#590a4f');
        setPrimaryFontColor(data.primary_font_color || '#ffffff');
        setSecondaryFontColor(data.secondary_font_color || '#222222');
        setGradientColor1(data.gradient_color1 || '#faf3ff');
        setGradientColor2(data.gradient_color2 || '#fffafe');
        setSocialMediaEnabled(data.social_media_enabled !== undefined ? data.social_media_enabled : true);
      }
    } catch (error) {
      console.error('Error fetching corporate branding:', error);
      // Use defaults if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Are you sure you want to reset all branding settings to default?')) {
      try {
        setSaving(true);
        const defaultData = {
          primary_color: '#78176b',
          secondary_color: '#590a4f',
          primary_font_color: '#ffffff',
          secondary_font_color: '#222222',
          gradient_color1: '#faf3ff',
          gradient_color2: '#fffafe',
          social_media_enabled: true,
          client_logo_path: null,
          client_banner_path: null,
          login_banner_path: null
        };
        await apiService.updateCorporateBranding(defaultData);
        setPrimaryColor('#78176b');
        setSecondaryColor('#590a4f');
        setPrimaryFontColor('#ffffff');
        setSecondaryFontColor('#222222');
        setGradientColor1('#faf3ff');
        setGradientColor2('#fffafe');
        setSocialMediaEnabled(true);
        setClientLogo(null);
        setClientBanner(null);
        setLoginBanner(null);
        alert('Branding settings reset to default and saved!');
      } catch (error: any) {
        console.error('Error resetting branding:', error);
        alert(`Failed to reset branding: ${error.message || 'Unknown error'}`);
      } finally {
        setSaving(false);
      }
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handlePublish = async () => {
    if (window.confirm('Are you sure you want to publish these branding changes?')) {
      try {
        setSaving(true);
        const brandingData = {
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          primary_font_color: primaryFontColor,
          secondary_font_color: secondaryFontColor,
          gradient_color1: gradientColor1,
          gradient_color2: gradientColor2,
          social_media_enabled: socialMediaEnabled,
          client_logo_path: clientLogo ? clientLogo.name : null,
          client_banner_path: clientBanner ? clientBanner.name : null,
          login_banner_path: loginBanner ? loginBanner.name : null
        };
        await apiService.updateCorporateBranding(brandingData);
        alert('Branding settings published successfully!\n\nChanges will be reflected across the application.');
      } catch (error: any) {
        console.error('Error publishing branding:', error);
        alert(`Failed to publish branding: ${error.message || 'Unknown error'}`);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Corporate Branding" breadcrumbs={['Admin', 'Corporate Branding']}>
        <div style={{
          backgroundColor: COLORS.lightBg,
          padding: '32px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
              Loading branding settings...
            </div>
          ) : (
            <>
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
                    backgroundColor: COLORS.white,
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
                    backgroundColor: COLORS.white,
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
                  backgroundColor: COLORS.white,
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
            </>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '20px',
            }}
            onClick={handleClosePreview}
          >
            <div
              style={{
                backgroundColor: COLORS.lightBg,
                borderRadius: '8px',
                padding: '32px',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily }}>
                  Branding Preview
                </h2>
                <button
                  onClick={handleClosePreview}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: COLORS.text,
                    padding: '0',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>

              {/* Preview Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header Preview */}
                <div
                  style={{
                    backgroundColor: primaryColor,
                    color: primaryFontColor,
                    padding: '16px 24px',
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '18px' }}>arithwise_hrms</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px' }}>Dashboard</span>
                      <span style={{ fontSize: '14px' }}>Admin</span>
                      <span style={{ fontSize: '14px' }}>Profile</span>
                    </div>
                  </div>
                </div>

                {/* Buttons Preview */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px' }}>
                    Buttons
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      style={{
                        padding: '10px 24px',
                        backgroundColor: primaryColor,
                        color: primaryFontColor,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = secondaryColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = primaryColor;
                      }}
                    >
                      Primary Button
                    </button>
                    <button
                      style={{
                        padding: '10px 24px',
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
                      Success Button
                    </button>
                    <button
                      style={{
                        padding: '10px 24px',
                        backgroundColor: 'transparent',
                        color: COLORS.text,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: '14px',
                      }}
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>

                {/* Text Colors Preview */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px' }}>
                    Text Colors
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily }}>
                      Primary Text Color (#222222) - This is how regular text will appear
                    </div>
                    <div style={{ color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
                      Secondary Text Color (#666666) - This is how secondary text will appear
                    </div>
                    <div style={{ color: primaryColor, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500 }}>
                      Primary Color Text (#78176b) - This is how links and highlights will appear
                    </div>
                  </div>
                </div>

                {/* Cards/Sections Preview */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px' }}>
                    Cards & Sections
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div
                      style={{
                        backgroundColor: gradientColor1,
                        padding: '20px',
                        borderRadius: '6px',
                        border: `1px solid ${COLORS.border}`,
                        fontFamily: TYPOGRAPHY.fontFamily,
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px 0', color: COLORS.text }}>Card 1</h4>
                      <p style={{ margin: 0, color: COLORS.textLight, fontSize: '14px' }}>
                        This card uses Gradient Color 1 ({gradientColor1})
                      </p>
                    </div>
                    <div
                      style={{
                        backgroundColor: gradientColor2,
                        padding: '20px',
                        borderRadius: '6px',
                        border: `1px solid ${COLORS.border}`,
                        fontFamily: TYPOGRAPHY.fontFamily,
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px 0', color: COLORS.text }}>Card 2</h4>
                      <p style={{ margin: 0, color: COLORS.textLight, fontSize: '14px' }}>
                        This card uses Gradient Color 2 ({gradientColor2})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sidebar Preview */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px' }}>
                    Sidebar Preview
                  </h3>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div
                      style={{
                        width: '200px',
                        backgroundColor: COLORS.white,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '6px',
                        padding: '16px',
                        fontFamily: TYPOGRAPHY.fontFamily,
                      }}
                    >
                      <div
                        style={{
                          padding: '12px',
                          backgroundColor: primaryColor,
                          color: primaryFontColor,
                          borderRadius: '4px',
                          marginBottom: '8px',
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        Dashboard
                      </div>
                      <div style={{ padding: '12px', color: COLORS.text, fontSize: '14px', marginBottom: '4px' }}>
                        PIM
                      </div>
                      <div style={{ padding: '12px', color: COLORS.text, fontSize: '14px', marginBottom: '4px' }}>
                        Leave
                      </div>
                      <div style={{ padding: '12px', color: COLORS.text, fontSize: '14px' }}>
                        Time
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.lightBg,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '6px',
                        padding: '20px',
                        fontFamily: TYPOGRAPHY.fontFamily,
                      }}
                    >
                      <h4 style={{ margin: '0 0 12px 0', color: COLORS.text }}>Main Content Area</h4>
                      <p style={{ margin: 0, color: COLORS.textLight, fontSize: '14px' }}>
                        This is how the main content area will look with your selected background colors.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Color Swatches */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px' }}>
                    Color Palette
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <div
                        style={{
                          height: '60px',
                          backgroundColor: primaryColor,
                          borderRadius: '4px',
                          marginBottom: '8px',
                          border: `1px solid ${COLORS.border}`,
                        }}
                      />
                      <div style={{ fontSize: '12px', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily }}>
                        Primary: {primaryColor}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          height: '60px',
                          backgroundColor: secondaryColor,
                          borderRadius: '4px',
                          marginBottom: '8px',
                          border: `1px solid ${COLORS.border}`,
                        }}
                      />
                      <div style={{ fontSize: '12px', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily }}>
                        Secondary: {secondaryColor}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          height: '60px',
                          backgroundColor: gradientColor1,
                          borderRadius: '4px',
                          marginBottom: '8px',
                          border: `1px solid ${COLORS.border}`,
                        }}
                      />
                      <div style={{ fontSize: '12px', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily }}>
                        Gradient 1: {gradientColor1}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          height: '60px',
                          backgroundColor: gradientColor2,
                          borderRadius: '4px',
                          marginBottom: '8px',
                          border: `1px solid ${COLORS.border}`,
                        }}
                      />
                      <div style={{ fontSize: '12px', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily }}>
                        Gradient 2: {gradientColor2}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          height: '60px',
                          backgroundColor: COLORS.lightBg,
                          borderRadius: '4px',
                          marginBottom: '8px',
                          border: `1px solid ${COLORS.border}`,
                        }}
                      />
                      <div style={{ fontSize: '12px', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily }}>
                        Background: {COLORS.lightBg}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          height: '60px',
                          backgroundColor: COLORS.success,
                          borderRadius: '4px',
                          marginBottom: '8px',
                          border: `1px solid ${COLORS.border}`,
                        }}
                      />
                      <div style={{ fontSize: '12px', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily }}>
                        Success: {COLORS.success}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleClosePreview}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: primaryColor,
                    color: primaryFontColor,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = secondaryColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = primaryColor;
                  }}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default CorporateBranding;
