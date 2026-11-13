"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import geo from "@/styles/geo.module.css";

type GeoShotProps = {
  src: string;
  alt: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.5;

export default function GeoShot({ src, alt }: GeoShotProps) {
  const [zoomed, setZoomed] = useState(false);
  const [scale, setScale] = useState(1);

  const close = useCallback(() => {
    setZoomed(false);
    setScale(1);
  }, []);

  const open = useCallback(() => {
    setScale(1);
    setZoomed(true);
  }, []);

  const zoomIn = useCallback(
    () => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP)),
    []
  );
  const zoomOut = useCallback(
    () => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP)),
    []
  );

  useEffect(() => {
    if (!zoomed) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomed, close]);

  return (
    <>
      <button
        type="button"
        className={geo.shotButton}
        onClick={open}
        title="单击放大"
        aria-label={`单击放大截图：${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 260px"
          className={geo.shotImg}
        />
        <span className={geo.shotZoomHint}>单击放大</span>
      </button>
      {zoomed && (
        <div
          className={geo.zoomBackdrop}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div
            className={geo.zoomScroll}
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className={geo.zoomImgEl}
              style={{ width: `${scale * 100}%` }}
              onDoubleClick={() =>
                setScale((s) => (s > MIN_SCALE ? MIN_SCALE : 2))
              }
            />
          </div>
          <div
            className={geo.zoomControls}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={geo.zoomBtn}
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              aria-label="缩小"
            >
              −
            </button>
            <span className={geo.zoomLevel}>{Math.round(scale * 100)}%</span>
            <button
              type="button"
              className={geo.zoomBtn}
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
              aria-label="放大"
            >
              +
            </button>
          </div>
          <button
            type="button"
            className={geo.zoomCloseBtn}
            onClick={close}
            aria-label="关闭大图"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
