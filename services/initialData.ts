import { DrawResult } from '../types';

// Generates deterministic fake lô data seeded by draw index
function makeLo(seed: number, count: number): string[] {
  const nums: string[] = [];
  let s = seed;
  while (nums.length < count) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const n = Math.abs(s) % 100;
    nums.push(n.toString().padStart(2, '0'));
  }
  return nums;
}

function makeDate(daysAgo: number): string {
  const d = new Date('2026-05-05');
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function makeSpecial(seed: number): string {
  const s = (seed * 22695477 + 1) & 0xffffffff;
  return (Math.abs(s) % 90000 + 10000).toString();
}

export const INITIAL_DRAWS_XSMB: DrawResult[] = Array.from({ length: 30 }, (_, i) => {
  const special = makeSpecial(i + 100);
  const deNum = special.slice(-2);
  const loNums = makeLo(i + 100, 27);
  // ensure deNum appears in loNums (it would in real draws)
  loNums[0] = deNum;
  return {
    id: `xsmb-${makeDate(i)}`,
    date: makeDate(i),
    region: 'XSMB',
    province: 'Hà Nội',
    specialPrize: special,
    loNums,
    deNum,
  };
});

export const INITIAL_DRAWS_XSMT: DrawResult[] = Array.from({ length: 20 }, (_, i) => {
  const special = makeSpecial(i + 200);
  const deNum = special.slice(-2);
  const loNums = makeLo(i + 200, 18);
  loNums[0] = deNum;
  const provinces = ['Thừa TT Huế', 'Phú Yên', 'Đắk Lắk', 'Quảng Nam', 'Khánh Hòa', 'Đà Nẵng'];
  return {
    id: `xsmt-${makeDate(i)}`,
    date: makeDate(i),
    region: 'XSMT',
    province: provinces[i % provinces.length],
    specialPrize: special,
    loNums,
    deNum,
  };
});

export const INITIAL_DRAWS_XSMN: DrawResult[] = Array.from({ length: 20 }, (_, i) => {
  const special = makeSpecial(i + 300);
  const deNum = special.slice(-2);
  const loNums = makeLo(i + 300, 18);
  loNums[0] = deNum;
  const provinces = ['TP. Hồ Chí Minh', 'Đồng Nai', 'Cần Thơ', 'Bến Tre', 'Vũng Tàu'];
  return {
    id: `xsmn-${makeDate(i)}`,
    date: makeDate(i),
    region: 'XSMN',
    province: provinces[i % provinces.length],
    specialPrize: special,
    loNums,
    deNum,
  };
});
