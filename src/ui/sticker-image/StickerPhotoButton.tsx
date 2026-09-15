"use client";

import {
  useCallback,
  useState,
  type AnimationEvent,
  type ButtonHTMLAttributes,
  type ImgHTMLAttributes,
  type SyntheticEvent,
} from "react";

type LoadPhase = "loading" | "entering" | "ready";
type StickerImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "ref"> & {
  alt: string;
};
type StickerPhotoButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  image: StickerImageProps;
};

/* eslint-disable @next/next/no-img-element */

/**
 * 이미지 로드가 끝나면 테두리·그림자·오버레이를 포함한 카드 전체를 붙인다.
 * 모션이 끝난 뒤 animation class를 제거해 기존 hover 효과를 온전히 되살린다.
 */
export function StickerPhotoButton({
  image,
  children,
  className = "",
  onAnimationEnd,
  type = "button",
  ...buttonProps
}: StickerPhotoButtonProps) {
  const [phase, setPhase] = useState<LoadPhase>("loading");
  const {
    alt,
    className: imageClassName = "",
    onLoad,
    onError,
    ...imageProps
  } = image;

  const reveal = useCallback(() => {
    setPhase((current) => (current === "loading" ? "entering" : current));
  }, []);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    reveal();
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    setPhase("ready");
    onError?.(event);
  };

  const handleAnimationEnd = (event: AnimationEvent<HTMLButtonElement>) => {
    if (event.target === event.currentTarget && event.animationName === "photo-slap") {
      setPhase("ready");
    }
    onAnimationEnd?.(event);
  };

  return (
    <button
      {...buttonProps}
      type={type}
      onAnimationEnd={handleAnimationEnd}
      className={`${className} ${
        phase === "loading" ? "opacity-0" : phase === "entering" ? "photo-enter" : ""
      }`}
    >
      <img
        {...imageProps}
        ref={(node) => {
          if (node?.complete && node.naturalWidth > 0) reveal();
        }}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={imageClassName}
      />
      {children}
    </button>
  );
}
