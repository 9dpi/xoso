import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { REGIONS, AI_STRATEGIES } from '../constants';
import { AIStrategy } from '../types';
import { runBacktest, BacktestReport, BacktestDayResult } from '../services/backtestEngine';
import toast from 'react-hot-toast';

interface Props { onClose: () => void }

function HitBadge({ hits }: { hits: number }) {
  const colors = ['#475569', '#f59e0b', '#f97316', '#a855f7'];
  const labels = ['0/3', '1/3', '2/3', '3/3'];
  const c = colors[Math.min(hits, 3)];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 20,
      background: `${c}22`, border: `1px solid ${c}55`,
      color: c, fontWeight: 800, fontSize: 12, minWidth: 36, textAlign: 'center',
    }}>
      {labels[Math.min(hits, 3)]}
    </span>
  );
}

function DayRow({ day, regionColor }: { day: BacktestDayResult; regionColor: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', cursor: 'pointer',
          background: open ? 'rgba(255,255,255,0.03)' : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        <span style={{ minWidth: 86, fontSize: 12, color: 'var(--muted)' }}>{day.date}</span>
        <HitBadge hits={day.loHits} />
        <span style={{ fontSize: 11, color: day.deHit ? '#22c55e' : 'var(--muted)' }}>
          {day.deHit ? '✅ Đề' : '—'}
        </span>
        <div style={{ flex: 1, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {day.predictedLo.map(n => (
            <span key={n} style={{
              fontSize: 12, fontWeight: 700, padding: '1px 7px', borderRadius: 12,
              background: day.actualLo.includes(n) ? `${regionColor}33` : 'rgba(255,255,255,0.06)',
              color: day.actualLo.includes(n) ? regionColor : 'var(--muted)',
              border: `1px solid ${day.actualLo.includes(n) ? regionColor + '66' : 'transparent'}`,
            }}>
              {n}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding: '8px 12px 12px', fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
          <span>Đề thực: <strong style={{ color: 'var(--text)' }}>{day.actualDe}</strong></span>
          <span style={{ marginLeft: 16 }}>Đề đoán: <strong style={{ color: day.deHit ? '#22c55e' : 'var(--text)' }}>{day.predictedDe}</strong></span>
          <div style={{ marginTop: 4 }}>
            Lô thực ({day.actualLo.length}):{' '}
            <span style={{ color: 'var(--text)' }}>{day.actualLo.join(', ')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BacktestPanel({ onClose }: Props) {
  const { region, getDrawsForRegion } = useStore();
  const cfg = REGIONS[region];

  const [strategy, setStrategy] = useState<AIStrategy>('BALANCED');
  const [days, setDays] = useState(30);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<BacktestReport | null>(null);

  function handleRun() {
    const draws = getDrawsForRegion();
    if (draws.length < 10) {
      toast.error('Cần ít nhất 10 kỳ dữ liệu để backtest');
      return;
    }
    setRunning(true);
    setReport(null);
    // Chạy async nhẹ để không block UI
    setTimeout(() => {
      try {
        const r = runBacktest(draws, region, strategy, days);
        setReport(r);
        toast.success(`Backtest xong: ${r.totalDays} ngày`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      } finally {
        setRunning(false);
      }
    }, 50);
  }

  const hitColor = (r: number) =>
    r >= 0.6 ? '#22c55e' : r >= 0.4 ? '#f59e0b' : r >= 0.2 ? '#f97316' : '#ef4444';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, width: '100%', maxWidth: 720,
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
              🧪 Backtest – <span style={{ color: cfg.color }}>{cfg.shortName}</span>
            </h2>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              Kiểm tra độ chính xác của mô hình trên dữ liệu lịch sử
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Controls */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Strategy */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Chiến lược
            </label>
            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value as AIStrategy)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
                color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              {(Object.keys(AI_STRATEGIES) as AIStrategy[]).map(s => (
                <option key={s} value={s} style={{ background: 'var(--surface)' }}>
                  {AI_STRATEGIES[s].name}
                </option>
              ))}
            </select>
          </div>

          {/* Days */}
          <div style={{ minWidth: 120 }}>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Số ngày test
            </label>
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
                color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              {[7, 14, 20, 30].map(d => (
                <option key={d} value={d} style={{ background: 'var(--surface)' }}>{d} ngày</option>
              ))}
            </select>
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={running}
            style={{
              padding: '9px 20px', borderRadius: 10, border: 'none',
              background: running ? 'rgba(124,58,237,0.4)' : `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
              color: '#fff', fontWeight: 700, fontSize: 13,
              cursor: running ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {running ? '⏳ Đang chạy...' : '▶ Chạy Backtest'}
          </button>
        </div>

        {/* Result */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 8px' }}>
          {!report && !running && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
              <p>Chọn chiến lược và nhấn <strong>Chạy Backtest</strong> để xem kết quả.</p>
              <p style={{ fontSize: 11, marginTop: 8 }}>
                Mỗi ngày: dùng dữ liệu trước đó → dự đoán → so với kết quả thực
              </p>
            </div>
          )}

          {report && (
            <>
              {/* Summary cards */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))',
                gap: 10, padding: '14px 22px',
              }}>
                {[
                  { label: 'Ngày test', value: report.totalDays, unit: 'ngày', color: '#a78bfa' },
                  { label: 'Lô đúng TB', value: report.avgLoHits.toFixed(2), unit: '/3', color: hitColor(report.avgHitRate) },
                  { label: 'Hit Rate Lô', value: `${(report.avgHitRate * 100).toFixed(1)}%`, unit: '', color: hitColor(report.avgHitRate) },
                  { label: 'Đề đúng', value: report.deHitCount, unit: `/${report.totalDays}`, color: '#22c55e' },
                  { label: 'Hit Rate Đề', value: `${(report.deHitRate * 100).toFixed(1)}%`, unit: '', color: report.deHitRate >= 0.15 ? '#22c55e' : '#f59e0b' },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} style={{
                    background: 'var(--surface2)', borderRadius: 12,
                    padding: '12px', textAlign: 'center', border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}<span style={{ fontSize: 11, color: 'var(--muted)' }}>{unit}</span></div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Best day */}
              {report.bestDay && (
                <div style={{
                  margin: '0 22px 12px', padding: '10px 14px',
                  background: `${cfg.color}12`, border: `1px solid ${cfg.color}33`, borderRadius: 10,
                  fontSize: 12,
                }}>
                  <span style={{ color: cfg.color, fontWeight: 700 }}>🏆 Ngày tốt nhất: </span>
                  <span style={{ color: 'var(--text)' }}>{report.bestDay.date}</span>
                  <span style={{ color: 'var(--muted)', marginLeft: 8 }}>
                    Đoán đúng {report.bestDay.loHits}/3 lô
                    {report.bestDay.deHit ? ' + đề ✅' : ''}
                  </span>
                </div>
              )}

              {/* Day-by-day table */}
              <div style={{ margin: '0 22px', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{
                  display: 'flex', gap: 10, padding: '8px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  fontSize: 11, color: 'var(--muted)', fontWeight: 600,
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ minWidth: 86 }}>Ngày</span>
                  <span style={{ minWidth: 40 }}>Lô</span>
                  <span style={{ minWidth: 40 }}>Đề</span>
                  <span style={{ flex: 1 }}>Số đã đoán (xanh = đúng)</span>
                </div>
                {report.days.map(day => (
                  <DayRow key={day.date} day={day} regionColor={cfg.color} />
                ))}
              </div>

              <div style={{ padding: '10px 22px', fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>
                Chạy lúc {new Date(report.ranAt).toLocaleString('vi-VN')} · Chiến lược: {AI_STRATEGIES[report.strategy].name}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
