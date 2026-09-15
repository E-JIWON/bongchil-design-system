/**
 * 랜덤 닉네임 생성기 — 형용사 + 명사 + 4자리 숫자 (예: 조용한토끼_3174)
 *
 * 한글 조합이라 unique-names-generator 등 영문 라이브러리 대신 자체 사전으로 구성.
 * 다락방(방명록) 낙서에 이름을 적기 번거로운 방문자를 위한 '↻ 랜덤' 옵션.
 */

const ADJECTIVES = [
  "조용한", "따뜻한", "포근한", "수줍은", "씩씩한", "느긋한", "다정한", "엉뚱한",
  "상냥한", "반짝이는", "졸린", "배고픈", "신난", "까칠한", "궁금한", "귀여운",
  "용감한", "몽글한", "나른한", "장난꾸러기", "부지런한", "덤벙대는", "새침한", "명랑한",
];

const NOUNS = [
  "토끼", "고양이", "너구리", "다람쥐", "수달", "판다", "여우", "고슴도치",
  "물개", "부엉이", "참새", "오리", "곰돌이", "펭귄", "두더지", "햄스터",
  "강아지", "문어", "고래", "달팽이", "코알라", "라쿤", "병아리", "청설모",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 형용사 + 명사 + 4자리 숫자로 된 랜덤 닉네임 반환 */
export function randomNickname(): string {
  const num = Math.floor(Math.random() * 9000) + 1000; // 1000 ~ 9999
  return `${pick(ADJECTIVES)}${pick(NOUNS)}_${num}`;
}

/** 형용사 + 명사만 랜덤 조합 (숫자 없음) — 게스트 고정 태그와 조합해 쓴다 */
export function randomBaseName(): string {
  return `${pick(ADJECTIVES)}${pick(NOUNS)}`;
}

/** FNV-1a 32bit 해시 — 시드 문자열을 결정적 인덱스로 */
function fnv1a(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * 시드(게스트 UUID) → 4자리 고정 태그 (1000~9999).
 * UUID의 눈에 보이는 지문 — 이름을 바꾸거나 랜덤을 돌려도 이 숫자는 불변.
 */
export function tagFromSeed(seed: string): string {
  return String((fnv1a(seed) % 9000) + 1000);
}

/**
 * 시드 기반 결정적 닉네임 — 같은 시드(게스트 UUID)면 항상 같은 이름.
 * 구글시트 '익명 동물' 방식의 자동 배정에 사용.
 */
export function nicknameFromSeed(seed: string): string {
  const h = fnv1a(seed);
  const adj = ADJECTIVES[h % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(h / ADJECTIVES.length) % NOUNS.length];
  return `${adj}${noun}_${tagFromSeed(seed)}`;
}

/** "수줍은고슴도치_3174" → { base: "수줍은고슴도치", num: "_3174" } (숫자 꼬리 분리 표시용) */
export function splitNickname(name: string): { base: string; num: string } {
  const m = name.match(/^(.*)_(\d+)$/);
  return m ? { base: m[1], num: `_${m[2]}` } : { base: name, num: "" };
}
