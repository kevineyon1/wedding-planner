"use client";

import { useRef } from "react";

/** Dropdown yang otomatis submit form induk saat nilai berubah. */
export function StatusSelect({
  name = "status",
  value,
  options,
  className = "",
}: {
  name?: string;
  value: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const ref = useRef<HTMLSelectElement>(null);
  return (
    <select
      ref={ref}
      name={name}
      defaultValue={value}
      onChange={() => ref.current?.form?.requestSubmit()}
      className={className || "input"}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
