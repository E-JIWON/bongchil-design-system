import { createElement, useState } from "react";
import {
  Bookmark,
  BookOpen,
  Coffee,
  Feather,
  Layers,
  Plus,
  Quote,
  Search,
  SquareCheck,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  BasicGlass,
  Button,
  IconButton,
  ImageEditor,
  EmbedCard,
  NavTabs,
  Toggle,
  useModal,
  CATEGORY_ICONS,
  CategoryChip,
  CategoryIcon,
  CategoryPill,
  CategorySelect,
  EmptyState,
  LiquidGlass,
  PageTitle,
  TodoCheckbox,
  useToast,
  type CategoryColor,
  type CategoryOption,
} from "bongchil-design-system";
import { opts, snippet, type Story } from "./controls";

/* ── 데모 데이터 ── */

const SKY: CategoryColor = {
  dot: "bg-comment-sky-solid",
  icon: "text-comment-sky-solid",
  bg: "bg-comment-sky",
  stitch: "border-comment-sky-solid",
};

const ICONS: Record<string, LucideIcon> = {
  Plus,
  Trash2,
  Search,
  Bookmark,
  Quote,
  Layers,
  BookOpen,
  Coffee,
};

const iconOpts = [
  { value: undefined, label: "(없음)" },
  ...Object.keys(ICONS).map((k) => ({ value: k, label: k })),
];

const COLORS = [
  { value: undefined, label: "(tone 색)" },
  { value: "var(--color-comment-sky-solid)", label: "sky" },
  { value: "var(--color-comment-sand-solid)", label: "sand" },
  { value: "var(--color-comment-pink-solid)", label: "pink" },
];

const CAT_OPTIONS: CategoryOption[] = [
  { value: "all", label: "전체", icon: Layers, color: "text-ink-4" },
  { value: "note", label: "문득", icon: Quote, color: "text-primary" },
  { value: "todo", label: "다짐", icon: SquareCheck, color: "text-comment-sand-solid" },
  { value: "wish", label: "바람", icon: Bookmark, color: "text-comment-sky-solid" },
];

const TOKEN_GROUPS: { title: string; swatches: { cls: string; name: string }[] }[] = [
  {
    title: "표면",
    swatches: [
      { cls: "bg-surface", name: "surface" },
      { cls: "bg-surface-warm", name: "surface-warm" },
      { cls: "bg-surface-subtle", name: "surface-subtle" },
      { cls: "bg-desk", name: "desk" },
    ],
  },
  {
    title: "먹",
    swatches: [
      { cls: "bg-ink", name: "ink" },
      { cls: "bg-ink-2", name: "ink-2" },
      { cls: "bg-ink-3", name: "ink-3" },
      { cls: "bg-ink-4", name: "ink-4" },
      { cls: "bg-ink-5", name: "ink-5" },
    ],
  },
  {
    title: "포인트 · 위계",
    swatches: [
      { cls: "bg-primary", name: "primary" },
      { cls: "bg-primary-hover", name: "primary-hover" },
      { cls: "bg-primary-muted", name: "primary-muted" },
      { cls: "bg-primary-light", name: "primary-light" },
      { cls: "bg-secondary", name: "secondary" },
      { cls: "bg-danger", name: "danger" },
    ],
  },
  {
    title: "코멘트 팔레트",
    swatches: [
      { cls: "bg-comment-green-solid", name: "green" },
      { cls: "bg-comment-sky-solid", name: "sky" },
      { cls: "bg-comment-sand-solid", name: "sand" },
      { cls: "bg-comment-mint-solid", name: "mint" },
      { cls: "bg-comment-pink-solid", name: "pink" },
      { cls: "bg-comment-brown-solid", name: "brown" },
      { cls: "bg-comment-charcoal-solid", name: "charcoal" },
    ],
  },
];

/** shape="square"가 함께 써야 하는 아이콘 hover 모션 (animations.css) */
const ICON_MOTIONS: [string, LucideIcon][] = [
  ["icon-plus-pop", Plus],
  ["icon-trash-lid", Trash2],
  ["icon-search-sweep", Search],
  ["icon-bookmark-tuck", Bookmark],
  ["icon-chevron-nudge", Layers],
];

/* ── 스토리 ── */

export const STORIES: Story[] = [
  {
    id: "tokens",
    group: "기초",
    name: "색 토큰",
    notes: ["하드코딩 색상 금지 — 전부 이 토큰으로", "위 툴바에서 테마·accent를 바꿔 확인"],
    wide: true,
    render: () => (
      <div className="flex w-full flex-col gap-5">
        {TOKEN_GROUPS.map((g) => (
          <div key={g.title}>
            <p className="mb-2 text-[11.5px] font-bold text-ink-4">{g.title}</p>
            <div className="flex flex-wrap gap-2.5">
              {g.swatches.map((s) => (
                <div key={s.name} className="flex flex-col items-center gap-1">
                  <span className={`h-11 w-[72px] rounded-lg border border-border ${s.cls}`} />
                  <code className="font-mono text-[10.5px] text-ink-4">{s.name}</code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },

  {
    id: "button",
    group: "컨트롤",
    name: "Button",
    notes: [
      "새로 만들면 variant='grain'",
      "유리는 아이콘 하나만 — 라벨 금지",
      "tone은 위계, active는 상태",
    ],
    controls: [
      { key: "variant", type: "select", options: opts("grain", "text", "dotted", "plain", "glass") },
      { key: "shape", type: "select", options: opts("pill", "square", "round") },
      { key: "size", type: "select", options: opts("xs", "sm", "md", "lg") },
      { key: "tone", type: "select", options: opts("default", "muted", "primary", "danger") },
      { key: "color", type: "select", options: COLORS },
      { key: "icon", type: "select", options: iconOpts },
      { key: "children", type: "text" },
      { key: "active", type: "bool" },
      { key: "hoverActive", type: "bool" },
      { key: "disabled", type: "bool" },
      { key: "count", type: "number", min: 0, max: 99 },
    ],
    initial: {
      variant: "grain",
      shape: "pill",
      size: "md",
      tone: "default",
      icon: "Plus",
      children: "기록",
      count: 0,
    },
    render: (p) => {
      const iconOnly = p.shape === "round" || p.shape === "square";
      return (
        <Button
          variant={p.variant as never}
          shape={p.shape as never}
          size={p.size as never}
          tone={p.tone as never}
          color={p.color as string | undefined}
          icon={p.icon ? ICONS[p.icon as string] : undefined}
          active={Boolean(p.active)}
          hoverActive={Boolean(p.hoverActive)}
          disabled={Boolean(p.disabled)}
          count={Number(p.count) || undefined}
          aria-label={iconOnly ? String(p.children || "버튼") : undefined}
        >
          {iconOnly ? undefined : String(p.children ?? "")}
        </Button>
      );
    },
    code: (p) => {
      const iconOnly = p.shape === "round" || p.shape === "square";
      const props = {
        variant: p.variant,
        shape: p.shape === "pill" ? undefined : p.shape,
        size: p.size === "md" ? undefined : p.size,
        tone: p.tone === "default" ? undefined : p.tone,
        color: p.color,
        icon: p.icon ? `{${p.icon}}` : undefined,
        active: p.active,
        hoverActive: p.hoverActive,
        disabled: p.disabled,
        count: Number(p.count) || undefined,
      };
      return snippet("Button", props, iconOnly ? undefined : String(p.children ?? ""));
    },
  },

  {
    id: "todo-checkbox",
    group: "컨트롤",
    name: "TodoCheckbox",
    notes: ["off는 파선(적어만 둔 것), on은 채움 + 손으로 그은 체크"],
    controls: [
      { key: "done", type: "bool" },
      { key: "readOnly", type: "bool" },
      { key: "size", type: "number", min: 12, max: 40 },
    ],
    initial: { done: true, size: 17 },
    render: (p) => (
      <div className="flex items-center gap-3">
        <TodoCheckbox done={Boolean(p.done)} readOnly={Boolean(p.readOnly)} size={Number(p.size)} />
        <span className={`relative text-[14px] ${p.done ? "text-ink-4" : "text-ink-2"}`}>
          장보기 목록 정리하기
          {Boolean(p.done) && (
            <span
              key="strike"
              className="animate-scribble-strike pointer-events-none absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-current"
            />
          )}
        </span>
      </div>
    ),
    code: (p) => snippet("TodoCheckbox", { done: p.done, readOnly: p.readOnly, size: p.size }),
  },

  {
    id: "basic-glass",
    group: "표면",
    name: "BasicGlass",
    notes: ["가려주는 유리 — surface 84% + blur 5", "opaque = 94% + blur 14 (목록용)"],
    controls: [{ key: "opaque", type: "bool" }],
    render: (p) => (
      <BasicGlass opaque={Boolean(p.opaque)} className="rounded-xl px-5 py-3.5 text-[13px] text-ink-2">
        뒤가 {p.opaque ? "6%" : "16%"} 비칩니다
      </BasicGlass>
    ),
    code: (p) => snippet("BasicGlass", { opaque: p.opaque, className: "rounded-xl px-5 py-3.5" }, "…"),
  },

  {
    id: "liquid-glass",
    group: "표면",
    name: "LiquidGlass",
    notes: ["보여주는 유리 — 굴절 + 광학 림", "독 pill·플로팅 컨트롤 같은 특수한 자리만"],
    render: () => (
      <LiquidGlass className="rounded-full px-6 py-3 text-[13px] text-ink-2">떠 있는 유리</LiquidGlass>
    ),
  },

  {
    id: "category-chip",
    group: "카테고리",
    name: "CategoryChip",
    notes: ["아이콘 + 이름 고정. 배경·카운트 없음", "hex를 주면 유저 지정색이 토큰색을 이긴다"],
    controls: [
      { key: "label", type: "text" },
      { key: "iconKey", type: "select", options: opts("book", "cafe", "walk", "music", undefined) },
      { key: "hex", type: "select", options: [{ value: undefined, label: "(토큰색)" }, { value: "#C86E82", label: "#C86E82" }, { value: "#B47850", label: "#B47850" }] },
    ],
    initial: { label: "영화", iconKey: "book" },
    render: (p) => (
      <CategoryChip
        color={SKY}
        label={String(p.label ?? "")}
        iconKey={p.iconKey as string | undefined}
        hex={p.hex as string | undefined}
      />
    ),
    code: (p) => snippet("CategoryChip", { color: "{CAT_COLORS.sky}", label: p.label, iconKey: p.iconKey, hex: p.hex }),
  },

  {
    id: "category-pill",
    group: "카테고리",
    name: "CategoryPill",
    notes: ["서랍장·필터에서 하나를 고르는 알약"],
    controls: [
      { key: "label", type: "text" },
      { key: "count", type: "number", min: 0, max: 99 },
      { key: "iconKey", type: "select", options: opts("book", "cafe", "walk", "music") },
      { key: "size", type: "select", options: opts("sm", "md") },
      { key: "active", type: "bool" },
      { key: "hex", type: "select", options: [{ value: undefined, label: "(토큰색)" }, { value: "#B47850", label: "#B47850" }] },
    ],
    initial: { label: "산책", count: 7, iconKey: "walk", size: "md", active: true },
    render: (p) => (
      <CategoryPill
        label={String(p.label ?? "")}
        count={Number(p.count) || undefined}
        iconKey={p.iconKey as string}
        size={p.size as never}
        active={Boolean(p.active)}
        hex={p.hex as string | undefined}
      />
    ),
    code: (p) => snippet("CategoryPill", { label: p.label, count: Number(p.count) || undefined, iconKey: p.iconKey, size: p.size === "md" ? undefined : p.size, active: p.active, hex: p.hex }),
  },

  {
    id: "category-select",
    group: "카테고리",
    name: "CategorySelect",
    notes: ["패널은 portal로 뜬다 — 부모 overflow에 안 잘린다"],
    controls: [
      { key: "size", type: "select", options: opts("xs", "sm", "md", "lg") },
      { key: "variant", type: "select", options: opts("grain", "liquid", "dotted", "text") },
      { key: "align", type: "select", options: opts("left", "right") },
    ],
    initial: { size: "md", variant: "grain", align: "left" },
    render: (p) => (
      <CategorySelectDemo size={p.size as never} variant={p.variant as never} align={p.align as never} />
    ),
    code: (p) => snippet("CategorySelect", { value: "{cat}", onChange: "{setCat}", options: "{CAT_OPTIONS}", size: p.size === "md" ? undefined : p.size, variant: p.variant === "grain" ? undefined : p.variant, align: p.align }),
  },

  {
    id: "category-icon",
    group: "아이콘",
    name: "CategoryIcon",
    notes: ["키 → lucide 아이콘 레지스트리. 이모지도 키로 폴백된다"],
    wide: true,
    render: () => (
      <div className="flex flex-wrap gap-3">
        {Object.keys(CATEGORY_ICONS).map((k) => (
          <span key={k} className="flex w-[68px] flex-col items-center gap-1 text-ink-3">
            <CategoryIcon categoryKey={k} size={18} />
            <code className="truncate font-mono text-[10px] text-ink-4">{k}</code>
          </span>
        ))}
      </div>
    ),
  },

  {
    id: "page-title",
    group: "레이아웃",
    name: "PageTitle",
    notes: ["제목 + 소제목 + 우측 액션 한 자리", "액션이 있든 없든 행 높이는 34px 고정"],
    wide: true,
    controls: [
      { key: "title", type: "text" },
      { key: "subtitle", type: "text" },
      { key: "action", type: "bool" },
    ],
    initial: { title: "스치는 것들", subtitle: "문득 · 다짐 · 바람, 일단 적어두기", action: true },
    render: (p) => (
      <div className="w-full">
        <PageTitle
          title={String(p.title ?? "")}
          subtitle={p.subtitle ? String(p.subtitle) : undefined}
          action={
            p.action ? (
              <Button variant="grain" size="sm" icon={Plus}>
                기록
              </Button>
            ) : undefined
          }
        />
      </div>
    ),
    code: (p) => snippet("PageTitle", { title: p.title, subtitle: p.subtitle, action: p.action ? "{<Button …/>}" : undefined }),
  },

  {
    id: "empty-state",
    group: "피드백",
    name: "EmptyState",
    notes: ["size: full · section · inline", "ownerOnly 액션은 isOwner일 때만 나온다"],
    wide: true,
    controls: [
      { key: "size", type: "select", options: opts("section", "inline", "full") },
      { key: "title", type: "text" },
      { key: "description", type: "text" },
      { key: "isOwner", type: "bool" },
    ],
    initial: {
      size: "section",
      title: "아직 적어둔 게 없어요",
      description: "문득 스친 생각을 위에 적어보세요",
      isOwner: true,
    },
    render: (p) => (
      <div className="w-full">
        <EmptyState
          size={p.size as never}
          icon={Feather}
          title={String(p.title ?? "")}
          description={p.description ? String(p.description) : undefined}
          isOwner={Boolean(p.isOwner)}
          actions={[{ label: "기록하기", icon: Plus, variant: "primary", ownerOnly: true, onClick: () => {} }]}
        />
      </div>
    ),
    code: (p) => snippet("EmptyState", { size: p.size, icon: "{Feather}", title: p.title, description: p.description, isOwner: p.isOwner }),
  },

  {
    id: "toast",
    group: "피드백",
    name: "useToast",
    notes: ["액션 토스트는 TOAST_ACTION_MS 동안 떠 있다 — 그 사이 되돌릴 수 있다"],
    render: () => <ToastDemo />,
    code: () => `const toast = useToast();\ntoast.info("문득 하나 지웠어요", {\n  label: "다시 적기",\n  onClick: () => restore(),\n});`,
  },


  {
    id: "toggle",
    group: "컨트롤",
    name: "Toggle",
    notes: ["on/off 스위치는 이것만 — 체크박스로 대신하지 않는다", "onChange 없으면 표시 전용"],
    controls: [
      { key: "checked", type: "bool" },
      { key: "size", type: "select", options: opts("sm", "md", "lg") },
      { key: "color", type: "select", options: COLORS },
      { key: "readOnly", type: "bool" },
    ],
    initial: { checked: true, size: "md" },
    render: (p) => <ToggleDemo checked={Boolean(p.checked)} size={p.size as never} color={p.color as string | undefined} readOnly={Boolean(p.readOnly)} />,
    code: (p) => snippet("Toggle", { checked: "{on}", onChange: p.readOnly ? undefined : "{setOn}", label: "공개", size: p.size === "md" ? undefined : p.size, color: p.color }),
  },

  {
    id: "icon-button",
    group: "컨트롤",
    name: "IconButton",
    notes: ["아이콘만 있는 원형 버튼 + 툴팁(라벨이 툴팁을 대신한다)", "둥근 사각이 필요하면 Button shape='square'"],
    controls: [
      { key: "shape", type: "select", options: opts("round", "square") },
      { key: "size", type: "select", options: opts("xs", "sm", "md", "lg") },
      { key: "tone", type: "select", options: opts("default", "muted", "primary", "danger") },
      { key: "icon", type: "select", options: iconOpts.slice(1) },
      { key: "tooltipSide", type: "select", options: opts("top", "bottom", "left", "right") },
      { key: "hoverActive", type: "bool" },
    ],
    initial: { shape: "round", size: "md", tone: "default", icon: "Search", tooltipSide: "bottom" },
    render: (p) => (
      <IconButton
        label="검색"
        icon={createElement(ICONS[p.icon as string] ?? Search, { size: 16, strokeWidth: 1.9 })}
        shape={p.shape as never}
        size={p.size as never}
        tone={p.tone as never}
        tooltipSide={p.tooltipSide as never}
        hoverActive={Boolean(p.hoverActive)}
      />
    ),
    code: (p) => snippet("IconButton", { label: "검색", icon: `{${p.icon}}`, shape: p.shape === "round" ? undefined : p.shape, size: p.size === "md" ? undefined : p.size, tone: p.tone === "default" ? undefined : p.tone, tooltipSide: p.tooltipSide === "bottom" ? undefined : p.tooltipSide, hoverActive: p.hoverActive }),
  },

  {
    id: "nav-tabs",
    group: "레이아웃",
    name: "NavTabs",
    notes: [
      "표식 알약 하나가 고른 탭으로 미끄러진다 (트랙 없음)",
      "좌표만 재서 넘기고 트위닝은 CSS — JS 루프 없음",
      "라우팅은 앱 몫: href를 주면 주입된 Link, onSelect를 주면 button",
    ],
    wide: true,
    render: () => <NavTabsDemo />,
    code: () => `<NavTabs\n  tabs={[\n    { label: "일기", href: "/", isActive: true },\n    { label: "발자취", href: "/places", isActive: false },\n  ]}\n/>`,
  },

  {
    id: "modal",
    group: "표면",
    name: "Modal",
    notes: [
      "alert / confirm / custom 세 가지 — await로 결과를 받는다",
      "ModalProvider에 pathname을 넘기면 라우트가 바뀔 때 자동으로 닫힌다",
    ],
    render: () => <ModalDemo />,
    code: () => `const modal = useModal();\n\nif (await modal.confirm({ message: "지울까요?" })) {\n  remove();\n}`,
  },

  {
    id: "embed-card",
    group: "임베드",
    name: "EmbedCard",
    notes: [
      "block = 줄에 혼자 놓인 링크. 음악이면 CD, 나머지는 표지 카드를 알아서 고른다",
      "line = 문장 속 링크 — 『제목』 + 점선 + (저자), 호버하면 표지가 뜬다",
      "React가 아니라 마크업을 붙인다 — 발행 HTML과 한 픽셀도 안 달라야 해서. 움직임은 전부 :hover",
    ],
    wide: true,
    controls: [
      { key: "format", type: "select", options: opts("block", "line") },
      {
        key: "src",
        type: "select",
        options: [
          { value: "https://www.kyobobook.co.kr/product/1", label: "책" },
          { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", label: "영상" },
          { value: "https://music.apple.com/kr/album/1", label: "음악" },
          { value: "https://tailwindcss.com/blog/tailwindcss-v4", label: "링크" },
        ],
      },
      { key: "title", type: "text" },
      { key: "author", type: "text" },
      {
        key: "tint",
        type: "select",
        options: [
          { value: "", label: "(기본)" },
          { value: "92,130,104", label: "초록" },
          { value: "200,110,130", label: "분홍" },
          { value: "80,120,200", label: "파랑" },
        ],
      },
      { key: "align", type: "select", options: opts("left", "center") },
    ],
    initial: {
      format: "block",
      src: "https://www.kyobobook.co.kr/product/1",
      title: "작별하지 않는다",
      author: "한강",
      tint: "92,130,104",
      align: "left",
    },
    render: (p) => {
      const data = {
        src: String(p.src),
        title: String(p.title ?? ""),
        description: "",
        image: "",
        tint: String(p.tint ?? ""),
        author: String(p.author ?? ""),
        site: "",
        align: p.align as "left" | "center",
      };
      return p.format === "line" ? (
        <p className="text-[15px] leading-8 text-ink-2">
          요즘 자기 전에 <EmbedCard data={data} format="line" /> 를 조금씩 읽고 있다.
        </p>
      ) : (
        <div className="w-full">
          <EmbedCard data={data} />
        </div>
      );
    },
    code: (p) =>
      snippet("EmbedCard", {
        data: "{{ src, title, author, tint, image, site, description }}",
        format: p.format === "block" ? undefined : p.format,
      }),
  },

  {
    id: "image-editor",
    group: "임베드",
    name: "ImageEditor",
    notes: [
      "자르기(비율 5종) · 회전 후 업로드하는 전면 편집창",
      "업로드처는 앱이 configure({ uploadImage })로 꽂는다 — 패키지는 백엔드를 모른다",
      "다른 출처 이미지는 캔버스를 오염시켜 저장이 막힌다 → configure({ proxySrc })",
    ],
    render: () => <ImageEditorDemo />,
    code: () => `configure({ uploadImage: (blob) => uploadFile(blob) });\n\n{editorProps && <ImageEditor {...editorProps} />}`,
  },

  {
    id: "icon-motion",
    group: "모션",
    name: "아이콘 hover",
    notes: ["shape='square'는 hoverActive + icon-* 모션을 항상 같이 준다", "마우스를 올려보세요"],
    wide: true,
    render: () => (
      <div className="flex flex-wrap gap-4">
        {ICON_MOTIONS.map(([cls, Icon]) => (
          <span key={cls} className="flex flex-col items-center gap-1.5">
            <Button shape="square" hoverActive icon={Icon} className={cls} aria-label={cls} />
            <code className="font-mono text-[10px] text-ink-4">{cls.replace("icon-", "")}</code>
          </span>
        ))}
      </div>
    ),
  },
];

/* ── 스토리 안에서 상태가 필요한 것들 ── */

function CategorySelectDemo({
  size,
  variant,
  align,
}: {
  size: "xs" | "sm" | "md" | "lg";
  variant: "grain" | "liquid" | "dotted" | "text";
  align: "left" | "right";
}) {
  const [cat, setCat] = useState("note");
  return (
    <CategorySelect value={cat} onChange={setCat} options={CAT_OPTIONS} size={size} variant={variant} align={align} />
  );
}

function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="grain"
        onClick={() =>
          toast.info("“문득 하나” 지웠어요", {
            label: "다시 적기",
            onClick: () => toast.success("되살렸어요"),
          })
        }
      >
        되돌리기 액션
      </Button>
      <Button variant="grain" tone="primary" onClick={() => toast.success("저장했어요")}>
        성공
      </Button>
      <Button variant="grain" tone="danger" onClick={() => toast.error("실패했어요")}>
        실패
      </Button>
    </div>
  );
}

function ToggleDemo({
  checked,
  size,
  color,
  readOnly,
}: {
  checked: boolean;
  size: "sm" | "md" | "lg";
  color?: string;
  readOnly: boolean;
}) {
  const [on, setOn] = useState(checked);
  return (
    <div className="flex items-center gap-2.5">
      <Toggle
        checked={readOnly ? checked : on}
        onChange={readOnly ? undefined : setOn}
        label="공개"
        size={size}
        color={color}
      />
      <span className="text-[13px] text-ink-3">공개</span>
    </div>
  );
}

function NavTabsDemo() {
  const [active, setActive] = useState(0);
  const labels = ["일기", "발자취", "다락방", "끄적끄적", "아카이브"];
  return (
    <NavTabs
      tabs={labels.map((label, i) => ({
        label,
        isActive: i === active,
        onSelect: () => setActive(i),
      }))}
    />
  );
}

function ModalDemo() {
  const modal = useModal();
  const [result, setResult] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="grain" onClick={() => modal.alert({ message: "저장했어요" })}>
        alert
      </Button>
      <Button
        variant="grain"
        tone="danger"
        onClick={async () => {
          const ok = await modal.confirm({ message: "이 기록을 지울까요?", confirmLabel: "지우기", variant: "danger" });
          setResult(ok ? "지웠어요" : "그만뒀어요");
        }}
      >
        confirm
      </Button>
      {result && <span className="text-[12.5px] text-ink-4">{result}</span>}
    </div>
  );
}

function ImageEditorDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="grain" tone="primary" onClick={() => setOpen(true)}>
        편집창 열기
      </Button>
      {open && (
        <ImageEditor
          src="https://picsum.photos/900/1200"
          onDone={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}
