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

  const statusCount = (status: string) =>
    allVendors.filter((v) => v.status === status).length;

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Vendor</h1>
          <p className="text-sm text-muted">
            {allVendors.length} vendor • Total terpilih:{" "}
            <span className="font-semibold text-primary">
              {formatRupiah(totalTerpilih)}
            </span>
          </p>
        </div>
        <VendorFormDialog />
      </header>

      {/* Tabs filter status */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/vendor"
          className={`text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${
            !filterStatus
              ? "bg-primary-soft text-primary"
              : "border border-border bg-card text-foreground hover:bg-primary-soft/60"
          }`}
        >
          Semua ({allVendors.length})
        </Link>
        {STATUS_VENDOR.map((s) => (
          <Link
            key={s}
            href={`/vendor?status=${s}`}
            className={`text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${
              filterStatus === s
                ? "bg-primary-soft text-primary"
                : "border border-border bg-card text-foreground hover:bg-primary-soft/60"
            }`}
          >
            {LABEL_STATUS_VENDOR[s]} ({statusCount(s)})
          </Link>
        ))}
      </div>

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
              <section key={kategori}>
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
