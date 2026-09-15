import type { ReactNode } from "react";
import { IFRAME_ALLOW, parseEmbedUrl } from "../../lib/embed";

/**
 * 영상 임베드 (`.embed-video`) — youtube/vimeo iframe.
 * children으로 오버레이(삭제 버튼 등)를 받는다.
 */
export function VideoEmbed({ src, children }: { src: string; children?: ReactNode }) {
  const { embedSrc } = parseEmbedUrl(src);
  return (
    <div contentEditable={false} className="embed-video group">
      <iframe src={embedSrc || src} allow={IFRAME_ALLOW} allowFullScreen loading="lazy" title="embed" />
      {children}
    </div>
  );
}
