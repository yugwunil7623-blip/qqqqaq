import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Chat API endpoint for Gemini multi-turn chat
app.post('/api/chat', async (req, res) => {
  try {
    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not configured
      return res.json({
        text: '안녕하세요! AI 타자 도사 젬나이입니다. API 키가 아직 설정되지 않았지만 기본 타자 연습과 산성비 게임은 바로 즐기실 수 있습니다. 타자 실력 향상 비결은 바른 자세와 손가락 홈 포지션(F, J) 유지, 그리고 시선을 화면에 고정하는 것입니다!',
      });
    }

    const { messages, userStats, promptRole } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: '메시지 목록이 올바르지 않습니다.' });
    }

    const statsContext = userStats
      ? `[사용자 현재 타자 기록]: 최근 타수 ${userStats.cpm || 0}타/분, 정확도 ${userStats.accuracy || 100}%, 최고 타수 ${userStats.bestCpm || 0}타, 완료 게임 ${userStats.gamesPlayed || 0}회.`
      : '';

    const systemInstruction = `당신은 대한민국 최고의 타자 마스터이자 유쾌하고 열정적인 AI 타자 코치 '타자 도사 젬나이'입니다.
당신의 역할:
1. 사용자의 타자 실력(타수, 정확도, 오타 습관)을 분석하고 실전 향상 조언을 제공합니다.
2. 손가락 기본 위치(F/J 돌기 키, 홈 포지션), 독수리 타법 교정법, 손목 피로 방지 스트레칭을 친절하게 안내합니다.
3. 사용자가 요청하거나 필요할 때 타자 연습에 좋은 재미있는 예문(짧은 명언, K-문학 구절, 잰말놀이 간장공장 공장장 등, 코딩 한 줄, 속담, 명대사 등)을 추천해줍니다.
4. 사용자가 연습하기 좋게 예문을 제시할 때는 따옴표나 별도 블록으로 명확하게 보여주고, 게임 연습 모드에서 도전해보라고 격려하세요.
5. 어조는 친근하고 에너지 넘치며, 이모지를 적절히 섞어 동기부여를 북돋아줍니다. 한국어로 정답고 자연스럽게 대화하세요.
${statsContext}`;

    // Convert messages to Gemini contents format
    // role: 'user' or 'model'
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const replyText = response.text || '응답을 생성할 수 없습니다.';
    return res.json({ text: replyText });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: error?.message || 'Gemini AI 응답 처리 중 오류가 발생했습니다.',
    });
  }
});

// AI custom sentences generator
app.post('/api/generate-sentences', async (req, res) => {
  try {
    const { topic = '문학 명언', count = 5 } = req.body;

    if (!ai) {
      return res.json({
        sentences: [
          '동해 물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세.',
          '별 하나에 추억과 별 하나에 사랑과 별 하나에 쓸쓸함과 별 하나에 동경.',
          '가장 아름다운 것은 눈에 보이지 않고 마음으로 보아야 해.',
          '늦었다고 생각할 때가 가장 빠르다는 말은 언제나 용기를 준다.',
          '오늘 걷지 않으면 내일은 뛰어야 한다는 말을 기억하자.',
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `사용자가 타자 연습을 할 수 있는 ${topic} 주제의 짧은 한국어 문장 ${count}개를 작성해주세요. 각 문장은 20~50자 내외로 타이핑 리듬감이 좋고 흥미로워야 합니다. JSON 배열 형식으로만 응답해주세요. 예: ["문장1", "문장2"]`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let sentences: string[] = [];
    try {
      sentences = JSON.parse(response.text || '[]');
    } catch {
      sentences = [
        '별을 노래하는 마음으로 모든 죽어가는 것을 사랑해야지.',
        '내 삶의 가장 찬란한 순간은 바로 지금 내가 키보드를 두드리는 이 순간이다.',
      ];
    }

    return res.json({ sentences });
  } catch (error: any) {
    console.error('Generate sentences error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Setup dev server middlewares or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TypeMaster server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
