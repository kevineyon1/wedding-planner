import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import {
  LABEL_STATUS_VENDOR,
  STATUS_VENDOR,
  STATUS_TERPILIH,
} from "@/lib/constants";
import { VendorFormDialog } from "@/components/VendorFormDialog";
import { VendorCard } from "@/components/VendorCard";

const STATUS_STYLE: Record<string, { icon: string; badge: string; ring: string }> = {
  wishlist: { icon: "🤍", badge: "bg-gray-100 text-gray-600", ring: "ring-gray-300" },
  shortlist: { icon: "⭐", badge: "bg-amber-100 text-amber-700", ring: "ring-amber-300" },
  dipilih: { icon: "💗", badge: "bg-primary-soft text-primary", ring: "ring-primary/40" },
  booked: { icon: "✅", badge: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-300" },
};

export default async function VendorPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const filterStatus = STATUS_VENDOR.includes(params.status as (typeof STATUS_VENDOR)[number])
    ? params.status!
    : null;

  const allVendors = await prisma.vendor.findMany({
    orderBy: [{ kategori: "asc" }, { hargaPenawaran: "asc" }],
  });

  const vendors = filterStatus
    ? allVendors.filter((v) => v.status === filterStatus)
    : allVendors;

  // Kelompokkan per kategori
  const grouped = new Map<string, typeof vendors>();
  for (const v of vendors) {
    if (!grouped.has(v.kategori)) grouped.set(v.kategori, []);
    grouped.get(v.kategori)!.push(v);
  }

  const totalTerpilih = allVendors
    .filter((v) => STATUS_TERPILIH.includes(v.status))
    .reduce((s, v) => s + v.hargaPenawaran, 0);

  const statusOptions = STATUS_VENDOR.map((s) => ({
    value: s,
    label: LABEL_STATUS_VENDOR[s],
  }));

  const statusStats = STATUS_VENDOR.map((s) => {
    const list = allVendors.filter((v) => v.status === s);
    return { status: s, count: list.length, total: list.reduce((a, v) => a + v.hargaPenawaran, 0) };
  });

  // Ringkasan per kategori (selalu dari semua vendor, tidak ikut filter)
  const kategoriStats = Array.from(
    allVendors.reduce((m, v) => {
      if (!m.has(v.kategori)) m.set(v.kategori, []);
      m.get(v.kategori)!.push(v);
      return m;
    }, new Map<string, typeof allVendors>())
  ).map(([kategori, list]) => {
    const terpilih = list.filter((v) => STATUS_TERPILIH.includes(v.status));
    const harga = list.map((v) => v.hargaPenawaran).filter((h) => h > 0);
    return {
      kategori,
      kandidat: list.length,
      terpilih,
      min: harga.length ? Math.min(...harga) : 0,
      max: harga.length ? Math.max(...harga) : 0,
    };
  });
  const kategoriDiputuskan = kategoriStats.filter((k) => k.terpilih.length > 0).length;
  const persenDiputuskan = kategoriStats.length
    ? Math.round((kategoriDiputuskan / kategoriStats.length) * 100)
    : 0;

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Survey Vendor</h1>
          <p className="text-sm text-muted">
            Bandingkan kandidat vendor per kategori sebelum memutuskan.
          </p>
        </div>
        <VendorFormDialog />
      </header>

      {/* Kartu status — sekaligus filter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {statusStats.map(({ status, count, total }) => {
          const style = STATUS_STYLE[status];
          const active = filterStatus === status;
          return (
            <Link
              key={status}
              href={active ? "/vendor" : `/vendor?status=${status}`}
              className={`card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                active ? `ring-2 ${style.ring}` : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`badge ${style.badge}`}>
                  {style.icon} {LABEL_STATUS_VENDOR[status]}
                </span>
                {active && <span className="text-[10px] text-muted">filter aktif ×</span>}
              </div>
              <p className="text-3xl font-bold mt-3">{count}</p>
              <p className="text-xs text-muted mt-0.5">
                vendor{total > 0 ? ` · ${formatRupiah(total)}` : ""}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Progres keputusan + total terpilih */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-3">
        <div className="card p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold">Progres keputusan</span>
            <span className="text-xs text-muted">
              {kategoriDiputuskan} dari {kategoriStats.length} kategori sudah dipilih
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-primary-soft overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${persenDiputuskan}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-2">
            {allVendors.length} vendor disurvey · {persenDiputuskan}% kategori sudah diputuskan
          </p>
        </div>
        <div className="card p-4 sm:min-w-56 bg-primary-soft/40 border-primary/20">
          <p className="text-xs text-muted">Total vendor terpilih</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatRupiah(totalTerpilih)}
          </p>
          <p className="text-xs text-muted mt-0.5">status Dipilih + Booked</p>
        </div>
      </div>

      {/* Ringkasan per kategori */}
      {kategoriStats.length > 0 && (
        <div className="card p-4 mb-6">
          <p className="text-sm font-semibold mb-3">Per kategori</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {kategoriStats.map((k) => (
              <a
                key={k.kategori}
                href={`#kat-${encodeURIComponent(k.kategori)}`}
                className={`rounded-lg border px-3 py-2 text-xs transition-colors hover:bg-primary-soft/40 ${
                  k.terpilih.length ? "border-emerald-200 bg-emerald-50/50" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">{k.kategori}</span>
                  <span className="text-muted shrink-0">{k.kandidat} kandidat</span>
                </div>
                {k.terpilih.length ? (
                  <p className="text-emerald-700 mt-0.5 truncate">
                    ✓ {k.terpilih.map((v) => v.nama).join(", ")}
                  </p>
                ) : (
                  <p className="text-muted mt-0.5">
                    {k.max > 0
                      ? k.min === k.max
                        ? formatRupiah(k.min)
                        : `${formatRupiah(k.min)} – ${formatRupiah(k.max)}`
                      : "Belum ada harga"}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {filterStatus && (
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-muted">
            Menampilkan {vendors.length} vendor{" "}
            <b className="text-foreground">{LABEL_STATUS_VENDOR[filterStatus]}</b>
          </span>
          <Link href="/vendor" className="text-primary hover:underline text-xs">
            Tampilkan semua ({allVendors.length})
          </Link>
        </div>
      )}

      {vendors.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          {filterStatus ? (
            `Belum ada vendor berstatus ${LABEL_STATUS_VENDOR[filterStatus]}.`
          ) : (
            <>
              Belum ada vendor. Klik <b>+ Tambah Vendor</b> untuk mulai
              membandingkan pilihan.
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([kategori, list]) => {
            const totalKat = list
              .filter((v) => STATUS_TERPILIH.includes(v.status))
              .reduce((s, v) => s + v.hargaPenawaran, 0);
            return (
              <section
                key={kategori}
                id={`kat-${encodeURIComponent(kategori)}`}
                className="scroll-mt-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-foreground">
                    {kategori}{" "}
                    <span className="text-muted font-normal text-sm">
                      ({list.length})
                    </span>
                  </h2>
                  {totalKat > 0 && (
                    <span className="text-sm text-primary font-medium">
                      {formatRupiah(totalKat)}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {list.map((v) => (
                    <VendorCard key={v.id} vendor={v} statusOptions={statusOptions} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
