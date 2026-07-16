import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import type { VendorCompareGroup } from "@/lib/queries";

const STATUS_BAR_COLOR: Record<string, string> = {
  wishlist: "bg-gray-400",
  shortlist: "bg-amber-400",
  dipilih: "bg-primary",
  booked: "bg-emerald-500",
};

const STATUS_LABEL: Record<string, string> = {
  wishlist: "Wishlist",
  shortlist: "Shortlist",
  dipilih: "Dipilih",
  booked: "Booked",
};

const LEGEND_ORDER = ["wishlist", "shortlist", "dipilih", "booked"];

export function VendorCompareSection({ groups }: { groups: VendorCompareGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <section className="card p-5 mt-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold">📊 Perbandingan Vendor</h2>
        <Link href="/vendor" className="text-xs text-primary hover:underline">
          Kelola vendor →
        </Link>
      </div>
      <p className="text-xs text-muted mb-3">
        Bandingkan harga antar kandidat per kategori, biar lebih mudah ambil
        keputusan.
      </p>

      {/* Legend status — warna sama seperti badge di halaman Vendor */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-5 pb-4 border-b border-border">
        {LEGEND_ORDER.map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-muted">
            <span className={`w-2.5 h-2.5 rounded-full ${STATUS_BAR_COLOR[s]}`} />
            {STATUS_LABEL[s]}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.kategori}>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              {group.kategori}
            </h3>
            <div className="space-y-3">
              {group.vendors.map((v) => {
                const widthPct = Math.max(
                  4,
                  Math.round((v.hargaPenawaran / group.maxHarga) * 100)
                );
                return (
                  <div key={v.id}>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {v.nama}
                        </span>
                        {v.isTermurah && (
                          <span className="badge bg-emerald-100 text-emerald-700 shrink-0 text-[10px]">
                            💰 Termurah
                          </span>
                        )}
                        {v.pax != null && (
                          <span className="text-xs text-muted shrink-0">
                            · {v.pax} pax
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold shrink-0">
                        {formatRupiah(v.hargaPenawaran)}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-primary-soft overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_BAR_COLOR[v.status] ?? "bg-gray-400"}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
