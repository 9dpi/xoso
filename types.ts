export type Region = 'XSMB' | 'XSMT' | 'XSMN';
export type AIStrategy = 'BALANCED' | 'HOT_FOCUS' | 'COLD_FOCUS' | 'PATTERN';

export interface DrawResult {
  id: string;
  date: string;
  region: Region;
  province: string;
  specialPrize: string; // 5-digit giải đặc biệt
  loNums: string[];     // 27 (XSMB) or 18 (XSMT/N) last-2-digit endings
  deNum: string;        // last 2 digits of specialPrize
}

export interface NumberFrequency {
  number: string;
  count: number;
  lastSeenDays: number;
  momentum: number; // recent vs overall rate
}

export interface PredictionRecord {
  id: string;
  createdAt: string;
  region: Region;
  predictedLo: string[];
  strategy: AIStrategy;
  reasoning: string;
}
