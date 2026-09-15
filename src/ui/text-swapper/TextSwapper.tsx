"use client";

import { useEffect } from "react";
import { TEXT_SWAPS } from "../../lib/text-swaps";

/** 바꿔주는 칸 — 한 줄 입력(`input`)과 여러 줄 입력(`textarea`). 이 중에서도 글자 칸만 */
const TEXT_INPUT_TYPES = new Set(["text", "search"]);

/** 커서 앞에서 볼 만큼 — 가장 긴 짝(`...`) 길이 */
const LOOK_BACK = Math.max(...TEXT_SWAPS.map((s) => s.from.length));

/**
 * 글 치는 곳 어디서나 `...` → `⋯`, `->` → `→` (앱 루트에 한 번 장착).
 *
 * 칸마다 `onChange`를 고쳐 다니는 대신 **문서에서 한 번** 듣는다 — 새로 만드는 입력칸도
 * 그냥 따라온다. 본문 에디터(`contenteditable`)는 제 안에서 따로 처리하므로 여기 안 걸린다.
 *
 * ⚠️ 값을 직접 넣지 않고 `execCommand("insertText")`로 바꾼다 — 리액트가 들고 있는 칸(controlled)은
 *    `el.value = ...`로 고치면 화면만 바뀌고 상태는 옛 값 그대로다. 브라우저가 대신 쳐 주면
 *    평소 입력과 똑같이 흘러가고, 되돌리기(⌘Z)도 살아 있다.
 * ⚠️ 한글 조합 중(`isComposing`)엔 손대지 않는다 — 조합이 끊겨 글자가 사라진다.
 */
export function TextSwapper() {
  useEffect(() => {
    const onInput = (e: Event) => {
      const { isComposing, inputType } = e as InputEvent;
      // 손으로 친 글자만 — 붙여넣기(`insertFromPaste`)로 들어온 주소·인용문은 건드리지 않는다
      if (isComposing || inputType !== "insertText") return;
      const el = e.target;
      const editable =
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(el.type));
      if (!editable) return;

      const caret = el.selectionEnd;
      if (caret === null || el.selectionStart !== caret) return; // 범위를 잡고 있는 중이면 두고 본다

      const before = el.value.slice(Math.max(0, caret - LOOK_BACK), caret);
      const hit = TEXT_SWAPS.find((s) => before.endsWith(s.from));
      if (!hit) return;

      el.setSelectionRange(caret - hit.from.length, caret);
      if (!document.execCommand("insertText", false, hit.to)) el.setSelectionRange(caret, caret);
    };

    // capture — 칸이 이벤트를 먹더라도(stopPropagation) 먼저 듣는다
    document.addEventListener("input", onInput, true);
    return () => document.removeEventListener("input", onInput, true);
  }, []);

  return null;
}
