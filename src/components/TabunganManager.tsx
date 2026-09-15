"use client";

import { useRef, useState, useTransition } from "react";
import { addTabungan, deleteTabungan } from "@/app/actions/tabungan";
import { formatRupiah, formatTanggal } from "@/lib/format";
import type { TabunganRow } from "@/lib/queries";

function onlyDigits(v: string): number {
  const d = v.replace(/[^\d]/g, "");
  return d ? parseInt(d, 10) : 0;
}

function formatThousands(v: string): string {
  const n = onlyDigits(v);
  return n ? n.toLocaleString("id-ID") : "";
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TabunganManager({ entries }: { entries: TabunganRow[] }) {
  const [jumlah, setJumlah] = useState("");
  const [tanggal, setTanggal] = useState(todayInputValue());
  const [catatan, setCatatan] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd() {
    if (onlyDigits(jumlah) <= 0) {
      alert("Isi nominal tabungan dulu.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("jumlah", jumlah);
      fd.set("tanggal", tanggal);
      fd.set("catatan", catatan);
      await addTabungan(fd);
      setJumlah("");
      setCatatan("");
      setTanggal(todayInputValue());
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Hapus catatan tabungan ini?")) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(id));
      await deleteTabungan(fd);
    });
  }

  return (
    <div className="card p-4">
      <h2 className="font-semibold mb-3">Riwayat Tabungan</h2>

      <form
        ref={formRef}
        action={handleAdd}
        className="grid grid-cols-1 sm:grid-cols-[140px_150px_1fr_auto] gap-2 items-end mb-4"
      >
        <div>
          <label className="label text-xs">Jumlah (Rp)</label>
          <input
            value={jumlah}
            onChange={(e) => setJumlah(formatThousands(e.target.value))}
            inputMode="numeric"
            className="input py-1.5 text-sm"
            placeholder="500.000"
          />
        </div>
        <div>
          <label className="label text-xs">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="input py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="label text-xs">Catatan (opsional)</label>
          <input
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="input py-1.5 text-sm"
            placeholder="mis. dari gaji bulan ini"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary py-1.5 text-sm disabled:opacity-50"
        >
          {isPending ? "..." : "+ Tambah"}
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="text-sm text-muted text-center py-4">
          Belum ada catatan tabungan. Tambahkan yang pertama di atas.
        </p>
      ) : (
        <div className="space-y-1.5">
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-2 text-sm bg-primary-soft/30 rounded-lg px-3 py-2"
            >
              <div className="min-w-0">
                <span className="font-medium text-primary">
                  {formatRupiah(e.jumlah)}
                </span>
                <span className="text-muted"> · {formatTanggal(e.tanggal)}</span>
                {e.catatan && (
                  <p className="text-xs text-muted truncate">{e.catatan}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(e.id)}
                disabled={isPending}
                className="text-red-500 hover:text-red-700 shrink-0"
                aria-label="Hapus catatan tabungan"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
