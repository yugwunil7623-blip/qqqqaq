import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  CloudRain,
  FileText,
  Zap,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  HelpCircle,
  BarChart3,
  Bot,
  Flame,
} from 'lucide-react';
import { AcidRainGame } from './components/AcidRainGame';
import { SentencePractice } from './components/SentencePractice';
import { WordPractice } from './components/WordPractice';
import { AICustomChallenge } from './components/AICustomChallenge';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { AICoachChat } from './components/AICoachChat';
import { StatsModal, UserStatsData, getRankTitle } from './components/StatsModal';
import { soundManager } from './utils/sound';

type GameTab = 'acid_rain' | 'sentence' | 'word' | 'ai_custom';

export default function App() {
  const [activeTab, setActiveTab] = useState<GameTab>('sentence');
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Active key pressed and target key
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [targetChar, setTargetChar] = useState<string>('');

  // Custom sentence sent from AI Coach or AI Custom Challenge
  const [selectedCustomSentence, setSelectedCustomSentence] = useState<string | null>(null);

  // User Stats
  const [stats, setStats] = useState<UserStatsData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typemaster_user_stats');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {
      cpm: 0,
      accuracy: 100,
      bestCpm: 0,
      gamesPlayed: 0,
      totalWords: 0,
      totalSentences: 0,
      history: [],
    };
  });

  useEffect(() => {
    setIsMuted(soundManager.getMuted());
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Global keydown listener to highlight virtual keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKey(e.key);
    };
    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Save stats to localStorage
  const saveStats = (newStats: UserStatsData) => {
    setStats(newStats);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typemaster_user_stats', JSON.stringify(newStats));
    }
  };

  // Record sentence result
  const recordSentenceResult = (cpm: number, accuracy: number) => {
    if (cpm <= 0) return;
    const newStats: UserStatsData = {
      ...stats,
      cpm,
      accuracy: Math.round((stats.accuracy * stats.totalSentences + accuracy) / (stats.totalSentences + 1)),
      bestCpm: Math.max(stats.bestCpm, cpm),
      totalSentences: stats.totalSentences + 1,
      gamesPlayed: stats.gamesPlayed + 1,
      history: [
        {
          type: '문장 연습',
          cpm,
          accuracy,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...stats.history.slice(0, 9),
      ],
    };
    saveStats(newStats);
  };

  // Record word practice result
  const recordWordResult = (cpm: number, accuracy: number) => {
    if (cpm <= 0) return;
    const newStats: UserStatsData = {
      ...stats,
      cpm,
      accuracy: Math.round((stats.accuracy + accuracy) / 2),
      bestCpm: Math.max(stats.bestCpm, cpm),
      totalWords: stats.totalWords + 10,
      gamesPlayed: stats.gamesPlayed + 1,
      history: [
        {
          type: '단어 연습',
          cpm,
          accuracy,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...stats.history.slice(0, 9),
      ],
    };
    saveStats(newStats);
  };

  // Record Acid Rain result
  const recordAcidRainResult = (score: number, wordsCount: number) => {
    const estimatedCpm = Math.min(800, wordsCount * 25);
    const newStats: UserStatsData = {
      ...stats,
      bestCpm: Math.max(stats.bestCpm, estimatedCpm),
      totalWords: stats.totalWords + wordsCount,
      gamesPlayed: stats.gamesPlayed + 1,
      history: [
        {
          type: `산성비 (${score.toLocaleString()}점)`,
          cpm: estimatedCpm,
          accuracy: 95,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...stats.history.slice(0, 9),
      ],
    };
    saveStats(newStats);
  };

  const handleApplyCustomSentence = (text: string) => {
    setSelectedCustomSentence(text);
    setActiveTab('sentence');
  };

  const handleResetStats = () => {
    const emptyStats: UserStatsData = {
      cpm: 0,
      accuracy: 100,
      bestCpm: 0,
      gamesPlayed: 0,
      totalWords: 0,
      totalSentences: 0,
      history: [],
    };
    saveStats(emptyStats);
  };

  const rank = getRankTitle(stats.bestCpm);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-300 bg-clip-text text-transparent">
                  타자 마스터 <span className="text-emerald-400 text-sm font-bold font-mono">TypeMaster</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI 타자 연습
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                한컴 산성비 & 문장 연습 & Gemini AI 타자 코치
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div
            onClick={() => setShowStatsModal(true)}
            className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">최근:</span>
              <span className="font-mono font-bold text-emerald-400">{stats.cpm} 타</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">최고:</span>
              <span className="font-mono font-bold text-amber-400">{stats.bestCpm} 타</span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
              title={isMuted ? '소리 켜기' : '소리 끄기'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => setShowKeyboard(!showKeyboard)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                showKeyboard
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="가상 키보드 표시/숨기기"
            >
              <Keyboard className="w-4 h-4" />
              <span className="hidden lg:inline">{showKeyboard ? '키보드 On' : '키보드 Off'}</span>
            </button>

            <button
              onClick={() => setShowStatsModal(true)}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
              title="내 타자 기록"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={() => setIsAIChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-transform hover:scale-105 active:scale-95 shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-teal-200" />
              <span>AI 코치</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'sentence', label: '문장 연습 (명언/시/잰말)', icon: FileText, color: 'text-emerald-400' },
            { id: 'acid_rain', label: '추억의 산성비 게임', icon: CloudRain, color: 'text-cyan-400' },
            { id: 'word', label: '단어 연습 (60초 챌린지)', icon: Zap, color: 'text-amber-400' },
            { id: 'ai_custom', label: 'AI 맞춤 예문 생성', icon: Sparkles, color: 'text-purple-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as GameTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? tab.color : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* Active Tab Screen */}
        {activeTab === 'sentence' && (
          <SentencePractice
            customSentence={selectedCustomSentence}
            onActiveKeyChange={setActiveKey}
            onTargetCharChange={setTargetChar}
            onRecordResult={recordSentenceResult}
            onOpenAICoach={() => setIsAIChatOpen(true)}
          />
        )}

        {activeTab === 'acid_rain' && (
          <AcidRainGame
            onGameOverRecord={recordAcidRainResult}
            onOpenAICoach={() => setIsAIChatOpen(true)}
          />
        )}

        {activeTab === 'word' && (
          <WordPractice
            onRecordResult={recordWordResult}
            onOpenAICoach={() => setIsAIChatOpen(true)}
          />
        )}

        {activeTab === 'ai_custom' && (
          <AICustomChallenge
            onSelectSentence={(sentence) => handleApplyCustomSentence(sentence)}
          />
        )}

        {/* Interactive Virtual Keyboard */}
        {showKeyboard && (
          <div className="pt-4 border-t border-slate-800/80">
            <VirtualKeyboard activeKey={activeKey} targetChar={targetChar} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <p>타자 마스터 (TypeMaster) • 한국어 2벌식 & 영문 타이핑 연습 및 Gemini AI 코칭</p>
      </footer>

      {/* Gemini AI Multi-turn Chatbot Drawer / Widget */}
      <AICoachChat
        isOpen={isAIChatOpen}
        onToggleOpen={() => setIsAIChatOpen(!isAIChatOpen)}
        userStats={{
          cpm: stats.cpm,
          accuracy: stats.accuracy,
          bestCpm: stats.bestCpm,
          gamesPlayed: stats.gamesPlayed,
        }}
        onApplySentence={(sentence) => {
          handleApplyCustomSentence(sentence);
          setIsAIChatOpen(false);
        }}
      />

      {/* User Stats Modal */}
      {showStatsModal && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStatsModal(false)}
          onResetStats={handleResetStats}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}
    </div>
  );
}
