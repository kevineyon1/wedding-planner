"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#b24a6d] active:translate-y-px disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
    >
      {pending ? (
        "Memeriksa…"
      ) : (
        <>
          Masuk
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </>
      )}
    </button>
  );
}

export function LoginForm({ hasError }: { hasError: boolean }) {
  const [show, setShow] = useState(false);

  return (
    <form action={login} className="space-y-4">
      {hasError && (
        <div
          role="alert"
          className="wp-reveal flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="mt-0.5 shrink-0"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5M12 16h.01" />
          </svg>
          Username atau password salah.
        </div>
      )}

      <div className="wp-reveal" style={d(260)}>
        <label htmlFor="username" className="label text-xs uppercase tracking-wider text-muted">
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          autoFocus
          autoComplete="username"
          className="input py-2.5"
          placeholder="nama pengguna"
        />
      </div>

      <div className="wp-reveal" style={d(330)}>
        <label htmlFor="password" className="label text-xs uppercase tracking-wider text-muted">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            className="input py-2.5 pr-11"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted transition-colors hover:text-primary cursor-pointer"
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          >
            {show ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <path d="M1 1l22 22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="wp-reveal pt-1" style={d(400)}>
        <SubmitButton />
      </div>
    </form>
  );
}
