/**
 * arithwise_hrms Nationalities Management Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const COLORS = {
  primary: '#78176b',
  success: '#28a745',
  danger: '#dc3545',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  lightBg: '#faf3ff',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

interface Nationality {
  id: number;
  name: string;
}

const initialNationalities: Nationality[] = [
  { id: 1, name: 'Afghan' },
  { id: 2, name: 'Albanian' },
  { id: 3, name: 'Algerian' },
  { id: 4, name: 'American' },
  { id: 5, name: 'Andorran' },
  { id: 6, name: 'Angolan' },
  { id: 7, name: 'Antiguans' },
  { id: 8, name: 'Argentinean' },
  { id: 9, name: 'Armenian' },
  { id: 10, name: 'Australian' },
  { id: 11, name: 'Austrian' },
  { id: 12, name: 'Azerbaijani' },
  { id: 13, name: 'Bahamian' },
  { id: 14, name: 'Bahraini' },
  { id: 15, name: 'Bangladeshi' },
  { id: 16, name: 'Barbadian' },
  { id: 17, name: 'Barbudans' },
  { id: 18, name: 'Batswana' },
  { id: 19, name: 'Belarusian' },
  { id: 20, name: 'Belgian' },
  { id: 21, name: 'Belizean' },
  { id: 22, name: 'Beninese' },
  { id: 23, name: 'Bhutanese' },
  { id: 24, name: 'Bolivian' },
  { id: 25, name: 'Bosnian' },
  { id: 26, name: 'Brazilian' },
  { id: 27, name: 'British' },
  { id: 28, name: 'Bruneian' },
  { id: 29, name: 'Bulgarian' },
  { id: 30, name: 'Burkinabe' },
  { id: 31, name: 'Burmese' },
  { id: 32, name: 'Burundian' },
  { id: 33, name: 'Cambodian' },
  { id: 34, name: 'Cameroonian' },
  { id: 35, name: 'Canadian' },
  { id: 36, name: 'Cape Verdean' },
  { id: 37, name: 'Central African' },
  { id: 38, name: 'Chadian' },
  { id: 39, name: 'Chilean' },
  { id: 40, name: 'Chinese' },
  { id: 41, name: 'Colombian' },
  { id: 42, name: 'Comoran' },
  { id: 43, name: 'Congolese' },
  { id: 44, name: 'Costa Rican' },
  { id: 45, name: 'Croatian' },
  { id: 46, name: 'Cuban' },
  { id: 47, name: 'Cypriot' },
  { id: 48, name: 'Czech' },
  { id: 49, name: 'Danish' },
  { id: 50, name: 'Djibouti' },
  { id: 51, name: 'Dominican' },
  { id: 52, name: 'Dutch' },
  { id: 53, name: 'East Timorese' },
  { id: 54, name: 'Ecuadorean' },
  { id: 55, name: 'Egyptian' },
  { id: 56, name: 'Emirian' },
  { id: 57, name: 'Equatorial Guinean' },
  { id: 58, name: 'Eritrean' },
  { id: 59, name: 'Estonian' },
  { id: 60, name: 'Ethiopian' },
  { id: 61, name: 'Fijian' },
  { id: 62, name: 'Filipino' },
  { id: 63, name: 'Finnish' },
  { id: 64, name: 'French' },
  { id: 65, name: 'Gabonese' },
  { id: 66, name: 'Gambian' },
  { id: 67, name: 'Georgian' },
  { id: 68, name: 'German' },
  { id: 69, name: 'Ghanaian' },
  { id: 70, name: 'Greek' },
  { id: 71, name: 'Grenadian' },
  { id: 72, name: 'Guatemalan' },
  { id: 73, name: 'Guinea-Bissauan' },
  { id: 74, name: 'Guinean' },
  { id: 75, name: 'Guyanese' },
  { id: 76, name: 'Haitian' },
  { id: 77, name: 'Herzegovinian' },
  { id: 78, name: 'Honduran' },
  { id: 79, name: 'Hungarian' },
  { id: 80, name: 'I-Kiribati' },
  { id: 81, name: 'Icelander' },
  { id: 82, name: 'Indian' },
  { id: 83, name: 'Indonesian' },
  { id: 84, name: 'Iranian' },
  { id: 85, name: 'Iraqi' },
  { id: 86, name: 'Irish' },
  { id: 87, name: 'Israeli' },
  { id: 88, name: 'Italian' },
  { id: 89, name: 'Ivorian' },
  { id: 90, name: 'Jamaican' },
  { id: 91, name: 'Japanese' },
  { id: 92, name: 'Jordanian' },
  { id: 93, name: 'Kazakhstani' },
  { id: 94, name: 'Kenyan' },
  { id: 95, name: 'Kittian and Nevisian' },
  { id: 96, name: 'Kuwaiti' },
  { id: 97, name: 'Kyrgyz' },
  { id: 98, name: 'Laotian' },
  { id: 99, name: 'Latvian' },
  { id: 100, name: 'Lebanese' },
  { id: 101, name: 'Liberian' },
  { id: 102, name: 'Libyan' },
  { id: 103, name: 'Liechtensteiner' },
  { id: 104, name: 'Lithuanian' },
  { id: 105, name: 'Luxembourger' },
  { id: 106, name: 'Macedonian' },
  { id: 107, name: 'Malagasy' },
  { id: 108, name: 'Malawian' },
  { id: 109, name: 'Malaysian' },
  { id: 110, name: 'Maldivan' },
  { id: 111, name: 'Malian' },
  { id: 112, name: 'Maltese' },
  { id: 113, name: 'Marshallese' },
  { id: 114, name: 'Mauritanian' },
  { id: 115, name: 'Mauritian' },
  { id: 116, name: 'Mexican' },
  { id: 117, name: 'Micronesian' },
  { id: 118, name: 'Moldovan' },
  { id: 119, name: 'Monacan' },
  { id: 120, name: 'Mongolian' },
  { id: 121, name: 'Moroccan' },
  { id: 122, name: 'Mosotho' },
  { id: 123, name: 'Motswana' },
  { id: 124, name: 'Mozambican' },
  { id: 125, name: 'Namibian' },
  { id: 126, name: 'Nauruan' },
  { id: 127, name: 'Nepalese' },
  { id: 128, name: 'New Zealander' },
  { id: 129, name: 'Nicaraguan' },
  { id: 130, name: 'Nigerian' },
  { id: 131, name: 'Nigerien' },
  { id: 132, name: 'North Korean' },
  { id: 133, name: 'Northern Irish' },
  { id: 134, name: 'Norwegian' },
  { id: 135, name: 'Omani' },
  { id: 136, name: 'Pakistani' },
  { id: 137, name: 'Palauan' },
  { id: 138, name: 'Panamanian' },
  { id: 139, name: 'Papua New Guinean' },
  { id: 140, name: 'Paraguayan' },
  { id: 141, name: 'Peruvian' },
  { id: 142, name: 'Polish' },
  { id: 143, name: 'Portuguese' },
  { id: 144, name: 'Qatari' },
  { id: 145, name: 'Romanian' },
  { id: 146, name: 'Russian' },
  { id: 147, name: 'Rwandan' },
  { id: 148, name: 'Saint Lucian' },
  { id: 149, name: 'Salvadoran' },
  { id: 150, name: 'Samoan' },
  { id: 151, name: 'San Marinese' },
  { id: 152, name: 'Sao Tomean' },
  { id: 153, name: 'Saudi' },
  { id: 154, name: 'Scottish' },
  { id: 155, name: 'Senegalese' },
  { id: 156, name: 'Serbian' },
  { id: 157, name: 'Seychellois' },
  { id: 158, name: 'Sierra Leonean' },
  { id: 159, name: 'Singaporean' },
  { id: 160, name: 'Slovakian' },
  { id: 161, name: 'Slovenian' },
  { id: 162, name: 'Solomon Islander' },
  { id: 163, name: 'Somali' },
  { id: 164, name: 'South African' },
  { id: 165, name: 'South Korean' },
  { id: 166, name: 'Spanish' },
  { id: 167, name: 'Sri Lankan' },
  { id: 168, name: 'Sudanese' },
  { id: 169, name: 'Surinamer' },
  { id: 170, name: 'Swazi' },
  { id: 171, name: 'Swedish' },
  { id: 172, name: 'Swiss' },
  { id: 173, name: 'Syrian' },
  { id: 174, name: 'Taiwanese' },
  { id: 175, name: 'Tajik' },
  { id: 176, name: 'Tanzanian' },
  { id: 177, name: 'Thai' },
  { id: 178, name: 'Togolese' },
  { id: 179, name: 'Tongan' },
  { id: 180, name: 'Trinidadian or Tobagonian' },
  { id: 181, name: 'Tunisian' },
  { id: 182, name: 'Turkish' },
  { id: 183, name: 'Tuvaluan' },
  { id: 184, name: 'Ugandan' },
  { id: 185, name: 'Ukrainian' },
  { id: 186, name: 'Uruguayan' },
  { id: 187, name: 'Uzbekistani' },
  { id: 188, name: 'Venezuelan' },
  { id: 189, name: 'Vietnamese' },
  { id: 190, name: 'Welsh' },
  { id: 191, name: 'Yemenite' },
  { id: 192, name: 'Zambian' },
  { id: 193, name: 'Zimbabwean' },
];

const Nationalities: React.FC = () => {
  const [nationalities, setNationalities] = useState<Nationality[]>(initialNationalities);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNationality, setEditingNationality] = useState<Nationality | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(nationalities.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(nid => nid !== id));
    }
  };

  const handleAdd = () => {
    setEditingNationality(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const handleEdit = (nationality: Nationality) => {
    setEditingNationality(nationality);
    setFormData({ name: nationality.name });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this nationality?')) {
      setNationalities(nationalities.filter(n => n.id !== id));
      setSelectedIds(selectedIds.filter(nid => nid !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a nationality name');
      return;
    }

    if (editingNationality) {
      setNationalities(nationalities.map(n =>
        n.id === editingNationality.id ? { ...n, name: formData.name } : n
      ));
    } else {
      const newNationality: Nationality = {
        id: Math.max(...nationalities.map(n => n.id), 0) + 1,
        name: formData.name,
      };
      setNationalities([...nationalities, newNationality]);
    }
    setShowModal(false);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      alert('Please select nationalities to delete');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} nationality(ies)?`)) {
      setNationalities(nationalities.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
    }
  };

  return (
    <ProtectedRoute requiredPermission="view_employees">
      <AdminLayout title="Nationalities" breadcrumbs={['Admin', 'Nationalities']}>
        <div style={{
          backgroundColor: COLORS.white,
          padding: '24px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {/* Header with Add Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button
              onClick={handleAdd}
              style={{
                padding: '10px 24px',
                backgroundColor: COLORS.success,
                color: COLORS.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
              }}
            >
              + Add
            </button>
          </div>

          {/* Delete Selected Button */}
          {selectedIds.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={handleDeleteSelected}
                style={{
                  padding: '8px 16px',
                  backgroundColor: COLORS.danger,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                }}
              >
                Delete Selected ({selectedIds.length})
              </button>
            </div>
          )}

          {/* Records Count */}
          <div style={{ marginBottom: '16px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
            ({nationalities.length}) Records Found
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.lightBg }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}` }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === nationalities.length && nationalities.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}`, fontFamily: TYPOGRAPHY.fontFamily }}>
                  Nationality
                </th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: `2px solid ${COLORS.border}`, fontFamily: TYPOGRAPHY.fontFamily }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {nationalities.map((nationality) => (
                <tr key={nationality.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(nationality.id)}
                      onChange={(e) => handleSelect(nationality.id, e.target.checked)}
                    />
                  </td>
                  <td style={{ padding: '12px', fontFamily: TYPOGRAPHY.fontFamily }}>
                    {nationality.name}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(nationality.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        marginRight: '8px',
                        color: COLORS.danger,
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => handleEdit(nationality)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#4a90e2',
                      }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
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
              padding: '32px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}>
              <h2 style={{
                marginTop: 0,
                marginBottom: '24px',
                color: COLORS.primary,
                fontFamily: TYPOGRAPHY.fontFamily,
              }}>
                {editingNationality ? 'Edit Nationality' : 'Add Nationality'}
              </h2>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  color: COLORS.text,
                  fontWeight: 500,
                }}>
                  Nationality Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Enter nationality name"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: 'transparent',
                    color: COLORS.text,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: COLORS.primary,
                    color: COLORS.white,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontWeight: 500,
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Nationalities;
