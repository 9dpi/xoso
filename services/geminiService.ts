import { GoogleGenAI, Type } from '@google/genai';
import { Region, AIStrategy, DrawResult } from '../types';
import { REGIONS, AI_STRATEGIES } from '../constants';

function getClient() {
  const key = sessionStorage.getItem('geminiApiKey');
  if (!key) throw new Error('NO_API_KEY');
  return new GoogleGenAI({ apiKey: key });
}

function buildPrompt(region: Region, history: DrawResult[], strategy: AIStrategy): string {
  const cfg = REGIONS[region];
  const recent10 = history.slice(0, 10);
  const recent30 = history.slice(0, 30);

  // frequency over last 30
  const freq30 = new Map<string, number>();
  recent30.forEach(d => d.loNums.forEach(n => freq30.set(n, (freq30.get(n) ?? 0) + 1)));

  // frequency over last 10
  const freq10 = new Map<string, number>();
  recent10.forEach(d => d.loNums.forEach(n => freq10.set(n, (freq10.get(n) ?? 0) + 1)));

  const sorted = [...freq30.entries()].sort((a, b) => b[1] - a[1]);
  const hot = sorted.slice(0, 10).map(([n]) => n).join(', ');
  const cold = sorted.slice(-10).map(([n]) => n).join(', ');

  // momentum: appears more in last 10 than expected
  const momentum = [...freq10.entries()]
    .filter(([n, c10]) => c10 > (freq30.get(n) ?? 0) / 3)
    .map(([n]) => n).join(', ') || 'Không rõ';

  // days since last seen for cold numbers
  const allLo = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
  const neverSeen = allLo.filter(n => !freq30.has(n)).join(', ') || 'Không có';

  const stratDesc = AI_STRATEGIES[strategy].description;

  return `
Bạn là chuyên gia phân tích xổ số với 20 năm kinh nghiệm phân tích thống kê ${cfg.name} (${cfg.shortName}).
Mỗi ngày có ${cfg.loPerDraw} lô (số từ 00–99) được quay.

DỮ LIỆU THỐNG KÊ (${Math.min(history.length, 30)} kỳ gần nhất):
- Lô NÓNG nhất (30 kỳ): ${hot}
- Lô LẠNH nhất (30 kỳ): ${cold}
- Lô có MOMENTUM (tăng gần đây): ${momentum}
- Lô CHƯA VỀ (30 kỳ): ${neverSeen}
- Kỳ gần nhất: ${history[0]?.date ?? 'N/A'} – Đặc biệt: ${history[0]?.specialPrize ?? 'N/A'} – Đề: ${history[0]?.deNum ?? 'N/A'}

CHIẾN LƯỢC NGƯỜI DÙNG CHỌN: "${strategy}" – ${stratDesc}

NHIỆM VỤ:
1. Dự đoán 5 cặp số lô 2 chữ số (00–99) có khả năng về cao nhất kỳ tiếp theo.
2. Dự đoán 1 số đề (2 chữ số cuối của giải đặc biệt).
3. Giải thích ngắn gọn lý do chọn (1–2 câu tiếng Việt).

Trả lời đúng định dạng JSON yêu cầu.
  `.trim();
}

export async function getPrediction(
  region: Region,
  history: DrawResult[],
  strategy: AIStrategy
): Promise<{ predictedLo: string[]; deNum: string; reasoning: string }> {
  const ai = getClient();
  const prompt = buildPrompt(region, history, strategy);

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          predictedLo: {
            type: Type.ARRAY,
            description: 'Mảng 5 cặp số lô 2 chữ số dạng chuỗi, vd: ["12","34","56","78","90"]',
            items: { type: Type.STRING },
          },
          deNum: {
            type: Type.STRING,
            description: 'Số đề dự đoán, 2 chữ số, vd: "36"',
          },
          reasoning: {
            type: Type.STRING,
            description: 'Giải thích ngắn gọn lý do chọn số bằng tiếng Việt',
          },
        },
        required: ['predictedLo', 'deNum', 'reasoning'],
      },
      temperature: 0.9,
      topP: 0.95,
    },
  });

  const parsed = JSON.parse(result.text.trim());
  if (!Array.isArray(parsed.predictedLo) || parsed.predictedLo.length === 0)
    throw new Error('AI trả về dữ liệu không hợp lệ');

  return {
    predictedLo: (parsed.predictedLo as string[]).slice(0, 5).map((n: string) =>
      n.toString().padStart(2, '0')
    ),
    deNum: (parsed.deNum as string).padStart(2, '0'),
    reasoning: parsed.reasoning as string,
  };
}
