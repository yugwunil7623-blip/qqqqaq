import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, X, Minimize2, Maximize2, Bot, User, RefreshCw, Play } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

interface AICoachChatProps {
  userStats: {
    cpm: number;
    accuracy: number;
    bestCpm: number;
    gamesPlayed: number;
  };
  onApplySentence?: (text: string) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const QUICK_PROMPTS = [
  '🎯 내 현재 타수와 정확도 분석해줘',
  '⚡ 타수를 500타 이상으로 올리는 비결은?',
  '📝 재미있는 잰말놀이(간장공장 등) 연습문장 3개 만들어줘',
  '🧘 장시간 타자 칠 때 손목 스트레칭 방법',
  '💻 개발자 코딩용 특수문자 타이핑 요령',
];

export const AICoachChat: React.FC<AICoachChatProps> = ({
  userStats,
  onApplySentence,
  isOpen: propIsOpen,
  onToggleOpen: propOnToggleOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const toggleOpen = propOnToggleOpen || (() => setInternalIsOpen(!internalIsOpen));

  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `반갑습니다! 🎯 당신의 타자 실력을 한 단계 끌어올려 줄 **AI 타자 스승 젬나이**입니다.\n\n타자 자세 교정, 손가락 배치, 독수리 타법 탈출법, 맞춤형 연습 예문 생성 등 무엇이든 물어보세요!`,
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userStats,
        }),
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류가 발생했습니다.');
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.text || '응답을 생성하지 못했습니다.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: `죄송합니다. 오류가 발생했습니다: ${err.message || '네트워크 상태를 확인해주세요.'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract practice sentence candidates from model response
  const extractPracticeSentences = (text: string) => {
    // Check for quoted sentences ("..." or '...') or bullet items with Korean
    const quotes = text.match(/["'「『]([^"'」』\n]{10,80})["'」』]/g);
    if (!quotes) return [];
    return quotes.map((q) => q.replace(/["'「『」』]/g, '').trim()).slice(0, 3);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-medium rounded-full shadow-[0_8px_30px_rgb(13,148,136,0.4)] hover:shadow-[0_10px_35px_rgb(13,148,136,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 group border border-teal-400/40 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-teal-100 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
          </div>
          <span className="text-sm font-semibold tracking-wide">AI 타자 코치</span>
          <span className="bg-emerald-800/80 text-[11px] px-2 py-0.5 rounded-full text-emerald-200 border border-emerald-500/30">
            Gemini
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl border border-slate-700/80 backdrop-blur-xl bg-slate-900/95 text-slate-100 rounded-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-10'
              : 'bottom-4 right-4 md:bottom-6 md:right-6 w-[92vw] sm:w-[440px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-100">타자 도사 젬나이</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono border border-emerald-500/30">
                    gemini-3.8-flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  실시간 타자 코칭 & 맞춤 예문 생성기
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title={isExpanded ? '축소' : '확대'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleOpen}
                className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats Banner inside Chat */}
          <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span className="text-slate-400">현재 내 기록:</span>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-emerald-400 font-bold">{userStats.cpm} 타/분</span>
              <span className="text-cyan-400 font-bold">{userStats.accuracy}%</span>
              <span className="text-amber-400 font-bold">최고 {userStats.bestCpm}타</span>
            </div>
          </div>

          {/* Messages Thread (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              const practiceOptions = !isUser ? extractPracticeSentences(m.content) : [];

              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-700/20'
                        : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/60'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {/* Quick Apply Practice Sentences Button if detected */}
                    {practiceOptions.length > 0 && onApplySentence && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/80 space-y-1.5">
                        <div className="text-[11px] font-semibold text-teal-300 flex items-center gap-1">
                          <Play className="w-3 h-3" /> 추천 예문으로 바로 연습하기:
                        </div>
                        {practiceOptions.map((sentence, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              onApplySentence(sentence);
                              toggleOpen();
                            }}
                            className="w-full text-left p-2 rounded-lg bg-slate-900/90 hover:bg-teal-950/60 border border-slate-700 hover:border-teal-500 text-xs text-slate-300 hover:text-teal-200 transition-colors flex items-center justify-between group"
                          >
                            <span className="truncate pr-2">"{sentence}"</span>
                            <span className="shrink-0 text-[10px] font-medium text-teal-400 group-hover:translate-x-0.5 transition-transform">
                              선택 →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-1.5 ${
                        isUser ? 'text-emerald-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center text-slate-400 text-xs py-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-2 text-slate-400 text-xs">도사가 답변을 작성하고 있습니다...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 text-[11px] border border-slate-700 hover:border-teal-500/50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="타자 조언을 구하거나 '연습 문장 만들어줘'라고 해보세요..."
              className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
