"use client";

/**
 * ImageEditor — 크롭 박스 드래그+리사이즈 방식
 * 이미지 고정, 크롭 박스를 이동/모서리 리사이즈
 * 비율 모드: 비율 고정 리사이즈 / 자유: 비율 제한 없음
 * 회전(90°)은 원본을 돌려 새 이미지로 갈아끼운다 — 크롭 좌표 계산은 회전을 몰라도 된다
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useModal } from "../modal";
import { getConfig } from "../../config";
import { X, RectangleHorizontal, RectangleVertical, Square, Maximize, Expand, RotateCw } from "lucide-react";
import { Button } from "../button";

type Ratio = "3:4" | "4:3" | "1:1" | "free";
type Box = { x: number; y: number; w: number; h: number };
type Handle = "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null;

type Props = {
  /** 새로 고른 파일 (업로드 전) */
  file?: File;
  /** 이미 올라간 사진 주소 — 본문에 실린 사진을 다시 편집할 때 */
  src?: string;
  onDone: (url: string) => void;
  onCancel: () => void;
  initialRatio?: Ratio;
  /** 여러 장을 한 번에 골랐을 때 진행 표시 (2/4) — 한 장이면 생략 */
  step?: { index: number; total: number };
  /** 이번에 함께 고른 사진들 — 있으면 패널에 목록으로 깔고 눌러서 그 장으로 건너뛴다 */
  files?: File[];
  onPickFile?: (index: number) => void;
};

const RATIO_OPTIONS: { key: Ratio; label: string; icon: typeof Square; value: number | null }[] = [
  { key: "3:4", label: "3:4", icon: RectangleVertical, value: 3 / 4 },
  { key: "4:3", label: "4:3", icon: RectangleHorizontal, value: 4 / 3 },
  { key: "1:1", label: "1:1", icon: Square, value: 1 },
  { key: "free", label: "자유", icon: Maximize, value: null },
];

const MIN_SIZE = 40;

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

/**
 * 비율 칩 — 평소엔 테두리가 없고, 고르면 파선 테두리가 배어 나온다 (`transition-colors`가 태운다).
 * 선은 늘 같은 굵기로 깔아 두고 색만 투명 → 진하게 바꾸므로 고를 때 칩 폭이 흔들리지 않는다.
 */
function chipStyle(on: boolean) {
  const color = "var(--color-primary)";
  return {
    borderStyle: "dashed" as const,
    borderColor: on ? `color-mix(in srgb, ${color} 60%, transparent)` : "transparent",
    borderRadius: "var(--radius-s)",
    background: on ? `color-mix(in srgb, ${color} 12%, transparent)` : "transparent",
    color: on ? color : "var(--color-ink-4)",
  };
}

export function ImageEditor({ file, src, onDone, onCancel, initialRatio = "3:4", step, files, onPickFile }: Props) {
  const modal = useModal();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imgSrc, setImgSrc] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [ratio, setRatio] = useState<Ratio>(initialRatio);
  const [uploading, setUploading] = useState(false);
  /** 돌리기 누적 각도 — 버튼 아이콘이 누를 때마다 90°씩 실제로 돈다 */
  const [turns, setTurns] = useState(0);
  /** 함께 고른 사진들의 미리보기 URL (목록 표시용) */
  const [thumbs, setThumbs] = useState<string[]>([]);

  /** 전체 영역 모드 — 켜면 크롭 박스를 사진 전체에 맞춘다 (매번 끝까지 끌지 않게) */
  const [fullArea, setFullArea] = useState(false);

  // 이미지 표시 영역 (컨테이너 내 fit)
  const [imgRect, setImgRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  // 크롭 박스 (컨테이너 좌표)
  const [box, setBox] = useState<Box>({ x: 0, y: 0, w: 200, h: 200 });

  const [activeHandle, setActiveHandle] = useState<Handle>(null);
  const dragRef = useRef({ startX: 0, startY: 0, startBox: { x: 0, y: 0, w: 0, h: 0 } });
  /** 회전본 objectURL — 다시 돌리거나 다음 사진으로 넘어갈 때 회수한다 */
  const rotatedUrlRef = useRef<string | null>(null);

  // 파일 → objectURL. 여러 장을 줄 세워 편집하면 같은 모달에 다음 장이 들어오므로,
  // 로드 플래그를 내려 크롭 박스를 새 사진 기준으로 다시 잡게 한다.
  useEffect(() => {
    let alive = true;
    let url = "";
    setImgLoaded(false);
    const cleanup = () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
      if (rotatedUrlRef.current) URL.revokeObjectURL(rotatedUrlRef.current);
      rotatedUrlRef.current = null;
    };
    if (file) {
      url = URL.createObjectURL(file);
      setImgSrc(url);
      return cleanup;
    }
    if (!src) return cleanup;
    // 다른 출처 이미지는 캔버스를 오염시켜 잘라내기 저장이 막힌다 →
    // 앱이 준 같은 출처 주소(configure proxySrc)로 받아 blob으로 바꿔 쓴다
    const sameOrigin = getConfig().proxySrc(src);
    fetch(sameOrigin)
      .then((r) => r.blob())
      .then((blob) => {
        if (!alive) return;
        url = URL.createObjectURL(blob);
        setImgSrc(url);
      })
      .catch(() => {});
    return cleanup;
  }, [file, src]);

  // 목록 썸네일 — 묶음이 바뀔 때만 새로 만들고 정리한다 (편집 중인 장이 바뀔 땐 그대로 둔다)
  useEffect(() => {
    if (!files || files.length < 2) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setThumbs(urls);
    return () => {
      urls.forEach(URL.revokeObjectURL);
      setThumbs([]);
    };
  }, [files]);

  // 이미지 로드
  useEffect(() => {
    if (!imgSrc) return;
    const img = new Image();
    img.onload = () => { imgRef.current = img; setImgLoaded(true); };
    img.src = imgSrc;
  }, [imgSrc]);

  // 이미지 로드 후 fit + 초기 크롭 박스
  const initLayout = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const scale = Math.min(cw / img.width, ch / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    const ix = (cw - iw) / 2;
    const iy = (ch - ih) / 2;
    setImgRect({ x: ix, y: iy, w: iw, h: ih });

    // 전체 영역이면 사진 그대로가 크롭 박스
    if (fullArea) {
      setBox({ x: ix, y: iy, w: iw, h: ih });
      return;
    }

    // 크롭 박스: 이미지 80% 크기, 비율에 맞게
    const ratioVal = RATIO_OPTIONS.find((r) => r.key === ratio)?.value;
    let bw: number, bh: number;
    if (ratioVal) {
      bw = Math.min(iw * 0.8, ih * 0.8 * ratioVal);
      bh = bw / ratioVal;
    } else {
      bw = iw * 0.8;
      bh = ih * 0.8;
    }
    const bx = ix + (iw - bw) / 2;
    const by = iy + (ih - bh) / 2;
    setBox({ x: bx, y: by, w: bw, h: bh });
  }, [ratio, fullArea]);

  useEffect(() => { if (imgLoaded) initLayout(); }, [imgLoaded, initLayout]);

  // 핸들 감지
  function getHandle(e: React.PointerEvent): Handle {
    const r = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const edge = 14;
    const inX = mx >= box.x && mx <= box.x + box.w;
    const inY = my >= box.y && my <= box.y + box.h;
    const nearL = Math.abs(mx - box.x) < edge;
    const nearR = Math.abs(mx - (box.x + box.w)) < edge;
    const nearT = Math.abs(my - box.y) < edge;
    const nearB = Math.abs(my - (box.y + box.h)) < edge;

    if (nearT && nearL) return "nw";
    if (nearT && nearR) return "ne";
    if (nearB && nearL) return "sw";
    if (nearB && nearR) return "se";
    if (nearT && inX) return "n";
    if (nearB && inX) return "s";
    if (nearL && inY) return "w";
    if (nearR && inY) return "e";
    if (inX && inY) return "move";
    return null;
  }

  function getCursor(h: Handle): string {
    switch (h) {
      case "nw": case "se": return "nwse-resize";
      case "ne": case "sw": return "nesw-resize";
      case "n": case "s": return "ns-resize";
      case "e": case "w": return "ew-resize";
      case "move": return "move";
      default: return "default";
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    const h = getHandle(e);
    if (!h) return;
    setActiveHandle(h);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const r = containerRef.current!.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX - r.left,
      startY: e.clientY - r.top,
      startBox: { ...box },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // 커서 업데이트
    if (!activeHandle) {
      const h = getHandle(e);
      if (containerRef.current) containerRef.current.style.cursor = getCursor(h);
      return;
    }

    const r = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const dx = mx - dragRef.current.startX;
    const dy = my - dragRef.current.startY;
    const sb = dragRef.current.startBox;
    const ratioVal = RATIO_OPTIONS.find((o) => o.key === ratio)?.value;

    let next: Box = { ...sb };

    if (activeHandle === "move") {
      next.x = clamp(sb.x + dx, imgRect.x, imgRect.x + imgRect.w - sb.w);
      next.y = clamp(sb.y + dy, imgRect.y, imgRect.y + imgRect.h - sb.h);
    } else {
      // 리사이즈
      let nx = sb.x, ny = sb.y, nw = sb.w, nh = sb.h;

      if (activeHandle.includes("e")) nw = Math.max(MIN_SIZE, sb.w + dx);
      if (activeHandle.includes("w")) { nw = Math.max(MIN_SIZE, sb.w - dx); nx = sb.x + sb.w - nw; }
      if (activeHandle.includes("s")) nh = Math.max(MIN_SIZE, sb.h + dy);
      if (activeHandle.includes("n")) { nh = Math.max(MIN_SIZE, sb.h - dy); ny = sb.y + sb.h - nh; }

      // 비율 고정
      if (ratioVal) {
        if (activeHandle === "n" || activeHandle === "s") {
          nw = nh * ratioVal;
          nx = sb.x + (sb.w - nw) / 2;
        } else if (activeHandle === "e" || activeHandle === "w") {
          nh = nw / ratioVal;
          ny = sb.y + (sb.h - nh) / 2;
        } else {
          // 코너: 더 큰 변화 기준
          if (Math.abs(dx) > Math.abs(dy)) {
            nh = nw / ratioVal;
            if (activeHandle.includes("n")) ny = sb.y + sb.h - nh;
          } else {
            nw = nh * ratioVal;
            if (activeHandle.includes("w")) nx = sb.x + sb.w - nw;
          }
        }
      }

      // 이미지 영역 내로 제한.
      // 비율 모드에서 가로·세로를 따로 clamp하면 닿은 쪽만 깎여 비율이 깨진다
      // (세로가 짧은 사진에서 4:3이 1:1이 됐다) — 넘치면 아예 안 키우고 직전 상태를 둔다.
      if (ratioVal) {
        const eps = 0.5; // 부동소수 오차로 경계에서 박스가 굳는 걸 막는 여유
        if (
          nx < imgRect.x - eps ||
          ny < imgRect.y - eps ||
          nx + nw > imgRect.x + imgRect.w + eps ||
          ny + nh > imgRect.y + imgRect.h + eps
        )
          return;
      } else {
        nx = clamp(nx, imgRect.x, imgRect.x + imgRect.w - MIN_SIZE);
        ny = clamp(ny, imgRect.y, imgRect.y + imgRect.h - MIN_SIZE);
        nw = clamp(nw, MIN_SIZE, imgRect.x + imgRect.w - nx);
        nh = clamp(nh, MIN_SIZE, imgRect.y + imgRect.h - ny);
      }

      next = { x: nx, y: ny, w: nw, h: nh };
    }

    setBox(next);
  };

  const handlePointerUp = () => setActiveHandle(null);

  // 90° 회전 — 돌린 결과를 새 이미지로 갈아끼운다. 로드 훅이 다시 돌며 fit·크롭 박스를 새로 잡으므로
  // 크롭/출력 좌표 계산은 회전 각도를 몰라도 된다 (누적 회전 상태를 들고 다닐 필요 없음)
  const handleRotate = () => {
    const img = imgRef.current;
    if (!img) return;
    setTurns((t) => t + 1);
    const c = document.createElement("canvas");
    c.width = img.height;
    c.height = img.width;
    const ctx = c.getContext("2d")!;
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    // PNG로 중간 저장 — 여러 번 돌려도 화질이 깎이지 않는다 (최종 인코딩은 적용에서 한 번만)
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      if (rotatedUrlRef.current) URL.revokeObjectURL(rotatedUrlRef.current);
      rotatedUrlRef.current = url;
      setImgLoaded(false);
      setImgSrc(url);
    }, "image/png");
  };

  // 적용
  const handleApply = async () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    setUploading(true);
    try {
      // box → 이미지 원본 좌표로 변환
      const scale = img.width / imgRect.w;
      const sx = (box.x - imgRect.x) * scale;
      const sy = (box.y - imgRect.y) * scale;
      const sw = box.w * scale;
      const sh = box.h * scale;

      const maxDim = 1200;
      const outputW = Math.min(sw, maxDim);
      const outputH = (outputW / sw) * sh;
      canvas.width = outputW;
      canvas.height = outputH;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputW, outputH);

      // PNG·WebP를 JPEG로 바꾸면 투명 영역이 검은 픽셀로 굳는다.
      // 알파 채널을 지원하는 입력은 같은 포맷으로 내보내 투명도를 유지한다.
      const inputType = file?.type ?? (src?.endsWith(".png") ? "image/png" : src?.endsWith(".webp") ? "image/webp" : "");
      const outputType =
        inputType === "image/png"
          ? "image/png"
          : inputType === "image/webp"
            ? "image/webp"
            : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, outputType, 0.82),
      );
      if (!blob) throw new Error("이미지 인코딩에 실패했습니다.");
      const data = await getConfig().uploadImage(blob);
      if (data.url) onDone(data.url);
    } catch {
      modal.alert({ message: "이미지 처리에 실패했습니다." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-ink/60 backdrop-blur-sm">
      {/* 도구는 오른쪽 세로 패널로 모으고, 남은 폭은 전부 사진이 먹는다 (좁은 화면에선 아래로 접힌다) */}
      <div className="flex h-[min(560px,86vh)] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface shadow-l max-sm:mx-3 max-sm:h-auto max-sm:max-h-[94vh] max-sm:flex-col">

        {/* 크롭 영역 */}
        <div
          ref={containerRef}
          className="relative min-h-[300px] flex-1 overflow-hidden bg-black/90"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* 이미지 (고정, fit) */}
          {imgLoaded && imgRef.current && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt=""
              draggable={false}
              className="pointer-events-none absolute select-none"
              style={{ left: imgRect.x, top: imgRect.y, width: imgRect.w, height: imgRect.h }}
            />
          )}

          {/* 어두운 오버레이 (크롭 밖) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 right-0 top-0 bg-black/50" style={{ height: box.y }} />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50" style={{ height: `calc(100% - ${box.y + box.h}px)` }} />
            <div className="absolute bg-black/50" style={{ top: box.y, left: 0, width: box.x, height: box.h }} />
            <div className="absolute bg-black/50" style={{ top: box.y, right: 0, width: `calc(100% - ${box.x + box.w}px)`, height: box.h }} />
          </div>

          {/* 크롭 박스 */}
          <div
            className="pointer-events-none absolute border-2 border-white/90"
            style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
          >
            {/* 3등분 가이드 */}
            <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" />
            <div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
            <div className="absolute left-0 top-1/3 h-px w-full bg-white/20" />
            <div className="absolute left-0 top-2/3 h-px w-full bg-white/20" />

            {/* 코너 핸들 */}
            {[
              "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
              "right-0 top-0 translate-x-1/2 -translate-y-1/2",
              "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
              "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
            ].map((cls, i) => (
              <div key={i} className={`absolute ${cls} h-3.5 w-3.5 rounded-full border-2 border-white bg-white/30`} />
            ))}
            {/* 엣지 핸들 (중앙) */}
            {[
              "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
              "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
              "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
            ].map((cls, i) => (
              <div key={`e${i}`} className={`absolute ${cls} h-2 w-2 rounded-full border-2 border-white bg-white/30`} />
            ))}
          </div>

        </div>

        {/* 도구 패널 */}
        <div className="flex w-[184px] flex-col gap-2.5 border-l border-border p-3.5 max-sm:w-full max-sm:border-l-0 max-sm:border-t">
          {/* 크기는 제목의 부제 — 도구 밑에 있으면 무엇의 크기인지 다시 찾게 된다 */}
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <p className="text-[13px] font-semibold text-ink">이미지 편집</p>
              <p className="text-[11px] tabular-nums text-ink-4">
                {imgRef.current && imgRect.w
                  ? `${Math.round(box.w * (imgRef.current.width / imgRect.w))} × ${Math.round(box.h * (imgRef.current.height / imgRect.h))}`
                  : "불러오는 중"}
              </p>
            </div>
            <Button
              shape="square"
              size="sm"
              hoverActive
              tone="muted"
              onClick={onCancel}
              aria-label={step ? "이 사진 건너뛰기" : "닫기"}
              icon={<X size={14} strokeWidth={2} />}
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {RATIO_OPTIONS.map((r) => (
              <Button
                key={r.key}
                variant="dotted"
                size="sm"
                color="var(--color-primary)"
                active={!fullArea && ratio === r.key}
                icon={r.icon}
                onClick={() => {
                  setFullArea(false);
                  setRatio(r.key);
                }}
                className="duration-300"
                style={chipStyle(ratio === r.key)}
              >
                {r.label}
              </Button>
            ))}
            {/* 전체 영역 — 사진 끝까지 끌지 않고 한 번에 통째로 */}
            <Button
              variant="dotted"
              size="sm"
              color="var(--color-primary)"
              active={fullArea}
              icon={Expand}
              disabled={!imgLoaded}
              onClick={() => {
                setRatio("free");
                setFullArea(true);
              }}
              className="col-span-2 duration-300"
              style={chipStyle(fullArea)}
            >
              전체 영역
            </Button>

            {/* 비율은 '고르는 것', 돌리기는 '누르면 실행'이라 재질을 갈라 둔다 */}
            <Button
              variant="grain"
              size="sm"
              hoverActive
              color="var(--color-primary)"
              disabled={!imgLoaded}
              onClick={handleRotate}
              className="col-span-2"
              style={{ borderRadius: "var(--radius-s)" }}
              icon={
                <RotateCw
                  size={14}
                  strokeWidth={2}
                  className="shrink-0"
                  style={{ transform: `rotate(${turns * 90}deg)`, transition: "transform 420ms cubic-bezier(0.34, 1.4, 0.64, 1)" }}
                />
              }
            >
              돌리기
            </Button>
          </div>

          <div className="flex-1 max-sm:hidden" />

          {/* 건너뛰기는 '이 장을 빼기'라 사진 목록 문맥에 붙인다 — 적용(확정)과 같은 줄에 두면 무게가 겹친다 */}
          {step && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] tabular-nums text-ink-4">
                {step.index} / {step.total}
              </span>
              <Button variant="text" size="sm" tone="muted" onClick={onCancel}>건너뛰기</Button>
            </div>
          )}

          {thumbs.length > 1 && (
            <div className="flex gap-2">
              {thumbs.map((src, i) => {
                const current = step ? step.index - 1 === i : false;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => onPickFile?.(i)}
                    disabled={!onPickFile}
                    className={`aspect-square min-w-0 flex-1 overflow-hidden rounded-md transition-opacity ${
                      current
                        ? "opacity-100 outline-[1.5px] outline-offset-2 outline-dashed outline-primary/70"
                        : "opacity-45 hover:opacity-80"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}

          {/* 되돌리는 것이 위, 확정하는 것이 맨 아래 — 손가락이 마지막에 닿는 자리를 '적용'이 갖는다 */}
          {!step && (
            <Button
              variant="grain"
              tone="muted"
              hoverActive
              className="w-full"
              style={{ borderRadius: "var(--radius-s)" }}
              onClick={onCancel}
            >
              취소
            </Button>
          )}
          <Button
            variant="grain"
            tone="primary"
            className="w-full"
            style={{ borderRadius: "var(--radius-s)" }}
            onClick={handleApply}
            disabled={uploading}
          >
            {uploading ? "처리 중..." : "적용"}
          </Button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
