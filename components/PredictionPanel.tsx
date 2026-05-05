import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { AI_STRATEGIES, REGIONS } from '../constants';
import { AIStrategy, PredictionRecord } from '../types';
import { getPrediction } from '../services/geminiService';
import { SparklesIcon, LoadingSpinner } from './icons';
import toast from 'react-hot-toast';

export default function PredictionPanel() {
  const {
    region, strategy, setStrategy, getDrawsForRegion,
    addPrediction, setShowApiModal, setIsLoadingAI, isLoadingAI,
  } = useStore();

  const [lastPrediction, setLastPrediction] = useState<PredictionRecord | null>(null);
  const cfg = REGIONS[region];

  async function handleGenerate() {
    const apiKey = sessionStorage.getItem('geminiApiKey');
    if (!apiKey) { setShowApiModal(true); return; }

    const draws = getDrawsForRegion();
    if (draws.length < 5) {
      toast.error('Cần ít nhất 5 kỳ dữ liệu để phân tích');
      return;
    }

    setIsLoadingAI(true);
    try {
      const result = await getPrediction(region, draws, strategy);
      const record: PredictionRecord = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        region,
        predictedLo: result.predictedLo,
        strategy,
        reasoning: result.reasoning,
      };
      addPrediction(record);
      setLastPrediction(record);
      toast.success('Dự đoán thành công!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === 'NO_API_KEY') setShowApiModal(true);
      else toast.error(`Lỗi AI: ${msg}`);
    } finally {
      setIsLoadingAI(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <SparklesIcon />
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>AI Dự Đoán</h2>
      </div>

      {/* Strategy selector */}
      <div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Chiến lược phân tích:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(Object.keys(AI_STRATEGIES) as AIStrategy[]).map((s) => {
            const st = AI_STRATEGIES[s];
            const active = strategy === s;
            return (
              <button
                key={s}
                id={`strategy-${s}`}
                onClick={() => setStrategy(s)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: active ? `2px solid ${cfg.color}` : '2px solid transparent',
                  background: active ? `${cfg.color}18` : 'rgba(255,255,255,0.04)',
                  color: active ? cfg.color : 'var(--muted)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>{st.name}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{st.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate button */}
      <button
        id="generate-prediction-btn"
        onClick={handleGenerate}
        disabled={isLoadingAI}
        style={{
          padding: '14px',
          borderRadius: 12,
          border: 'none',
          background: isLoadingAI
            ? 'rgba(124,58,237,0.4)'
            : `linear-gradient(135deg, #7c3aed, #a78bfa)`,
          color: '#fff',
          fontWeight: 700,
          fontSize: 15,
          cursor: isLoadingAI ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.2s',
          fontFamily: 'inherit',
        }}
      >
        {isLoadingAI ? <><LoadingSpinner /> Đang phân tích...</> : <><SparklesIcon /> Dự Đoán Lô Đề</>}
      </button>

      {/* Result */}
      {lastPrediction && (
        <div style={{
          background: 'rgba(124,58,237,0.12)',
          border: '1px solid rgba(124,58,237,0.35)',
          borderRadius: 14,
          padding: 16,
        }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
            🎯 Lô gợi ý (kỳ tiếp theo):
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {lastPrediction.predictedLo.map(n => (
              <div
                key={n}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}88)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                  color: '#fff',
                  boxShadow: `0 4px 12px ${cfg.color}44`,
                }}
              >
                {n}
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            color: 'var(--text)',
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}>
            💡 {lastPrediction.reasoning}
          </div>
        </div>
      )}
    </div>
  );
}
