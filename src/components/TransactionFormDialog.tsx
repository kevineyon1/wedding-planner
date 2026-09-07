"use client";

import { useState, useTransition } from "react";
import { createTransaction } from "@/app/actions/transaction";
import { KATEGORI_VENDOR, ACARA_TRANSAKSI, LABEL_ACARA } from "@/lib/constants";

export function TransactionFormDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAction(fd: FormData) {
    startTransition(async () => {
      await createTransaction(fd);
      setOpen(false);
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        + Tambah Transaksi
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="card w-full max-w-lg my-8 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tambah Transaksi</h2>
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
              <div>
                <label className="label">Acara *</label>
                <div className="flex gap-4 text-sm">
                  {ACARA_TRANSAKSI.map((a, i) => (
                    <label key={a} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="acara"
                        value={a}
                        defaultChecked={i === 0}
                      />
                      {LABEL_ACARA[a]}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Kategori *</label>
                  <select name="kategori" required defaultValue="" className="input">
                    <option value="" disabled>
                      Pilih kategori
                    </option>
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
                    className="input"
                    placeholder="mis. Studio Foto ABC"
                  />
                </div>
              </div>

              <div>
                <label className="label">Total Harga (Rp) *</label>
                <input
                  name="totalHarga"
                  required
                  inputMode="numeric"
                  className="input"
                  placeholder="50000000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">DP (Rp)</label>
                  <input
                    name="dp"
                    inputMode="numeric"
                    className="input"
                    placeholder="10000000 (opsional)"
                  />
                </div>
                <div>
                  <label className="label">Tanggal DP Dibayar</label>
                  <input type="date" name="tanggalDp" className="input" />
                </div>
              </div>

              <div>
                <label className="label">Deadline Pelunasan (opsional)</label>
                <input type="date" name="deadline" className="input" />
              </div>

              <div>
                <label className="label">Catatan</label>
                <textarea
                  name="catatan"
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
                  {isPending ? "Menyimpan..." : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
