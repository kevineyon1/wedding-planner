"use client";

import { Fragment, useRef, useState, useTransition } from "react";
import {
  addTransactionPayment,
  deleteTransactionPayment,
  deleteTransaction,
} from "@/app/actions/transaction";
import { formatRupiah, formatTanggal } from "@/lib/format";
import type { TransactionRow } from "@/lib/queries";
import { TransactionEditDialog } from "@/components/TransactionEditDialog";
import { LABEL_ACARA } from "@/lib/constants";

const JENIS_LABEL: Record<string, string> = {
  dp: "DP",
  cicilan: "Cicilan",
  pelunasan: "Pelunasan",
  lainnya: "Lainnya",
};

const ACARA_STYLE: Record<string, string> = {
  wedding: "bg-primary-soft text-primary",
  sanjit: "bg-amber-100 text-amber-700",
};

function isOverdue(t: TransactionRow): boolean {
  if (t.lunas || !t.deadline) return false;
  return t.deadline.getTime() < Date.now();
}

export function FinanceTable({ transactions }: { transactions: TransactionRow[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="card p-8 text-center text-muted">
        Belum ada transaksi. Klik <b>+ Tambah Transaksi</b> untuk mulai catat
        pembayaran ke vendor.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="px-4 py-3 font-medium">Vendor</th>
            <th className="px-4 py-3 font-medium text-right">Total Harga</th>
            <th className="px-4 py-3 font-medium text-right">Dibayar</th>
            <th className="px-4 py-3 font-medium text-right">Sisa Hutang</th>
            <th className="px-4 py-3 font-medium">Deadline</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const overdue = isOverdue(t);
            const expanded = expandedId === t.id;
            return (
              <Fragment key={t.id}>
                <tr
                  className={`border-b border-border last:border-0 hover:bg-primary-soft/30 cursor-pointer ${
                    expanded ? "bg-primary-soft/30" : ""
                  }`}
                  onClick={() => setExpandedId(expanded ? null : t.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium">{t.namaVendor}</span>
                      <span className={`badge ${ACARA_STYLE[t.acara] ?? ""}`}>
                        {LABEL_ACARA[t.acara] ?? t.acara}
                      </span>
                    </div>
                    <div className="text-xs text-muted">{t.kategori}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatRupiah(t.totalHarga)}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 whitespace-nowrap">
                    {formatRupiah(t.totalDibayar)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {t.lunas ? (
                      <span className="badge bg-emerald-100 text-emerald-700">
                        ✅ Lunas
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-600">
                        {formatRupiah(t.sisaHutang)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {t.deadline ? (
                      <span className={overdue ? "text-red-600 font-medium" : "text-muted"}>
                        {formatTanggal(t.deadline)}
                        {overdue && " ⚠️"}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-muted whitespace-nowrap">
                    {expanded ? "▲" : "▼"}
                  </td>
                </tr>
                {expanded && (
                  <tr className="border-b border-border">
                    <td colSpan={6} className="px-4 py-4 bg-primary-soft/10">
                      <TransactionDetail transaction={t} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TransactionDetail({ transaction: t }: { transaction: TransactionRow }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAddPayment(fd: FormData) {
    startTransition(async () => {
      await addTransactionPayment(fd);
      formRef.current?.reset();
    });
  }

  function handleDeletePayment(fd: FormData) {
    startTransition(async () => {
      await deleteTransactionPayment(fd);
    });
  }

  function handleDeleteTransaction() {
    if (!confirm(`Hapus transaksi "${t.namaVendor}"? Semua riwayat pembayarannya ikut terhapus.`)) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(t.id));
      await deleteTransaction(fd);
    });
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className="space-y-4">
      {t.catatan && (
        <p className="text-xs text-muted italic">📝 {t.catatan}</p>
      )}

      {/* Riwayat pembayaran */}
      {t.payments.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted mb-1.5">
            Riwayat Pembayaran ({t.payments.length})
          </p>
          <div className="space-y-1.5">
            {t.payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs bg-card border border-border rounded-lg px-2.5 py-1.5"
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
        </div>
      )}

      {/* Form tambah pembayaran */}
      {!t.lunas && (
        <form
          ref={formRef}
          action={handleAddPayment}
          className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-end"
        >
          <input type="hidden" name="transactionId" value={t.id} />
          <div>
            <label className="label text-[11px]">Catat pembayaran (Rp)</label>
            <input
              name="jumlah"
              inputMode="numeric"
              required
              className="input py-1.5 text-sm"
              placeholder={`maks ${formatRupiah(t.sisaHutang)}`}
            />
          </div>
          <div>
            <label className="label text-[11px]">Jenis</label>
            <select name="jenis" defaultValue="cicilan" className="input py-1.5 text-sm">
              <option value="cicilan">Cicilan</option>
              <option value="pelunasan">Pelunasan</option>
              <option value="dp">DP</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="label text-[11px]">Tanggal</label>
            <input type="date" name="tanggalBayar" className="input py-1.5 text-sm" />
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

      <div className="flex items-center justify-end gap-4 pt-1">
        <TransactionEditDialog transaction={t} />
        <button
          type="button"
          onClick={handleDeleteTransaction}
          disabled={isPending}
          className="text-xs text-red-600 hover:underline disabled:opacity-50"
        >
          Hapus transaksi ini
        </button>
      </div>
    </div>
  );
}
