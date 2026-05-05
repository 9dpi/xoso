import React, { useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { REGIONS } from '../constants';
import { DrawResult } from '../types';

interface Props {
  onNumberClick: (n: string) => void;
  highlightedNums?: string[];
}

function computeFreq(draws: DrawResult[]): Map<string, number> {
  const map = new Map<string, number>();
  draws.forEach(d => d.loNums.forEach(n => map.set(n, (map.get(n) ?? 0) + 1)));
  return map;
}

export default function LoHeatmap({ onNumberClick, highlightedNums = [] }: Props) {
  const { getDrawsForRegion, region } = useStore();
  const draws = getDrawsForRegion();
  const cfg = REGIONS[region];

  const freq = useMemo(() => computeFreq(draws), [draws]);
  const maxFreq = useMemo(() => Math.max(...Array.from(freq.values()), 1), [freq]);

  function getColor(n: string): string {
    const count = freq.get(n) ?? 0;
    const ratio = count / maxFreq;
    if (ratio === 0) return 'rgba(30,33,53,0.8)';
    if (ratio < 0.2) return 'rgba(59,130,246,0.3)';
    if (ratio < 0.4) return 'rgba(59,130,246,0.55)';
    if (ratio < 0.6) return 'rgba(168,85,247,0.55)';
    if (ratio < 0.8) return 'rgba(249,115,22,0.65)';
    return 'rgba(239,68,68,0.80)';
  }

  function getTextColor(n: string): string {
    const count = freq.get(n) ?? 0;
    const ratio = count / maxFreq;
    return ratio > 0.5 ? '#fff' : 'var(--text)';
  }

  const cells = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
          🗺️ Heatmap Lô 00–99
        </h2>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {draws.length} kỳ phân tích · {cfg.loPerDraw} lô/kỳ
        </span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { color: 'rgba(30,33,53,0.8)', label: 'Chưa về' },
          { color: 'rgba(59,130,246,0.4)', label: 'Lạnh' },
          { color: 'rgba(168,85,247,0.55)', label: 'Trung bình' },
          { color: 'rgba(249,115,22,0.65)', label: 'Nóng' },
          { color: 'rgba(239,68,68,0.80)', label: 'Rất nóng' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color, border: '1px solid rgba(255,255,255,0.15)' }} />
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Row labels (tens digit) */}
      <div style={{ display: 'grid', gridTemplateColumns: '20px repeat(10, 1fr)', gap: 3 }}>
        <div />
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted)', paddingBottom: 2 }}>
            {i}
          </div>
        ))}

        {Array.from({ length: 10 }, (_, row) => (
          <React.Fragment key={row}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--muted)' }}>
              {row}x
            </div>
            {Array.from({ length: 10 }, (_, col) => {
              const n = cells[row * 10 + col];
              const count = freq.get(n) ?? 0;
              const isHighlighted = highlightedNums.includes(n);
              return (
                <button
                  key={n}
                  id={`lo-cell-${n}`}
                  onClick={() => onNumberClick(n)}
                  title={`Lô ${n}: ${count} lần`}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 6,
                    border: isHighlighted
                      ? `2px solid ${cfg.color}`
                      : '1px solid rgba(255,255,255,0.08)',
                    background: getColor(n),
                    color: getTextColor(n),
                    fontSize: 11,
                    fontWeight: isHighlighted ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    boxShadow: isHighlighted ? `0 0 10px ${cfg.color}88` : 'none',
                    transform: isHighlighted ? 'scale(1.15)' : 'scale(1)',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = isHighlighted ? 'scale(1.15)' : 'scale(1)')}
                >
                  {n}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
