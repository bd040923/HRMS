import React from 'react';
import { useNavigate } from 'react-router-dom';

const Expenses: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#faf3ff', minHeight: 'calc(100vh - 80px)' }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          padding: '8px 16px',
          backgroundColor: '#666666',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: "'Segoe UI', Arial, sans-serif",
          fontWeight: 500,
          marginBottom: '20px'
        }}
      >
        ← Back to Dashboard
      </button>
      
      <h1 style={{ color: '#78176b', fontSize: '2rem', fontFamily: "'Segoe UI', Arial, sans-serif", fontWeight: 500, marginBottom: '24px', marginTop: 0 }}>
        Expense Management
      </h1>
      
      <div style={{
        backgroundColor: '#fffafe',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <p style={{ fontSize: '16px', fontFamily: "'Segoe UI', Arial, sans-serif", color: '#333' }}>
          Expense management features coming soon...
        </p>
      </div>
    </div>
  );
};

export default Expenses;

