/**
 * CSS 온전성 검사 — 규칙을 옮기거나 죽은 블록을 걷어낼 때 조용히 깨지는 것들을 잡는다.
 * 잘린 주석이 다음 주석까지 삼키거나, @media 안 규칙만 살아남는 경우.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";

const FILES = ["src/tokens.css", "src/components.css"];
let failed = false;

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  failed = true;
}

for (const file of FILES) {
  const css = readFileSync(file, "utf8");

  const open = (css.match(/\{/g) ?? []).length;
  const close = (css.match(/\}/g) ?? []).length;
  if (open !== close) fail(`${file}: 중괄호 불균형 (열림 ${open} / 닫힘 ${close})`);

  // 안 닫힌 주석은 다음 주석까지 통째로 삼켜 규칙을 조용히 지운다
  let i = 0;
  while (true) {
    const a = css.indexOf("/*", i);
    if (a < 0) break;
    const b = css.indexOf("*/", a + 2);
    const line = css.slice(0, a).split("\n").length;
    if (b < 0) {
      fail(`${file}:${line} 주석이 끝까지 안 닫혔다`);
      break;
    }
    if (css.slice(a + 2, b).includes("/*")) {
      fail(`${file}:${line} 주석이 잘려 다음 주석까지 삼킨다`);
    }
    i = b + 2;
  }
}

// Tailwind 네임스페이스 토큰이 키워드 유틸을 덮는 이름 — `--container-max`가 `w-max`를 1024px로 만든 적 있다
const tokens = readFileSync("src/tokens.css", "utf8");
for (const m of tokens.matchAll(/--(container|width|spacing)-(max|min|fit|full|auto|screen|px)\s*:/g)) {
  fail(`src/tokens.css: --${m[1]}-${m[2]} 가 Tailwind 키워드 유틸(w-${m[2]} 등)을 덮는다`);
}

// 면(side) 약자와 겹치는 토큰 이름 — `rounded-l` 은 "왼쪽 면", `rounded-s` 는 "시작 면"이라
// --radius-l 을 만들어도 rounded-l 로는 못 쓴다. 쓰려면 rounded-[var(--radius-l)] 로 지목해야 한다.
for (const m of tokens.matchAll(/--radius-(s|e|l|r|t|b|x|y)\s*:/g)) {
  console.warn(`  · src/tokens.css: --radius-${m[1]} 은 Tailwind 면 유틸(rounded-${m[1]})과 이름이 겹친다 — 호출부는 rounded-[var(--radius-${m[1]})] 로 쓸 것`);
}

// 컴포넌트도 데모도 안 쓰는 embed 규칙
const components = readFileSync("src/components.css", "utf8");
const code = ["src/ui", "src/lib", "demo/src"]
  .flatMap((dir) => execFiles(dir))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");
for (const m of components.matchAll(/^\.(embed-[a-z-]+)/gm)) {
  if (!code.includes(m[1])) fail(`src/components.css: .${m[1]} 를 쓰는 곳이 없다`);
}

function execFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = `${dir}/${name}`;
    if (statSync(p).isDirectory()) out.push(...execFiles(p));
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

if (failed) process.exit(1);
console.log("✅ CSS 온전");
