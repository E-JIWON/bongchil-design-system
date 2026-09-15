import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Inbox, LayoutGrid, Sparkles, StickyNote } from "lucide-react";
import {
  BottomSheet,
  Button,
  CoverFrame,
  DatePicker,
  DateRangeText,
  DockPopover,
  DockReset,
  FilterChips,
  GUEST_COLORS,
  GuestAvatar,
  GuestSwatch,
  GuestTag,
  HeartRating,
  MonthPicker,
  NoticeArea,
  PAPER_COLORS,
  PaletteBlobs,
  PostItCard,
  RecommendationIcon,
  Segmented,
  Skeleton,
  StickerPhotoButton,
  WEATHER_KEYS,
  WISH_CAT_ICONS,
  WeatherIcon,
  getWeatherLabel,
  useToast,
  type FilterChip,
  type GuestColor,
} from "bongchil-design-system";
import { opts, snippet, type Story } from "./controls";

const PHOTO = "https://picsum.photos/seed/bongchil/600/800";

const guestOpts = GUEST_COLORS.map((c) => ({ value: c, label: c }));

export const MORE_STORIES: Story[] = [
  /* ── 컨트롤 ── */
  {
    id: "filter-chips",
    group: "컨트롤",
    name: "FilterChips",
    notes: ["화면 상단 필터 칩 줄의 단일 표준", "공용 Button(grain) md 고정", "색을 안 준 항목은 ink"],
    render: () => <FilterChipsDemo />,
    code: () => `<FilterChips items={ITEMS} value={filter} onChange={setFilter} />`,
  },

  {
    id: "segmented",
    group: "컨트롤",
    name: "Segmented",
    notes: [
      "작은 자리에서 「여럿 중 하나」를 고르는 눌린 칸 막대 — 고른 칸만 흰 종이로 떠오른다",
      "뜻이 다른 묶음은 groups로 나누면 가는 세로선이 들어간다",
      "누를 때 에디터 선택이 안 풀린다 (mousedown 기본동작을 막음). 화면 상단 필터는 FilterChips",
    ],
    controls: [{ key: "정렬 묶음", type: "bool" }],
    initial: { "정렬 묶음": true },
    render: (p) => <SegmentedDemo withAlign={Boolean(p["정렬 묶음"])} />,
    code: () => `<Segmented\n  groups={[\n    { items: FORMATS, value: format, onChange: setFormat },\n    { items: ALIGNS, value: align, onChange: setAlign },\n  ]}\n/>`,
  },

  /* ── 날짜 ── */
  {
    id: "date-picker",
    group: "날짜",
    name: "DatePicker",
    notes: [
      "앱의 날짜 선택 단일 표준 — field(테두리 버튼) · inline(텍스트)",
      "onRangeChange를 주면 범위 모드 — 두 번 누르거나 끌기",
      "팝오버 없이 달력만 필요하면 DatePickerCalendar",
    ],
    controls: [
      { key: "variant", type: "select", options: opts("field", "inline") },
      { key: "range", type: "bool" },
    ],
    initial: { variant: "field" },
    render: (p) => <DatePickerDemo variant={p.variant as "field" | "inline"} range={Boolean(p.range)} />,
    code: (p) =>
      p.range
        ? `<DatePicker\n  value={start}\n  endValue={end}\n  onChange={setStart}\n  onRangeChange={(s, e) => { setStart(s); setEnd(e); }}\n/>`
        : snippet("DatePicker", { value: "{date}", onChange: "{setDate}", variant: p.variant === "field" ? undefined : p.variant }),
  },
  {
    id: "month-picker",
    group: "날짜",
    name: "MonthPicker",
    notes: ["filled에 기록 있는 달을 주면 점이 찍힌다"],
    controls: [
      { key: "variant", type: "select", options: opts("title", "pill") },
      { key: "arrows", type: "bool" },
    ],
    initial: { variant: "title", arrows: true },
    render: (p) => <MonthPickerDemo variant={p.variant as never} arrows={Boolean(p.arrows)} />,
    code: (p) => snippet("MonthPicker", { value: '"2026-09"', onChange: "{setMonth}", filled: "{filledMonths}", variant: p.variant, arrows: p.arrows }),
  },
  {
    id: "date-range-text",
    group: "날짜",
    name: "DateRangeText",
    notes: [
      "여러 날의 날짜 표기 — DatePicker 범위 모드의 읽기 쪽 짝",
      "글꼴·크기는 감싸는 줄을 물려받는다. 길이(3박4일)만 옅은 포인트색",
    ],
    controls: [
      { key: "format", type: "select", options: opts("dot", "short") },
      { key: "여러 날", type: "bool" },
      { key: "hideNights", type: "bool" },
    ],
    initial: { format: "dot", "여러 날": true },
    render: (p) => (
      <div className="font-mono text-[13px] text-ink-4">
        <DateRangeText
          isoDate="2026-08-05"
          endIso={p["여러 날"] ? "2026-08-08" : undefined}
          format={p.format as never}
          hideNights={Boolean(p.hideNights)}
        />
      </div>
    ),
    code: (p) => snippet("DateRangeText", { isoDate: "2026-08-05", endIso: p["여러 날"] ? "2026-08-08" : undefined, format: p.format === "dot" ? undefined : p.format, hideNights: p.hideNights }),
  },

  /* ── 카드 · 종이 ── */
  {
    id: "postit-card",
    group: "카드 · 종이",
    name: "PostItCard",
    notes: ["색 4종 × 모양 2종", "tape로 테이프 자국"],
    controls: [
      { key: "color", type: "select", options: PAPER_COLORS.map((c) => ({ value: c.key, label: c.label })) },
      { key: "shape", type: "select", options: opts("note", "bubble") },
      { key: "tape", type: "bool" },
      { key: "caption", type: "text" },
      { key: "from", type: "text" },
      { key: "width", type: "number", min: 100, max: 240 },
    ],
    initial: { color: PAPER_COLORS[0].key, shape: "note", tape: true, caption: "오늘은 산책을 오래 했다", from: "봉칠", width: 150 },
    render: (p) => (
      <PostItCard
        from={String(p.from ?? "")}
        caption={String(p.caption ?? "")}
        color={p.color as never}
        shape={p.shape as never}
        tape={Boolean(p.tape)}
        width={Number(p.width)}
      />
    ),
    code: (p) => snippet("PostItCard", { from: p.from, caption: p.caption, color: p.color, shape: p.shape === "note" ? undefined : p.shape, tape: p.tape, width: p.width }),
  },
  {
    id: "cover-frame",
    group: "카드 · 종이",
    name: "CoverFrame",
    notes: ["src가 있으면 사진, 없고 onPick이 있으면 점선 자리"],
    controls: [{ key: "사진", type: "bool" }],
    initial: { 사진: true },
    render: (p) => (
      <div className="w-[260px]">
        {p.사진 ? <CoverFrame src={PHOTO} alt="샘플" caption={<span>대표 사진 캡션</span>} /> : <CoverFramePick />}
      </div>
    ),
    code: (p) => (p.사진 ? `<CoverFrame src={src} alt="…" caption={…} />` : `<CoverFrame onPick={openPicker} />`),
  },
  {
    id: "sticker-photo-button",
    group: "모션",
    name: "StickerPhotoButton",
    notes: ["이미지 로드가 끝나면 스티커 붙는 모션"],
    render: () => (
      <StickerPhotoButton
        image={{ src: "https://picsum.photos/seed/sticker/200/240", alt: "샘플", className: "h-24 w-20 rounded-lg object-cover" }}
        className="rounded-lg"
        onClick={() => {}}
      />
    ),
  },
  {
    id: "palette-blobs",
    group: "모션",
    name: "PaletteBlobs",
    notes: ["이미지 팔레트 블롭 배경 — 부모에 넣기만 하면 absolute inset-0", "src를 주면 사진에서 색을 뽑는다"],
    wide: true,
    controls: [{ key: "seed", type: "text" }],
    initial: { seed: "catalog" },
    render: (p) => (
      <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border">
        <PaletteBlobs palette={["134,169,134", "204,174,108", "138,146,204"]} seed={String(p.seed ?? "")} />
      </div>
    ),
    code: () => `<div className="relative …">\n  <PaletteBlobs palette={["134,169,134", "204,174,108"]} seed="…" />\n</div>`,
  },
  {
    id: "notice-area",
    group: "카드 · 종이",
    name: "NoticeArea",
    notes: ["1.5px 파선 + 옅은 틴트", "임시로 떠 있는 구획에만 — 상시 카드엔 안 쓴다"],
    wide: true,
    render: () => (
      <div className="w-full space-y-1.5">
        <NoticeArea className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-ink-2">
          <Inbox size={14} className="text-secondary" /> 새로 받은 추천이 3건 있어요
        </NoticeArea>
        <NoticeArea borderClass="border-comment-sky-solid/35" bgClass="bg-comment-sky/35" className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-ink-2">
          <Sparkles size={14} className="text-comment-sky-solid" /> 색을 바꾼 것
        </NoticeArea>
      </div>
    ),
    code: () => `<NoticeArea borderClass="…" bgClass="…" className="…">…</NoticeArea>`,
  },

  /* ── 레이아웃 ── */
  {
    id: "bottom-sheet",
    group: "표면",
    name: "BottomSheet",
    notes: ["모바일 하단 시트 셸", "닫히는 중(closing) 상태는 호출부가 관리한다"],
    render: () => <BottomSheetDemo />,
    code: () => `{sheet !== "closed" && (\n  <BottomSheet closing={sheet === "closing"} onClose={close}>…</BottomSheet>\n)}`,
  },
  {
    id: "dock-popover",
    group: "표면",
    name: "DockPopover",
    notes: ["하단 독에서 위로 펼쳐지는 팝오버 — 기준점 버튼 위에 뜬다", "DockReset은 팝오버 공용 초기화 버튼"],
    render: () => <DockPopoverDemo />,
  },
  {
    id: "skeleton",
    group: "피드백",
    name: "Skeleton",
    notes: [
      "로딩 자리 — 크기·모양은 className으로만 준다 (컴포넌트는 결만 가진다)",
      "도착할 콘텐츠와 같은 틀로 깔아야 도착할 때 화면이 안 튄다",
      "스피너 → 빈 상태로 두 번 바뀌는 것보다 낫다",
    ],
    wide: true,
    controls: [{ key: "모양", type: "select", options: opts("글줄", "카드", "목록", "사진 격자") }],
    initial: { 모양: "카드" },
    render: (p) => <SkeletonDemo shape={String(p.모양)} />,
    code: () => `<Skeleton className="h-4 w-2/3 rounded-md" />`,
  },
  {
    id: "heart-rating",
    group: "컨트롤",
    name: "HeartRating",
    notes: [
      "하트는 이것 하나 — onChange 없으면 보여주기, 있으면 눌러서 입력",
      "보여주기는 4.3처럼 부분 채움, 입력은 정수 1~5",
      "color로 카테고리색을 따른다 (기본 포인트색)",
    ],
    controls: [
      { key: "입력", type: "bool" },
      { key: "rating", type: "number", min: 0, max: 5 },
      { key: "color", type: "select", options: [{ value: undefined, label: "(포인트색)" }, { value: "var(--color-comment-sky-solid)", label: "sky" }, { value: "var(--color-comment-pink-solid)", label: "pink" }] },
      { key: "size", type: "number", min: 10, max: 24 },
      { key: "showValue", type: "bool" },
    ],
    initial: { 입력: false, rating: 4, size: 13 },
    render: (p) => <HeartRatingDemo input={Boolean(p.입력)} rating={Number(p.rating)} color={p.color as string | undefined} size={Number(p.size)} showValue={Boolean(p.showValue)} />,
    code: (p) => snippet("HeartRating", { rating: p.입력 ? "{hype}" : 4.3, onChange: p.입력 ? "{setHype}" : undefined, color: p.color, size: p.size === 13 ? undefined : p.size, showValue: p.showValue }),
  },
  {
    id: "weather-icon",
    group: "아이콘",
    name: "WeatherIcon",
    notes: ["6종 고정", "옛 날씨 이모지도 resolveWeatherKey로 렌더"],
    wide: true,
    render: () => (
      <div className="flex flex-wrap gap-5">
        {WEATHER_KEYS.map((key) => (
          <span key={key} className="flex flex-col items-center gap-1 text-ink-3">
            <WeatherIcon value={key} size={20} />
            <span className="text-[10px] text-ink-5">{getWeatherLabel(key)}</span>
          </span>
        ))}
      </div>
    ),
  },
  {
    id: "wish-icon",
    group: "아이콘",
    name: "위시 아이콘",
    notes: ["위시 카테고리 + 추천 전용 마커(맨 오른쪽)"],
    wide: true,
    render: () => (
      <div className="flex flex-wrap items-center gap-5">
        {Object.entries(WISH_CAT_ICONS).map(([key, Icon]) => (
          <span key={key} className="flex flex-col items-center gap-1 text-ink-3">
            <Icon size={18} strokeWidth={1.8} />
            <code className="text-[10px] text-ink-5">{key}</code>
          </span>
        ))}
        <span className="border-l border-border pl-5 text-secondary">
          <RecommendationIcon size={18} />
        </span>
      </div>
    ),
  },

  /* ── 방문자 ── */
  {
    id: "guest-tag",
    group: "방문자",
    name: "GuestTag",
    notes: ["방문자 표기의 기본형 — 마크 + 별명 + 숫자 태그", "sm(댓글) · md(목록) · lg(도장 팝오버)", "마크가 따로 있으면 GuestName만"],
    controls: [
      { key: "color", type: "select", options: guestOpts },
      { key: "size", type: "select", options: opts("sm", "md", "lg") },
      { key: "name", type: "text" },
    ],
    initial: { color: "green", size: "md", name: "용감한강아지_4821" },
    render: (p) => <GuestTag color={p.color as GuestColor} name={String(p.name ?? "")} size={p.size as never} />,
    code: (p) => snippet("GuestTag", { color: p.color, name: p.name, size: p.size }),
  },
  {
    id: "guest-avatar",
    group: "방문자",
    name: "GuestAvatar · GuestSwatch",
    notes: ["Avatar — 표기용 마크, 색 자체가 정체성", "Swatch — 색 고르는 칸, 고른 칸은 체크로만 알린다"],
    wide: true,
    render: () => <GuestColorsDemo />,
  },
];

/* ── 상태가 필요한 데모 ── */

const FILTER_ITEMS: FilterChip<"all" | "wish" | "memo">[] = [
  { value: "all", label: "전체", icon: LayoutGrid, count: 24 },
  { value: "wish", label: "위시", icon: Sparkles, count: 8 },
  { value: "memo", label: "메모", icon: StickyNote, count: 16 },
];

function FilterChipsDemo() {
  const [v, setV] = useState<"all" | "wish" | "memo">("all");
  return <FilterChips items={FILTER_ITEMS} value={v} onChange={setV} />;
}

function DatePickerDemo({ variant, range }: { variant: "field" | "inline"; range: boolean }) {
  const [date, setDate] = useState("2026-09-15");
  const [end, setEnd] = useState<string | undefined>("2026-09-18");
  return range ? (
    <DatePicker value={date} onChange={setDate} endValue={end} onRangeChange={(s, e) => { setDate(s); setEnd(e ?? undefined); }} variant={variant} />
  ) : (
    <DatePicker value={date} onChange={setDate} variant={variant} />
  );
}

function MonthPickerDemo({ variant, arrows }: { variant: "title" | "pill"; arrows: boolean }) {
  const [m, setM] = useState("2026-09");
  return <MonthPicker value={m} onChange={setM} filled={["2026-07", "2026-08", "2026-09"]} variant={variant} arrows={arrows} />;
}

function CoverFramePick() {
  const toast = useToast();
  return <CoverFrame onPick={() => toast.info("사진 고르기")} />;
}

function BottomSheetDemo() {
  const [sheet, setSheet] = useState<"open" | "closing" | "closed">("closed");
  const close = () => {
    setSheet("closing");
    setTimeout(() => setSheet("closed"), 280);
  };
  return (
    <>
      <Button variant="grain" onClick={() => setSheet("open")}>시트 열기</Button>
      {sheet !== "closed" && (
        <BottomSheet closing={sheet === "closing"} onClose={close}>
          <div className="space-y-3 px-6 pb-8 pt-2">
            <p className="text-sm font-semibold text-ink">바텀 시트</p>
            <p className="text-xs text-ink-4">배경을 누르거나 버튼으로 닫아요.</p>
            <Button variant="text" onClick={close}>닫기</Button>
          </div>
        </BottomSheet>
      )}
    </>
  );
}

function DockPopoverDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="relative mt-40">
      {open && (
        <DockPopover>
          <div className="flex items-center justify-between gap-6">
            <p className="text-[13px] font-bold text-ink-2">서랍장</p>
            <DockReset onClick={() => {}} />
          </div>
          <p className="mt-2 text-[12px] text-ink-4">독 버튼 위로 떠오른 팝오버</p>
        </DockPopover>
      )}
      <Button variant="grain" active={open} onClick={() => setOpen((o) => !o)}>독 버튼</Button>
    </div>
  );
}

function GuestColorsDemo() {
  const [picked, setPicked] = useState(3);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4">
        {GUEST_COLORS.map((c) => (
          <span key={c} className="flex flex-col items-center gap-1">
            <GuestAvatar color={c} name={c} />
            <code className="text-[10px] text-ink-5">{c}</code>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        {GUEST_COLORS.map((c, i) => (
          <GuestSwatch key={c} color={c} active={i === picked} onClick={() => setPicked(i)} />
        ))}
      </div>
    </div>
  );
}

function SkeletonDemo({ shape }: { shape: string }) {
  if (shape === "글줄")
    return (
      <div className="w-full max-w-[420px] space-y-2.5">
        <Skeleton className="h-5 w-2/3 rounded-md" />
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-11/12 rounded-md" />
        <Skeleton className="h-3.5 w-3/5 rounded-md" />
      </div>
    );
  if (shape === "목록")
    return (
      <div className="w-full max-w-[420px] space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/2 rounded-md" />
              <Skeleton className="h-3 w-4/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  if (shape === "사진 격자")
    return (
      <div className="grid w-full max-w-[420px] grid-cols-3 gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
        ))}
      </div>
    );
  return (
    <div className="w-[240px] space-y-3 rounded-2xl border border-border p-3">
      <Skeleton className="aspect-[4/3] w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <Skeleton className="h-3 w-1/2 rounded-md" />
    </div>
  );
}

function HeartRatingDemo({ input, rating, color, size, showValue }: { input: boolean; rating: number; color?: string; size: number; showValue: boolean }) {
  const [hype, setHype] = useState(3);
  return input ? (
    <HeartRating rating={hype} onChange={setHype} color={color} size={size} showValue={showValue} label="기대지수" />
  ) : (
    <div className="flex flex-col items-start gap-2">
      <HeartRating rating={rating} color={color} size={size} showValue={showValue} />
      <HeartRating rating={rating - 0.7} color={color} size={size} showValue={showValue} />
    </div>
  );
}

function SegmentedDemo({ withAlign }: { withAlign: boolean }) {
  const [format, setFormat] = useState("cover");
  const [align, setAlign] = useState("left");
  return (
    <Segmented
      groups={[
        {
          items: [
            { value: "cover", label: "표지" },
            { value: "line", label: "한 줄" },
            { value: "text", label: "글자" },
          ],
          value: format,
          onChange: setFormat,
        },
        ...(withAlign
          ? [
              {
                items: [
                  { value: "left", icon: AlignLeft, title: "왼쪽 정렬" },
                  { value: "center", icon: AlignCenter, title: "가운데 정렬" },
                  { value: "right", icon: AlignRight, title: "오른쪽 정렬" },
                ],
                value: align,
                onChange: setAlign,
              },
            ]
          : []),
      ]}
    />
  );
}
