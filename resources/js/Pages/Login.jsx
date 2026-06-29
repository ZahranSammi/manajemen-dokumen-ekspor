import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const [focusedField, setFocusedField] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <div style={styles.container}>
      <Head title="Masuk - Sistem Manajemen Dokumen Impor" />
      
      {/* Background Gradient Orbs for Visual Premium Look */}
      <div style={styles.orb1}></div>
      <div style={styles.orb2}></div>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>IM</div>
          <h2 style={styles.title}>Manajemen Dokumen Impor</h2>
          <p style={styles.subtitle}>Masukkan kredensial untuk masuk ke dasbor Anda</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Alamat Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              style={{
                ...styles.input,
                ...(focusedField === 'email' ? styles.inputFocus : {}),
                ...(errors.email ? styles.inputError : {})
              }}
              placeholder="nama@perusahaan.com"
              required
            />
            {errors.email && <div style={styles.errorText}>{errors.email}</div>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Kata Sandi</label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              style={{
                ...styles.input,
                ...(focusedField === 'password' ? styles.inputFocus : {}),
                ...(errors.password ? styles.inputError : {})
              }}
              placeholder="••••••••"
              required
            />
            {errors.password && <div style={styles.errorText}>{errors.password}</div>}
          </div>

          <div style={styles.rememberRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
                style={styles.checkbox}
              />
              Ingat saya
            </label>
          </div>

          <button
            type="submit"
            disabled={processing}
            style={{
              ...styles.button,
              ...(processing ? styles.buttonDisabled : {})
            }}
          >
            {processing ? 'Menghubungkan...' : 'Masuk Aplikasi'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Kredensial Bawaan:</p>
          <div style={styles.credsList}>
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

// Inline Glassmorphic and Premium Styles
const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0a0f1d',
    fontFamily: "'Instrument Sans', sans-serif",
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
    top: '-10%',
    left: '-10%',
    filter: 'blur(40px)',
  },
  orb2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(0,0,0,0) 70%)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    color: '#f3f4f6',
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
    color: '#ffffff',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#9ca3af',
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
    color: '#d1d5db',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.25)',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
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
    color: '#9ca3af',
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
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginBottom: '0.5rem',
    fontWeight: '600',
  },
  credsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontSize: '0.7rem',
    color: '#9ca3af',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: '0.75rem',
    borderRadius: '8px',
  }
};
