import React, { useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { REGIONS } from '../constants';
import { DrawResult } from '../types';
import { FireIcon, SnowIcon } from './icons';

function getTopFrequencies(draws: DrawResult[], top: number, order: 'asc' | 'desc') {
  const map = new Map<string, number>();
  draws.forEach(d => d.loNums.forEach(n => map.set(n, (map.get(n) ?? 0) + 1)));
  return [...map.entries()]
    .sort((a, b) => order === 'desc' ? b[1] - a[1] : a[1] - b[1])
    .slice(0, top);
}

export default function FrequencyChart() {
  const { getDrawsForRegion, region } = useStore();
  const draws = getDrawsForRegion();
  const cfg = REGIONS[region];

  const hot = useMemo(() => getTopFrequencies(draws, 10, 'desc'), [draws]);
  const cold = useMemo(() => getTopFrequencies(draws, 10, 'asc'), [draws]);
  const maxCount = hot[0]?.[1] ?? 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hot */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <FireIcon />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Top 10 Lô Nóng</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {hot.map(([n, count]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 24, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>{n}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(count / maxCount) * 100}%`,
                  background: `linear-gradient(90deg, #ef4444, #f97316)`,
                  borderRadius: 4,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', width: 32, textAlign: 'right' }}>{count}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cold */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <SnowIcon />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>Top 10 Lô Lạnh</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {cold.map(([n, count]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 24, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>{n}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(count / maxCount) * 100}%`,
                  background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
                  borderRadius: 4,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', width: 32, textAlign: 'right' }}>{count}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
