"use client";

import { useState, useTransition } from "react";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  addTransactionPayment,
  deleteTransactionPayment,
} from "@/app/actions/transaction";
import { formatRupiah, formatTanggal } from "@/lib/format";
import type { TransactionRow } from "@/lib/queries";

const JENIS_LABEL: Record<string, string> = {
  dp: "DP",
  cicilan: "Cicilan",
  pelunasan: "Pelunasan",
  lainnya: "Lainnya",
};

function onlyDigits(v: string): number {
  const d = v.replace(/[^\d]/g, "");
  return d ? parseInt(d, 10) : 0;
}

export function ChecklistItemCard({
  item,
  acara,
  transaction: t,
}: {
  item: string;
  acara: string;
  transaction: TransactionRow | null;
}) {
  const [namaVendor, setNamaVendor] = useState(t?.namaVendor ?? "");
  const [totalHarga, setTotalHarga] = useState(
    t?.totalHarga ? String(t.totalHarga) : ""
  );
  const [showDetail, setShowDetail] = useState(false);
  const [bayarJumlah, setBayarJumlah] = useState("");
  const [bayarJenis, setBayarJenis] = useState("dp");
  const [isPending, startTransition] = useTransition();

  const dibayar = t?.totalDibayar ?? 0;
  const hargaNum = onlyDigits(totalHarga);
  const sisa = Math.max(0, hargaNum - dibayar);
  const lunas = hargaNum > 0 && dibayar >= hargaNum;
  const belumDiisi = !t;

  function handleSave() {
    if (!namaVendor.trim()) {
      alert(`Isi dulu nama vendor untuk "${item}".`);
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("acara", acara);
      fd.set("kategori", item);
      fd.set("namaVendor", namaVendor);
      fd.set("totalHarga", totalHarga);
      if (t) {
        fd.set("id", String(t.id));
        fd.set(
          "deadline",
          t.deadline ? new Date(t.deadline).toISOString().slice(0, 10) : ""
        );
        fd.set("catatan", t.catatan ?? "");
        await updateTransaction(fd);
      } else {
        await createTransaction(fd);
      }
    });
  }

  function handleAddPayment() {
    if (!t) return;
    if (onlyDigits(bayarJumlah) <= 0) {
      alert("Isi nominal pembayaran dulu.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("transactionId", String(t.id));
      fd.set("jumlah", bayarJumlah);
      fd.set("jenis", bayarJenis);
      await addTransactionPayment(fd);
      setBayarJumlah("");
    });
  }

  function handleDeletePayment(paymentId: number) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(paymentId));
      await deleteTransactionPayment(fd);
    });
  }

  function handleReset() {
    if (!t) return;
    if (!confirm(`Kosongkan data "${item}"? Riwayat pembayarannya ikut terhapus.`))
      return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(t.id));
      await deleteTransaction(fd);
      setNamaVendor("");
      setTotalHarga("");
      setShowDetail(false);
    });
  }

  return (
    <div
      className={`border-b border-border last:border-0 px-4 py-3 ${
        belumDiisi ? "" : "bg-card"
      }`}
    >
      {/* Baris 1: nama item + status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm font-medium">{item}</span>
        {belumDiisi ? (
          <span className="badge bg-gray-100 text-gray-500 shrink-0">
            Belum diisi
          </span>
        ) : lunas ? (
          <span className="badge bg-emerald-100 text-emerald-700 shrink-0">
            ✅ Lunas
          </span>
        ) : (
          <span className="badge bg-amber-100 text-amber-700 shrink-0">
            Sisa {formatRupiah(sisa)}
          </span>
        )}
      </div>

      {/* Baris 2: input — grid seragam supaya rata di semua baris */}
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_170px_auto] gap-2">
        <input
          value={namaVendor}
          onChange={(e) => setNamaVendor(e.target.value)}
          className="input py-1.5 text-sm"
          placeholder="Nama vendor"
          aria-label={`Nama vendor ${item}`}
        />
        <input
          value={totalHarga}
          onChange={(e) => setTotalHarga(e.target.value)}
          inputMode="numeric"
          className="input py-1.5 text-sm"
          placeholder="Total biaya"
          aria-label={`Total biaya ${item}`}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="btn-primary py-1.5 text-sm disabled:opacity-50"
        >
          {isPending ? "..." : "Simpan"}
        </button>
      </div>

      {/* Baris 3: ringkasan angka + toggle detail */}
      {!belumDiisi && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mt-2 text-xs">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-muted">
              Biaya <b className="text-foreground">{formatRupiah(hargaNum)}</b>
            </span>
            <span className="text-muted">
              Dibayar <b className="text-emerald-600">{formatRupiah(dibayar)}</b>
            </span>
            <span className="text-muted">
              Sisa{" "}
              <b className={lunas ? "text-emerald-600" : "text-amber-600"}>
                {formatRupiah(sisa)}
              </b>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowDetail((s) => !s)}
            className="text-primary hover:underline shrink-0"
          >
            {showDetail ? "▲ Tutup" : "▼ Bayar / riwayat"}
          </button>
        </div>
      )}

      {/* Detail: catat pembayaran + riwayat */}
      {!belumDiisi && showDetail && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_140px_auto] gap-2">
            <input
              value={bayarJumlah}
              onChange={(e) => setBayarJumlah(e.target.value)}
              inputMode="numeric"
              className="input py-1.5 text-sm"
              placeholder={`Nominal bayar (sisa ${formatRupiah(sisa)})`}
              aria-label={`Nominal pembayaran ${item}`}
            />
            <select
              value={bayarJenis}
              onChange={(e) => setBayarJenis(e.target.value)}
              className="input py-1.5 text-sm"
              aria-label={`Jenis pembayaran ${item}`}
            >
              <option value="dp">DP</option>
              <option value="cicilan">Cicilan</option>
              <option value="pelunasan">Pelunasan</option>
              <option value="lainnya">Lainnya</option>
            </select>
            <button
              type="button"
              onClick={handleAddPayment}
              disabled={isPending}
              className="btn-ghost py-1.5 text-sm disabled:opacity-50"
            >
              Catat
            </button>
          </div>

          {t!.payments.length > 0 && (
            <div className="space-y-1.5">
              {t!.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 text-xs bg-primary-soft/30 rounded-lg px-2.5 py-1.5"
                >
                  <span className="min-w-0">
                    <span className="badge bg-primary-soft text-primary mr-1.5">
                      {JENIS_LABEL[p.jenis] ?? p.jenis}
                    </span>
                    {formatRupiah(p.jumlah)}
                    {p.tanggalBayar && (
                      <span className="text-muted">
                        {" "}
                        · {formatTanggal(p.tanggalBayar)}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeletePayment(p.id)}
                    disabled={isPending}
                    className="text-red-500 hover:text-red-700 shrink-0"
                    aria-label="Hapus pembayaran"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending}
              className="text-xs text-red-600 hover:underline disabled:opacity-50"
            >
              Kosongkan item ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
