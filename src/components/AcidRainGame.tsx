import React, { useState, useEffect, useRef } from 'react';
import { Heart, Trophy, Zap, RefreshCw, Volume2, VolumeX, ShieldAlert, Award, Sparkles, Flame } from 'lucide-react';
import { WORD_CATEGORIES } from '../data/typingContent';
import { soundManager } from '../utils/sound';

interface FallingWord {
  id: number;
  text: string;
  x: number; // percentage (5% to 85%)
  y: number; // percentage (0% to 100%)
  speed: number;
  isSpecial?: 'bomb' | 'freeze' | 'heal' | 'gold';
}

interface AcidRainGameProps {
  onGameOverRecord?: (score: number, wordsCount: number) => void;
  onOpenAICoach?: () => void;
}

export const AcidRainGame: React.FC<AcidRainGameProps> = ({
  onGameOverRecord,
  onOpenAICoach,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(5);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wordsDestroyed, setWordsDestroyed] = useState(0);

  const [words, setWords] = useState<FallingWord[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isFrozen, setIsFrozen] = useState(false);
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const nextWordId = useRef(1);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnTime = useRef(0);

  // Pool of all words for acid rain
  const allWords = useRef<string[]>([]);

  useEffect(() => {
    // Collect words from all categories
    const pool = WORD_CATEGORIES.flatMap((c) => c.words);
    allWords.current = pool.sort(() => 0.5 - Math.random());
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setLevel(1);
    setLives(5);
    setCombo(0);
    setMaxCombo(0);
    setWordsDestroyed(0);
    setWords([]);
    setCurrentInput('');
    setIsFrozen(false);
    setFreezeTimeLeft(0);
    lastSpawnTime.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Spawn a word
  const spawnWord = () => {
    const wordList = allWords.current.length > 0 ? allWords.current : ['산성비', '컴퓨터', '코딩', '타자'];
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    const x = Math.floor(Math.random() * 75) + 10; // 10% to 85%

    // Base speed increases with level
    const baseSpeed = 0.28 + level * 0.08;
    const speed = baseSpeed + (Math.random() * 0.15 - 0.05);

    // Random special item chance (15%)
    let isSpecial: FallingWord['isSpecial'] = undefined;
    const specialRand = Math.random();
    if (specialRand < 0.04) isSpecial = 'bomb';
    else if (specialRand < 0.08) isSpecial = 'freeze';
    else if (specialRand < 0.12) isSpecial = 'heal';
    else if (specialRand < 0.18) isSpecial = 'gold';

    const newWord: FallingWord = {
      id: nextWordId.current++,
      text,
      x,
      y: 0,
      speed,
      isSpecial,
    };

    setWords((prev) => [...prev, newWord]);
  };

  // Main game loop (runs 60fps)
  useEffect(() => {
    if (!isPlaying || isGameOver || isPaused) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Handle freeze timer
      if (isFrozen) {
        setFreezeTimeLeft((prev) => {
          if (prev <= delta) {
            setIsFrozen(false);
            return 0;
          }
          return prev - delta;
        });
      }

      // Spawn rate based on level
      const spawnInterval = Math.max(1200, 3200 - level * 350);
      if (Date.now() - lastSpawnTime.current > spawnInterval) {
        spawnWord();
        lastSpawnTime.current = Date.now();
      }

      // Update words position
      setWords((prevWords) => {
        const nextWords: FallingWord[] = [];
        let lostLife = false;

        for (const w of prevWords) {
          const moveSpeed = isFrozen ? w.speed * 0.15 : w.speed;
          const newY = w.y + moveSpeed * (delta * 60);

          if (newY >= 92) {
            // Word hit the acid lake!
            lostLife = true;
            soundManager.playAcidSplash();
          } else {
            nextWords.push({ ...w, y: newY });
          }
        }

        if (lostLife) {
          setLives((curr) => {
            const nextLives = curr - 1;
            if (nextLives <= 0) {
              endGame();
            }
            return Math.max(0, nextLives);
          });
          setCombo(0);
          setScreenFlash('bg-rose-500/25');
          setTimeout(() => setScreenFlash(null), 250);
        }

        return nextWords;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isGameOver, isPaused, isFrozen, level]);

  const endGame = () => {
    setIsGameOver(true);
    setIsPlaying(false);
    soundManager.playGameOver();
    onGameOverRecord?.(score, wordsDestroyed);
  };

  // Submit typed word
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const trimmed = currentInput.trim();
      if (!trimmed) return;

      // Find matching word closest to bottom
      const matchIndex = words
        .map((w, idx) => ({ ...w, idx }))
        .filter((w) => w.text === trimmed)
        .sort((a, b) => b.y - a.y)[0];

      if (matchIndex) {
        // Hit success!
        soundManager.playCorrect();
        const matched = words[matchIndex.idx];

        // Handle special word effects
        if (matched.isSpecial === 'bomb') {
          // Explode all words
          soundManager.playCombo();
          setScore((s) => s + words.length * 100);
          setWords([]);
          setScreenFlash('bg-amber-400/30');
          setTimeout(() => setScreenFlash(null), 300);
        } else if (matched.isSpecial === 'freeze') {
          setIsFrozen(true);
          setFreezeTimeLeft(5); // 5 seconds freeze
        } else if (matched.isSpecial === 'heal') {
          setLives((l) => Math.min(5, l + 1));
        }

        // Calculate score with combo
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);

        if (newCombo % 5 === 0) {
          soundManager.playCombo();
        }

        const basePoints = matched.isSpecial === 'gold' ? 300 : 100;
        const comboBonus = Math.floor(basePoints * (1 + newCombo * 0.1));
        const totalAdd = comboBonus * level;

        setScore((s) => s + totalAdd);
        setWordsDestroyed((c) => {
          const nextCount = c + 1;
          // Level up every 8 words
          if (nextCount % 8 === 0) {
            setLevel((lvl) => Math.min(10, lvl + 1));
            soundManager.playCombo();
          }
          return nextCount;
        });

        // Remove the matched word
        setWords((prev) => prev.filter((w) => w.id !== matched.id));
      } else {
        // Mismatch error
        soundManager.playError();
        setCombo(0);
      }

      setCurrentInput('');
    } else {
      soundManager.playKeyClick();
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col h-[700px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl select-none">
      {/* Screen flash on hit or bomb */}
      {screenFlash && (
        <div className={`absolute inset-0 z-30 pointer-events-none transition-opacity ${screenFlash}`} />
      )}

      {/* Top HUD Bar */}
      <div className="z-20 px-4 md:px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
        {/* Lives & Level */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-transform ${
                  i < lives
                    ? 'text-rose-500 fill-rose-500 scale-100'
                    : 'text-slate-700 scale-90 opacity-40'
                }`}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>LEVEL {level}</span>
          </div>

          {isFrozen && (
            <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-400/50 text-sky-300 text-xs font-mono font-bold animate-pulse">
              ❄️ 결빙: {freezeTimeLeft.toFixed(1)}s
            </span>
          )}
        </div>

        {/* Combo & Score */}
        <div className="flex items-center gap-4">
          {combo > 1 && (
            <div className="flex items-center gap-1 text-amber-400 font-extrabold text-sm animate-bounce">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{combo} COMBO!</span>
            </div>
          )}

          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-medium">SCORE</div>
            <div className="text-lg md:text-xl font-black font-mono text-emerald-400 tracking-wider">
              {score.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Falling Arena */}
      <div className="relative flex-1 bg-gradient-to-b from-slate-950 via-slate-900/90 to-emerald-950/40 overflow-hidden">
        {/* Retro Grid Background Lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Start Game Overlay */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20 mb-4 animate-bounce">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              한컴 추억의 <span className="text-emerald-400">산성비 게임</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
              하늘에서 떨어지는 단어들이 산성 용액에 닿기 전에 입력하여 파괴하세요!
              연속으로 맞히면 콤보 보너스가 주어지고, 💣폭탄/❄️빙결/💖회복 특수 단어도 등장합니다.
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base rounded-xl shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              게임 시작 (Start)
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 mb-3">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-rose-400 mb-1">
              GAME OVER
            </h2>
            <p className="text-slate-400 text-sm mb-5">산성비 수위가 위험 수치에 도달했습니다!</p>

            <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-6">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400">최종 점수</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {score.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400">제거한 단어</div>
                <div className="text-lg font-black text-cyan-400 font-mono">
                  {wordsDestroyed}개
                </div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400">최대 콤보</div>
                <div className="text-lg font-black text-amber-400 font-mono">
                  {maxCombo}x
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer text-sm"
              >
                <RefreshCw className="w-4 h-4" /> 다시 도전
              </button>
              {onOpenAICoach && (
                <button
                  onClick={onOpenAICoach}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-teal-400" /> AI 도사에게 조언 받기
                </button>
              )}
            </div>
          </div>
        )}

        {/* Falling Words */}
        {isPlaying &&
          words.map((w) => {
            const isMatchPending =
              currentInput && w.text.startsWith(currentInput.trim());

            return (
              <div
                key={w.id}
                style={{
                  left: `${w.x}%`,
                  top: `${w.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`
                  absolute px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold tracking-wide transition-all shadow-lg
                  ${
                    w.isSpecial === 'bomb'
                      ? 'bg-rose-900/90 text-rose-200 border-2 border-rose-500 animate-pulse shadow-rose-500/50'
                      : w.isSpecial === 'freeze'
                      ? 'bg-sky-900/90 text-sky-200 border-2 border-sky-400 shadow-sky-500/50'
                      : w.isSpecial === 'heal'
                      ? 'bg-emerald-900/90 text-emerald-200 border-2 border-emerald-400 shadow-emerald-500/50'
                      : w.isSpecial === 'gold'
                      ? 'bg-amber-900/90 text-amber-200 border-2 border-amber-400 shadow-amber-500/50'
                      : isMatchPending
                      ? 'bg-teal-500/30 text-teal-200 border-2 border-teal-400 scale-105'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700'
                  }
                `}
              >
                <span className="flex items-center gap-1">
                  {w.isSpecial === 'bomb' && '💣'}
                  {w.isSpecial === 'freeze' && '❄️'}
                  {w.isSpecial === 'heal' && '💖'}
                  {w.isSpecial === 'gold' && '⭐'}
                  <span>{w.text}</span>
                </span>
              </div>
            );
          })}

        {/* Acid Lake at the Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-emerald-600/60 via-teal-700/40 to-transparent pointer-events-none border-t border-emerald-500/30 overflow-hidden">
          {/* Animated Acid Bubbles */}
          <div className="absolute inset-0 flex justify-around items-end pb-1 opacity-70">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-emerald-400/80 animate-ping"
                style={{
                  animationDuration: `${1.2 + (i % 5) * 0.4}s`,
                  animationDelay: `${(i % 4) * 0.3}s`,
                }}
              />
            ))}
          </div>
          <div className="absolute bottom-1 w-full text-center text-[10px] text-emerald-300 font-mono font-bold tracking-widest uppercase opacity-80">
            ⚠️ ACID DANGER ZONE ⚠️
          </div>
        </div>
      </div>

      {/* Bottom Typing Input Dock */}
      <div className="z-20 p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-3">
        <div className="relative w-full max-w-md">
          <input
            ref={inputRef}
            type="text"
            disabled={!isPlaying || isGameOver}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={isPlaying ? '단어를 입력하고 Enter를 누르세요!' : '게임을 시작하세요'}
            className="w-full bg-slate-950 border-2 border-emerald-500/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-slate-100 font-bold px-4 py-3 rounded-xl text-center text-base placeholder-slate-500 outline-none transition-all shadow-inner"
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
            Enter ↵
          </div>
        </div>
      </div>
    </div>
  );
};
