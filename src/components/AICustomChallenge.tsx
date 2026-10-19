import React, { useState } from 'react';
import { Sparkles, Wand2, Play, BookOpen, Layers, Check } from 'lucide-react';

interface AICustomChallengeProps {
  onSelectSentence: (sentence: string) => void;
}

const TOPIC_SUGGESTIONS = [
  '🌶️ 고난도 한국어 잰말놀이 (간장공장 공장장 등)',
  '🚀 사이버펑크 SF 우주 탐사 소설',
  '☕ 비 오는 날 감성 에세이',
  '💻 밤샘 코딩하는 개발자의 독백',
  '📜 조선 왕실과 역사 야사',
  '🌸 서정적인 한국 현대시 구절',
];

export const AICustomChallenge: React.FC<AICustomChallengeProps> = ({
  onSelectSentence,
}) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSentences, setGeneratedSentences] = useState<string[]>([
    '비트코인과 인공지능이 융합된 메타버스 공간에서 새로운 디지털 경제가 시작되었다.',
    '간장 공장 공장장은 강 공장장이고, 된장 공장 공장장은 장 공장장이다.',
    '디버깅이란 버그를 찾는 것이 아니라 버그를 제거했다고 착각하는 예술이다.',
    '비 오는 날 창가에 앉아 마시는 따뜻한 아메리카노 한 잔은 영혼을 위로한다.',
    '세종대왕의 훈민정음 창제 정신은 백성을 사랑하는 깊은 애민 정신에서 출발했다.',
  ]);

  const handleGenerate = async (customTopic?: string) => {
    const targetTopic = customTopic || topic;
    if (!targetTopic.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: targetTopic }),
      });
      const data = await res.json();
      if (Array.isArray(data.sentences) && data.sentences.length > 0) {
        setGeneratedSentences(data.sentences);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Gemini 3.8 Flash 파워 맞춤 훈련</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              원하는 주제로 <span className="text-emerald-400">AI 타자 예문</span> 생성하기
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-lg">
              문학, 코딩, 철학, 잰말놀이 등 관심 있는 키워드를 입력하면 Gemini가 타이핑 리듬감에 최적화된 문장을 즉석 창작합니다.
            </p>
          </div>
        </div>

        {/* Topic Input Box */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="주제를 입력하세요 (예: 고난도 잰말놀이, 판타지 소설, 개발자 유머...)"
            className="flex-1 bg-slate-950/90 border border-slate-700 focus:border-emerald-400 text-slate-100 px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder-slate-500"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={!topic.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 animate-spin" /> 생성 중...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" /> 문장 생성
              </span>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {TOPIC_SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setTopic(s);
                handleGenerate(s);
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700/60 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Sentences List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
          <span>생성된 문장 목록 (클릭하여 즉시 타자 연습 시작)</span>
          <span>총 {generatedSentences.length}개</span>
        </div>

        {generatedSentences.map((sentence, idx) => (
          <div
            key={idx}
            className="p-4 md:p-5 bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl flex items-center justify-between gap-4 group transition-all duration-200 hover:bg-slate-850"
          >
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <p className="text-slate-200 font-medium text-sm md:text-base leading-relaxed group-hover:text-emerald-200 transition-colors">
                  "{sentence}"
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 font-mono">
                  <span>글자 수: {sentence.length}자</span>
                  <span>예상 난이도: {sentence.length > 35 ? '상급' : '중급'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectSentence(sentence)}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 border border-emerald-500/30 transition-all cursor-pointer group-hover:scale-105"
            >
              <Play className="w-3.5 h-3.5" /> 연습 시작
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
