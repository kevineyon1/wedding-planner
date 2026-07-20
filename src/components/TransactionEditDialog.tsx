"use client";

import { useState, useTransition } from "react";
import { updateTransaction } from "@/app/actions/transaction";
import { KATEGORI_VENDOR } from "@/lib/constants";
import type { TransactionRow } from "@/lib/queries";

function toDateInputValue(d: Date | string | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function TransactionEditDialog({ transaction: t }: { transaction: TransactionRow }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAction(fd: FormData) {
    startTransition(async () => {
      await updateTransaction(fd);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-primary hover:underline"
      >
        Edit
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="card w-full max-w-md my-8 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Transaksi</h2>
              <button
                onClick={() => !isPending && setOpen(false)}
                disabled={isPending}
                className="text-muted hover:text-foreground text-xl leading-none disabled:opacity-40"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <form action={handleAction} className="space-y-3">
              <input type="hidden" name="id" value={t.id} />

              <div>
                <label className="label">Kategori *</label>
                <select
                  name="kategori"
                  required
                  defaultValue={t.kategori}
                  className="input"
                >
                  {KATEGORI_VENDOR.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Nama Vendor *</label>
                <input
                  name="namaVendor"
                  required
                  defaultValue={t.namaVendor}
                  className="input"
                  placeholder="Nama vendor / penerima"
                />
              </div>

              <div>
                <label className="label">Total Harga (Rp) *</label>
                <input
                  name="totalHarga"
                  required
                  inputMode="numeric"
                  defaultValue={t.totalHarga}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Deadline Pelunasan (opsional)</label>
                <input
                  type="date"
                  name="deadline"
                  defaultValue={toDateInputValue(t.deadline)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Catatan</label>
                <textarea
                  name="catatan"
                  defaultValue={t.catatan ?? ""}
                  className="input min-h-12"
                  placeholder="Catatan tambahan (opsional)..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="btn-ghost disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
