"use client";

import { useSyncExternalStore } from "react";

const KEY = "wp_hide_amount";
const EVENT = "wp-hide-amount";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function useHidden() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Nominal yang bisa disembunyikan lewat tombol mata. */
export function Amount({ children }: { children: string }) {
  const hidden = useHidden();
  return <>{hidden ? children.replace(/Rp\s?[\d.,]+/g, "Rp •••••••") : children}</>;
}

/** Tombol mata — berlaku untuk semua <Amount> di halaman. Aman ditaruh di dalam <Link>. */
export function EyeToggle() {
  const hidden = useHidden();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          localStorage.setItem(KEY, hidden ? "0" : "1");
        } catch {}
        window.dispatchEvent(new Event(EVENT));
      }}
      className="rounded-full p-1.5 text-muted hover:text-primary hover:bg-primary-soft transition-colors"
      aria-label={hidden ? "Tampilkan nominal" : "Sembunyikan nominal"}
      title={hidden ? "Tampilkan nominal" : "Sembunyikan nominal"}
    >
      {hidden ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}
