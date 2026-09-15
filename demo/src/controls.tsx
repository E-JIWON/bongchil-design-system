import type { ReactNode } from "react";
import { Button } from "bongchil-design-system";

/** 스토리 하나가 노출하는 조절 손잡이 */
export type Control =
  | { key: string; type: "select"; options: { value: unknown; label: string }[] }
  | { key: string; type: "bool" }
  | { key: string; type: "text" }
  | { key: string; type: "number"; min?: number; max?: number };

export type Props = Record<string, unknown>;

export type Story = {
  id: string;
  group: string;
  name: string;
  notes?: string[];
  controls?: Control[];
  /** 손잡이 초기값 */
  initial?: Props;
  render: (p: Props) => ReactNode;
  /** 미리보기 아래 코드 — 없으면 코드칸을 안 그린다 */
  code?: (p: Props) => string;
  /** 미리보기를 세로로 넓게 (빈 상태·페이지 제목처럼 폭을 다 쓰는 것) */
  wide?: boolean;
};

/** 선택지 헬퍼 — `opts("a","b")` 또는 라벨을 따로 줄 땐 객체로 */
export function opts(...values: (string | undefined)[]) {
  return values.map((v) => ({ value: v, label: v ?? "(없음)" }));
}

/** props 객체 → JSX 스니펫 문자열 */
export function snippet(tag: string, props: Props, children?: string) {
  const attrs = Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== "" && v !== false)
    .map(([k, v]) => {
      if (v === true) return k;
      if (typeof v === "string") return `${k}="${v}"`;
      return `${k}={${typeof v === "object" ? JSON.stringify(v) : String(v)}}`;
    });
  const multiline = attrs.length > 2;
  const head = multiline ? `<${tag}\n  ${attrs.join("\n  ")}\n` : `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}`;
  return children ? `${head}>${children}</${tag}>` : `${head.trimEnd()} />`;
}

/** 손잡이 한 줄 */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-2.5">
      <code className="w-[92px] shrink-0 text-right font-mono text-[11px] text-ink-4">{label}</code>
      {children}
    </label>
  );
}

export function ControlsPanel({
  controls,
  value,
  onChange,
}: {
  controls: Control[];
  value: Props;
  onChange: (next: Props) => void;
}) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });

  return (
    <div className="flex flex-col gap-2.5">
      {controls.map((c) => (
        <Field key={c.key} label={c.key}>
          {c.type === "select" && (
            <div className="flex flex-wrap gap-1.5">
              {c.options.map((o) => (
                <Button
                  key={o.label}
                  variant="grain"
                  size="xs"
                  active={value[c.key] === o.value}
                  onClick={() => set(c.key, o.value)}
                >
                  {o.label}
                </Button>
              ))}
            </div>
          )}
          {c.type === "bool" && (
            <Button
              variant="grain"
              size="xs"
              active={Boolean(value[c.key])}
              onClick={() => set(c.key, !value[c.key])}
            >
              {value[c.key] ? "true" : "false"}
            </Button>
          )}
          {c.type === "text" && (
            <input
              className="h-8 w-[280px] rounded-[10px] border border-border bg-surface/70 px-3 text-[13px] text-ink-2 outline-none focus:border-primary/40"
              value={String(value[c.key] ?? "")}
              onChange={(e) => set(c.key, e.target.value)}
            />
          )}
          {c.type === "number" && (
            <input
              type="range"
              min={c.min ?? 0}
              max={c.max ?? 10}
              value={Number(value[c.key] ?? 0)}
              onChange={(e) => set(c.key, Number(e.target.value))}
              className="w-[180px] accent-[var(--color-primary)]"
            />
          )}
          {c.type === "number" && (
            <code className="font-mono text-[11px] text-ink-3">{String(value[c.key])}</code>
          )}
        </Field>
      ))}
    </div>
  );
}
