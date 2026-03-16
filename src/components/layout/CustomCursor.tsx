"use client";

import { useEffect } from "react";

/* 48×48 enlarged system-style arrow cursor */
const LARGE_ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Cpath d='M5 2 L5 28 L11.5 21.5 L17.5 32 L22 30 L16 19 L24.5 19 Z' fill='white' stroke='%231a1a1a' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E") 5 2, auto`;

/* 48×48 enlarged system-style pointer hand cursor */
const LARGE_POINTER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Cpath d='M14.5 2 C13.2 2 12 3 12 4.5 L12 17.5 L9.5 15 C8.2 13.7 6 13.7 4.7 15 C3.4 16.3 3.4 18.4 4.7 19.7 L13 28 C15 30 17.5 31 20.5 31 L22 31 C27.5 31 32 26.5 32 21 L32 14.5 C32 13 30.8 12 29.5 12 C28.2 12 27 13 27 14.5 L27 15 L27 12.5 C27 11 25.8 10 24.5 10 C23.2 10 22 11 22 12.5 L22 14 L22 11 C22 9.5 20.8 8.5 19.5 8.5 C18.2 8.5 17 9.5 17 11 L17 4.5 C17 3 15.8 2 14.5 2 Z' fill='white' stroke='%231a1a1a' stroke-width='1.8' stroke-linejoin='round' stroke-linecap='round'/%3E%3C/svg%3E") 14 2, pointer`;

export default function CustomCursor() {
  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after {
        cursor: ${LARGE_ARROW} !important;
      }
      a, button, [role="button"], input[type="submit"],
      input[type="button"], select, label, [data-hoverable],
      a *, button * {
        cursor: ${LARGE_POINTER} !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}
