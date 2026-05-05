export const REGIONS = {
  XSMB: {
    name: 'Xổ Số Miền Bắc',
    shortName: 'XSMB',
    color: '#ef4444',
    loPerDraw: 27,
    drawSchedule: 'Hàng ngày 18:30',
    provinces: ['Hà Nội'],
  },
  XSMT: {
    name: 'Xổ Số Miền Trung',
    shortName: 'XSMT',
    color: '#f59e0b',
    loPerDraw: 18,
    drawSchedule: 'Hàng ngày 17:15',
    provinces: ['Thừa TT Huế', 'Phú Yên', 'Đắk Lắk', 'Quảng Nam', 'Khánh Hòa', 'Đà Nẵng'],
  },
  XSMN: {
    name: 'Xổ Số Miền Nam',
    shortName: 'XSMN',
    color: '#22c55e',
    loPerDraw: 18,
    drawSchedule: 'Hàng ngày 16:45',
    provinces: ['TP. Hồ Chí Minh', 'Đồng Nai', 'Cần Thơ', 'Bến Tre', 'Vũng Tàu', 'Bình Dương'],
  },
} as const;

export const AI_STRATEGIES = {
  BALANCED: {
    name: 'Cân Bằng',
    description: 'Kết hợp lô nóng, lô lạnh và xu hướng gần đây',
    icon: '⚖️',
  },
  HOT_FOCUS: {
    name: '🔥 Lô Nóng',
    description: 'Ưu tiên các cặp số xuất hiện nhiều nhất gần đây',
    icon: '🔥',
  },
  COLD_FOCUS: {
    name: '❄️ Lô Lạnh',
    description: 'Các số đang "ngủ đông", thống kê đang nợ',
    icon: '❄️',
  },
  PATTERN: {
    name: '📊 Chu Kỳ',
    description: 'Phân tích đầu số, đuôi số và chu kỳ quay lại',
    icon: '📊',
  },
} as const;
