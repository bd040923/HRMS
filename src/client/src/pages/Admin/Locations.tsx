/**
 * Arithwise HRM Locations Management Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiService } from '../../services/api';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#f9f9f9',
  lightBgAlt: '#f9f9f9',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  green: '#78176b', // Using primary purple instead of green
  red: '#dc3545',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

interface Location {
  id: number;
  name: string;
  city: string;
  country: string;
  phone: string;
  numberOfEmployees: number;
}

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    phone: '',
    numberOfEmployees: 0,
  });
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    city: '',
    country: '',
  });

  // Fetch locations from API
  useEffect(() => {
    fetchLocations();
  }, [searchFilters]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLocations({
        name: searchFilters.name || undefined,
        city: searchFilters.city || undefined,
        country: searchFilters.country || undefined,
      });
      setLocations(data.map((item: any) => ({
        id: item.id,
        name: item.name,
        city: item.city || '',
        country: item.country || '',
        phone: item.phone || '',
        numberOfEmployees: item.number_of_employees || 0,
      })));
    } catch (error) {
      console.error('Error fetching locations:', error);
      alert('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(locations.map(l => l.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await apiService.deleteLocation(id);
        setLocations(locations.filter(l => l.id !== id));
        setSelectedItems(selectedItems.filter(i => i !== id));
        alert('Location deleted successfully');
      } catch (error: any) {
        console.error('Error deleting location:', error);
        alert(`Failed to delete location: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', city: '', country: '', phone: '', numberOfEmployees: 0 });
    setShowAddModal(true);
  };

  const handleEdit = (item: Location) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      city: item.city,
      country: item.country,
      phone: item.phone,
      numberOfEmployees: item.numberOfEmployees,
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Location name is required');
      return;
    }

    try {
      if (editingItem) {
        // Update existing location
        const updated = await apiService.updateLocation(editingItem.id, {
          name: formData.name,
          city: formData.city || undefined,
          country: formData.country || undefined,
          phone: formData.phone || undefined,
          number_of_employees: formData.numberOfEmployees,
        });
        setLocations(locations.map(l => 
          l.id === editingItem.id 
            ? { 
                id: updated.id, 
                name: updated.name, 
                city: updated.city || '', 
                country: updated.country || '', 
                phone: updated.phone || '', 
                numberOfEmployees: updated.number_of_employees || 0 
              }
            : l
        ));
        alert('Location updated successfully');
      } else {
        // Create new location
        const newLocation = await apiService.createLocation({
          name: formData.name,
          city: formData.city || undefined,
          country: formData.country || undefined,
          phone: formData.phone || undefined,
          number_of_employees: formData.numberOfEmployees,
        });
        setLocations([...locations, { 
          id: newLocation.id, 
          name: newLocation.name, 
          city: newLocation.city || '', 
          country: newLocation.country || '', 
          phone: newLocation.phone || '', 
          numberOfEmployees: newLocation.number_of_employees || 0 
        }]);
        alert('Location created successfully');
      }
      setShowAddModal(false);
      setFormData({ name: '', city: '', country: '', phone: '', numberOfEmployees: 0 });
    } catch (error: any) {
      console.error('Error saving location:', error);
      alert(`Failed to save location: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSearch = () => {
    fetchLocations();
  };

  const handleReset = () => {
    setSearchFilters({ name: '', city: '', country: '' });
    // fetchLocations will be called automatically via useEffect
  };

  return (
    <ProtectedRoute requiredPermission="manage_departments">
      <AdminLayout title="Locations" breadcrumbs={['Admin', 'Organization']}>
        <div style={{
          backgroundColor: COLORS.lightBg,
          minHeight: 'calc(100vh - 200px)',
          padding: '24px',
        }}>
          {/* Search Filters */}
          <div style={{
            backgroundColor: COLORS.white,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <h3 style={{
              color: COLORS.primary,
              fontSize: '1.1rem',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontWeight: 500,
              margin: '0 0 16px 0',
            }}>
              Locations
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textNote.fontSize, color: COLORS.textLight }}>
                  Name
                </label>
                <input
                  type="text"
                  value={searchFilters.name}
                  onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textNote.fontSize, color: COLORS.textLight }}>
                  City
                </label>
                <input
                  type="text"
                  value={searchFilters.city}
                  onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textNote.fontSize, color: COLORS.textLight }}>
                  Country
                </label>
                <select
                  value={searchFilters.country}
                  onChange={(e) => setSearchFilters({ ...searchFilters, country: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                  }}
                >
                  <option value="">-- Select --</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="India">India</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 20px',
                  backgroundColor: COLORS.white,
                  color: COLORS.primary,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                }}
              >
                Reset
              </button>
              <button
                onClick={handleSearch}
                style={{
                  padding: '8px 20px',
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            style={{
              backgroundColor: COLORS.green,
              color: COLORS.white,
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            + Add
          </button>

          {/* Records count */}
          <div style={{
            color: COLORS.textLight,
            fontSize: TYPOGRAPHY.textNote.fontSize,
            fontFamily: TYPOGRAPHY.fontFamily,
            marginBottom: '16px',
          }}>
            {loading ? 'Loading...' : `(${locations.length}) Records Found`}
          </div>

          {/* Table */}
          <div style={{
            backgroundColor: COLORS.white,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: COLORS.lightBgAlt, borderBottom: `1px solid ${COLORS.border}` }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === locations.length && locations.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                    Name
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                    City
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                    Country
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                    Phone
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                    Number of Employees
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: COLORS.textLight }}>
                      Loading locations...
                    </td>
                  </tr>
                ) : locations.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: COLORS.textLight }}>
                      No locations found. Click "+ Add" to create one.
                    </td>
                  </tr>
                ) : (
                  locations.map(location => (
                  <tr key={location.id} style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.white }}>
                    <td style={{ padding: '16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(location.id)}
                        onChange={() => handleSelectItem(location.id)}
                      />
                    </td>
                    <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.primary }}>
                      {location.name}
                    </td>
                    <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      {location.city}
                    </td>
                    <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      {location.country}
                    </td>
                    <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      {location.phone}
                    </td>
                    <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      {location.numberOfEmployees}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleDelete(location.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: COLORS.textLight,
                            fontSize: '18px',
                            padding: '4px 8px',
                          }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => handleEdit(location)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: COLORS.textLight,
                            fontSize: '18px',
                            padding: '4px 8px',
                          }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
              <div style={{
                backgroundColor: COLORS.white,
                borderRadius: '8px',
                padding: '24px',
                width: '600px',
                maxWidth: '90%',
              }}>
                <h2 style={{
                  color: COLORS.primary,
                  fontSize: '1.25rem',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  marginBottom: '20px',
                }}>
                  {editingItem ? 'Edit Location' : 'Add Location'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: TYPOGRAPHY.textImportant.fontSize,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: TYPOGRAPHY.textImportant.fontSize,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: TYPOGRAPHY.textImportant.fontSize,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: TYPOGRAPHY.textImportant.fontSize,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      Number of Employees
                    </label>
                    <input
                      type="number"
                      value={formData.numberOfEmployees}
                      onChange={(e) => setFormData({ ...formData, numberOfEmployees: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: TYPOGRAPHY.textImportant.fontSize,
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: COLORS.textLight,
                      color: COLORS.white,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: COLORS.primary,
                      color: COLORS.white,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Locations;

