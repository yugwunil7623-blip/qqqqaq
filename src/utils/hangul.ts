/**
 * Hangul syllable decomposition and keystroke/stroke count calculation
 * Standard Korean Typing Test stroke rules (2-beolsik)
 */

// 초성 19자
const CHO = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// 중성 21자
const JUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

// 종성 28자 (index 0 is empty)
const JONG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// Keystrokes for Cho
const CHO_STROKES: Record<string, number> = {
  'ㄱ': 1, 'ㄲ': 2, 'ㄴ': 1, 'ㄷ': 1, 'ㄸ': 2, 'ㄹ': 1, 'ㅁ': 1, 'ㅂ': 1, 'ㅃ': 2, 'ㅅ': 1,
  'ㅆ': 2, 'ㅇ': 1, 'ㅈ': 1, 'ㅉ': 2, 'ㅊ': 1, 'ㅋ': 1, 'ㅌ': 1, 'ㅍ': 1, 'ㅎ': 1,
};

// Keystrokes for Jung
const JUNG_STROKES: Record<string, number> = {
  'ㅏ': 1, 'ㅐ': 1, 'ㅑ': 1, 'ㅒ': 2, 'ㅓ': 1, 'ㅔ': 1, 'ㅕ': 1, 'ㅖ': 2, 'ㅗ': 1, 'ㅘ': 2,
  'ㅙ': 3, 'ㅚ': 2, 'ㅛ': 1, 'ㅜ': 1, 'ㅝ': 2, 'ㅞ': 3, 'ㅟ': 2, 'ㅠ': 1, 'ㅡ': 1, 'ㅢ': 2, 'ㅣ': 1,
};

// Keystrokes for Jong
const JONG_STROKES: Record<string, number> = {
  '': 0, 'ㄱ': 1, 'ㄲ': 2, 'ㄳ': 2, 'ㄴ': 1, 'ㄵ': 2, 'ㄶ': 2, 'ㄷ': 1, 'ㄹ': 1, 'ㄺ': 2,
  'ㄻ': 2, 'ㄼ': 2, 'ㄽ': 2, 'ㄾ': 2, 'ㄿ': 2, 'ㅀ': 2, 'ㅁ': 1, 'ㅂ': 1, 'ㅄ': 2, 'ㅅ': 1,
  'ㅆ': 2, 'ㅇ': 1, 'ㅈ': 1, 'ㅊ': 1, 'ㅋ': 1, 'ㅌ': 1, 'ㅍ': 1, 'ㅎ': 1,
};

/**
 * Calculates strokes for a single character
 */
export function getCharStrokeCount(char: string): number {
  if (!char) return 0;
  const code = char.charCodeAt(0);

  // Hangul Syllables (가 ~ 힣)
  if (code >= 0xac00 && code <= 0xd7a3) {
    const syllableIndex = code - 0xac00;
    const choIndex = Math.floor(syllableIndex / (21 * 28));
    const jungIndex = Math.floor((syllableIndex % (21 * 28)) / 28);
    const jongIndex = syllableIndex % 28;

    const cho = CHO[choIndex];
    const jung = JUNG[jungIndex];
    const jong = JONG[jongIndex];

    const choCount = CHO_STROKES[cho] || 1;
    const jungCount = JUNG_STROKES[jung] || 1;
    const jongCount = JONG_STROKES[jong] || 0;

    return choCount + jungCount + jongCount;
  }

  // Hangul Jamo alone (ㄱ ~ ㅣ)
  if (code >= 0x3131 && code <= 0x3163) {
    return CHO_STROKES[char] || JUNG_STROKES[char] || 1;
  }

  // Uppercase English or shift characters
  if (/[A-Z!@#$%^&*()_+{}|:"<>?]/.test(char)) {
    return 2; // Shift + key
  }

  // Normal letters, digits, spaces, punctuation
  return 1;
}

/**
 * Calculate total strokes for a full string
 */
export function getTotalStrokeCount(text: string): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    count += getCharStrokeCount(text[i]);
  }
  return count;
}

/**
 * Calculate CPM (타수 per minute)
 * strokes typed divided by elapsed minutes
 */
export function calculateCPM(strokes: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0.1 || strokes <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(strokes / minutes);
}

/**
 * Calculate accuracy % between typed and target text
 */
export function calculateAccuracy(target: string, typed: string): number {
  if (!typed || typed.length === 0) return 100;
  let correct = 0;
  const len = Math.min(target.length, typed.length);
  for (let i = 0; i < len; i++) {
    if (target[i] === typed[i]) {
      correct++;
    }
  }
  return Math.max(0, Math.round((correct / typed.length) * 100));
}
