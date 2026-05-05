import React from 'react';
import { useStore } from '../hooks/useStore';
import { REGIONS } from '../constants';
import { Region } from '../types';

const regions: Region[] = ['XSMB', 'XSMT', 'XSMN'];

export default function RegionSelector() {
  const { region, setRegion } = useStore();

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {regions.map((r) => {
        const cfg = REGIONS[r];
        const active = region === r;
        return (
          <button
            key={r}
            id={`region-btn-${r}`}
            onClick={() => setRegion(r)}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              border: active ? `2px solid ${cfg.color}` : '2px solid transparent',
              background: active
                ? `${cfg.color}22`
                : 'rgba(255,255,255,0.05)',
              color: active ? cfg.color : 'var(--muted)',
              fontWeight: active ? 700 : 500,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            {cfg.shortName}
          </button>
        );
      })}
    </div>
  );
}
