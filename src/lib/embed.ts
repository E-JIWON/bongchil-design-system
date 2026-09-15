/**
 * 임베드/링크 공통 로직 — 단일 출처.
 *
 * 에디터 NodeView(EmbedNode), 발행 HTML(renderHTML), 상세뷰 DOM 보강(enhance-links)이
 * 각각 URL 파싱·호스트 추출·뮤직 카드 판별·OG 조회를 중복 구현하던 것을 여기로 모은다.
 * (순수 로직만 — UI는 shared/ui/embed-card, 스타일은 globals.css의 `.embed-*`)
 */

/* ── 프로바이더 파싱 ── */

export type EmbedProvider = "youtube" | "vimeo" | "link";

export const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

/** URL → 프로바이더 + iframe src. 영상이 아니면 provider="link". */
export function parseEmbedUrl(url: string): { provider: EmbedProvider; embedSrc: string | null } {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      if (id) return { provider: "youtube", embedSrc: `https://www.youtube.com/embed/${id}` };
    }
    if (host.endsWith("youtube.com")) {
      let id = u.searchParams.get("v");
      if (!id && u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2] ?? null;
      if (!id && u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2] ?? null;
      if (id) return { provider: "youtube", embedSrc: `https://www.youtube.com/embed/${id}` };
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const seg = u.pathname.split("/").filter(Boolean);
      const id = seg.find((s) => /^\d+$/.test(s));
      if (id) return { provider: "vimeo", embedSrc: `https://player.vimeo.com/video/${id}` };
    }
  } catch {
    /* invalid URL */
  }
  return { provider: "link", embedSrc: null };
}

/** 영상(리치 임베드) URL인지 */
export function isVideoUrl(url: string): boolean {
  return parseEmbedUrl(url).provider !== "link";
}

/** 영상 썸네일 URL (OG 이미지 폴백). 유튜브는 id로 직접 유도, 그 외는 빈 문자열 */
export function videoThumbnail(url: string): string {
  const { embedSrc } = parseEmbedUrl(url);
  const m = embedSrc?.match(/youtube\.com\/embed\/([^/?#]+)/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : "";
}

/* ── URL 표기 ── */

/** 호스트만 (www 제거). 파싱 실패 시 원문 */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 퍼센트 인코딩 URL을 읽기 쉽게 디코드 (한글 등) */
export function prettyUrl(url: string): string {
  try {
    return decodeURI(url);
  } catch {
    return url;
  }
}

/* ── 뮤직 링크(앨범색 틴트 카드) ── */

/** 뮤직 카드로 렌더할 서비스면 출처 라벨, 아니면 null */
export function musicSource(url: string): string | null {
  return hostOf(url) === "music.apple.com" ? "Apple Music" : null;
}

/** OG 제목에서 "Apple Music에서 만나는 …" / "… on Apple Music" 래퍼 제거.
 *  주의: Apple OG 제목은 "Apple"과 "Music" 사이가 non-breaking space(U+00A0)라 일반 공백 정규식이 빗나간다 → \s로 매칭.
 *  또 제목 앞에 보이지 않는 방향/제로폭 문자(U+200E 등)가 붙기도 해 먼저 제거. */
export function cleanMusicTitle(title: string): string {
  return (
    title
      .replace(/^[‎‏‪-‮⁦-⁩﻿\s]+/, "")
      .replace(/^Apple\s*Music에서\s*(?:만나는|감상하는|듣는)\s*/i, "")
      .replace(/^Apple\s*Music\s*/i, "") // 재생목록: "Apple Music{이름}" 형태
      .replace(/\s+on\s+Apple\s*Music$/i, "")
      .replace(/\s*[–-]\s*Apple\s*Music$/i, "")
      .trim() || title
  );
}

/** tint("r,g,b|r,g,b") → {m1,m2} 앨범색. 없으면 null (CSS 기본값 사용) */
export function splitTint(tint: string): { m1: string; m2: string } | null {
  if (!tint) return null;
  const [m1, m2] = tint.split("|");
  return { m1, m2: m2 || m1 };
}

// OG 메타 조회는 서버 프록시가 필요해 앱 몫이다 — 카드엔 조회 결과만 넘긴다.

/* ── 임베드 종류·사이트 이름 (표지 카드·본문 한 줄 공용) ── */

export type EmbedKind = "video" | "music" | "book" | "link";

/** 책 표지(세로 3:4)로 다룰 서점 */
const BOOK_HOSTS = ["kyobobook.co.kr", "yes24.com", "aladin.co.kr", "ridibooks.com", "millie.co.kr"];

/** URL → 표지 비율·낫표를 가르는 종류 */
export function embedKind(url: string): EmbedKind {
  if (isVideoUrl(url)) return "video";
  if (musicSource(url)) return "music";
  const host = hostOf(url);
  return BOOK_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) ? "book" : "link";
}

/** 영문 도메인 대신 보여줄 이름 — og:site_name이 없거나 영문일 때 자주 쓰는 곳만 */
const SITE_LABELS: [string, string][] = [
  ["kyobobook.co.kr", "교보문고"],
  ["yes24.com", "예스24"],
  ["aladin.co.kr", "알라딘"],
  ["youtube.com", "유튜브"],
  ["youtu.be", "유튜브"],
  ["vimeo.com", "비메오"],
  ["music.apple.com", "애플 뮤직"],
  ["musinsa.com", "무신사"],
  ["brunch.co.kr", "브런치"],
  ["instagram.com", "인스타그램"],
];

/** 출처 라벨 — 아는 곳은 한글 이름, 아니면 og:site_name, 그것도 없으면 호스트 */
export function siteLabel(url: string, site = ""): string {
  const host = hostOf(url);
  const known = SITE_LABELS.find(([h]) => host === h || host.endsWith(`.${h}`))?.[1];
  return known || site || host;
}

/** 제목 끝에 붙은 「 - 교보문고」 같은 사이트 꼬리를 뗀다 (출처는 따로 보여주니까) */
export function cleanEmbedTitle(title: string, url: string, site = ""): string {
  const names = [siteLabel(url, site), site].filter(Boolean).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!names.length) return title;
  return title.replace(new RegExp(`\\s*[-|:·–]\\s*(?:${names.join("|")})\\s*$`), "").trim() || title;
}
