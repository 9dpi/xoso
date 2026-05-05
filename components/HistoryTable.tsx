import React from 'react';
import { useStore } from '../hooks/useStore';
import { REGIONS } from '../constants';

export default function HistoryTable() {
  const { getDrawsForRegion, region } = useStore();
  const draws = getDrawsForRegion().slice(0, 10);
  const cfg = REGIONS[region];

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>
        📅 10 Kỳ Gần Nhất – {cfg.name}
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600 }}>Ngày</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600 }}>Tỉnh</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600 }}>ĐB</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600 }}>Đề</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600 }}>Lô ra ({cfg.loPerDraw})</th>
            </tr>
          </thead>
          <tbody>
            {draws.map((d, i) => (
              <tr
                key={d.id}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                }}
              >
                <td style={{ padding: '6px 8px', color: 'var(--muted)' }}>{d.date}</td>
                <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>{d.province}</td>
                <td style={{ padding: '6px 8px', fontWeight: 700, color: cfg.color }}>{d.specialPrize}</td>
                <td style={{ padding: '6px 8px' }}>
                  <span style={{
                    display: 'inline-block',
                    background: `${cfg.color}22`,
                    border: `1px solid ${cfg.color}44`,
                    borderRadius: 6,
                    padding: '1px 8px',
                    fontWeight: 700,
                    color: cfg.color,
                  }}>
                    {d.deNum}
                  </span>
                </td>
                <td style={{ padding: '6px 8px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {d.loNums.slice(0, 18).map((n, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(255,255,255,0.07)',
                        }}
                      >
                        {n}
                      </span>
                    ))}
                    {d.loNums.length > 18 && (
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>+{d.loNums.length - 18}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
