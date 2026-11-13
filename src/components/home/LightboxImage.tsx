"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface LightboxImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
}

export default function LightboxImage({ src, alt, width, height, className, sizes = "(max-width: 768px) 100vw, 480px" }: LightboxImageProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onClick={() => setOpen(true)}
        style={{ cursor: "zoom-in" }}
        sizes={sizes}
        quality={90}
      />
      {mounted && createPortal(
        <div
          ref={overlayRef}
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            padding: "24px",
            opacity: open ? 1 : 0,
            visibility: open ? "visible" : "hidden",
            transition: "opacity 0.2s ease, visibility 0.2s ease",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              width: "auto",
              height: "auto",
              borderRadius: "6px",
              objectFit: "contain",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              transform: open ? "scale(1)" : "scale(0.92)",
              opacity: open ? 1 : 0,
              transition: "transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.2s ease",
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
