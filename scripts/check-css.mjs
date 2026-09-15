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
