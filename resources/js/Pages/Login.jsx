import React, { useState, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const [focusedField, setFocusedField] = useState('');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/login');
  };

  const isDark = theme === 'dark';

  // Dynamic Styles
  const currentStyles = {
    container: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: isDark ? '#0a0f1d' : '#f3f4f6',
      fontFamily: "'Instrument Sans', sans-serif",
      overflow: 'hidden',
      transition: 'background-color 0.2s ease',
    },
    orb1: {
      position: 'absolute',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: isDark 
        ? 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)'
        : 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(0,0,0,0) 70%)',
      top: '-10%',
      left: '-10%',
      filter: 'blur(40px)',
    },
    orb2: {
      position: 'absolute',
      width: '500px',
      height: '500px',
      borderRadius: '50%',
      background: isDark 
        ? 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(0,0,0,0) 70%)'
        : 'radial-gradient(circle, rgba(236, 72, 153, 0.05) 0%, rgba(0,0,0,0) 70%)',
      bottom: '-10%',
      right: '-10%',
      filter: 'blur(50px)',
    },
    card: {
      position: 'relative',
      zIndex: 10,
      width: '100%',
      maxWidth: '460px',
      padding: '2.5rem',
      borderRadius: '24px',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(16px)',
      boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.05)',
      color: isDark ? '#f3f4f6' : '#1f2937',
      transition: 'all 0.2s ease',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    logoBadge: {
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '54px',
      height: '54px',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      color: '#ffffff',
      fontWeight: '700',
      fontSize: '1.25rem',
      marginBottom: '1rem',
      boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#111827',
      margin: '0 0 0.5rem 0',
    },
    subtitle: {
      fontSize: '0.875rem',
      color: isDark ? '#9ca3af' : '#6b7280',
      margin: 0,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: isDark ? '#d1d5db' : '#374151',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.15)',
      color: isDark ? '#ffffff' : '#111827',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
    },
    inputFocus: {
      borderColor: '#6366f1',
      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.05)' : '#ffffff',
      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.25)',
    },
    inputError: {
      borderColor: '#ef4444',
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.02)',
    },
    errorText: {
      fontSize: '0.8rem',
      color: '#ef4444',
      marginTop: '0.25rem',
    },
    rememberRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.875rem',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: isDark ? '#9ca3af' : '#4b5563',
      cursor: 'pointer',
    },
    checkbox: {
      accentColor: '#6366f1',
      cursor: 'pointer',
    },
    button: {
      width: '100%',
      padding: '0.875rem',
      borderRadius: '12px',
      border: 'none',
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      color: '#ffffff',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
      marginTop: '0.5rem',
    },
    buttonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    footer: {
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
    },
    footerText: {
      fontSize: '0.75rem',
      color: isDark ? '#9ca3af' : '#4b5563',
      marginBottom: '0.5rem',
      fontWeight: '600',
    },
    credsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem',
      fontSize: '0.7rem',
      color: isDark ? '#9ca3af' : '#4b5563',
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
      padding: '0.75rem',
      borderRadius: '8px',
      border: isDark ? 'none' : '1px solid rgba(0, 0, 0, 0.05)',
    }
  };

  return (
    <div style={currentStyles.container}>
      <Head title="Masuk - Sistem Manajemen Dokumen Impor" />
      
      {/* Background Gradient Orbs */}
      <div style={currentStyles.orb1}></div>
      <div style={currentStyles.orb2}></div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '10px',
          borderRadius: '50%',
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          color: isDark ? '#ffffff' : '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        title={isDark ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
      >
        {isDark ? (
          <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728A9 9 0 115.636 5.636m12.728 12.728A9 9 0 015.636 5.636" /></svg>
        ) : (
          <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      <div style={currentStyles.card}>
        <div style={currentStyles.header}>
          <div style={currentStyles.logoBadge}>IM</div>
          <h2 style={currentStyles.title}>Manajemen Dokumen Impor</h2>
          <p style={currentStyles.subtitle}>Masukkan kredensial untuk masuk ke dasbor Anda</p>
        </div>

        <form onSubmit={handleSubmit} style={currentStyles.form}>
          <div style={currentStyles.formGroup}>
            <label style={currentStyles.label}>Alamat Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              style={{
                ...currentStyles.input,
                ...(focusedField === 'email' ? currentStyles.inputFocus : {}),
                ...(errors.email ? currentStyles.inputError : {})
              }}
              placeholder="nama@perusahaan.com"
              required
            />
            {errors.email && <div style={currentStyles.errorText}>{errors.email}</div>}
          </div>

          <div style={currentStyles.formGroup}>
            <label style={currentStyles.label}>Kata Sandi</label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              style={{
                ...currentStyles.input,
                ...(focusedField === 'password' ? currentStyles.inputFocus : {}),
                ...(errors.password ? currentStyles.inputError : {})
              }}
              placeholder="••••••••"
              required
            />
            {errors.password && <div style={currentStyles.errorText}>{errors.password}</div>}
          </div>

          <div style={currentStyles.rememberRow}>
            <label style={currentStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
                style={currentStyles.checkbox}
              />
              Ingat saya
            </label>
          </div>

          <button
            type="submit"
            disabled={processing}
            style={{
              ...currentStyles.button,
              ...(processing ? currentStyles.buttonDisabled : {})
            }}
          >
            {processing ? 'Menghubungkan...' : 'Masuk Aplikasi'}
          </button>
        </form>

        <div style={currentStyles.footer}>
          <p style={currentStyles.footerText}>Kredensial Bawaan:</p>
          <div style={currentStyles.credsList}>
            <div><code>supplier@example.com</code> / <code>password123</code> (Supplier)</div>
            <div><code>staff@example.com</code> / <code>password123</code> (Staff)</div>
            <div><code>manager@example.com</code> / <code>password123</code> (Manager)</div>
            <div><code>admin@example.com</code> / <code>password123</code> (Admin)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
