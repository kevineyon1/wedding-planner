"use client";

import { useTransition } from "react";
import { updatePaymentSumber } from "@/app/actions/transaction";
import { LABEL_SUMBER } from "@/lib/constants";

/** Label sumber dana pembayaran; klik untuk menukar Tabungan <-> Luar tabungan. */
export function SumberBadge({ paymentId, sumber }: { paymentId: number; sumber: string }) {
  const [isPending, startTransition] = useTransition();
  const dariTabungan = sumber === "tabungan";

  function toggle() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(paymentId));
      fd.set("sumber", dariTabungan ? "luar" : "tabungan");
      await updatePaymentSumber(fd);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      title="Klik untuk ganti sumber dana"
      className={`badge mr-1.5 disabled:opacity-50 ${
        dariTabungan ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      {dariTabungan ? "🏦 " : "💵 "}
      {LABEL_SUMBER[sumber] ?? sumber}
    </button>
  );
}

/** Pilihan sumber dana untuk form input pembayaran. */
export function SumberSelect({
  value,
  onChange,
  name,
  className = "",
  label,
}: {
  value?: string;
  onChange?: (v: string) => void;
  name?: string;
  className?: string;
  label: string;
}) {
  return (
    <select
      name={name}
      {...(onChange
        ? { value, onChange: (e) => onChange(e.target.value) }
        : { defaultValue: "tabungan" })}
      className={`input py-1.5 text-sm ${className}`}
      aria-label={label}
      title="Sumber dana pembayaran"
    >
      <option value="tabungan">🏦 Tabungan</option>
      <option value="luar">💵 Luar tabungan</option>
    </select>
  );
}
