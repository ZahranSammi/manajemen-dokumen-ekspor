import React from 'react';

export default function Welcome() {
  return (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontFamily: 'Instrument Sans, sans-serif',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        padding: '2rem',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#111827', marginBottom: '0.5rem' }}>Sistem Manajemen Dokumen Impor</h1>
        <p style={{ color: '#4b5563' }}>React + Inertia.js berhasil terkonfigurasi dengan Laravel 13!</p>
      </div>
    </div>
  );
}
