import { useState, type CSSProperties } from "react";
import { CalendarDays, Home, PiggyBank, Settings } from "lucide-react";
import { CrayonBar, CrayonCheck, CrayonCircle, CrayonColumns, CrayonFrame, CrayonNavItem, CrayonPen, CrayonSideTabs, CrayonSteps, CrayonWash } from "bongchil-design-system/crayon";
import { type Story } from "./controls";

/* 크레용 타입 스토리 — 기존 스토리와 섞지 않고 네비의 "크레용" 쪽에만 뜬다 */

const COLORS = [
  { value: undefined, label: "primary" },
  { value: "var(--color-comment-sky-solid)", label: "sky" },
  { value: "var(--color-comment-mint-solid)", label: "mint" },
  { value: "var(--color-comment-sand-solid)", label: "sand" },
  { value: "var(--color-comment-pink-solid)", label: "pink" },
  { value: "var(--color-comment-charcoal-solid)", label: "charcoal" },
];

const colorAttr = (c: unknown) => (c ? ` color="${c}"` : "");

const FILTERS = [
  { id: "", label: "(없음)" },
  { id: "crayon", label: "#crayon" },
  { id: "pastel", label: "#pastel" },
  { id: "pastel-line", label: "#pastel-line" },
  { id: "graphite", label: "#graphite" },
];


/** 세로 탭 미리 보기 — 고르면 바뀌어야 해서 상태가 있는 작은 부품 */
function SideTabsDemo({ color }: { color?: string }) {
  const [v, setV] = useState<"todo" | "read" | "save">("todo");
  return (
    <div className="w-[208px]">
      <CrayonSideTabs
        value={v}
        onChange={setV}
        items={[
          { key: "todo", label: "할 일", color: color ?? "var(--color-comment-pink-solid)", count: "8개", sub: "5/8 끝냄", ratio: 5 / 8 },
          { key: "read", label: "읽을 책", color: "var(--color-comment-sky-solid)", count: "3권", sub: "1/3 읽음", ratio: 1 / 3 },
          { key: "save", label: "모을 돈", color: "var(--color-comment-mint-solid)", count: "4곳", sub: "62% 모음", ratio: 0.62 },
        ]}
      />
    </div>
  );
}

/** 누르면 그 칸이 켜졌다 꺼졌다 — 켤 때 빗금 · 체크가 그어지는 걸 보려고 */
function CheckDemo({ on, ...rest }: { on: boolean; check: boolean; bare: boolean; mix: boolean; next: boolean; size: number; color?: string }) {
  const [ons, setOns] = useState(() => [on, on, on, on]);
  return (
    <div className="flex items-center gap-3">
      {ons.map((v, i) => (
        <button key={i} type="button" aria-pressed={v} onClick={() => setOns((cur) => cur.map((x, j) => (j === i ? !x : x)))}>
          <CrayonCheck seed={"abcd"[i]} on={v} {...rest} />
        </button>
      ))}
    </div>
  );
}

/** 누른 탭으로 형광펜이 옮겨 가며 다시 칠해짐 */
function WashTabs({ color, still, first }: { color?: string; still: boolean; first: string }) {
  const tabs = ["흐름", first, "설정"];
  const [v, setV] = useState(1);
  return (
    <div className="flex items-center gap-6 text-[17px]">
      {tabs.map((t, i) =>
        i === v ? (
          <CrayonWash key={i} color={color} still={still}>
            <span className="font-bold text-ink-2">{t}</span>
          </CrayonWash>
        ) : (
          <button key={i} type="button" className="text-ink-4 hover:text-ink-2" onClick={() => setV(i)}>
            {t}
          </button>
        ),
      )}
    </div>
  );
}

/** 누른 날에 네모가 새로 그어짐 */
function FrameDays({ color }: { color?: string }) {
  const [v, setV] = useState(4);
  return (
    <div className="flex gap-4 text-[13px] tabular-nums text-ink-2">
      {[3, 4, 5].map((d) => (
        <button key={d} type="button" onClick={() => setV(d)} className="relative grid h-14 w-16 place-items-center">
          {d}일{d === v && <CrayonFrame color={color} />}
        </button>
      ))}
    </div>
  );
}

function NavDemo({ color }: { color?: string }) {
  const [v, setV] = useState("home");
  const items = [
    { key: "home", label: "처음", Icon: Home },
    { key: "cal", label: "달력", Icon: CalendarDays },
    { key: "save", label: "모으기", Icon: PiggyBank },
    { key: "set", label: "설정", Icon: Settings },
  ];
  return (
    <div className="flex w-[172px] flex-col gap-0.5">
      {items.map(({ key, label, Icon }) => (
        <CrayonNavItem key={key} as="button" type="button" onClick={() => setV(key)} active={v === key} color={color} icon={<Icon />}>
          {label}
        </CrayonNavItem>
      ))}
    </div>
  );
}

export const CRAYON_STORIES: Story[] = [
  {
    id: "crayon-filters",
    group: "기초",
    name: "필터 4종",
    notes: ["<CrayonDefs />를 페이지에 한 번 — 이게 없으면 결이 하나도 안 붙는다", "같은 칸에 필터만 바꿔 얹은 것"],
    wide: true,
    render: () => (
      <div className="flex w-full flex-wrap gap-6">
        {FILTERS.map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-2">
            <span
              className="h-10 w-20 rounded-[4px] bg-primary"
              style={f.id ? { filter: `url(#${f.id})` } : undefined}
            />
            <span
              className="h-[2px] w-20 bg-ink/60"
              style={f.id ? { filter: `url(#${f.id})` } : undefined}
            />
            <code className="font-mono text-[10.5px] text-ink-4">{f.label}</code>
          </div>
        ))}
      </div>
    ),
    code: () => `import { CrayonDefs } from "bongchil-design-system/crayon";\n\n<CrayonDefs />  // 루트에 한 번`,
  },

  {
    id: "crayon-bar",
    group: "진행",
    name: "CrayonBar",
    fresh: true,
    notes: ["한 만큼은 칠(.crayon-fill), 남은 만큼은 손빗금(.crayon-todo)", "now를 주면 잉크색 지금 선", "새로: ratio가 1을 넘으면 1까지는 color, 넘친 만큼은 over 색(기본 --color-over)", "높이는 className으로"],
    wide: true,
    controls: [
      { key: "ratio", type: "number", min: 0, max: 160 },
      { key: "now", type: "number", min: 0, max: 100 },
      { key: "color", type: "select", options: COLORS },
    ],
    initial: { ratio: 60, now: 72 },
    render: (p) => (
      <div className="flex w-full flex-col gap-5">
        <CrayonBar ratio={Number(p.ratio) / 100} now={Number(p.now) / 100} color={p.color as string | undefined} />
        <CrayonBar ratio={Number(p.ratio) / 100} color={p.color as string | undefined} style={{ height: 14 }} />
      </div>
    ),
    code: (p) => `<CrayonBar ratio={${Number(p.ratio) / 100}} now={${Number(p.now) / 100}}${colorAttr(p.color)} />`,
  },

  {
    id: "crayon-fill",
    group: "기초",
    name: "칠 · 빗금 · 가장자리",
    notes: [".crayon-fill 칠한 면", ".crayon-todo 안 한 쪽 빗금. 빗금 진하기는 --crayon-todo-p (기본 56%)", ".crayon-edge 가장자리만 흔들 때 (작은 칸, 점)", "색은 --crayon (기본 --color-primary)"],
    wide: true,
    controls: [{ key: "todoP", type: "number", min: 10, max: 100 }],
    initial: { todoP: 56 },
    render: (p) => (
      <div className="flex w-full flex-wrap items-end gap-8">
        <div className="flex flex-col items-center gap-2">
          <span className="crayon-fill block h-10 w-24" />
          <code className="font-mono text-[10.5px] text-ink-4">.crayon-fill</code>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="crayon-todo block h-10 w-24" style={{ "--crayon-todo-p": `${p.todoP}%` } as CSSProperties} />
          <code className="font-mono text-[10.5px] text-ink-4">.crayon-todo</code>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="flex gap-2">
            {["--color-primary", "--color-comment-sky-solid", "--color-comment-sand-solid"].map((c) => (
              <span key={c} className="crayon-edge block size-5 rounded-[4px]" style={{ boxShadow: `inset 0 0 0 1.5px var(${c})` }} />
            ))}
            <span className="crayon-edge block size-5 rounded-[4px] bg-ink" />
          </span>
          <code className="font-mono text-[10.5px] text-ink-4">.crayon-edge</code>
        </div>
      </div>
    ),
    code: (p) => `<span class="crayon-fill" style="--crayon: var(--color-comment-sky-solid)" />\n<span class="crayon-todo" style="--crayon-todo-p: ${p.todoP}%" />`,
  },

  {
    id: "crayon-wash",
    group: "레이아웃",
    name: "CrayonWash (형광펜)",
    notes: [
      "글자 아래 절반을 칠한다. 붙을 때 왼쪽부터 0.26초 — 데모에서 탭을 눌러 보기",
      "고른 탭·강조 단어에. 상자 대신 이걸로 고른 걸 보여준다",
      "높이 --crayon-wash-h (기본 55%), 진하기 --crayon-wash-p (기본 60%)",
      "still: 늘 칠해져 있는 제목·강조는 움직임 없이 (클래스 .crayon-wash-still)",
    ],
    controls: [
      { key: "text", type: "text" },
      { key: "color", type: "select", options: COLORS },
      { key: "h", type: "number", min: 20, max: 100 },
      { key: "p", type: "number", min: 10, max: 100 },
      { key: "still", type: "bool" },
    ],
    initial: { text: "오늘 할 일", h: 55, p: 60, still: false },
    render: (p) => (
      <div style={{ "--crayon-wash-h": `${p.h}%`, "--crayon-wash-p": `${p.p}%` } as CSSProperties}>
        {/* 글자를 바꾸면 처음부터 다시 */}
        <WashTabs key={String(p.text)} first={String(p.text)} color={p.color as string | undefined} still={Boolean(p.still)} />
      </div>
    ),
    code: (p) =>
      `<CrayonWash${colorAttr(p.color)}${p.still ? " still" : ""}>${p.text}</CrayonWash>` +
      (p.h !== 55 || p.p !== 60 ? `\n/* 감싼 요소에 */ --crayon-wash-h: ${p.h}%; --crayon-wash-p: ${p.p}%;` : ""),
  },

  {
    id: "crayon-line",
    group: "기초",
    name: "연필 선",
    notes: [".crayon-line — 가는 잉크 선에 종이 결 (#graphite)", "굵기는 height로", "칸을 나누는 상자 대신 이 선 하나로"],
    wide: true,
    render: () => (
      <div className="flex w-full flex-col gap-4">
        <p className="text-[13px] text-ink-3">아침</p>
        <span className="crayon-line" />
        <p className="text-[13px] text-ink-3">점심</p>
        <span className="crayon-line" style={{ height: 3 }} />
        <p className="text-[13px] text-ink-3">저녁</p>
        <span className="crayon-line w-16" style={{ height: 1.4 }} />
      </div>
    ),
    code: () => `<span class="crayon-line" />`,
  },

  {
    id: "crayon-circle",
    group: "표시",
    name: "CrayonCircle (손그림 동그라미)",
    fresh: true,
    notes: [
      "찌그러진 동그라미를 글자 뒤에 칠한다 — 고른 날, 고른 값",
      "ring은 칠 없이 크레용 테두리만 (오늘 같은 표시)",
      "새로: className · style로 크기 · 자리 조절 (작은 칸에선 minWidth/minHeight를 줄임)",
      "아래 줄: 컴포넌트 없이 .crayon-blob 클래스만 — 어떤 요소든 뒤에 같은 동그라미. 진하기 --crayon-blob-p (기본 32%), 안쪽 여백 --crayon-blob-inset",
    ],
    controls: [
      { key: "ring", type: "bool" },
      { key: "color", type: "select", options: COLORS },
      { key: "blobP", type: "number", min: 10, max: 100 },
    ],
    initial: { ring: false, blobP: 32 },
    render: (p) => (
      <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-3 text-[14px] font-bold tabular-nums text-ink-2">
        {[1, 2, 3, 4, 5, 6, 7].map((d) =>
          d === 4 ? (
            <CrayonCircle key={d} ring={Boolean(p.ring)} color={p.color as string | undefined}>
              {d}
            </CrayonCircle>
          ) : (
            <span key={d} className="grid size-7 place-items-center font-normal text-ink-3">
              {d}
            </span>
          ),
        )}
      </div>
      <div className="flex items-center gap-2 text-[13px] text-ink-3">
        {["아침", "점심", "저녁"].map((t) => (
          <span
            key={t}
            className={t === "점심" ? "crayon-blob px-3 py-1.5 font-bold text-ink-2" : "px-3 py-1.5"}
            style={t === "점심" ? ({ "--crayon-blob-p": `${p.blobP}%`, ...(p.color ? { "--crayon": p.color } : {}) } as CSSProperties) : undefined}
          >
            {t}
          </span>
        ))}
      </div>
      </div>
    ),
    code: (p) => `<CrayonCircle${p.ring ? " ring" : ""}${colorAttr(p.color)}>4</CrayonCircle>\n<span class="crayon-blob" style="--crayon-blob-p: ${p.blobP}%">점심</span>`,
  },

  // ── 새로 들어온 것 (fresh — 검수 중) ──
  {
    id: "crayon-check",
    group: "컨트롤",
    name: "CrayonCheck (손그림 체크 칸)",
    fresh: true,
    notes: ["두 번 겹쳐 그은 휜 테두리 + 손빗금 — 작은 칸엔 크레파스 필터 대신 이 결", "on이면 촘촘한 빗금 + 펜 체크, 아니면 옅은 빗금, bare는 테두리만", "seed가 같으면 늘 같은 모양 (목록에선 항목 id)", "켤 때만 빗금이 한 줄씩, 이어서 체크가 그어짐 — 데모에서 칸을 눌러 보기", "mix: 묶음 일부만 함 (왼쪽 절반 칠) · next: 다음 할 것 (굵은 테두리) — 끈 칸에서 보임"],
    controls: [
      { key: "on", type: "bool" },
      { key: "check", type: "bool" },
      { key: "bare", type: "bool" },
      { key: "mix", type: "bool" },
      { key: "next", type: "bool" },
      { key: "size", type: "number", min: 12, max: 40 },
      { key: "color", type: "select", options: COLORS },
    ],
    initial: { on: true, check: true, bare: false, mix: false, next: false, size: 22 },
    render: (p) => <CheckDemo key={String(p.on)} on={Boolean(p.on)} check={Boolean(p.check)} bare={Boolean(p.bare)} mix={Boolean(p.mix)} next={Boolean(p.next)} size={Number(p.size)} color={p.color as string | undefined} />,
    code: (p) => `<CrayonCheck on={${Boolean(p.on)}}${p.mix ? " mix" : ""}${p.next ? " next" : ""} seed="a" size={${p.size}}${colorAttr(p.color)} />`,
  },

  {
    id: "crayon-steps",
    group: "진행",
    name: "CrayonSteps (칸 띠)",
    fresh: true,
    notes: ["total칸 중 done칸을 메움 — 회차 · 진행 · 출석", "skip칸은 테두리만 (자리는 차지해서 끝 칸이 밀림)"],
    controls: [
      { key: "total", type: "number", min: 1, max: 24 },
      { key: "done", type: "number", min: 0, max: 24 },
      { key: "color", type: "select", options: COLORS },
    ],
    initial: { total: 12, done: 5 },
    render: (p) => <CrayonSteps total={Number(p.total)} done={Number(p.done)} skip={[2]} seed="steps" color={p.color as string | undefined} />,
    code: (p) => `<CrayonSteps total={${p.total}} done={${p.done}} skip={[2]}${colorAttr(p.color)} />`,
  },

  {
    id: "crayon-columns",
    group: "진행",
    name: "CrayonColumns (기둥 줄)",
    fresh: true,
    notes: ["값마다 높이, 0은 바닥 선", "진한 칸은 마지막(기본) 또는 가장 큰 칸(peak), 나머지는 옅게", "live면 마지막 칸은 아직 진행 중 — 빗금", "키 큰 칠은 #pastel-block(세로 결, 구멍 덜 남) — CrayonDefs에 새로 들어감"],
    wide: true,
    controls: [
      { key: "peak", type: "bool" },
      { key: "live", type: "bool" },
      { key: "color", type: "select", options: COLORS },
    ],
    initial: { peak: false, live: true },
    render: (p) => (
      <div className="w-64">
        <CrayonColumns values={[12, 30, 0, 22, 41, 18, 26]} h={48} peak={Boolean(p.peak)} live={Boolean(p.live)} color={p.color as string | undefined} />
      </div>
    ),
    code: (p) => `<CrayonColumns values={[12, 30, 0, 22, 41, 18, 26]} h={48}${p.peak ? " peak" : ""}${p.live ? " live" : ""}${colorAttr(p.color)} />`,
  },

  {
    id: "crayon-frame",
    group: "카드 · 종이",
    name: "CrayonFrame (손으로 두른 네모)",
    fresh: true,
    notes: ["고른 칸 표시 — 부모(relative)를 꽉 채움", "변마다 따로 그은 선이 모서리에서 엇갈려 넘침, 처음 생길 때 펜처럼 그어짐 — 데모에서 날을 눌러 보기", "칸 비율대로 늘어나도 선 굵기는 그대로"],
    controls: [{ key: "color", type: "select", options: COLORS }],
    render: (p) => <FrameDays key={String(p.color)} color={p.color as string | undefined} />,
    code: (p) => `<span className="relative">4일 <CrayonFrame${colorAttr(p.color)} /></span>`,
  },

  {
    id: "crayon-pen",
    group: "표시",
    name: "CrayonPen (펜 표시)",
    fresh: true,
    notes: ["인쇄된 화면에 펜으로 표시하듯 — 칠하지 않고 획만", "underline 밑줄 · strike 끝난 것 (체크는 CrayonCheck)", "글자를 relative로 감싼 부모 안에 둔다", "className을 주면 자리 · 크기는 부르는 쪽이 정함 (기본 자리 대신)"],
    controls: [{ key: "color", type: "select", options: COLORS }],
    render: (p) => (
      <div className="flex items-center gap-8 text-[15px] text-ink-2">
        <span className="relative inline-block">밑줄<CrayonPen kind="underline" color={p.color as string | undefined} /></span>
        <span className="relative inline-block">끝난 일<CrayonPen kind="strike" /></span>
      </div>
    ),
    code: () => `<span className="relative">밑줄<CrayonPen kind="underline" /></span>\n<span className="relative">끝난 일<CrayonPen kind="strike" /></span>`,
  },

  {
    id: "crayon-side-tabs",
    group: "레이아웃",
    name: "CrayonSideTabs (세로 탭)",
    fresh: true,
    notes: ["고를 묶음을 위아래로 — 오른쪽에 고른 묶음의 내용을 두는 두 칸 화면의 왼쪽", "묶음마다 크레용 칩 · 이름 · 개수, 아래 한 줄 값(sub) · 크레용 막대(ratio 0~1)", "고른 칸은 그 묶음 색을 옅게 칠한 크레파스 면(.crayon-pick) + 진한 글자", "role=tablist · aria-selected"],
    controls: [{ key: "color", type: "select", options: COLORS }],
    render: (p) => <SideTabsDemo color={p.color as string | undefined} />,
    code: () => `<CrayonSideTabs\n  value={v}\n  onChange={setV}\n  items={[\n    { key: "todo", label: "할 일", color: "var(--color-comment-pink-solid)", count: "8개", sub: "5/8 끝냄", ratio: 5 / 8 },\n    { key: "read", label: "읽을 책", count: "3권", sub: "1/3 읽음", ratio: 1 / 3 },\n  ]}\n/>`,
  },

  {
    id: "crayon-nav-item",
    group: "컨트롤",
    name: "CrayonNavItem (메뉴 한 줄)",
    fresh: true,
    notes: ["아이콘 · 이름. 지금 있는 곳(active)은 세로 탭과 같은 옅은 크레파스 면 + 진한 글자, 아이콘만 그 색", "링크 부품은 as로 — as={Link} href=\"/\" (안 주면 <a>)", "aria-current=page"],
    controls: [{ key: "color", type: "select", options: COLORS }],
    render: (p) => <NavDemo color={p.color as string | undefined} />,
    code: () => `<CrayonNavItem as={Link} href="/" active icon={<Home />}>처음</CrayonNavItem>`,
  },
];
