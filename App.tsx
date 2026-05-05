import React, { useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import LoHeatmap from './components/LoHeatmap';
import PredictionPanel from './components/PredictionPanel';
import FrequencyChart from './components/FrequencyChart';
import HistoryTable from './components/HistoryTable';
import ApiKeyModal from './components/ApiKeyModal';
import NumberInspector from './components/NumberInspector';
import DataManagement from './components/DataManagement';
import { useStore } from './hooks/useStore';
import { REGIONS } from './constants';

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 20,
};

export default function App() {
  const { showApiModal, showDataModal, setShowDataModal, getDrawsForRegion, region, predictions } = useStore();
  const [inspectedNumber, setInspectedNumber] = useState<string | null>(null);
  const cfg = REGIONS[region];

  const draws = getDrawsForRegion();

  // Quick stats
  const stats = useMemo(() => {
    const freq = new Map<string, number>();
    draws.forEach(d => d.loNums.forEach(n => freq.set(n, (freq.get(n) ?? 0) + 1)));
    const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
    const hottest = sorted[0]?.[0] ?? '--';
    const coldest = sorted[sorted.length - 1]?.[0] ?? '--';
    const deFreq = new Map<string, number>();
    draws.forEach(d => deFreq.set(d.deNum, (deFreq.get(d.deNum) ?? 0) + 1));
    const hotDe = [...deFreq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '--';
    return { hottest, coldest, hotDe };
  }, [draws]);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease; }
      `}</style>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontFamily: 'Be Vietnam Pro, sans-serif',
            fontSize: 13,
          },
        }}
      />

      {showApiModal && <ApiKeyModal />}
      {showDataModal && <DataManagement onClose={() => setShowDataModal(false)} />}
      {inspectedNumber && (
        <NumberInspector
          selectedNumber={inspectedNumber}
          onClose={() => setInspectedNumber(null)}
        />
      )}

      <Header />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 20px 40px' }}>
        {/* Stats bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}>
          {[
            { label: 'Kỳ đã phân tích', value: draws.length, color: '#a78bfa', icon: '📊' },
            { label: 'Lô nóng nhất', value: stats.hottest, color: '#ef4444', icon: '🔥' },
            { label: 'Lô lạnh nhất', value: stats.coldest, color: '#3b82f6', icon: '❄️' },
            { label: 'Đề nóng', value: stats.hotDe, color: '#22c55e', icon: '🎯' },
            { label: 'AI dự đoán', value: predictions.filter(p => p.region === region).length, color: '#f59e0b', icon: '🤖' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={{ ...cardStyle, textAlign: 'center', padding: '14px 12px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Main 3-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 280px',
          gap: 16,
          alignItems: 'start',
        }}>
          {/* Left: Frequency chart */}
          <div style={cardStyle}>
            <FrequencyChart />
          </div>

          {/* Center: Heatmap */}
          <div style={{ ...cardStyle, minWidth: 0 }}>
            <LoHeatmap
              onNumberClick={(n) => setInspectedNumber(n)}
              highlightedNums={
                predictions.find(p => p.region === region)?.predictedLo ?? []
              }
            />
          </div>

          {/* Right: AI Prediction */}
          <div style={cardStyle}>
            <PredictionPanel />
          </div>
        </div>

        {/* History table */}
        <div style={{ ...cardStyle, marginTop: 16 }}>
          <HistoryTable />
        </div>

        {/* Prediction history */}
        {predictions.filter(p => p.region === region).length > 0 && (
          <div style={{ ...cardStyle, marginTop: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              🤖 Lịch Sử Dự Đoán AI – {cfg.name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {predictions.filter(p => p.region === region).slice(0, 5).map(p => (
                <div key={p.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 80 }}>
                    {new Date(p.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {p.predictedLo.map(n => (
                      <span key={n} style={{
                        padding: '2px 10px', borderRadius: 20,
                        background: `${cfg.color}22`,
                        border: `1px solid ${cfg.color}44`,
                        fontWeight: 700, fontSize: 13, color: cfg.color,
                      }}>{n}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)', flex: 1 }}>
                    {p.reasoning.slice(0, 80)}{p.reasoning.length > 80 ? '…' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
