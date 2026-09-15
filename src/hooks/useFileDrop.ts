"use client";

import { useCallback, useState } from "react";

/** 기본으로 받는 파일 — 사진 */
const acceptImage = (file: File) => file.type.startsWith("image/");

/**
 * useFileDrop — 어떤 요소든 파일 드롭존으로 만드는 훅.
 *
 * ```tsx
 * const { dragging, dropProps } = useFileDrop(handleFiles);
 * <div {...dropProps} className={dragging ? "ring-2" : ""} />
 * ```
 *
 * 기본은 사진만 받는다. 동영상까지 받으려면 `accept`로 판별식을 넘긴다.
 *
 * dragleave는 자식 위로 지나갈 때도 터져서 깜빡인다 → relatedTarget이
 * 아직 안쪽이면 무시한다.
 */
export function useFileDrop(
  onFiles: (files: File[]) => void,
  disabled = false,
  accept: (file: File) => boolean = acceptImage,
) {
  const [dragging, setDragging] = useState(false);

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setDragging(true);
    },
    [disabled],
  );

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(accept);
      if (files.length) onFiles(files);
    },
    [disabled, onFiles, accept],
  );

  return { dragging, dropProps: { onDragOver, onDragLeave, onDrop } };
}
