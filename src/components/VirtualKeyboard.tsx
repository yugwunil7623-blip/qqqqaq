import React from 'react';

interface VirtualKeyboardProps {
  activeKey?: string | null;
  targetChar?: string;
  isCompact?: boolean;
}

interface KeyItem {
  key: string;
  shift?: string;
  ko?: string;
  koShift?: string;
  finger: number;
  width?: string;
  label?: string;
  home?: boolean;
}

// Finger zones for standard touch typing
// 1: Left Pinky, 2: Left Ring, 3: Left Middle, 4: Left Index, 5: Right Index, 6: Right Middle, 7: Right Ring, 8: Right Pinky
const KEYBOARD_ROWS: KeyItem[][] = [
  [
    { key: '`', shift: '~', ko: '', finger: 1, width: 'w-10' },
    { key: '1', shift: '!', ko: '', finger: 1 },
    { key: '2', shift: '@', ko: '', finger: 2 },
    { key: '3', shift: '#', ko: '', finger: 3 },
    { key: '4', shift: '$', ko: '', finger: 4 },
    { key: '5', shift: '%', ko: '', finger: 4 },
    { key: '6', shift: '^', ko: '', finger: 5 },
    { key: '7', shift: '&', ko: '', finger: 5 },
    { key: '8', shift: '*', ko: '', finger: 6 },
    { key: '9', shift: '(', ko: '', finger: 7 },
    { key: '0', shift: ')', ko: '', finger: 8 },
    { key: '-', shift: '_', ko: '', finger: 8 },
    { key: '=', shift: '+', ko: '', finger: 8 },
    { key: 'Backspace', shift: '', ko: '', finger: 8, width: 'w-18', label: '← Back' },
  ],
  [
    { key: 'Tab', shift: '', ko: '', finger: 1, width: 'w-14', label: 'Tab' },
    { key: 'q', shift: 'Q', ko: 'ㅂ', koShift: 'ㅃ', finger: 1 },
    { key: 'w', shift: 'W', ko: 'ㅈ', koShift: 'ㅉ', finger: 2 },
    { key: 'e', shift: 'E', ko: 'ㄷ', koShift: 'ㄸ', finger: 3 },
    { key: 'r', shift: 'R', ko: 'ㄱ', koShift: 'ㄲ', finger: 4 },
    { key: 't', shift: 'T', ko: 'ㅅ', koShift: 'ㅆ', finger: 4 },
    { key: 'y', shift: 'Y', ko: 'ㅛ', koShift: '', finger: 5 },
    { key: 'u', shift: 'U', ko: 'ㅕ', koShift: '', finger: 5 },
    { key: 'i', shift: 'I', ko: 'ㅑ', koShift: '', finger: 6 },
    { key: 'o', shift: 'O', ko: 'ㅐ', koShift: 'ㅒ', finger: 7 },
    { key: 'p', shift: 'P', ko: 'ㅔ', koShift: 'ㅖ', finger: 8 },
    { key: '[', shift: '{', ko: '', finger: 8 },
    { key: ']', shift: '}', ko: '', finger: 8 },
    { key: '\\', shift: '|', ko: '', finger: 8, width: 'w-14' },
  ],
  [
    { key: 'CapsLock', shift: '', ko: '', finger: 1, width: 'w-16', label: 'Caps' },
    { key: 'a', shift: 'A', ko: 'ㅁ', koShift: '', finger: 1 },
    { key: 's', shift: 'S', ko: 'ㄴ', koShift: '', finger: 2 },
    { key: 'd', shift: 'D', ko: 'ㅇ', koShift: '', finger: 3 },
    { key: 'f', shift: 'F', ko: 'ㄹ', koShift: '', finger: 4, home: true },
    { key: 'g', shift: 'G', ko: 'ㅎ', koShift: '', finger: 4 },
    { key: 'h', shift: 'H', ko: 'ㅗ', koShift: '', finger: 5 },
    { key: 'j', shift: 'J', ko: 'ㅓ', koShift: '', finger: 5, home: true },
    { key: 'k', shift: 'K', ko: 'ㅏ', koShift: '', finger: 6 },
    { key: 'l', shift: 'L', ko: 'ㅣ', koShift: '', finger: 7 },
    { key: ';', shift: ':', ko: '', finger: 8 },
    { key: "'", shift: '"', ko: '', finger: 8 },
    { key: 'Enter', shift: '', ko: '', finger: 8, width: 'w-20', label: 'Enter ↵' },
  ],
  [
    { key: 'ShiftLeft', shift: '', ko: '', finger: 1, width: 'w-22', label: '⇧ Shift' },
    { key: 'z', shift: 'Z', ko: 'ㅋ', koShift: '', finger: 1 },
    { key: 'x', shift: 'X', ko: 'ㅌ', koShift: '', finger: 2 },
    { key: 'c', shift: 'C', ko: 'ㅊ', koShift: '', finger: 3 },
    { key: 'v', shift: 'V', ko: 'ㅍ', koShift: '', finger: 4 },
    { key: 'b', shift: 'B', ko: 'ㅠ', koShift: '', finger: 4 },
    { key: 'n', shift: 'N', ko: 'ㅜ', koShift: '', finger: 5 },
    { key: 'm', shift: 'M', ko: 'ㅡ', koShift: '', finger: 5 },
    { key: ',', shift: '<', ko: '', finger: 6 },
    { key: '.', shift: '>', ko: '', finger: 7 },
    { key: '/', shift: '?', ko: '', finger: 8 },
    { key: 'ShiftRight', shift: '', ko: '', finger: 8, width: 'w-22', label: '⇧ Shift' },
  ],
  [
    { key: 'Ctrl', shift: '', ko: '', finger: 1, width: 'w-16', label: 'Ctrl' },
    { key: 'Alt', shift: '', ko: '', finger: 1, width: 'w-14', label: 'Alt' },
    { key: ' ', shift: ' ', ko: '', finger: 0, width: 'flex-1', label: 'Space Bar' },
    { key: '한/영', shift: '', ko: '', finger: 8, width: 'w-16', label: '한/영' },
    { key: 'CtrlRight', shift: '', ko: '', finger: 8, width: 'w-16', label: 'Ctrl' },
  ],
];

// Color mapping for fingers
const FINGER_COLORS: Record<number, { border: string; bg: string; dot: string; text: string }> = {
  0: { border: 'border-slate-700/60', bg: 'bg-slate-800/80', dot: 'bg-slate-400', text: '엄지' },
  1: { border: 'border-rose-500/40', bg: 'bg-rose-950/20', dot: 'bg-rose-400', text: '왼손 새끼' },
  2: { border: 'border-amber-500/40', bg: 'bg-amber-950/20', dot: 'bg-amber-400', text: '왼손 약지' },
  3: { border: 'border-emerald-500/40', bg: 'bg-emerald-950/20', dot: 'bg-emerald-400', text: '왼손 중지' },
  4: { border: 'border-sky-500/40', bg: 'bg-sky-950/20', dot: 'bg-sky-400', text: '왼손 검지' },
  5: { border: 'border-blue-500/40', bg: 'bg-blue-950/20', dot: 'bg-blue-400', text: '오른손 검지' },
  6: { border: 'border-indigo-500/40', bg: 'bg-indigo-950/20', dot: 'bg-indigo-400', text: '오른손 중지' },
  7: { border: 'border-purple-500/40', bg: 'bg-purple-950/20', dot: 'bg-purple-400', text: '오른손 약지' },
  8: { border: 'border-pink-500/40', bg: 'bg-pink-950/20', dot: 'bg-pink-400', text: '오른손 새끼' },
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeKey,
  targetChar,
  isCompact = false,
}) => {
  const normalizedActive = activeKey ? activeKey.toLowerCase() : null;

  return (
    <div className="w-full max-w-4xl mx-auto select-none bg-slate-900/95 border border-slate-800 rounded-2xl p-3 md:p-5 shadow-2xl backdrop-blur-md">
      {/* Finger Legend Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">손가락 홈 포지션 가이드</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">(F, J 돌기 기준 위치)</span>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" />새끼</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />약지</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />중지</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-400" />검지</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" />엄지(스페이스)</span>
        </div>
      </div>

      {/* Keyboard Grid */}
      <div className="space-y-1.5">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 md:gap-1.5 justify-center">
            {row.map((k, colIdx) => {
              const isPressed =
                normalizedActive === k.key.toLowerCase() ||
                (k.shift && normalizedActive === k.shift.toLowerCase()) ||
                (k.ko && normalizedActive === k.ko) ||
                (k.koShift && normalizedActive === k.koShift);

              const isTarget =
                targetChar &&
                (targetChar === k.ko ||
                  targetChar === k.koShift ||
                  targetChar.toLowerCase() === k.key.toLowerCase() ||
                  targetChar === k.shift ||
                  (targetChar === ' ' && k.key === ' '));

              const fingerStyle = FINGER_COLORS[k.finger] || FINGER_COLORS[0];
              const widthClass = k.width || 'w-10 sm:w-12 md:w-14';

              return (
                <div
                  key={colIdx}
                  className={`
                    relative flex flex-col items-center justify-center h-10 sm:h-12 md:h-13 rounded-lg text-xs md:text-sm font-mono transition-all duration-75
                    ${widthClass}
                    ${k.home ? 'border-b-4 border-b-sky-400' : ''}
                    ${
                      isPressed
                        ? 'bg-amber-400 text-slate-950 font-bold scale-95 shadow-[0_0_15px_rgba(251,191,36,0.6)] z-10'
                        : isTarget
                        ? 'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-200 animate-pulse scale-[1.02] shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                        : `${fingerStyle.bg} border ${fingerStyle.border} text-slate-300 hover:border-slate-500`
                    }
                  `}
                >
                  {/* Top-Right: Korean Hangul character */}
                  {k.ko && (
                    <span className="absolute top-1 right-1.5 text-xs font-bold text-amber-300/90">
                      {k.ko}
                      {k.koShift && <span className="text-[10px] text-amber-400/60 ml-0.5">{k.koShift}</span>}
                    </span>
                  )}

                  {/* Top-Left: Shift symbol */}
                  {k.shift && (
                    <span className="absolute top-1 left-1.5 text-[10px] text-slate-500">
                      {k.shift}
                    </span>
                  )}

                  {/* Center / Bottom label */}
                  <span className={`${k.label ? 'text-[11px] font-sans font-medium' : 'text-sm font-bold'} mt-1`}>
                    {k.label || k.key.toUpperCase()}
                  </span>

                  {/* F / J tactile bump */}
                  {k.home && (
                    <span className="absolute bottom-1 w-3 h-0.5 bg-sky-300 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
