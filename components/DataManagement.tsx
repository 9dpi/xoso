import React, { useState, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import { REGIONS } from '../constants';
import { Region, DrawResult } from '../types';
import toast from 'react-hot-toast';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text)',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--muted)',
  marginBottom: 4,
  display: 'block',
  fontWeight: 600,
};

interface Props {
  onClose: () => void;
}

export default function DataManagement({ onClose }: Props) {
  const { region, draws, addDraw, deleteDraw, clearDrawsByRegion, importDraws } = useStore();
  const cfg = REGIONS[region];
  const regionDraws = draws.filter(d => d.region === region);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [province, setProvince] = useState(cfg.provinces[0]);
  const [specialPrize, setSpecialPrize] = useState('');
  const [loInput, setLoInput] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'import'>('add');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAddDraw() {
    if (!specialPrize || specialPrize.length < 5) {
      toast.error('Giải Đặc Biệt phải có ít nhất 5 chữ số');
      return;
    }

    // Parse lô numbers
    const loNums = loInput
      .replace(/[,;\s]+/g, ' ')
      .trim()
      .split(' ')
      .map(s => s.trim().padStart(2, '0'))
      .filter(s => /^\d{2}$/.test(s));

    const expectedLo = cfg.loPerDraw;
    if (loNums.length < 10) {
      toast.error(`Cần nhập ít nhất 10 lô (kỳ vọng ${expectedLo} lô). Đã nhập: ${loNums.length}`);
      return;
    }

    const deNum = specialPrize.slice(-2);
    const draw: DrawResult = {
      id: `${region.toLowerCase()}-${date}-${Date.now()}`,
      date,
      region: region as Region,
      province,
      specialPrize,
      loNums,
      deNum,
    };

    addDraw(draw);
    toast.success(`Đã thêm kết quả ngày ${date}`);

    // Reset form
    setSpecialPrize('');
    setLoInput('');
  }

  function handleExport() {
    const data = JSON.stringify(regionDraws, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xoso-${region}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file JSON');
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error('Dữ liệu không hợp lệ');

        const valid = parsed.filter(
          (d: DrawResult) => d.date && d.specialPrize && Array.isArray(d.loNums) && d.loNums.length > 0
        );

        if (valid.length === 0) {
          toast.error('File không chứa dữ liệu hợp lệ');
          return;
        }

        // Ensure region is set on imported data
        const withRegion = valid.map((d: DrawResult) => ({
          ...d,
          region: d.region || region,
          deNum: d.deNum || d.specialPrize.slice(-2),
          id: d.id || `${region.toLowerCase()}-${d.date}-${Date.now()}`,
        }));

        importDraws(withRegion);
        toast.success(`Đã nhập ${withRegion.length} kỳ quay`);
      } catch {
        toast.error('File JSON không hợp lệ');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleClearAll() {
    if (window.confirm(`Xóa toàn bộ ${regionDraws.length} kỳ quay ${cfg.name}?`)) {
      clearDrawsByRegion(region);
      toast.success('Đã xóa dữ liệu');
    }
  }

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: 8,
    border: active ? `2px solid ${cfg.color}` : '2px solid transparent',
    background: active ? `${cfg.color}18` : 'rgba(255,255,255,0.04)',
    color: active ? cfg.color : 'var(--muted)',
    fontWeight: active ? 700 : 500,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        width: '100%',
        maxWidth: 680,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800 }}>
              📋 Quản Lý Dữ Liệu – <span style={{ color: cfg.color }}>{cfg.shortName}</span>
            </h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {regionDraws.length} kỳ quay đã lưu
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              fontSize: 22, cursor: 'pointer', padding: 4,
            }}
          >✕</button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '12px 24px 0', display: 'flex', gap: 8 }}>
          <button style={tabBtnStyle(activeTab === 'add')} onClick={() => setActiveTab('add')}>
            ➕ Thêm kết quả
          </button>
          <button style={tabBtnStyle(activeTab === 'list')} onClick={() => setActiveTab('list')}>
            📄 Danh sách ({regionDraws.length})
          </button>
          <button style={tabBtnStyle(activeTab === 'import')} onClick={() => setActiveTab('import')}>
            📦 Nhập/Xuất
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

          {/* TAB: Add new draw */}
          {activeTab === 'add' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>📅 Ngày quay</label>
                  <input
                    id="draw-date-input"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>📍 Tỉnh/TP</label>
                  <select
                    id="province-select"
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {cfg.provinces.map(p => (
                      <option key={p} value={p} style={{ background: 'var(--surface)' }}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>🏆 Giải Đặc Biệt (5+ chữ số)</label>
                <input
                  id="special-prize-input"
                  type="text"
                  value={specialPrize}
                  onChange={e => setSpecialPrize(e.target.value.replace(/\D/g, ''))}
                  placeholder="VD: 98765"
                  maxLength={6}
                  style={{ ...inputStyle, fontSize: 18, fontWeight: 800, letterSpacing: 4, color: cfg.color }}
                />
                {specialPrize.length >= 2 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
                    → Đề: <span style={{
                      fontWeight: 800, color: cfg.color,
                      background: `${cfg.color}22`, padding: '1px 8px', borderRadius: 6,
                    }}>{specialPrize.slice(-2)}</span>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>
                  🎱 Các số lô (2 chữ số, cách nhau bởi dấu cách, phẩy hoặc chấm phẩy)
                </label>
                <textarea
                  id="lo-nums-input"
                  value={loInput}
                  onChange={e => setLoInput(e.target.value)}
                  placeholder={`VD: 12 34 56 78 90 01 23 45 67 89 11 22 33 44 55 66 77 88 99 00 10 20 30 40 50 60 70`}
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    lineHeight: 1.8,
                    letterSpacing: 1,
                  }}
                />
                <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    Đã nhập: {loInput.trim() ? loInput.replace(/[,;\s]+/g, ' ').trim().split(' ').filter(s => /^\d{1,2}$/.test(s.trim())).length : 0} lô
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    Kỳ vọng: {cfg.loPerDraw} lô
                  </span>
                </div>
              </div>

              <button
                id="add-draw-btn"
                onClick={handleAddDraw}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: 'none',
                  background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.2s',
                }}
              >
                ✅ Lưu Kết Quả
              </button>

              {/* Guide */}
              <div style={{
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: 12,
                padding: 14,
                fontSize: 12,
                color: 'var(--muted)',
                lineHeight: 1.7,
              }}>
                <strong style={{ color: '#a78bfa' }}>💡 Hướng dẫn nhanh:</strong>
                <br />1. Vào trang kết quả xổ số (VD: xoso.me, minhngoc.net)
                <br />2. Copy số Giải Đặc Biệt vào ô trên
                <br />3. Copy tất cả 2 chữ số cuối của các giải vào ô "Các số lô"
                <br />4. Ấn "Lưu Kết Quả" — dữ liệu lưu trên máy bạn
              </div>
            </div>
          )}

          {/* TAB: List existing draws */}
          {activeTab === 'list' && (
            <div>
              {regionDraws.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p>Chưa có dữ liệu. Hãy thêm kết quả ở tab "Thêm kết quả".</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {regionDraws.sort((a, b) => b.date.localeCompare(a.date)).map((d) => (
                    <div
                      key={d.id}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: 12,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 80 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{d.date}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{d.province}</div>
                      </div>
                      <div style={{ flex: 0, minWidth: 60 }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>ĐB</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: cfg.color }}>{d.specialPrize}</div>
                      </div>
                      <div style={{ flex: 0, minWidth: 36 }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>Đề</div>
                        <div style={{
                          fontSize: 14, fontWeight: 800, color: cfg.color,
                          background: `${cfg.color}22`, borderRadius: 6, textAlign: 'center', padding: '1px 6px',
                        }}>{d.deNum}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>Lô ({d.loNums.length})</div>
                        <div style={{
                          fontSize: 11, color: 'var(--text)', lineHeight: 1.6,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {d.loNums.join(', ')}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa kết quả ngày ${d.date}?`)) {
                            deleteDraw(d.id);
                            toast.success('Đã xóa');
                          }
                        }}
                        style={{
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: 8,
                          color: '#ef4444',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontFamily: 'inherit',
                        }}
                      >🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Import / Export */}
          {activeTab === 'import' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 14,
                padding: 18,
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#22c55e' }}>📤 Xuất dữ liệu</h4>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                  Xuất {regionDraws.length} kỳ quay {cfg.shortName} ra file JSON để sao lưu.
                </p>
                <button
                  id="export-btn"
                  onClick={handleExport}
                  disabled={regionDraws.length === 0}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: regionDraws.length > 0 ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(34,197,94,0.3)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: regionDraws.length > 0 ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                  }}
                >
                  📥 Tải file JSON ({regionDraws.length} kỳ)
                </button>
              </div>

              <div style={{
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: 14,
                padding: 18,
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#3b82f6' }}>📥 Nhập dữ liệu</h4>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                  Nhập từ file JSON đã xuất trước đó. Dữ liệu trùng (cùng ID) sẽ được ghi đè.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
                <button
                  id="import-btn"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  📂 Chọn file JSON
                </button>
              </div>

              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 14,
                padding: 18,
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#ef4444' }}>🗑 Xóa toàn bộ</h4>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                  Xóa hết {regionDraws.length} kỳ quay {cfg.shortName}. Không thể hoàn tác!
                </p>
                <button
                  id="clear-all-btn"
                  onClick={handleClearAll}
                  disabled={regionDraws.length === 0}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: regionDraws.length > 0 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(239,68,68,0.3)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: regionDraws.length > 0 ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                  }}
                >
                  ⚠️ Xóa tất cả {cfg.shortName}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
