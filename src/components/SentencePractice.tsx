import React, { useState, useEffect, useRef } from 'react';
import { SENTENCE_LIST, SentenceItem } from '../data/typingContent';
import { getTotalStrokeCount, calculateCPM, calculateAccuracy } from '../utils/hangul';
import { soundManager } from '../utils/sound';
import { RefreshCw, ChevronRight, ChevronLeft, Bot, Sparkles, Award, Play, CheckCircle2, RotateCcw } from 'lucide-react';

interface SentencePracticeProps {
  customSentence?: string | null;
  onActiveKeyChange?: (key: string | null) => void;
  onTargetCharChange?: (char: string) => void;
  onRecordResult?: (cpm: number, accuracy: number) => void;
  onOpenAICoach?: () => void;
}

export const SentencePractice: React.FC<SentencePracticeProps> = ({
  customSentence,
  onActiveKeyChange,
  onTargetCharChange,
  onRecordResult,
  onOpenAICoach,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [historyResults, setHistoryResults] = useState<{ cpm: number; acc: number; time: string }[]>([]);

  // AI Ghost racer (optional fun race challenge)
  const [enableGhostRace, setEnableGhostRace] = useState(true);
  const [ghostSpeedCpm, setGhostSpeedCpm] = useState(350); // 350타
  const [ghostProgress, setGhostProgress] = useState(0); // 0 to 100%

  const inputRef = useRef<HTMLInputElement>(null);

  // Filtered sentences
  const filteredSentences = SENTENCE_LIST.filter((s) =>
    selectedCategory === 'all' ? true : s.category === selectedCategory
  );

  const currentSentenceItem: SentenceItem = customSentence
    ? {
        id: 'custom',
        category: 'twister',
        title: 'AI 맞춤 연습 문장',
        text: customSentence,
      }
    : filteredSentences[currentIndex] || filteredSentences[0];

  const targetText = currentSentenceItem.text;

  // Reset when sentence changes
  useEffect(() => {
    resetPractice();
  }, [currentIndex, customSentence, selectedCategory]);

  const resetPractice = () => {
    setTypedText('');
    setStartTime(null);
    setCpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setGhostProgress(0);
    onActiveKeyChange?.(null);
    onTargetCharChange?.(targetText[0] || '');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Next / Prev Sentence
  const nextSentence = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredSentences.length);
  };

  const prevSentence = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredSentences.length) % filteredSentences.length);
  };

  // Update target character for virtual keyboard
  useEffect(() => {
    const nextChar = targetText[typedText.length] || '';
    onTargetCharChange?.(nextChar);
  }, [typedText, targetText, onTargetCharChange]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isFinished) return;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setTypedText(val);

    // Calculate real-time stats
    const now = Date.now();
    const elapsedSec = startTime ? (now - startTime) / 1000 : 0.1;

    // Stroke calculation
    const strokes = getTotalStrokeCount(val);
    const currentCpm = calculateCPM(strokes, elapsedSec);
    const currentAcc = calculateAccuracy(targetText, val);

    setCpm(currentCpm);
    setAccuracy(currentAcc);

    // Check typo sound
    const lastCharTyped = val[val.length - 1];
    const expectedChar = targetText[val.length - 1];
    if (lastCharTyped && expectedChar) {
      if (lastCharTyped === expectedChar) {
        soundManager.playKeyClick();
      } else {
        soundManager.playError();
      }
    }

    // Check completion
    if (val.length >= targetText.length) {
      setIsFinished(true);
      soundManager.playCorrect();
      onRecordResult?.(currentCpm, currentAcc);
      setHistoryResults((prev) => [
        {
          cpm: currentCpm,
          acc: currentAcc,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 4),
      ]);
    }
  };

  // AI Ghost typist loop
  useEffect(() => {
    if (!enableGhostRace || !startTime || isFinished) return;

    const targetStrokes = getTotalStrokeCount(targetText);
    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const ghostStrokesTyped = ghostSpeedCpm * elapsedMinutes;
      const progress = Math.min(100, Math.round((ghostStrokesTyped / targetStrokes) * 100));
      setGhostProgress(progress);
    }, 100);

    return () => clearInterval(interval);
  }, [enableGhostRace, startTime, isFinished, ghostSpeedCpm, targetText]);

  const userProgress = Math.min(100, Math.round((typedText.length / targetText.length) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Category selector & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: '전체' },
            { id: 'literature', label: '문학 & 시' },
            { id: 'quote', label: '인생 명언' },
            { id: 'twister', label: '잰말놀이' },
            { id: 'code', label: 'IT 개발자' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id && !customSentence
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* AI Ghost race toggle */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={enableGhostRace}
              onChange={(e) => setEnableGhostRace(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="flex items-center gap-1 font-medium">
              <Bot className="w-3.5 h-3.5 text-teal-400" /> AI 대결 모드
            </span>
          </label>
          {enableGhostRace && (
            <select
              value={ghostSpeedCpm}
              onChange={(e) => setGhostSpeedCpm(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-teal-300 rounded-lg px-2 py-1 text-xs outline-none"
            >
              <option value={200}>초보 (200타)</option>
              <option value={350}>보통 (350타)</option>
              <option value={500}>고수 (500타)</option>
              <option value={700}>달인 (700타)</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Typing Practice Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Top sentence info */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-emerald-400 font-bold">{currentSentenceItem.title}</span>
            {currentSentenceItem.author && <span>- {currentSentenceItem.author}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevSentence}
              className="p-1 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="이전 문장"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-400">
              {currentIndex + 1} / {filteredSentences.length}
            </span>
            <button
              onClick={nextSentence}
              className="p-1 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="다음 문장"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Ghost Racing Track */}
        {enableGhostRace && (
          <div className="mb-6 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
            {/* Player track */}
            <div className="flex items-center gap-3">
              <span className="w-14 text-[11px] font-bold text-emerald-400">나 (You)</span>
              <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150 rounded-full"
                  style={{ width: `${userProgress}%` }}
                />
              </div>
              <span className="w-10 text-right text-[11px] font-mono text-slate-300">{userProgress}%</span>
            </div>

            {/* AI Ghost track */}
            <div className="flex items-center gap-3">
              <span className="w-14 text-[11px] font-bold text-teal-400 flex items-center gap-1">
                <Bot className="w-3 h-3" /> AI
              </span>
              <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-150 rounded-full"
                  style={{ width: `${ghostProgress}%` }}
                />
              </div>
              <span className="w-10 text-right text-[11px] font-mono text-slate-300">{ghostProgress}%</span>
            </div>
          </div>
        )}

        {/* Target Sentence Display with live character highlights */}
        <div className="my-6 p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 min-h-[110px] flex items-center leading-relaxed text-lg md:text-xl font-medium tracking-wide">
          <div className="flex flex-wrap items-center">
            {targetText.split('').map((char, idx) => {
              const isTyped = idx < typedText.length;
              const isCurrent = idx === typedText.length;
              const isCorrect = isTyped && typedText[idx] === char;

              let charStyle = 'text-slate-400';
              if (isTyped) {
                charStyle = isCorrect
                  ? 'text-emerald-400 bg-emerald-500/10 rounded'
                  : 'text-rose-400 bg-rose-500/20 underline decoration-rose-500 rounded';
              } else if (isCurrent) {
                charStyle = 'text-slate-100 bg-emerald-400/30 border-b-2 border-emerald-400 animate-pulse px-0.5 rounded';
              }

              return (
                <span key={idx} className={`relative transition-colors ${charStyle}`}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">현재 타수</div>
            <div className="text-2xl md:text-3xl font-black font-mono text-emerald-400">
              {cpm} <span className="text-xs font-normal text-slate-400">타/분</span>
            </div>
          </div>
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">정확도</div>
            <div className="text-2xl md:text-3xl font-black font-mono text-cyan-400">
              {accuracy}%
            </div>
          </div>
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">진행률</div>
            <div className="text-2xl md:text-3xl font-black font-mono text-amber-400">
              {userProgress}%
            </div>
          </div>
        </div>

        {/* Typing Input Box */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            disabled={isFinished}
            value={typedText}
            onChange={handleInputChange}
            placeholder={isFinished ? '문장이 완료되었습니다! 다음 문장으로 넘어가세요.' : '위 문장을 그대로 따라 입력하세요...'}
            className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 text-slate-100 px-5 py-4 rounded-2xl text-base md:text-lg outline-none transition-all placeholder-slate-500 shadow-inner"
            autoFocus
          />
          <button
            onClick={resetPractice}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
            title="다시 입력"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Finished Modal / Card */}
        {isFinished && (
          <div className="mt-6 p-5 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-100 text-base">
                  문장 완료! {userProgress >= 100 && userProgress > ghostProgress && enableGhostRace ? '🎉 AI에게 승리했습니다!' : '멋진 타이핑이었습니다!'}
                </h4>
                <p className="text-xs text-slate-300">
                  기록: <span className="text-emerald-400 font-bold">{cpm} 타/분</span>, 정확도{' '}
                  <span className="text-cyan-400 font-bold">{accuracy}%</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetPractice}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                다시 치기
              </button>
              <button
                onClick={nextSentence}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              >
                다음 문장 →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
