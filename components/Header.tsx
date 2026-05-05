import React from 'react';
import RegionSelector from './RegionSelector';
import { useStore } from '../hooks/useStore';
import { REGIONS } from '../constants';
import { KeyIcon } from './icons';

export default function Header() {
  const { region, setShowApiModal, setShowDataModal } = useStore();
  const cfg = REGIONS[region];

  return (
    <header style={{
      background: 'rgba(22,24,39,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: '12px 24px',
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontSize: 26,
          filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.5))',
        }}>🎰</div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>
            <span style={{ color: cfg.color }}>Xổ Số</span>{' '}
            <span style={{ background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Predictor
            </span>
          </h1>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
            Phân tích lô đề thông minh · {cfg.drawSchedule}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <RegionSelector />
        <button
          id="open-data-mgmt-btn"
          onClick={() => setShowDataModal(true)}
          title="Quản lý dữ liệu"
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--muted)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          📋 Dữ liệu
        </button>
        <button
          id="open-api-key-btn"
          onClick={() => setShowApiModal(true)}
          title="Cài Gemini API Key"
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--muted)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          <KeyIcon /> API Key
        </button>
      </div>
    </header>
  );
}
