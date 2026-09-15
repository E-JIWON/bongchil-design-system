/**
 * 링크 임베드 마크업 — 단일 출처.
 *
 * 에디터 NodeView · 저장/발행 HTML(renderHTML) · 옛 글 카드 갈아끼우기(enhance-links)가 **같은 구조**를 쓰도록
 * 마크업을 DOMOutputSpec 모양의 순수 배열로만 만든다. 스타일은 `styles/editor.css`의 `.embed-cover*`·`.embed-cd*`·`.embed-line*`.
 * (정적 HTML로 박제되니 React·아이콘 컴포넌트는 못 쓴다 — 움직임은 전부 CSS :hover)
 *
 * - 표지 카드(낮게): 줄에 혼자 놓인 링크 — 세워 둔 작은 표지 + 제목 한 줄 + 저자·출처
 * - CD 카드: 음악 링크 — 케이스 뒤로 CD가 나와 있고 호버하면 돈다
 * - 본문 한 줄: 문장 속 링크 — 『제목』 + 점선 + (저자), 호버하면 표지·출처가 낫표 위로 뜬다
 */

import { cleanEmbedTitle, cleanMusicTitle, embedKind, prettyUrl, siteLabel, splitTint, videoThumbnail } from "./embed";

export type EmbedSpec = [string, Record<string, string>, ...(EmbedSpec | string)[]];

export type EmbedCardData = {
  src: string;
  title: string;
  description: string;
  image: string;
  tint: string;
  author: string;
  site: string;
  /** 줄 카드 정렬 — 글 쓸 때 고른다. 없으면 왼쪽 (본문 한 줄은 글줄 안이라 안 쓴다) */
  align?: "left" | "center";
};

/** 저장 HTML에 박제하는 속성 — 다시 불러올 때(parseHTML) 그대로 복원한다 */
function dataAttrs(d: EmbedCardData): Record<string, string> {
  return {
    "data-src": d.src,
    "data-title": d.title,
    "data-desc": d.description,
    "data-image": d.image,
    "data-tint": d.tint,
    "data-author": d.author,
    "data-site": d.site,
    ...(d.align === "center" ? { "data-align": "center" } : {}),
  };
}

function linkAttrs(d: EmbedCardData, cls: string): Record<string, string> {
  const t = splitTint(d.tint);
  return {
    href: d.src,
    target: "_blank",
    rel: "noopener noreferrer",
    class: cls,
    "data-kind": embedKind(d.src),
    ...(t ? { style: `--m1:${t.m1}` } : {}),
  };
}

/** 제목 — 「 - 교보문고」 꼬리·「Apple Music에서 만나는」 머리를 떼고, 없으면 주소 */
const titleOf = (d: EmbedCardData) => {
  const t = embedKind(d.src) === "music" ? cleanMusicTitle(d.title) : d.title;
  return cleanEmbedTitle(t, d.src, d.site) || prettyUrl(d.src);
};

/** 제목 아래 한 줄 — 저자 · 출처 */
function bodySpec(d: EmbedCardData): EmbedSpec {
  const meta: EmbedSpec = ["span", { class: "embed-cover-meta" }];
  // 저자와 출처 뱃지 사이 가운뎃점은 뺐다 — 뱃지 바탕과 틈이 구분을 맡는다
  if (d.author) meta.push(["span", { class: "embed-cover-author" }, d.author]);
  meta.push(["span", { class: "embed-cover-site" }, siteLabel(d.src, d.site)]);
  return ["span", { class: "embed-cover-body" }, ["span", { class: "embed-cover-title" }, titleOf(d)], meta];
}

/** 줄에 혼자 놓인 링크 — 음악이면 CD 카드, 아니면 낮게 세운 표지 카드 */
export function blockCardSpec(d: EmbedCardData, extra: Record<string, string> = {}): EmbedSpec {
  const kind = embedKind(d.src);
  const image = d.image || (kind === "video" ? videoThumbnail(d.src) : "");
  const base = { ...extra, "data-embed": "link", ...dataAttrs({ ...d, image }) };

  if (kind === "music" && image) {
    return [
      "a",
      { ...base, ...linkAttrs(d, "embed-cd") },
      [
        "span",
        { class: "embed-cd-art" },
        ["span", { class: "embed-cd-slide", "aria-hidden": "true" }, ["span", { class: "embed-cd-disc" }]],
        ["span", { class: "embed-cd-case" }, ["img", { class: "embed-cd-img", src: image, alt: "" }], ["span", { class: "embed-cd-play", "aria-hidden": "true" }]],
      ],
      bodySpec(d),
    ];
  }

  const art: EmbedSpec = ["span", { class: "embed-cover-lift" }];
  art.push(image ? ["img", { class: "embed-cover-img", src: image, alt: "" }] : ["span", { class: "embed-cover-blank", "aria-hidden": "true" }]);
  if (kind === "video") art.push(["span", { class: "embed-cover-play", "aria-hidden": "true" }]);
  return ["a", { ...base, ...linkAttrs(d, "embed-cover") }, ["span", { class: "embed-cover-art" }, art], bodySpec(d)];
}

/** 책은 겹낫표, 노래·영상·그 밖은 홑낫표, 제목을 못 받았으면 꺾쇠 */
function brackets(d: EmbedCardData): [string, string] {
  if (!d.title) return ["〈", "〉"];
  return embedKind(d.src) === "book" ? ["『", "』"] : ["「", "」"];
}

/** 문장 속 링크 — 『제목』 + 점선 + (저자). 호버하면 여는 낫표 위로 표지·출처 딱지가 뜬다 (글줄은 안 밀린다) */
export function lineSpec(d: EmbedCardData, extra: Record<string, string> = {}): EmbedSpec {
  const kind = embedKind(d.src);
  const image = d.image || (kind === "video" ? videoThumbnail(d.src) : "");
  const [open, close] = brackets(d);
  // 출처 딱지는 글자가 아니라 CSS(::after attr)로 그린다 — 글 요약(본문 텍스트 추출)에 「교보문고」가 섞이지 않게
  const pop: EmbedSpec = ["span", { class: "embed-line-pop", "aria-hidden": "true", "data-label": siteLabel(d.src, d.site) }];
  if (image) pop.push(["img", { class: "embed-line-pop-img", src: image, alt: "" }]);

  const spec: EmbedSpec = [
    "a",
    { ...extra, "data-embed-line": "", ...dataAttrs({ ...d, image }), ...linkAttrs(d, "embed-line") },
    ["span", { class: "embed-line-open" }, pop, open],
    ["span", { class: "embed-line-title" }, titleOf(d)],
    ["span", { class: "embed-line-close" }, close],
  ];
  if (d.author) spec.push(["span", { class: "embed-line-author" }, `(${d.author})`]);
  return spec;
}

/** 저장 HTML의 `data-*`에서 카드 데이터를 되살린다 (parseHTML·옛 글 갈아끼우기 공용) */
export function readEmbedData(el: HTMLElement): EmbedCardData {
  const a = (k: string) => el.getAttribute(k) || "";
  return {
    src: a("data-src") || a("href"),
    title: a("data-title"),
    description: a("data-desc"),
    image: a("data-image"),
    tint: a("data-tint"),
    author: a("data-author"),
    site: a("data-site"),
    align: a("data-align") === "center" ? "center" : "left",
  };
}

/** spec → DOM (NodeView·enhance-links용. 저장 HTML은 tiptap이 같은 spec을 직접 직렬화한다) */
export function renderEmbedSpec(doc: Document, spec: EmbedSpec): HTMLElement {
  const [tag, attrs, ...children] = spec;
  const el = doc.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const c of children) el.append(typeof c === "string" ? doc.createTextNode(c) : renderEmbedSpec(doc, c));
  return el;
}
