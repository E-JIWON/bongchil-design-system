import { useEffect, useMemo, useState } from "react";
import { Moon, Search, Sun } from "lucide-react";
import { Button, LiquidGlassDefs, Segmented } from "bongchil-design-system";
import { CrayonDefs } from "bongchil-design-system/crayon";
import { ControlsPanel, type Props, type Story } from "./controls";
import { STORIES as BASE_STORIES } from "./stories";
import { MORE_STORIES } from "./stories-more";
import { CRAYON_STORIES } from "./stories-crayon";

const GROUP_ORDER = ["기초", "컨트롤", "진행", "표시", "날짜", "카테고리", "표면", "레이아웃", "카드 · 종이", "피드백", "임베드", "아이콘", "모션", "방문자"];

/** 기존과 크레용이 같은 일을 하는 쌍 — 한 페이지에서 왼쪽 기존, 오른쪽 크레용 */
const TWINS: Record<string, string> = {
  "todo-checkbox": "crayon-check",
  "nav-tabs": "crayon-wash",
  "notice-area": "crayon-frame",
};
const twinOf = (id: string) => CRAYON_STORIES.find((s) => s.id === TWINS[id]);
const isCrayon = (s: Story) => CRAYON_STORIES.includes(s);

/** 한 목록 — 크레용은 하는 일 따라 기존 그룹에 섞이고, 쌍의 크레용 쪽은 기존 쪽 페이지에 들어간다 */
const STORIES = [...BASE_STORIES, ...MORE_STORIES, ...CRAYON_STORIES]
  .filter((s) => !Object.values(TWINS).includes(s.id))
  .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));

/** 주소창 `#button` → 그 스토리로 연다. 쌍의 크레용 쪽 주소(#crayon-check)는 기존 쪽 페이지로 */
const storyFromHash = () => {
  const id = window.location.hash.slice(1);
  return Object.keys(TWINS).find((k) => TWINS[k] === id) ?? STORIES.find((s) => s.id === id)?.id;
};

/** 이름 옆 작은 꼬리표 — 크레용만 있는 건 "크레용", 쌍은 "+ 크레용" */
function CrayonTag({ story }: { story: Story }) {
  const label = isCrayon(story) ? "크레용" : twinOf(story.id) ? "+ 크레용" : null;
  return label && <span className="ml-1.5 font-sans text-[10px] font-medium text-ink-5">{label}</span>;
}

/** 목록 거르기 — 쌍 페이지는 기존·크레용 어느 쪽에도 든다 */
type Kind = "all" | "base" | "crayon";
const KINDS = [
  { value: "all", label: "전체" },
  { value: "base", label: "기존" },
  { value: "crayon", label: "크레용" },
];
const ofKind = (s: Story, kind: Kind) =>
  kind === "all" || Boolean(twinOf(s.id)) || (kind === "crayon") === isCrayon(s);

/** 쌍 페이지 보기 — 나란히, 또는 한 칸에서 번갈아 */
type View = "both" | "base" | "crayon";
const VIEWS = [
  { value: "both", label: "나란히" },
  { value: "base", label: "기존" },
  { value: "crayon", label: "크레용" },
];

const ACCENTS = [
  { value: "", label: "green" },
  { value: "rose", label: "rose" },
  { value: "clay", label: "clay" },
  { value: "yellow", label: "yellow" },
  { value: "navy", label: "navy" },
];

/** 스토리별 손잡이 값 — 스토리를 오가도 조절해둔 값이 남는다 */
function useStoryProps() {
  const [byStory, setByStory] = useState<Record<string, Props>>({});
  return {
    get(id: string, initial: Props) {
      return byStory[id] ?? initial;
    },
    set(id: string, next: Props) {
      setByStory((cur) => ({ ...cur, [id]: next }));
    },
  };
}

export function App() {
  const [dark, setDark] = useState(false);
  const [accent, setAccent] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [view, setView] = useState<View>("both");
  const [activeId, setActiveId] = useState(() => storyFromHash() ?? "button");

  useEffect(() => {
    const onHash = () => {
      const id = storyFromHash();
      if (id) setActiveId(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function selectStory(id: string) {
    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
  }
  const props = useStoryProps();

  const story = STORIES.find((s) => s.id === activeId) ?? STORIES[0];
  const twin = twinOf(story.id);
  const pair = twin ? [story, twin] : [story];
  const sides = twin && view !== "both" ? [pair[view === "crayon" ? 1 : 0]] : pair;
  const split = twin && view === "both";

  // 검색 — 이름·그룹·메모를 한 덩어리로 훑는다
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const text = (s?: Story) => (s ? `${s.name} ${s.group} ${s.notes?.join(" ") ?? ""}` : "");
    const hits = STORIES.filter(
      (s) =>
        ofKind(s, kind) &&
        (!q || `${text(s)} ${text(twinOf(s.id))} ${isCrayon(s) || twinOf(s.id) ? "크레용" : ""}`.toLowerCase().includes(q)),
    );
    const map = new Map<string, Story[]>();
    hits.forEach((s) => map.set(s.group, [...(map.get(s.group) ?? []), s]));
    return [...map];
  }, [query, kind]);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }

  function pickAccent(v: string) {
    setAccent(v);
    if (v) document.documentElement.setAttribute("data-accent", v);
    else document.documentElement.removeAttribute("data-accent");
  }

  return (
    <div className="flex h-dvh">
      <LiquidGlassDefs />
      <CrayonDefs />

      {/* ── 좌측 네비 ── */}
      {/* 왼쪽에 떠 있는 패널 — 본문은 그 폭만큼 비켜 선다 */}
      <aside className="fixed bottom-3 left-3 top-3 z-10 flex w-[272px] flex-col rounded-lg bg-surface/85 shadow-[0_4px_20px_rgb(var(--shadow-ink)/0.12)] backdrop-blur-md">
        <div className="px-4 pb-3 pt-4">
          <p className="mb-3 text-[14px] font-bold tracking-tight text-ink-2">봉칠 디자인 시스템</p>
          <label className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface/70 px-2.5 focus-within:border-primary/40">
            <Search size={14} strokeWidth={2} className="shrink-0 text-ink-4" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] text-ink-2 outline-none placeholder:text-ink-5"
              placeholder="검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <Segmented className="mt-2.5" groups={[{ items: KINDS, value: kind, onChange: (v) => setKind(v as Kind) }]} />
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 pb-3">
          {groups.length === 0 && (
            <p className="px-2 py-6 text-center text-[12px] text-ink-4">찾는 게 없어요</p>
          )}
          {groups.map(([group, items]) => (
            <div key={group} className="mb-3">
              <p className="px-2 pb-1 text-[11.5px] font-bold uppercase tracking-wider text-ink-5">
                {group}
              </p>
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectStory(s.id)}
                  className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-[14px] transition-colors ${
                    s.id === activeId
                      ? "bg-primary-muted font-bold text-ink-2"
                      : "text-ink-3 hover:bg-surface-subtle"
                  }`}
                  // 새로 들어와 검수 중인 스토리는 글자색을 따로 (fresh)
                  style={s.fresh ? { color: "var(--color-comment-sky-solid)" } : undefined}
                >
                  {s.name}
                  <CrayonTag story={s} />
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-1.5 px-3 py-3">
          <Button size="xs" icon={dark ? Moon : Sun} on={dark} onClick={toggleDark}>
            {dark ? "다크" : "라이트"}
          </Button>
          {ACCENTS.map((a) => (
            <Button
              key={a.label}
              size="xs"
              on={accent === a.value}
              onClick={() => pickAccent(a.value)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </aside>

      {/* ── 본문 ── */}
      <main className="flex-1 overflow-y-auto pl-[284px]">
        <div className="mx-auto max-w-[760px] px-8 py-8">
          <h1 className="font-mono text-[17px] font-bold tracking-tight text-ink-2" style={story.fresh ? { color: "var(--color-comment-sky-solid)" } : undefined}>
            {story.name}
            {twin && <span className="text-ink-4"> · {twin.name}</span>}
            <CrayonTag story={story} />
            {story.fresh && <span className="ml-2 align-middle font-sans text-[11px] font-medium">새로 들어옴 · 검수 중</span>}
          </h1>
          {sides.some((s) => s.notes) && (
            <ul className="mt-2 flex flex-col gap-0.5">
              {sides.flatMap((s, i) =>
                (s.notes ?? []).map((n) => (
                  <li key={s.id + n} className="text-[12px] text-ink-4">
                    · {i ? `크레용: ${n}` : n}
                  </li>
                )),
              )}
            </ul>
          )}

          {story.see && (
            <p className="mt-2 flex flex-wrap gap-x-3 text-[12px] text-ink-4">
              같이 보기
              {story.see.map((l) => (
                <a key={l.id} href={`#${l.id}`} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                  {l.label} →
                </a>
              ))}
            </p>
          )}

          {twin && (
            <Segmented className="mt-4" groups={[{ items: VIEWS, value: view, onChange: (v) => setView(v as View) }]} />
          )}

          {/* 미리보기 — 책상 배경 위에 올려야 유리가 제대로 보인다. 쌍이면 왼쪽 기존, 오른쪽 크레용 */}
          <div
            className={`mt-5 flex min-h-[168px] rounded-2xl border border-border p-6 ${
              story.wide || split ? "items-start" : "items-center justify-center"
            }`}
            style={{ background: "var(--preview-base)" }}
          >
            {split ? (
              <div className="grid w-full grid-cols-2">
                {sides.map((s, i) => (
                  <div key={s.id} className={`flex min-w-0 flex-col gap-4 ${i ? "border-l border-border pl-6" : "pr-6"}`}>
                    <p className="text-[11px] font-bold text-ink-5" style={s.fresh ? { color: "var(--color-comment-sky-solid)" } : undefined}>
                      {i ? "크레용" : "기존"}
                      {s.fresh && " · 새로 들어옴 · 검수 중"}
                    </p>
                    <div className="flex flex-1 items-center justify-center">{s.render(props.get(s.id, s.initial ?? {}))}</div>
                  </div>
                ))}
              </div>
            ) : (
              sides[0].render(props.get(sides[0].id, sides[0].initial ?? {}))
            )}
          </div>

          {sides.map(
            (s) =>
              s.controls && (
                <div key={s.id} className="mt-4 rounded-2xl border border-border bg-surface/55 p-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-5">
                    props{split && ` · ${s.name}`}
                  </p>
                  <ControlsPanel
                    controls={s.controls}
                    value={props.get(s.id, s.initial ?? {})}
                    onChange={(next) => props.set(s.id, next)}
                  />
                </div>
              ),
          )}

          {sides.map(
            (s, i) =>
              s.code && (
                <pre key={s.id} className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface-subtle/70 p-4 font-mono text-[11.5px] leading-relaxed text-ink-3">
                  {split && `// ${i ? "크레용" : "기존"}\n`}
                  {s.code(props.get(s.id, s.initial ?? {}))}
                </pre>
              ),
          )}
        </div>
      </main>
    </div>
  );
}
