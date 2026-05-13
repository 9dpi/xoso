import React, { useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { REGIONS, AI_STRATEGIES } from '../constants';
import { AIStrategy } from '../types';
import {
  buildLearningStats, autoVerifyAll,
  StrategyPerformance, LearningStats,
} from '../services/learningContext';
import toast from 'react-hot-toast';

interface Props { onClose: () => void }

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreBar({ value, max = 0.3 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= 0.2 ? '#22c55e' : value >= 0.12 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', height: 6, flex: 1 }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 4,
        background: color, transition: 'width 0.5s ease',
      }} />
    </div>
  );
}

function MultiplierBadge({ value }: { value: number }) {
  const color = value >= 1.2 ? '#22c55e' : value >= 0.8 ? '#f59e0b' : '#ef4444';
  const label = value >= 1.2 ? '▲' : value < 0.8 ? '▼' : '—';
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800,
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>
      {label} ×{value.toFixed(2)}
    </span>
  );
}

function StrategyCard({ perf, multiplier, regionColor, isBest }: {
  perf: StrategyPerformance;
  multiplier: number;
  regionColor: string;
  isBest: boolean;
}) {
  const strat = AI_STRATEGIES[perf.strategy];
  return (
    <div style={{
      background: isBest ? `${regionColor}10` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isBest ? regionColor + '40' : 'var(--border)'}`,
      borderRadius: 12, padding: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: 13, color: isBest ? regionColor : 'var(--text)' }}>
            {isBest ? '🏆 ' : ''}{strat.name}
          </span>
          {perf.totalVerified < 3 && (
            <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 6 }}>
              (chưa đủ dữ liệu)
            </span>
          )}
        </div>
        <MultiplierBadge value={multiplier} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10, fontSize: 11 }}>
        {[
          { label: 'Đã verify', value: perf.totalVerified.toString() },
          { label: 'Lô đúng TB', value: perf.totalVerified > 0 ? `${perf.avgLoHits.toFixed(1)}/3` : '--' },
          { label: 'Hit Rate Đề', value: perf.totalVerified > 0 ? `${(perf.deHitRate * 100).toFixed(0)}%` : '--' },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 4px' }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{value}</div>
            <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          Score: {(perf.learningScore * 100).toFixed(1)}%
        </span>
        <ScoreBar value={perf.learningScore} />
      </div>
    </div>
  );
}

// ── Verified history list ─────────────────────────────────────────────────────

function VerifiedList({ stats }: { stats: LearningStats; regionColor: string }) {
  const { predictions, region } = useStore();
  const regionPreds = predictions
    .filter(p => p.region === region && p.verified)
    .slice(0, 10);

  if (regionPreds.length === 0) return null;

  return (
    <div style={{ marginTop: 4 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>
        📜 Lịch sử verify ({regionPreds.length} gần nhất)
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {regionPreds.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,0.03)', fontSize: 11,
          }}>
            <span style={{ color: 'var(--muted)', minWidth: 80 }}>{p.targetDate ?? '?'}</span>
            <span style={{ color: 'var(--muted)', minWidth: 55, fontSize: 10 }}>
              {AI_STRATEGIES[p.strategy]?.name ?? p.strategy}
            </span>
            <span style={{
              fontWeight: 800, minWidth: 32, textAlign: 'center',
              color: (p.loHits ?? 0) >= 2 ? '#22c55e' : (p.loHits ?? 0) >= 1 ? '#f59e0b' : '#ef4444',
            }}>
              {p.loHits ?? 0}/3
            </span>
            {p.deHit && <span style={{ color: '#22c55e' }}>✅Đề</span>}
            <div style={{ flex: 1, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {p.predictedLo.map(n => (
                <span key={n} style={{
                  padding: '1px 5px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                  background: p.actualLo?.includes(n) ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.06)',
                  color: p.actualLo?.includes(n) ? '#22c55e' : 'var(--muted)',
                }}>{n}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function LearningPanel({ onClose }: Props) {
  const { region, predictions, getDrawsForRegion, updatePredictions } = useStore() as any;
  const cfg = REGIONS[region];
  const draws = getDrawsForRegion();

  const stats: LearningStats = useMemo(
    () => buildLearningStats(predictions, region),
    [predictions, region]
  );

  function handleAutoVerify() {
    const updated = autoVerifyAll(predictions, draws);
    const newlyVerified = updated.filter(
      (p, i) => p.verified && !predictions[i]?.verified
    ).length;

    if (newlyVerified === 0) {
      toast('Không có dự đoán mới nào để verify (cần có kết quả thật trong data)', { icon: 'ℹ️' });
      return;
    }
    updatePredictions(updated);
    toast.success(`✅ Đã verify ${newlyVerified} dự đoán!`);
  }

  const { adaptiveWeights, bestStrategy, strategyPerformance } = stats;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, width: '100%', maxWidth: 680,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px 14px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>
              🧠 Learning Context – <span style={{ color: cfg.color }}>{cfg.shortName}</span>
            </h2>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              Học từ kết quả thực tế → tự điều chỉnh trọng số chiến lược
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stats overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'Đã dự đoán', value: stats.totalPredictions, color: '#a78bfa' },
              { label: 'Đã verify', value: stats.totalVerified, color: '#22c55e' },
              { label: 'Chờ verify', value: stats.totalPending, color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'var(--surface2)', borderRadius: 12,
                padding: '12px', textAlign: 'center', border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Auto verify button */}
          {stats.totalPending > 0 && (
            <button
              onClick={handleAutoVerify}
              style={{
                padding: '11px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ⚡ Auto-Verify {stats.totalPending} dự đoán đang chờ
            </button>
          )}

          {/* Adaptive weights info */}
          {adaptiveWeights.sampleSize >= 5 && (
            <div style={{
              background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)',
              borderRadius: 12, padding: 12, fontSize: 12,
            }}>
              <div style={{ fontWeight: 700, color: '#a78bfa', marginBottom: 6 }}>
                ⚡ Adaptive Weights đang hoạt động
              </div>
              <div style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                Dựa trên <strong style={{ color: 'var(--text)' }}>{adaptiveWeights.sampleSize} dự đoán đã verify</strong>,
                hệ thống đang tự điều chỉnh trọng số chiến lược. Multiplier &gt; 1 = chiến lược tin cậy hơn mức baseline.
              </div>
              {bestStrategy && (
                <div style={{ marginTop: 6, color: '#22c55e' }}>
                  🏆 Chiến lược tốt nhất hiện tại: <strong>{AI_STRATEGIES[bestStrategy].name}</strong>
                </div>
              )}
            </div>
          )}

          {/* Strategy cards */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 10 }}>
              📊 Hiệu suất theo chiến lược
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(Object.keys(AI_STRATEGIES) as AIStrategy[]).map(s => {
                const perf = strategyPerformance.find(p => p.strategy === s)!;
                return (
                  <StrategyCard
                    key={s}
                    perf={perf}
                    multiplier={adaptiveWeights.multipliers[s]}
                    regionColor={cfg.color}
                    isBest={bestStrategy === s}
                  />
                );
              })}
            </div>
          </div>

          {/* Hint */}
          {stats.totalVerified === 0 && (
            <div style={{
              textAlign: 'center', padding: '24px 20px', color: 'var(--muted)', fontSize: 12,
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🧠</div>
              <p>Chưa có dữ liệu học. Hệ thống sẽ tự verify sau khi:</p>
              <p style={{ marginTop: 6 }}>
                1. Bạn nhấn <strong>"Tính Xác Suất"</strong> → tạo dự đoán có targetDate<br />
                2. Ngày hôm sau crawl dữ liệu mới → kết quả thật có trong store<br />
                3. Nhấn <strong>"Auto-Verify"</strong> → hệ thống đối chiếu tự động
              </p>
            </div>
          )}

          {/* Verified history */}
          <VerifiedList stats={stats} regionColor={cfg.color} />
        </div>
      </div>
    </div>
  );
}
