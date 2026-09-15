import { useEffect, useMemo, useState } from "react";
import { Moon, Search, Sun } from "lucide-react";
import { Button, LiquidGlassDefs } from "bongchil-design-system";
import { ControlsPanel, type Props } from "./controls";
import { STORIES as BASE_STORIES } from "./stories";
import { MORE_STORIES } from "./stories-more";

const GROUP_ORDER = ["기초", "컨트롤", "날짜", "카테고리", "표면", "레이아웃", "카드 · 종이", "피드백", "임베드", "아이콘", "모션", "방문자"];

const STORIES = [...BASE_STORIES, ...MORE_STORIES].sort(
  (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group),
);

/** 주소창 `#button` → 그 스토리로 연다 */
const storyFromHash = () => STORIES.find((s) => `#${s.id}` === window.location.hash)?.id;

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
  const value = props.get(story.id, story.initial ?? {});

  // 검색 — 이름·그룹·메모를 한 덩어리로 훑는다
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hits = q
      ? STORIES.filter((s) =>
          `${s.name} ${s.group} ${s.notes?.join(" ") ?? ""}`.toLowerCase().includes(q),
        )
      : STORIES;
    const map = new Map<string, typeof STORIES>();
    hits.forEach((s) => map.set(s.group, [...(map.get(s.group) ?? []), s]));
    return [...map];
  }, [query]);

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

      {/* ── 좌측 네비 ── */}
      <aside className="flex w-[228px] shrink-0 flex-col border-r border-border bg-surface/45">
        <div className="border-b border-border px-3.5 py-3.5">
          <p className="mb-2.5 text-[13px] font-bold tracking-tight text-ink-2">봉칠 디자인 시스템</p>
          <label className="flex h-8 items-center gap-2 rounded-[10px] border border-border bg-surface/70 px-2.5 focus-within:border-primary/40">
            <Search size={13} strokeWidth={2} className="shrink-0 text-ink-4" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[13px] text-ink-2 outline-none placeholder:text-ink-5"
              placeholder="검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          {groups.length === 0 && (
            <p className="px-2 py-6 text-center text-[12px] text-ink-4">찾는 게 없어요</p>
          )}
          {groups.map(([group, items]) => (
            <div key={group} className="mb-3">
              <p className="px-2 pb-1 text-[10.5px] font-bold uppercase tracking-wider text-ink-5">
                {group}
              </p>
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectStory(s.id)}
                  className={`flex w-full items-center rounded-lg px-2 py-1.5 text-left text-[12.5px] transition-colors ${
                    s.id === activeId
                      ? "bg-primary-muted font-bold text-ink-2"
                      : "text-ink-3 hover:bg-surface-subtle"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-3">
          <Button variant="grain" size="xs" icon={dark ? Moon : Sun} active={dark} onClick={toggleDark}>
            {dark ? "다크" : "라이트"}
          </Button>
          {ACCENTS.map((a) => (
            <Button
              key={a.label}
              variant="grain"
              size="xs"
              active={accent === a.value}
              onClick={() => pickAccent(a.value)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </aside>

      {/* ── 본문 ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[760px] px-8 py-8">
          <h1 className="font-mono text-[17px] font-bold tracking-tight text-ink-2">{story.name}</h1>
          {story.notes && (
            <ul className="mt-2 flex flex-col gap-0.5">
              {story.notes.map((n) => (
                <li key={n} className="text-[12px] text-ink-4">
                  · {n}
                </li>
              ))}
            </ul>
          )}

          {/* 미리보기 — 책상 배경 위에 올려야 유리가 제대로 보인다 */}
          <div
            className={`mt-5 flex min-h-[168px] rounded-2xl border border-border p-6 ${
              story.wide ? "items-start" : "items-center justify-center"
            }`}
            style={{ background: "var(--preview-base)" }}
          >
            {story.render(value)}
          </div>

          {story.controls && (
            <div className="mt-4 rounded-2xl border border-border bg-surface/55 p-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-5">props</p>
              <ControlsPanel
                controls={story.controls}
                value={value}
                onChange={(next) => props.set(story.id, next)}
              />
            </div>
          )}

          {story.code && (
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface-subtle/70 p-4 font-mono text-[11.5px] leading-relaxed text-ink-3">
              {story.code(value)}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}
