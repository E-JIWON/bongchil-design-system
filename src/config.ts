import { createElement, type ComponentType, type ReactNode } from "react";

type LinkLike = ComponentType<{ href: string; children?: ReactNode } & Record<string, unknown>>;

/**
 * 앱이 채워 넣는 바깥 세계 — 이 패키지는 라우터도 백엔드도 모른다.
 * 앱 진입점에서 한 번 부르고, 안 부르면 아래 기본값으로 동작한다.
 */
export type Config = {
  /** `href`를 받은 컴포넌트가 렌더할 링크. 기본은 평범한 `<a>`(풀 리로드) */
  Link: LinkLike;
  /** ImageEditor가 잘라낸 이미지를 올리는 곳. 기본은 실패 */
  uploadImage: (blob: Blob) => Promise<{ url: string }>;
  /**
   * 캔버스에 그릴 이미지 주소 변환. 다른 출처 이미지는 캔버스를 오염시켜
   * 잘라내기 저장이 막히므로, 앱이 같은 출처 프록시 주소로 바꿔준다. 기본은 그대로.
   */
  proxySrc: (src: string) => string;
  /** 주인장 표시 이름 — 방문자가 같은 이름을 못 쓰게 막는다. 기본은 빈 값(검사 안 함) */
  ownerName: () => string;
};

const config: Config = {
  Link: ({ href, children, ...rest }) => createElement("a", { href, ...rest }, children),
  uploadImage: async () => {
    throw new Error("configure({ uploadImage }) 를 먼저 부르세요");
  },
  proxySrc: (src) => src,
  ownerName: () => "",
};

/** 앱 진입점에서 한 번 — 넘긴 항목만 덮어쓴다 */
export function configure(next: Partial<Config>) {
  Object.assign(config, next);
}

export function getConfig(): Config {
  return config;
}

/** 주입된 링크 — 컴포넌트가 `href`를 받았을 때 이걸로 렌더한다 */
export const Link: LinkLike = (props) => createElement(config.Link, props);
