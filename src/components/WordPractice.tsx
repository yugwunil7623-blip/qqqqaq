import React, { useState, useEffect, useRef } from 'react';
import { WORD_CATEGORIES, WordCategory } from '../data/typingContent';
import { getTotalStrokeCount, calculateCPM, calculateAccuracy } from '../utils/hangul';
import { soundManager } from '../utils/sound';
import { Timer, Zap, Trophy, RefreshCw, Flame, CheckCircle, Award } from 'lucide-react';

interface WordPracticeProps {
  onRecordResult?: (cpm: number, accuracy: number) => void;
  onOpenAICoach?: () => void;
}

export const WordPractice: React.FC<WordPracticeProps> = ({
  onRecordResult,
  onOpenAICoach,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('korean_common');
  const [wordsQueue, setWordsQueue] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');

  // 60-second challenge or Free mode
  const [mode, setMode] = useState<'timed' | 'free'>('timed');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Stats
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [correctWordsCount, setCorrectWordsCount] = useState(0);
  const [wrongWordsCount, setWrongWordsCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Get active category words
  const activeCategory =
    WORD_CATEGORIES.find((c) => c.id === selectedCatId) || WORD_CATEGORIES[0];

  const initWords = () => {
    const shuffled = [...activeCategory.words].sort(() => 0.5 - Math.random());
    setWordsQueue(shuffled);
    setCurrentWordIndex(0);
    setInputVal('');
    setTimeLeft(60);
    setIsActive(false);
    setIsFinished(false);
    setStartTime(null);
    setTotalStrokes(0);
    setCorrectWordsCount(0);
    setWrongWordsCount(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    initWords();
  }, [selectedCatId]);

  // Timer loop for timed mode
  useEffect(() => {
    if (!isActive || isFinished || mode !== 'timed') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isFinished, mode]);

  const finishTest = () => {
    setIsFinished(true);
    setIsActive(false);
    soundManager.playGameOver();

    const elapsedSeconds = mode === 'timed' ? 60 - timeLeft : startTime ? (Date.now() - startTime) / 1000 : 1;
    const finalCpm = calculateCPM(totalStrokes, elapsedSeconds);
    const totalWords = correctWordsCount + wrongWordsCount;
    const finalAcc = totalWords > 0 ? Math.round((correctWordsCount / totalWords) * 100) : 100;

    onRecordResult?.(finalCpm, finalAcc);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    if (!isActive) {
      setIsActive(true);
      setStartTime(Date.now());
    }
    setInputVal(e.target.value);
    soundManager.playKeyClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const currentTarget = wordsQueue[currentWordIndex];
      const trimmed = inputVal.trim();
      if (!trimmed) return;

      if (trimmed === currentTarget) {
        // Correct word
        soundManager.playCorrect();
        const strokes = getTotalStrokeCount(currentTarget);
        setTotalStrokes((s) => s + strokes);
        setCorrectWordsCount((c) => c + 1);

        const nextCombo = combo + 1;
        setCombo(nextCombo);
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);
        if (nextCombo % 5 === 0) soundManager.playCombo();
      } else {
        // Wrong word
        soundManager.playError();
        setWrongWordsCount((w) => w + 1);
        setCombo(0);
      }

      // Next word in queue
      if (currentWordIndex + 1 >= wordsQueue.length) {
        // Reshuffle and append more words
        const moreWords = [...activeCategory.words].sort(() => 0.5 - Math.random());
        setWordsQueue((prev) => [...prev, ...moreWords]);
      }
      setCurrentWordIndex((i) => i + 1);
      setInputVal('');
    }
  };

  const elapsedSeconds = startTime
    ? mode === 'timed'
      ? 60 - timeLeft
      : (Date.now() - startTime) / 1000
    : 0;
  const currentCpm = calculateCPM(totalStrokes, Math.max(0.1, elapsedSeconds));
  const totalAttempted = correctWordsCount + wrongWordsCount;
  const currentAcc = totalAttempted > 0 ? Math.round((correctWordsCount / totalAttempted) * 100) : 100;

  const currentWord = wordsQueue[currentWordIndex] || '';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Category & Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {WORD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCatId === cat.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode('timed');
              initWords();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'timed' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⏱️ 60초 챌린지
          </button>
          <button
            onClick={() => {
              setMode('free');
              initWords();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'free' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            자유 연습
          </button>
        </div>
      </div>

      {/* Main Word Practice Stage */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Top HUD: Timer & Combo */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {mode === 'timed' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                <Timer className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-base font-bold text-slate-200">
                  {timeLeft}초 남음
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium">자유 단어 반복 모드</span>
            )}

            {combo > 2 && (
              <div className="flex items-center gap-1 text-amber-400 font-extrabold text-sm animate-bounce">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>{combo} COMBO</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[10px] text-slate-400">맞힌 단어</div>
              <div className="font-mono text-base font-bold text-emerald-400">
                {correctWordsCount}개
              </div>
            </div>
            <button
              onClick={initWords}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
              title="초기화"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Word Queue Display */}
        <div className="mb-8 p-6 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center gap-4 md:gap-6 overflow-hidden">
          {/* Previous word faint */}
          {currentWordIndex > 0 && (
            <span className="text-slate-600 text-sm md:text-base line-through opacity-40 select-none">
              {wordsQueue[currentWordIndex - 1]}
            </span>
          )}

          {/* Active Word (Prominent) */}
          <div className="relative px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)]">
            <span className="text-3xl md:text-4xl font-extrabold text-emerald-300 font-sans tracking-wider">
              {currentWord}
            </span>
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
              Target
            </div>
          </div>

          {/* Next upcoming words */}
          {wordsQueue.slice(currentWordIndex + 1, currentWordIndex + 4).map((w, i) => (
            <span
              key={i}
              className="text-slate-400 text-base md:text-lg font-medium opacity-60 select-none"
            >
              {w}
            </span>
          ))}
        </div>

        {/* Real-time stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] text-slate-400">현재 타수</div>
            <div className="text-xl md:text-2xl font-black font-mono text-emerald-400">
              {currentCpm} <span className="text-xs font-normal text-slate-500">타/분</span>
            </div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] text-slate-400">정확도</div>
            <div className="text-xl md:text-2xl font-black font-mono text-cyan-400">
              {currentAcc}%
            </div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] text-slate-400">최대 콤보</div>
            <div className="text-xl md:text-2xl font-black font-mono text-amber-400">
              {maxCombo}x
            </div>
          </div>
        </div>

        {/* Input box */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            disabled={isFinished}
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isFinished ? '연습이 종료되었습니다.' : '단어를 입력하고 스페이스(Space) 또는 Enter를 누르세요!'}
            className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-400 text-slate-100 px-5 py-4 rounded-2xl text-center text-lg md:text-xl font-bold outline-none transition-all placeholder-slate-500 shadow-inner"
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded font-mono">
            Space / Enter ↵
          </div>
        </div>

        {/* Finished Modal */}
        {isFinished && (
          <div className="mt-6 p-6 bg-slate-950 border border-emerald-500/50 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">60초 챌린지 완료!</h3>
              <p className="text-xs text-slate-400 mt-1">
                최종 기록: <span className="text-emerald-400 font-bold">{currentCpm} 타/분</span>, 정확도{' '}
                <span className="text-cyan-400 font-bold">{currentAcc}%</span>, 완성 단어{' '}
                <span className="text-amber-400 font-bold">{correctWordsCount}개</span>
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={initWords}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-transform hover:scale-105 cursor-pointer shadow-lg"
              >
                다시 도전하기
              </button>
              {onOpenAICoach && (
                <button
                  onClick={onOpenAICoach}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  AI 코치에게 팁 받기
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
