import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { KeyIcon } from './icons';

export default function ApiKeyModal() {
  const { setApiKey, setShowApiModal } = useStore();
  const [value, setValue] = useState('');

  function handleSave() {
    if (!value.trim()) return;
    setApiKey(value.trim());
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        padding: 32,
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(124,58,237,0.2)',
            border: '1px solid rgba(124,58,237,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#a78bfa',
          }}>
            <KeyIcon />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Nhập Gemini API Key</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Cần thiết để kích hoạt tính năng AI</p>
          </div>
        </div>

        <input
          id="api-key-input"
          type="password"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="AIza..."
          autoFocus
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--text)',
            fontSize: 14,
            fontFamily: 'inherit',
            marginBottom: 12,
            outline: 'none',
          }}
        />

        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.6 }}>
          Lấy miễn phí tại{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
            style={{ color: '#a78bfa' }}>
            Google AI Studio
          </a>
          . Key chỉ lưu trong session, không gửi đến server của chúng tôi.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowApiModal(false)}
            style={{
              flex: 1, padding: '11px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
            }}
          >
            Bỏ qua
          </button>
          <button
            id="save-api-key-btn"
            onClick={handleSave}
            disabled={!value.trim()}
            style={{
              flex: 2, padding: '11px', borderRadius: 10,
              border: 'none',
              background: value.trim() ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' : 'rgba(124,58,237,0.3)',
              color: '#fff', fontWeight: 700, cursor: value.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', fontSize: 14,
            }}
          >
            Lưu & Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}
