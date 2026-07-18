"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import { LABEL_STATUS_VENDOR } from "@/lib/constants";
import { VendorFormDialog } from "@/components/VendorFormDialog";
import { StatusSelect } from "@/components/StatusSelect";
import { DeleteButton } from "@/components/DeleteButton";
import { setVendorStatus, deleteVendor } from "@/app/actions/vendor";

type Vendor = {
  id: number;
  nama: string;
  kategori: string;
  kontak: string | null;
  hargaPenawaran: number;
  hargaMode: string;
  hargaPerPax: number | null;
  pax: number | null;
  deskripsiPaket: string | null;
  status: string;
  link: string | null;
  catatan: string | null;
  brosurPath: string | null;
  brosurNama: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  wishlist: "bg-gray-100 text-gray-600",
  shortlist: "bg-amber-100 text-amber-700",
  dipilih: "bg-primary-soft text-primary",
  booked: "bg-emerald-100 text-emerald-700",
};

function isImageFile(name: string | null | undefined): boolean {
  if (!name) return false;
  return /\.(jpe?g|png|webp|gif)$/i.test(name);
}

/** Pecah teks jadi baris, buang baris kosong, untuk ditampilkan sbg bullet list. */
function toLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
}

export function VendorCard({
  vendor: v,
  statusOptions,
}: {
  vendor: Vendor;
  statusOptions: { value: string; label: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = Boolean(
    v.kontak || v.deskripsiPaket || v.catatan || v.link || v.brosurPath
  );

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{v.nama}</span>
            <span className={`badge ${STATUS_STYLE[v.status] ?? ""}`}>
              {LABEL_STATUS_VENDOR[v.status] ?? v.status}
            </span>
          </div>
          {v.pax != null && (
            <p className="text-xs text-muted mt-0.5">👥 {v.pax} pax</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold">{formatRupiah(v.hargaPenawaran)}</p>
          {v.hargaMode === "per_pax" && v.hargaPerPax != null && (
            <p className="text-xs text-muted">
              {formatRupiah(v.hargaPerPax)} / pax
            </p>
          )}
        </div>
      </div>

      {hasDetail && (
        <button
          type="button"
          onClick={() => setExpanded((s) => !s)}
          className="text-xs text-primary hover:underline mt-2"
        >
          {expanded ? "▲ Sembunyikan detail" : "▼ Lihat detail"}
        </button>
      )}

      {expanded && (
        <div className="mt-2 pt-2 border-t border-border space-y-2">
          {v.kontak && (
            <p className="text-xs text-muted">📞 {v.kontak}</p>
          )}
          {v.deskripsiPaket && (
            <ul className="text-sm text-foreground/80 space-y-0.5 list-disc list-inside">
              {toLines(v.deskripsiPaket).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
          {v.catatan && (
            <p className="text-xs text-muted italic">{v.catatan}</p>
          )}
          <div className="flex items-center gap-3">
            {v.link && (
              <a
                href={v.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                🔗 Lihat portofolio
              </a>
            )}
            {v.brosurPath && (
              <a
                href={`/api/vendor-brosur/${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                {isImageFile(v.brosurNama) ? "🖼️" : "📄"}{" "}
                {v.brosurNama ?? "Lihat lampiran"}
              </a>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border">
        <form action={setVendorStatus}>
          <input type="hidden" name="id" value={v.id} />
          <StatusSelect
            value={v.status}
            options={statusOptions}
            className="input py-1 text-xs w-auto"
          />
        </form>
        <div className="flex items-center gap-3">
          <VendorFormDialog vendor={v} trigger="ghost" />
          <form action={deleteVendor}>
            <input type="hidden" name="id" value={v.id} />
            <DeleteButton confirmText={`Hapus vendor "${v.nama}"?`} />
          </form>
        </div>
      </div>
    </div>
  );
}
