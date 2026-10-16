import {
  BookOpen,
  CookingPot,
  Footprints,
  Coffee,
  Cloud,
  Plane,
  Leaf,
  Music,
  Clapperboard,
  Dumbbell,
  Camera,
  GraduationCap,
  Palette,
  PawPrint,
  ShoppingBag,
  Heart,
  Home,
  Star,
  Sun,
  Moon,
  Code,
  Gamepad2,
  MapPin,
  Gift,
  Flower2,
  Users,
  Pencil,
  Sparkles,
  Brain,
  Bike,
  UtensilsCrossed,
  Headphones,
  Compass,
  Trophy,
  Lightbulb,
  TreePine,
  Umbrella,
  Flame,
  Anchor,
  Rocket,
  Cat,
  Mic,
  PersonStanding,
  Cake,
  Rainbow,
  Pizza,
  Piano,
  Tv,
  Luggage,
  type LucideIcon,
  Bus,
  Car,
  Wallet,
  Banknote,
  HeartPulse,
  Briefcase,
  Package,
  Coins,
  Receipt,
  CircleDollarSign,
  PiggyBank,
  TrendingUp,
  BarChart2,
  Landmark,
  Building2,
} from "lucide-react";

/* ── 아이콘 레지스트리 ── */

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  cooking: CookingPot,
  walk: Footprints,
  cafe: Coffee,
  thought: Cloud,
  travel: Plane,
  daily: Leaf,
  music: Music,
  movie: Clapperboard,
  exercise: Dumbbell,
  photo: Camera,
  study: GraduationCap,
  hobby: Palette,
  pet: PawPrint,
  shopping: ShoppingBag,
  heart: Heart,
  home: Home,
  star: Star,
  sun: Sun,
  moon: Moon,
  code: Code,
  gamepad: Gamepad2,
  map: MapPin,
  gift: Gift,
  flower: Flower2,
  users: Users,
  pencil: Pencil,
  sparkles: Sparkles,
  brain: Brain,
  bike: Bike,
  utensils: UtensilsCrossed,
  headphones: Headphones,
  compass: Compass,
  trophy: Trophy,
  lightbulb: Lightbulb,
  tree: TreePine,
  umbrella: Umbrella,
  flame: Flame,
  anchor: Anchor,
  rocket: Rocket,
  cat: Cat,
  mic: Mic,
  yoga: PersonStanding,
  cake: Cake,
  rainbow: Rainbow,
  pizza: Pizza,
  piano: Piano,
  tv: Tv,
  luggage: Luggage,
  sunflower: Sun,
  // 가계부 앱 전용 — 돈·교통·금융
  bus: Bus,
  car: Car,
  wallet: Wallet,
  banknote: Banknote,
  medical: HeartPulse,
  briefcase: Briefcase,
  package: Package,
  coins: Coins,
  receipt: Receipt,
  money: CircleDollarSign,
  piggybank: PiggyBank,
  trendingup: TrendingUp,
  barchart: BarChart2,
  landmark: Landmark,
  building: Building2,
};

/* ── 아이콘 추천 (키워드 매핑) ── */

export const ICON_SUGGESTIONS: { key: string; label: string; keywords: string[] }[] = [
  { key: "book", label: "독서", keywords: ["책", "독서", "독후감", "읽기", "서적", "도서", "문학"] },
  { key: "cooking", label: "요리", keywords: ["요리", "음식", "밥", "식사", "레시피", "맛", "베이킹", "반찬", "식료품", "장보기"] },
  { key: "walk", label: "산책", keywords: ["산책", "걷기", "산보", "걸음", "발자국"] },
  { key: "cafe", label: "카페", keywords: ["카페", "커피", "차", "음료", "라떼", "티타임"] },
  { key: "thought", label: "생각", keywords: ["생각", "사색", "고민", "마음", "감정"] },
  { key: "travel", label: "여행", keywords: ["여행", "비행", "해외", "관광", "투어", "비행기", "항공"] },
  { key: "daily", label: "일상", keywords: ["일상", "생활", "하루", "매일", "자연"] },
  { key: "music", label: "음악", keywords: ["음악", "노래", "연주", "악기", "멜로디", "가수"] },
  { key: "movie", label: "영화", keywords: ["영화", "극장", "시네마", "드라마", "넷플릭스", "감상", "문화", "전시", "공연", "취미"] },
  { key: "exercise", label: "운동", keywords: ["운동", "헬스", "체육", "피트니스", "근력", "웨이트", "헬스장"] },
  { key: "photo", label: "사진", keywords: ["사진", "카메라", "촬영", "풍경", "스냅"] },
  { key: "study", label: "공부", keywords: ["공부", "학습", "교육", "시험", "강의", "학교", "학원", "학비", "수업"] },
  { key: "hobby", label: "취미", keywords: ["취미", "그림", "미술", "예술", "만들기", "공예"] },
  { key: "pet", label: "반려동물", keywords: ["반려동물", "강아지", "고양이", "펫", "동물", "댕댕이"] },
  { key: "shopping", label: "쇼핑", keywords: ["쇼핑", "구매", "장보기", "옷", "패션", "온라인"] },
  { key: "heart", label: "사랑", keywords: ["사랑", "건강", "감사", "연애", "하트"] },
  { key: "home", label: "집", keywords: ["집", "가족", "인테리어", "홈", "거실", "방", "생활", "가사"] },
  { key: "star", label: "즐겨찾기", keywords: ["별", "즐겨찾기", "특별", "추천", "평점"] },
  { key: "sun", label: "날씨", keywords: ["날씨", "햇빛", "맑음", "밝음", "아침"] },
  { key: "moon", label: "밤", keywords: ["달", "밤", "수면", "잠", "꿈", "저녁"] },
  { key: "code", label: "코딩", keywords: ["코딩", "개발", "프로그래밍", "IT", "기술", "컴퓨터"] },
  { key: "gamepad", label: "게임", keywords: ["게임", "놀이", "오락", "콘솔", "플레이"] },
  { key: "map", label: "장소", keywords: ["장소", "위치", "지도", "방문", "동네"] },
  { key: "gift", label: "선물", keywords: ["선물", "기념", "축하", "생일", "기념일", "경조사"] },
  { key: "flower", label: "꽃", keywords: ["꽃", "정원", "식물", "화분", "봄"] },
  { key: "users", label: "모임", keywords: ["친구", "모임", "사람", "약속", "그룹", "회식"] },
  { key: "pencil", label: "글쓰기", keywords: ["쓰기", "글", "일기", "메모", "필기", "작성"] },
  { key: "sparkles", label: "특별", keywords: ["반짝", "특별", "이벤트", "축제", "파티"] },
  { key: "brain", label: "아이디어", keywords: ["뇌", "아이디어", "창의", "영감", "발상"] },
  { key: "bike", label: "자전거", keywords: ["자전거", "라이딩", "사이클", "따릉이"] },
  { key: "utensils", label: "외식", keywords: ["식당", "외식", "레스토랑", "맛집", "식비", "배달"] },
  { key: "headphones", label: "오디오", keywords: ["이어폰", "팟캐스트", "오디오", "청취"] },
  { key: "compass", label: "탐험", keywords: ["나침반", "탐험", "방향", "모험"] },
  { key: "trophy", label: "성취", keywords: ["트로피", "성취", "스포츠", "대회", "승리"] },
  { key: "lightbulb", label: "영감", keywords: ["전구", "아이디어", "영감", "깨달음"] },
  { key: "tree", label: "자연", keywords: ["나무", "숲", "환경", "녹색", "캠핑"] },
  { key: "umbrella", label: "비", keywords: ["우산", "비", "장마", "빗소리"] },
  { key: "flame", label: "열정", keywords: ["불", "열정", "캠핑", "모닥불", "따뜻"] },
  { key: "anchor", label: "바다", keywords: ["닻", "바다", "해변", "항해", "서핑"] },
  { key: "rocket", label: "도전", keywords: ["로켓", "우주", "목표", "도전", "시작"] },
  { key: "cat", label: "고양이", keywords: ["고양이", "냥이", "캣", "야옹"] },
  { key: "mic", label: "노래방", keywords: ["노래방", "마이크", "보컬", "라이브"] },
  { key: "yoga", label: "명상", keywords: ["명상", "요가", "휴식", "힐링", "마음챙김"] },
  { key: "cake", label: "생일", keywords: ["생일", "케이크", "파티", "기념"] },
  { key: "rainbow", label: "행복", keywords: ["무지개", "행복", "희망", "기분"] },
  { key: "pizza", label: "간식", keywords: ["피자", "배달", "간식", "야식"] },
  { key: "piano", label: "피아노", keywords: ["피아노", "건반", "클래식", "연습"] },
  { key: "tv", label: "방송", keywords: ["TV", "방송", "예능", "뉴스", "시청", "구독"] },
  { key: "luggage", label: "출장", keywords: ["여행가방", "출장", "짐싸기", "캐리어"] },
  { key: "sunflower", label: "여름", keywords: ["해바라기", "여름", "꽃밭", "밝은"] },
  // 가계부 앱 전용
  { key: "bus", label: "교통", keywords: ["교통", "버스", "대중교통", "통근", "출퇴근", "지하철"] },
  { key: "car", label: "자동차", keywords: ["자동차", "차량", "주유", "주차", "택시", "운전", "기름값"] },
  { key: "medical", label: "의료", keywords: ["의료", "병원", "약", "건강", "치료", "진료", "약국", "보험"] },
  { key: "package", label: "기타", keywords: ["기타", "택배", "배송", "패키지", "잡비"] },
  { key: "wallet", label: "급여", keywords: ["급여", "월급", "수입", "소득", "연봉", "지갑"] },
  { key: "money", label: "부수입", keywords: ["부수입", "용돈", "보너스", "수당", "투자", "배당", "이자"] },
  { key: "banknote", label: "돈", keywords: ["돈", "현금", "입금", "이체", "송금", "환급"] },
  { key: "coins", label: "저축", keywords: ["저축", "적금", "동전", "모으기", "예금"] },
  { key: "piggybank", label: "저금통", keywords: ["저금통", "적금", "비상금", "저축"] },
  { key: "trendingup", label: "투자", keywords: ["투자", "주식", "ETF", "펀드", "상승", "수익"] },
  { key: "barchart", label: "차트", keywords: ["차트", "나스닥", "분석", "지수"] },
  { key: "landmark", label: "은행", keywords: ["은행", "채권", "ISA", "금융기관", "청약"] },
  { key: "building", label: "부동산", keywords: ["부동산", "리츠", "건물", "아파트", "오피스텔"] },
  { key: "receipt", label: "공과금", keywords: ["청구서", "영수증", "공과금", "납부", "관리비", "전기", "수도", "가스"] },
  { key: "briefcase", label: "직장", keywords: ["직장", "회사", "업무", "출장", "근무", "사업"] },
];

/* ── 이모지 → 아이콘키 변환 (레거시 마이그레이션) ── */

const EMOJI_TO_KEY: Record<string, string> = {
  "📚": "book", "🍳": "cooking", "🚶": "walk", "☕": "cafe",
  "💭": "thought", "✈️": "travel", "🌿": "daily", "🎵": "music",
  "🎬": "movie", "💪": "exercise", "📸": "photo", "📝": "study",
  "🎨": "hobby", "🐶": "pet", "🛍️": "shopping", "❤️": "heart",
  "🏠": "home", "⭐": "star", "☀️": "sun", "🌙": "moon",
  "💻": "code", "🎮": "gamepad", "📍": "map", "🎁": "gift",
  "🌸": "flower", "👥": "users", "✏️": "pencil", "✨": "sparkles",
  "🧠": "brain", "🚲": "bike", "🍽️": "utensils", "🎧": "headphones",
  "🧭": "compass", "🏆": "trophy", "💡": "lightbulb", "🌲": "tree",
  "☂️": "umbrella", "🔥": "flame", "⚓": "anchor", "🚀": "rocket",
  "🐱": "cat", "🎤": "mic", "🧘": "yoga", "🎂": "cake",
  "🌈": "rainbow", "🍕": "pizza", "🎹": "piano", "📺": "tv",
  "🧳": "luggage", "🌻": "sunflower",
  // 가계부 앱 레거시 이모지
  "🍚": "utensils", "🚌": "bus", "🏥": "medical",
  "💰": "wallet", "💵": "banknote", "📦": "package",
  "🍺": "cafe", "💊": "medical", "💇": "sparkles",
  "🏖️": "anchor",
};

/** 이모지 문자열을 아이콘 키로 변환 (이미 키면 그대로 반환) */
export function resolveIconKey(value?: string): string | undefined {
  if (!value) return undefined;
  if (CATEGORY_ICONS[value]) return value;
  return EMOJI_TO_KEY[value];
}

/** 아이콘 키(또는 레거시 이모지)가 실제로 렌더 가능한 아이콘으로 해석되는지 여부 */
export function hasCategoryIcon(categoryKey?: string): boolean {
  if (!categoryKey) return false;
  const resolved = resolveIconKey(categoryKey) ?? categoryKey;
  return Boolean(CATEGORY_ICONS[resolved]);
}

/** 키워드로 아이콘 추천 */
export function suggestIcons(query: string): string[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  const scored = ICON_SUGGESTIONS.map((opt) => {
    const score = opt.keywords.filter(
      (kw) => kw.includes(q) || q.includes(kw),
    ).length;
    return { key: opt.key, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 8).map((x) => x.key);
}

/* ── 컴포넌트 ── */

export function CategoryIcon({
  categoryKey,
  className,
  size,
  strokeWidth,
  style,
}: {
  categoryKey: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
  /** 유저 hex 색 등 인라인 색 지정용 */
  style?: React.CSSProperties;
}) {
  const resolved = resolveIconKey(categoryKey) ?? categoryKey;
  const Icon = CATEGORY_ICONS[resolved];
  if (!Icon) return null;
  return <Icon className={className} size={size ?? 16} strokeWidth={strokeWidth ?? 1.5} style={style} />;
}
