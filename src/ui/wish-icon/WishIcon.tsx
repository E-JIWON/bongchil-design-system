import { Film, Clapperboard, Sparkles, Music, Book, Utensils, Shirt, type LucideIcon } from "lucide-react";

/**
 * wish(보고싶은 것) 카테고리별 고유 아이콘.
 * CATEGORY_ICONS와 같은 규칙 — 키는 평범한 string 이라 entities(WishCategoryKey)에 의존하지 않는다.
 * 끄적끄적 스트림과 글쓰기 위시 블록이 같은 아이콘을 쓰도록 여기 둔다.
 */
export const WISH_CAT_ICONS: Record<string, LucideIcon> = {
  movie: Film,
  drama: Clapperboard,
  anime: Sparkles,
  music: Music,
  book: Book,
  food: Utensils,
  clothes: Shirt,
};
