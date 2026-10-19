/**
 * Typing contents: Korean words, sentences, proverbs, idioms, literature, tech words, and English
 */

export interface WordCategory {
  id: string;
  name: string;
  desc: string;
  words: string[];
}

export const WORD_CATEGORIES: WordCategory[] = [
  {
    id: 'korean_common',
    name: '기본 일상 단어',
    desc: '자주 쓰이는 기본 한국어 단어',
    words: [
      '하늘', '바람', '구름', '사랑', '바다', '나무', '햇살', '달빛', '노을', '기쁨',
      '행복', '미소', '추억', '소망', '열정', '도전', '용기', '지혜', '배움', '친구',
      '가족', '여행', '음악', '미술', '커피', '편지', '약속', '선물', '시작', '성공',
      '새벽', '아침', '저녁', '별빛', '봄날', '여름', '가을', '겨울', '희망', '마음',
      '꽃잎', '노래', '이야기', '상상', '자유', '평화', '감사', '배려', '정성', '꿈길'
    ],
  },
  {
    id: 'korean_tech',
    name: 'IT & 개발자 용어',
    desc: '프로그래머와 디지털 환경 필수 단어',
    words: [
      '컴퓨터', '알고리즘', '함수', '변수', '데이터', '네트워크', '데이터베이스', '클라우드',
      '인공지능', '머신러닝', '서버', '클라이언트', '프론트엔드', '백엔드', '리액트', '타입스크립트',
      '깃허브', '커밋', '브랜치', '디버깅', '배포', '인터페이스', '비동기', '컴포넌트', '스택',
      '큐', '트리', '해시맵', '파이썬', '자바스크립트', '최적화', '보안', '트래픽', '캐시', '프레임워크'
    ],
  },
  {
    id: 'korean_idioms',
    name: '사자성어 & 고사성어',
    desc: '삶의 지혜가 담긴 사자성어',
    words: [
      '일취월장', '고진감래', '전화위복', '대기만성', '마부위침', '우공이산', '온고지신', '백절불굴',
      '유비무환', '동고동락', '각골난망', '결초보은', '금상첨화', '다다익선', '단도직입', '역지사지',
      '호연지기', '형설지공', '청출어람', '초지일관', '파죽지세', '풍수지탄', '화룡점정', '환골탈태'
    ],
  },
  {
    id: 'korean_pure',
    name: '아름다운 순우리말',
    desc: '맑고 고운 우리 옛말과 단어',
    words: [
      '미르', '가람', '온새미로', '시나브로', '윤슬', '너울', '늘봄', '다솜', '라온', '마루',
      '바론', '새솔', '아람', '자람', '푸르미', '하람', '한울', '혜윰', '도담도담', '소담하다',
      '달보드레', '모꼬지', '물비늘', '바람꽃', '비나리', '산들바람', '여우비', '윤슬', '하늬바람'
    ],
  },
  {
    id: 'english_common',
    name: 'English Words',
    desc: 'Essential English Vocabulary',
    words: [
      'galaxy', 'matrix', 'rhythm', 'harmony', 'whisper', 'freedom', 'inspire', 'journey',
      'crystal', 'shadow', 'fortune', 'silence', 'brave', 'courage', 'diamond', 'horizon',
      'mystery', 'radiant', 'passion', 'explore', 'creative', 'infinite', 'serenade', 'twilight'
    ],
  },
];

export interface SentenceItem {
  id: string;
  category: 'literature' | 'quote' | 'proverb' | 'twister' | 'code';
  title: string;
  author?: string;
  text: string;
}

export const SENTENCE_LIST: SentenceItem[] = [
  {
    id: 'lit-1',
    category: 'literature',
    title: '서시 (序詩)',
    author: '윤동주',
    text: '죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를, 잎새에 이는 바람에도 나는 괴로워했다.',
  },
  {
    id: 'lit-2',
    category: 'literature',
    title: '별 헤는 밤',
    author: '윤동주',
    text: '계절이 지나가는 하늘에는 가을로 가득 차 있습니다. 나는 아무 걱정도 없이 가을 속의 별들을 다 헤일 듯합니다.',
  },
  {
    id: 'lit-3',
    category: 'literature',
    title: '훈민정음 언해본 서문',
    author: '세종대왕',
    text: '나랏말싸미 듕귁에 달아 문자와로 서르 사맛디 아니할쎄, 이런 젼차로 어린 백셩이 니르고져 홇 배 이셔도.',
  },
  {
    id: 'lit-4',
    category: 'literature',
    title: '진달래꽃',
    author: '김소월',
    text: '나 보기가 역겨워 가실 때에는 말없이 고이 보내 드리우리다. 영변에 약산 진달래꽃 아름 따다 가실 길에 뿌리우리다.',
  },
  {
    id: 'lit-5',
    category: 'literature',
    title: '어린 왕자',
    author: '생텍쥐페리',
    text: '가장 중요한 것은 눈에 보이지 않아. 마음으로 보아야만 분명하게 볼 수 있어.',
  },
  {
    id: 'quote-1',
    category: 'quote',
    title: '스티브 잡스 명언',
    author: '스티브 잡스',
    text: '계속 갈망하라, 여전히 우직하게 살아가라. 위대한 일을 하는 유일한 방법은 당신이 하는 일을 사랑하는 것이다.',
  },
  {
    id: 'quote-2',
    category: 'quote',
    title: '아인슈타인 명언',
    author: '알베르트 아인슈타인',
    text: '인생은 자전거를 타는 것과 같다. 균형을 잡으려면 계속해서 앞으로 나아가야 한다.',
  },
  {
    id: 'quote-3',
    category: 'quote',
    title: '헨리 포드 명언',
    author: '헨리 포드',
    text: '당신이 할 수 있다고 믿든 할 수 없다고 믿든, 당신이 믿는 대로 될 것이다.',
  },
  {
    id: 'proverb-1',
    category: 'proverb',
    title: '한국의 옛 속담',
    text: '천 리 길도 한 걸음부터 시작되고, 티끌 모아 태산이 되듯 타자 연습도 매일의 정성이다.',
  },
  {
    id: 'proverb-2',
    category: 'proverb',
    title: '우리말 속담',
    text: '가는 말이 고와야 오는 말이 곱고, 낮말은 새가 듣고 밤말은 쥐가 듣는다.',
  },
  {
    id: 'twister-1',
    category: 'twister',
    title: '간장공장 공장장',
    text: '간장 공장 공장장은 강 공장장이고, 된장 공장 공장장은 장 공장장이다.',
  },
  {
    id: 'twister-2',
    category: 'twister',
    title: '내가 그린 기린 그림',
    text: '내가 그린 기린 그림은 잘 그린 기린 그림이고, 네가 그린 기린 그림은 못 그린 기린 그림이다.',
  },
  {
    id: 'twister-3',
    category: 'twister',
    title: '경찰청 철창살',
    text: '경찰청 쇠창살 외철창살, 검찰청 쇠창살 쌍철창살.',
  },
  {
    id: 'code-1',
    category: 'code',
    title: '클린 코드의 철학',
    author: '로버트 C. 마틴',
    text: '코드는 작성하는 시간보다 읽히는 시간이 훨씬 길다. 언제나 읽기 쉬운 코드를 작성하라.',
  },
  {
    id: 'code-2',
    category: 'code',
    title: '개발자의 격언',
    text: '작동하지 않는 코드는 버그지만, 왜 작동하는지 모르는 코드는 더 큰 재앙이다.',
  },
];
