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
import { SumberBadge, SumberSelect } from "@/components/SumberBadge";

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

/** Format input angka jadi "3.000.000" (titik ribuan) saat diketik, biar enak dibaca. */
function formatThousands(v: string): string {
  const n = onlyDigits(v);
  return n ? n.toLocaleString("id-ID") : "";
}

/** Tentukan label jenis pembayaran otomatis dari konteksnya. */
function inferJenis(dibayarSebelum: number, jumlahBaru: number, total: number): string {
  if (dibayarSebelum <= 0) return "dp";
  if (dibayarSebelum + jumlahBaru >= total && total > 0) return "pelunasan";
  return "cicilan";
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
  const [qty, setQty] = useState(String(t?.qty ?? 1));
  const [totalHarga, setTotalHarga] = useState(
    t?.totalHarga ? t.totalHarga.toLocaleString("id-ID") : ""
  );
  const [bayar, setBayar] = useState("");
  const [sumber, setSumber] = useState("tabungan");
  const [showDetail, setShowDetail] = useState(false);
  const [bayarManual, setBayarManual] = useState("");
  const [bayarManualJenis, setBayarManualJenis] = useState("dp");
  const [bayarManualSumber, setBayarManualSumber] = useState("tabungan");
  const [isPending, startTransition] = useTransition();

  const dibayar = t?.totalDibayar ?? 0;
  const hargaNum = onlyDigits(totalHarga);
  const bayarNum = onlyDigits(bayar);
  const qtyNum = Math.max(1, onlyDigits(qty));
  // Sisa langsung menghitung mundur nominal "Bayar" yg baru diketik, sebelum disimpan
  const sisa = Math.max(0, hargaNum - dibayar - bayarNum);
  const lunas = hargaNum > 0 && dibayar >= hargaNum;
  const belumDiisi = !t;
  const kosongTotal = hargaNum === 0 && dibayar === 0 && bayarNum === 0;

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
      fd.set("qty", String(qtyNum));
      fd.set("totalHarga", totalHarga);

      if (t) {
        fd.set("id", String(t.id));
        fd.set(
          "deadline",
          t.deadline ? new Date(t.deadline).toISOString().slice(0, 10) : ""
        );
        fd.set("catatan", t.catatan ?? "");
        await updateTransaction(fd);

        // Field "Bayar" di baris utama itu nominal TAMBAHAN, bukan total —
        // supaya tidak dobel kalau user cuma re-save nama/harga tanpa niat bayar lagi.
        if (bayarNum > 0) {
          const pfd = new FormData();
          pfd.set("transactionId", String(t.id));
          pfd.set("jumlah", String(bayarNum));
          pfd.set("jenis", inferJenis(dibayar, bayarNum, hargaNum));
          pfd.set("sumber", sumber);
          await addTransactionPayment(pfd);
        }
      } else {
        // Transaksi baru: kalau "Bayar" diisi, langsung dicatat sbg pembayaran pertama (DP)
        if (bayarNum > 0) {
          fd.set("dp", String(bayarNum));
          fd.set("sumber", sumber);
        }
        await createTransaction(fd);
      }

      setBayar("");
    });
  }

  function handleAddPayment() {
    if (!t) return;
    if (onlyDigits(bayarManual) <= 0) {
      alert("Isi nominal pembayaran dulu.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("transactionId", String(t.id));
      fd.set("jumlah", bayarManual);
      fd.set("jenis", bayarManualJenis);
      fd.set("sumber", bayarManualSumber);
      await addTransactionPayment(fd);
      setBayarManual("");
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
      setQty("1");
      setTotalHarga("");
      setBayar("");
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
            Belum lunas
          </span>
        )}
      </div>

      {/* Baris 2: input — grid seragam (kolom tetap) supaya rata di semua baris.
          Kolom Sisa dilebihkan lebarnya krn nominalnya bisa panjang (mis. "Rp 11.700.000"). */}
      <div className="grid grid-cols-2 sm:grid-cols-[minmax(0,1fr)_64px_115px_115px_150px_auto] gap-2">
        <input
          value={namaVendor}
          onChange={(e) => setNamaVendor(e.target.value)}
          className="input py-1.5 text-sm col-span-2 sm:col-span-1"
          placeholder="Nama vendor"
          aria-label={`Nama vendor ${item}`}
        />
        <div className="relative">
          <input
            value={qty}
            onChange={(e) => setQty(e.target.value.replace(/[^\d]/g, ""))}
            onBlur={() => setQty(String(qtyNum))}
            inputMode="numeric"
            className="input py-1.5 pl-7 text-sm w-full"
            aria-label={`Qty ${item}`}
            title="Jumlah orang/unit"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">
            ×
          </span>
        </div>
        <input
          value={totalHarga}
          onChange={(e) => setTotalHarga(formatThousands(e.target.value))}
          inputMode="numeric"
          className="input py-1.5 text-sm"
          placeholder="Total biaya"
          aria-label={`Total biaya ${item}`}
        />
        <input
          value={bayar}
          onChange={(e) => setBayar(formatThousands(e.target.value))}
          inputMode="numeric"
          className="input py-1.5 text-sm"
          placeholder="Bayar"
          aria-label={`Tambah bayar ${item}`}
          title="Nominal pembayaran baru yang mau ditambahkan"
        />
        <div
          className={`rounded-lg border px-2.5 py-1 text-sm flex flex-col justify-center leading-tight min-w-0 ${
            kosongTotal
              ? "border-border bg-background/40 text-muted"
              : lunas
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
          aria-label={`Sisa ${item}`}
        >
          <span className="text-[10px] opacity-70">Sisa</span>
          <span className="font-medium truncate">
            {kosongTotal ? "-" : formatRupiah(sisa)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="btn-primary py-1.5 text-sm disabled:opacity-50 col-span-2 sm:col-span-1"
        >
          {isPending ? "..." : "Simpan"}
        </button>
      </div>

      {bayarNum > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
          <span className="text-muted">
            Bayar {formatRupiah(bayarNum)} pakai
          </span>
          {(["tabungan", "luar"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSumber(s)}
              className={`rounded-full border px-2.5 py-1 transition-colors ${
                sumber === s
                  ? s === "tabungan"
                    ? "border-sky-300 bg-sky-100 text-sky-700 font-medium"
                    : "border-gray-300 bg-gray-100 text-gray-700 font-medium"
                  : "border-border text-muted hover:bg-primary-soft/40"
              }`}
            >
              {s === "tabungan" ? "🏦 Tabungan" : "💵 Luar tabungan"}
            </button>
          ))}
          <span className="text-muted">→ klik Simpan</span>
        </div>
      )}

      {qtyNum > 1 && hargaNum > 0 && (
        <p className="text-xs text-muted mt-1.5">
          {qtyNum} orang · ± {formatRupiah(Math.round(hargaNum / qtyNum))} / orang
        </p>
      )}

      {/* Baris 3: dibayar (kumulatif) + toggle riwayat */}
      {!belumDiisi && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mt-2 text-xs">
          <span className="text-muted">
            Sudah dibayar{" "}
            <b className="text-emerald-600">{formatRupiah(dibayar)}</b>
          </span>
          {t!.payments.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDetail((s) => !s)}
              className="text-primary hover:underline shrink-0"
            >
              {showDetail ? "▲ Tutup" : `▼ Riwayat (${t!.payments.length})`}
            </button>
          )}
        </div>
      )}

      {/* Detail: riwayat pembayaran + form manual (opsional, utk jenis khusus) */}
      {!belumDiisi && showDetail && (
        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
          {t!.payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 text-xs bg-primary-soft/30 rounded-lg px-2.5 py-1.5"
            >
              <span className="min-w-0">
                <span className="badge bg-primary-soft text-primary mr-1.5">
                  {JENIS_LABEL[p.jenis] ?? p.jenis}
                </span>
                <SumberBadge paymentId={p.id} sumber={p.sumber} />
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

      {!belumDiisi && (
        <div className="flex items-center justify-between gap-2 mt-2 text-xs">
          <details className="group">
            <summary className="text-muted hover:text-primary cursor-pointer list-none">
              + Catat manual (pilih jenis)
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_110px_150px_auto] gap-2 mt-2">
              <input
                value={bayarManual}
                onChange={(e) => setBayarManual(formatThousands(e.target.value))}
                inputMode="numeric"
                className="input py-1.5 text-sm"
                placeholder="Nominal"
                aria-label={`Nominal pembayaran manual ${item}`}
              />
              <select
                value={bayarManualJenis}
                onChange={(e) => setBayarManualJenis(e.target.value)}
                className="input py-1.5 text-sm"
                aria-label={`Jenis pembayaran manual ${item}`}
              >
                <option value="dp">DP</option>
                <option value="cicilan">Cicilan</option>
                <option value="pelunasan">Pelunasan</option>
                <option value="lainnya">Lainnya</option>
              </select>
              <SumberSelect
                value={bayarManualSumber}
                onChange={setBayarManualSumber}
                label={`Sumber dana pembayaran manual ${item}`}
              />
              <button
                type="button"
                onClick={handleAddPayment}
                disabled={isPending}
                className="btn-ghost py-1.5 text-sm disabled:opacity-50"
              >
                Catat
              </button>
            </div>
          </details>
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="text-red-600 hover:underline disabled:opacity-50 shrink-0"
          >
            Kosongkan
          </button>
        </div>
      )}
    </div>
  );
}
