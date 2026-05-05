import React from 'react';
import { useStore } from '../hooks/useStore';
import { REGIONS } from '../constants';

interface Props {
  selectedNumber: string | null;
  onClose: () => void;
}

export default function NumberInspector({ selectedNumber, onClose }: Props) {
  const { getDrawsForRegion, region } = useStore();
  const cfg = REGIONS[region];

  if (!selectedNumber) return null;

  const draws = getDrawsForRegion();
  const appearances = draws
    .map((d, i) => ({ draw: d, index: i }))
    .filter(({ draw }) => draw.loNums.includes(selectedNumber));

  const total = appearances.length;
  const lastSeen = appearances[0]?.index ?? -1;
  const rate = draws.length > 0 ? ((total / draws.length) * 100).toFixed(1) : '0';

  // Most common co-appearing numbers
  const coFreq = new Map<string, number>();
  appearances.forEach(({ draw }) => {
    draw.loNums.forEach(n => {
      if (n !== selectedNumber) coFreq.set(n, (coFreq.get(n) ?? 0) + 1);
    });
  });
  const topPartners = [...coFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--surface)',
          border: `1px solid ${cfg.color}44`,
          borderRadius: 18,
          padding: 28,
          maxWidth: 400,
          width: '100%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: '#fff',
              boxShadow: `0 4px 16px ${cfg.color}44`,
            }}>
              {selectedNumber}
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Lô {selectedNumber}</h3>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{cfg.name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Số lần về', value: total.toString() },
            { label: 'Tỷ lệ', value: `${rate}%` },
            { label: 'Cách đây', value: lastSeen < 0 ? 'Chưa về' : `${lastSeen} kỳ` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 10, padding: '10px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: cfg.color }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        <div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Top 5 số hay đi cùng:</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {topPartners.length > 0 ? topPartners.map(([n, cnt]) => (
              <div key={n} style={{
                background: 'rgba(255,255,255,0.07)',
                borderRadius: 8, padding: '4px 10px',
                fontSize: 13, fontWeight: 700,
              }}>
                {n} <span style={{ fontSize: 10, color: 'var(--muted)' }}>({cnt}x)</span>
              </div>
            )) : <span style={{ fontSize: 12, color: 'var(--muted)' }}>Chưa đủ dữ liệu</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
