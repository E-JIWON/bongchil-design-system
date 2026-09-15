"use client";

import { useCallback, useSyncExternalStore } from "react";
import { storage } from "./storage";
import { getConfig } from "../config";
import { nicknameFromSeed, randomBaseName, splitNickname, tagFromSeed } from "./random-nickname";

/**
 * 게스트 고정 정체성 (docs/guest-identity-plan.md)
 * 첫 방문 시 UUID 발급 → UUID 시드로 닉네임·색 자동 배정(구글시트식) →
 * localStorage에 영구 저장. 변경(✎/↻/색)은 명시적 액션으로만.
 */

export type GuestColor = "green" | "sky" | "sand" | "pink" | "brown" | "charcoal";

export type GuestIdentity = {
  id: string; // UUID — 발급 후 불변
  name: string; // 표시 닉네임 (자동 배정 or 사용자가 바꾼 값)
  color: GuestColor; // 아바타·댓글 색
  createdAt: string;
  renamedAt?: string;
};

export const GUEST_IDENTITY_STORAGE_KEY = "bongchil-diary-guest";

export const GUEST_COLORS: GuestColor[] = ["green", "sky", "sand", "pink", "brown", "charcoal"];

/** 게스트 색 → [밝은 스톱, 깊은 스톱] (같은 온도 계열 안에서 간격을 넓혀 또렷하게, 미드톤은 안 썩게) */
export const AVATAR_STOPS: Record<GuestColor, [light: string, deep: string]> = {
  green: ["#b6d0ac", "#6fa891"], // 세이지 → 딥 틸그린 (쿨)
  sky: ["#b4cbe4", "#8a92cc"], // 스카이 → 딥 페리윙클 (쿨)
  sand: ["#f0e8d0", "#ccae6c"], // 크림 → 딥 골드샌드 (웜)
  pink: ["#f2d4d8", "#d68f9c"], // 블러시 → 딥 로즈 (웜)
  brown: ["#ecd5bf", "#c8917c"], // 카멜 → 딥 클레이로즈 (웜)
  charcoal: ["#9a9088", "#4b453f"], // 스톤 → 딥 차콜 (뉴트럴)
};

/** 게스트 색 → 아바타 그라데이션 (도장 칩 등 납작한 원용) */
export const AVATAR_GRADIENT: Record<GuestColor, string> = Object.fromEntries(
  GUEST_COLORS.map((c) => [c, `linear-gradient(150deg,${AVATAR_STOPS[c][0]},${AVATAR_STOPS[c][1]})`]),
) as Record<GuestColor, string>;

/** 게스트 색 → 도장(스탬프) 톤 (도장형) */
export const STAMP_TONES: Record<GuestColor, { border: string; bg: string; ink: string; caret: string }> = {
  green: { border: "rgba(90,130,104,0.5)", bg: "rgba(90,130,104,0.07)", ink: "#4d6b56", caret: "#7fa890" },
  sky: { border: "rgba(110,140,175,0.5)", bg: "rgba(110,140,175,0.07)", ink: "#4d617a", caret: "#86a3c2" },
  sand: { border: "rgba(165,148,100,0.5)", bg: "rgba(165,148,100,0.08)", ink: "#7a6c47", caret: "#cdbf99" },
  pink: { border: "rgba(190,110,125,0.5)", bg: "rgba(190,110,125,0.08)", ink: "#9c5560", caret: "#d68f9c" },
  brown: { border: "rgba(160,125,95,0.5)", bg: "rgba(160,125,95,0.08)", ink: "#7a5f48", caret: "#c9a888" },
  charcoal: { border: "rgba(70,64,58,0.5)", bg: "rgba(70,64,58,0.08)", ink: "#3d3833", caret: "#6a635c" },
};

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 시드 문자열 → 게스트 색. 색 정보가 없는 자리(알림 보낸이 등)의 안정적 폴백으로도 쓴다 */
export function colorFromSeed(seed: string): GuestColor {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GUEST_COLORS[h % GUEST_COLORS.length];
}

/** 저장된 정체성 반환 — 없으면 발급 후 저장 (클라이언트 전용) */
export function getGuestIdentity(): GuestIdentity {
  const saved = storage.get<GuestIdentity>(GUEST_IDENTITY_STORAGE_KEY);
  if (saved?.id && saved.name && saved.color) {
    // 숫자 꼬리는 UUID 파생 고정 태그 — 과거 랜덤 숫자가 저장돼 있으면 태그로 교정
    const tagged = `${splitNickname(saved.name).base}_${tagFromSeed(saved.id)}`;
    // 지금은 없는 색(예: mint)이 저장돼 있으면 시드에서 유효한 색으로 재배정
    const color = GUEST_COLORS.includes(saved.color) ? saved.color : colorFromSeed(saved.id);
    if (tagged === saved.name && color === saved.color) return saved;
    const fixed = { ...saved, name: tagged, color };
    storage.set(GUEST_IDENTITY_STORAGE_KEY, fixed);
    return fixed;
  }
  const id = makeId();
  const fresh: GuestIdentity = {
    id,
    name: nicknameFromSeed(id),
    color: colorFromSeed(id),
    createdAt: new Date().toISOString(),
  };
  storage.set(GUEST_IDENTITY_STORAGE_KEY, fresh);
  return fresh;
}

/** 예약어 검사 — 주인장 닉네임·'글쓴이'는 게스트가 쓸 수 없다. 통과 시 null, 실패 시 에러 메시지.
 *  숫자 태그(_NNNN)를 제외한 base 이름을 검사한다. */
export function validateGuestName(name: string): string | null {
  const trimmed = splitNickname(name.trim()).base.trim();
  if (!trimmed) return "이름을 입력해 주세요";
  if (trimmed.length > 16) return "이름은 16자까지 쓸 수 있어요";
  // 주인장 표시 이름은 앱이 안다 — configure({ ownerName })
  const ownerName = getConfig().ownerName();
  if (ownerName && trimmed === ownerName) return `‘${ownerName}’ 은 주인장이 쓰고 있어요`;
  if (trimmed === "글쓴이") return "‘글쓴이’ 는 쓸 수 없는 이름이에요";
  return null;
}

/* 모듈 레벨 미니 스토어 — 같은 페이지의 도장·컴포저가 정체성을 실시간 공유 */
let cache: GuestIdentity | null = null;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function getSnapshot(): GuestIdentity | null {
  if (!cache) cache = getGuestIdentity();
  return cache;
}

function getServerSnapshot(): GuestIdentity | null {
  return null; // SSR에선 정체성 없음 — 클라이언트 하이드레이션 후 로드
}

function save(next: GuestIdentity) {
  cache = next;
  storage.set(GUEST_IDENTITY_STORAGE_KEY, next);
  listeners.forEach((cb) => cb());
}

/**
 * 게스트 정체성 훅 — localStorage 로드(SSR 안전, useSyncExternalStore).
 * rename은 예약어 검사를 통과해야 저장되고, 실패 시 에러 메시지를 반환한다.
 * 숫자 태그(_NNNN)는 UUID 파생 불변 — rename/reroll 모두 base 이름만 바꾼다.
 */
export function useGuestIdentity() {
  const identity = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const rename = useCallback((name: string): string | null => {
    if (!cache) return null;
    const base = splitNickname(name.trim()).base.trim();
    const error = validateGuestName(base);
    if (error) return error;
    save({ ...cache, name: `${base}_${tagFromSeed(cache.id)}`, renamedAt: new Date().toISOString() });
    return null;
  }, []);

  const reroll = useCallback(() => {
    if (!cache) return;
    // 이름과 함께 색도 랜덤 — 현재 색을 제외하고 뽑아 항상 바뀐 게 보이게
    const others = GUEST_COLORS.filter((c) => c !== cache!.color);
    const color = others[Math.floor(Math.random() * others.length)];
    save({ ...cache, name: `${randomBaseName()}_${tagFromSeed(cache.id)}`, color, renamedAt: new Date().toISOString() });
  }, []);

  const setColor = useCallback((color: GuestColor) => {
    if (cache) save({ ...cache, color });
  }, []);

  return { identity, rename, reroll, setColor };
}
