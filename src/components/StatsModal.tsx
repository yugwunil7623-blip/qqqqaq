import React from 'react';
import { Trophy, Zap, Target, Award, Clock, History, RotateCcw, X, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/sound';

export interface UserStatsData {
  cpm: number;
  accuracy: number;
  bestCpm: number;
  gamesPlayed: number;
  totalWords: number;
  totalSentences: number;
  history: {
    type: string;
    cpm: number;
    accuracy: number;
    date: string;
  }[];
}

interface StatsModalProps {
  stats: UserStatsData;
  onClose: () => void;
  onResetStats: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function getRankTitle(cpm: number): { title: string; desc: string; badgeColor: string } {
  if (cpm >= 700) {
    return { title: '타자의 신 (God of Typing)', desc: '손가락이 보이지 않는 경지!', badgeColor: 'from-amber-400 to-rose-500' };
  } else if (cpm >= 500) {
    return { title: '타자 달인 (Grandmaster)', desc: '빛의 속도로 타이핑하는 실력자', badgeColor: 'from-purple-500 to-pink-500' };
  } else if (cpm >= 350) {
    return { title: '타자 고수 (Expert)', desc: '오타 없이 안정적인 고급 타자', badgeColor: 'from-emerald-400 to-teal-500' };
  } else if (cpm >= 200) {
    return { title: '타자 중급자 (Intermediate)', desc: '홈 포지션이 익숙해진 숙련자', badgeColor: 'from-sky-400 to-blue-500' };
  } else {
    return { title: '타자 새싹 (Beginner)', desc: '꾸준한 연습으로 매일 성장하는 단계', badgeColor: 'from-slate-400 to-slate-500' };
  }
}

export const StatsModal: React.FC<StatsModalProps> = ({
  stats,
  onClose,
  onResetStats,
  isMuted,
  onToggleMute,
}) => {
  const rank = getRankTitle(stats.bestCpm);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${rank.badgeColor} flex items-center justify-center text-slate-950 font-black shadow-lg`}>
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-100">{rank.title}</h2>
            </div>
            <p className="text-xs text-slate-400">{rank.desc}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>최고 타수</span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {stats.bestCpm} <span className="text-xs font-normal text-slate-500">타/분</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>평균 정확도</span>
            </div>
            <div className="text-2xl font-black font-mono text-cyan-400">
              {stats.accuracy}%
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span>완료한 문장</span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-400">
              {stats.totalSentences}회
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>총 플레이 게임</span>
            </div>
            <div className="text-2xl font-black font-mono text-purple-400">
              {stats.gamesPlayed}회
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="mb-6">
          <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> 최근 연습 기록
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 max-h-36 overflow-y-auto space-y-2">
            {stats.history.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">아직 기록된 연습 내역이 없습니다.</p>
            ) : (
              stats.history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/60 text-slate-300">
                  <span className="font-medium text-slate-400">{h.type}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-emerald-400 font-bold">{h.cpm} 타</span>
                    <span className="text-cyan-400">{h.accuracy}%</span>
                    <span className="text-slate-500 text-[10px]">{h.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={onToggleMute}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>효과음 {isMuted ? '꺼짐' : '켜짐'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('모든 타자 기록을 초기화하시겠습니까?')) {
                onResetStats();
              }
            }}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기록 초기화</span>
          </button>
        </div>
      </div>
    </div>
  );
};
