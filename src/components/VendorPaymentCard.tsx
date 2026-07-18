"use client";

import { useRef, useState, useTransition } from "react";
import { addPayment, deletePayment } from "@/app/actions/payment";
import { formatRupiah, formatTanggal } from "@/lib/format";
import type { VendorPaymentInfo } from "@/lib/queries";

const JENIS_LABEL: Record<string, string> = {
  dp: "DP",
  pelunasan: "Pelunasan",
  lainnya: "Lainnya",
};

export function VendorPaymentCard({ vendor }: { vendor: VendorPaymentInfo }) {
  const [showHistory, setShowHistory] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const persen =
    vendor.harga > 0 ? Math.min(100, Math.round((vendor.totalDibayar / vendor.harga) * 100)) : 0;

  function handleAddPayment(fd: FormData) {
    startTransition(async () => {
      await addPayment(fd);
      formRef.current?.reset();
    });
  }

  function handleDeletePayment(fd: FormData) {
    startTransition(async () => {
      await deletePayment(fd);
    });
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="font-medium">{vendor.nama}</p>
          <p className="text-xs text-muted">{vendor.kategori}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold">{formatRupiah(vendor.harga)}</p>
          {vendor.lunas && (
            <span className="badge bg-emerald-100 text-emerald-700 mt-1">
              ✅ Lunas
            </span>
          )}
        </div>
      </div>

      <div className="h-2.5 rounded-full bg-primary-soft overflow-hidden mb-2">
        <div
          className={`h-full rounded-full ${vendor.lunas ? "bg-emerald-500" : "bg-primary"}`}
          style={{ width: `${persen}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-emerald-600">
          Dibayar: <b>{formatRupiah(vendor.totalDibayar)}</b>
        </span>
        <span className={vendor.lunas ? "text-muted" : "text-amber-600"}>
          Sisa: <b>{formatRupiah(vendor.sisa)}</b>
        </span>
      </div>

      {!vendor.lunas && (
        <form
          ref={formRef}
          action={handleAddPayment}
          className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end border-t border-border pt-3"
        >
          <input type="hidden" name="vendorId" value={vendor.id} />
          <div>
            <label className="label text-[11px]">Catat pembayaran (Rp)</label>
            <input
              name="jumlah"
              inputMode="numeric"
              required
              className="input py-1.5 text-sm"
              placeholder={`maks ${formatRupiah(vendor.sisa)}`}
            />
          </div>
          <div>
            <label className="label text-[11px]">Jenis</label>
            <select name="jenis" defaultValue="dp" className="input py-1.5 text-sm">
              <option value="dp">DP</option>
              <option value="pelunasan">Pelunasan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary py-1.5 text-sm disabled:opacity-50"
          >
            {isPending ? "..." : "Catat"}
          </button>
        </form>
      )}

      {vendor.payments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => setShowHistory((s) => !s)}
            className="text-xs text-primary hover:underline"
          >
            {showHistory ? "▲ Sembunyikan" : "▼ Lihat"} riwayat pembayaran (
            {vendor.payments.length})
          </button>
          {showHistory && (
            <div className="mt-2 space-y-1.5">
              {vendor.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-xs bg-primary-soft/40 rounded-lg px-2.5 py-1.5"
                >
                  <span>
                    <span className="badge bg-primary-soft text-primary mr-1.5">
                      {JENIS_LABEL[p.jenis] ?? p.jenis}
                    </span>
                    {formatRupiah(p.jumlah)}
                    {p.tanggalBayar && (
                      <span className="text-muted"> · {formatTanggal(p.tanggalBayar)}</span>
                    )}
                  </span>
                  <form action={handleDeletePayment}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="text-red-500 hover:text-red-700"
                      aria-label="Hapus pembayaran"
                    >
                      ×
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
