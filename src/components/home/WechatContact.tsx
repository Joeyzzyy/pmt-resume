"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "@/styles/home.module.css";
import { useLanguage } from "@/components/layout/LanguageProvider";

function WechatIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#07C160" aria-hidden="true">
      <path d="M8.7 4C4.9 4 2 6.6 2 9.9c0 1.9 1 3.5 2.6 4.6l-.7 2.2 2.6-1.3c.7.2 1.4.3 2.2.3h.4A5.8 5.8 0 0 1 9 14.3C9 11 12 8.4 15.6 8.4h.5C15.5 5.9 12.4 4 8.7 4z" />
      <path d="M15.7 9.5c-3.3 0-5.9 2.2-5.9 4.9s2.6 4.9 5.9 4.9c.6 0 1.2-.1 1.8-.2l2.2 1.1-.6-1.9c1.6-.9 2.6-2.4 2.6-4 0-2.7-2.7-4.8-6-4.8z" />
    </svg>
  );
}

export default function WechatContact({ label }: { label: string }) {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();

  const close = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.contactCta}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={open}
      >
        <span className={styles.contactCtaLogo}>
          <WechatIcon size={20} />
        </span>
        <span>{label}</span>
      </button>
      {open && (
        <div
          className={styles.contactModalBackdrop}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            id={dialogId}
            className={styles.contactModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className={styles.contactModalClose}
              onClick={close}
              aria-label={locale === "zh" ? "关闭微信联系方式" : "Close WeChat contact dialog"}
            >
              ×
            </button>
            <span className={styles.contactModalLogo}>
              <WechatIcon size={32} />
            </span>
            <h2 id={`${dialogId}-title`} className={styles.contactModalId}>
              Wechat：MT07181997
            </h2>
          </div>
        </div>
      )}
    </>
  );
}
