"use client";

import { useState, useTransition } from "react";
import { createTransaction } from "@/app/actions/transaction";
import { formatRupiah } from "@/lib/format";
import { VendorCombobox, type VendorOption } from "@/components/VendorCombobox";

export function TransactionFormDialog({ vendors }: { vendors: VendorOption[] }) {
  const [open, setOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [totalHarga, setTotalHarga] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedVendor = vendors.find((v) => v.id === Number(vendorId));

  function handleVendorSelect(v: VendorOption | null) {
    setVendorId(v ? String(v.id) : "");
    // Isi otomatis dari harga riset vendor, tapi tetap bisa diubah manual
    if (v && v.hargaPenawaran > 0) setTotalHarga(String(v.hargaPenawaran));
  }

  function handleAction(fd: FormData) {
    if (!vendorId) {
      alert("Pilih vendor dulu ya.");
      return;
    }
    startTransition(async () => {
      await createTransaction(fd);
      setOpen(false);
      setVendorId("");
      setTotalHarga("");
    });
  }

  if (vendors.length === 0) {
    return (
      <p className="text-sm text-muted">
        Belum ada vendor. Tambahkan vendor dulu di halaman Vendor sebelum
        buat transaksi.
      </p>
    );
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
                <label className="label">Vendor *</label>
                <input type="hidden" name="vendorId" value={vendorId} />
                <VendorCombobox
                  vendors={vendors}
                  value={vendorId}
                  onSelect={handleVendorSelect}
                />
              </div>

              <div>
                <label className="label">Total Harga (Rp) *</label>
                <input
                  name="totalHarga"
                  required
                  inputMode="numeric"
                  value={totalHarga}
                  onChange={(e) => setTotalHarga(e.target.value)}
                  className="input"
                  placeholder="50000000"
                />
                {selectedVendor && selectedVendor.hargaPenawaran > 0 && (
                  <p className="text-xs text-muted mt-1">
                    Harga riset di katalog vendor:{" "}
                    {formatRupiah(selectedVendor.hargaPenawaran)} — boleh
                    diubah sesuai deal final.
                  </p>
                )}
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
