import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { clearAuth } from '../api';

export default function DemoBar({ currentUser }) {
  if (!currentUser) return null;

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '8px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.8rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: 700, letterSpacing: '0.03em' }}>
        <Shield size={16} />
        <span style={{ color: '#f8fafc' }}>LoanFlow CRM Production Workspace</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#64748b' }}>Logged in as:</span>
          <strong style={{ color: '#f8fafc' }}>{currentUser.name}</strong>
          <span className={`badge ${currentUser.role === 'ADMIN' ? 'badge-primary' : (currentUser.role === 'ASM' ? 'badge-warning' : 'badge-success')}`}>
            {currentUser.role}
          </span>
          {currentUser.employee_id && (
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({currentUser.employee_id})</span>
          )}
        </div>
        <button
          onClick={() => {
            clearAuth();
            window.location.reload();
          }}
          title="Log out"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
