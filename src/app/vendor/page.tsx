import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import {
  LABEL_STATUS_VENDOR,
  STATUS_VENDOR,
  STATUS_TERPILIH,
} from "@/lib/constants";
import { VendorFormDialog } from "@/components/VendorFormDialog";
import { StatusSelect } from "@/components/StatusSelect";
import { DeleteButton } from "@/components/DeleteButton";
import { setVendorStatus, deleteVendor } from "@/app/actions/vendor";

const STATUS_STYLE: Record<string, string> = {
  wishlist: "bg-gray-100 text-gray-600",
  shortlist: "bg-amber-100 text-amber-700",
  dipilih: "bg-primary-soft text-primary",
  booked: "bg-emerald-100 text-emerald-700",
};

export default async function VendorPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: [{ kategori: "asc" }, { hargaPenawaran: "asc" }],
  });

  // Kelompokkan per kategori
  const grouped = new Map<string, typeof vendors>();
  for (const v of vendors) {
    if (!grouped.has(v.kategori)) grouped.set(v.kategori, []);
    grouped.get(v.kategori)!.push(v);
  }

  const totalTerpilih = vendors
    .filter((v) => STATUS_TERPILIH.includes(v.status))
    .reduce((s, v) => s + v.hargaPenawaran, 0);

  const statusOptions = STATUS_VENDOR.map((s) => ({
    value: s,
    label: LABEL_STATUS_VENDOR[s],
  }));

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Vendor</h1>
          <p className="text-sm text-muted">
            {vendors.length} vendor • Total terpilih:{" "}
            <span className="font-semibold text-primary">
              {formatRupiah(totalTerpilih)}
            </span>
          </p>
        </div>
        <VendorFormDialog />
      </header>

      {vendors.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          Belum ada vendor. Klik <b>+ Tambah Vendor</b> untuk mulai membandingkan
          pilihan.
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
                  <h2 className="font-semibold text-foreground">{kategori}</h2>
                  {totalKat > 0 && (
                    <span className="text-sm text-primary font-medium">
                      {formatRupiah(totalKat)}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {list.map((v) => (
                    <div key={v.id} className="card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{v.nama}</span>
                            <span
                              className={`badge ${STATUS_STYLE[v.status] ?? ""}`}
                            >
                              {LABEL_STATUS_VENDOR[v.status] ?? v.status}
                            </span>
                          </div>
                          {v.kontak && (
                            <p className="text-xs text-muted mt-0.5">
                              📞 {v.kontak}
                            </p>
                          )}
                          {v.deskripsiPaket && (
                            <p className="text-sm text-foreground/80 mt-1">
                              {v.deskripsiPaket}
                            </p>
                          )}
                          {v.catatan && (
                            <p className="text-xs text-muted mt-1 italic">
                              {v.catatan}
                            </p>
                          )}
                          {v.link && (
                            <a
                              href={v.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline mt-1 inline-block"
                            >
                              🔗 Lihat portofolio
                            </a>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold">
                            {formatRupiah(v.hargaPenawaran)}
                          </p>
                        </div>
                      </div>

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
                            <DeleteButton
                              confirmText={`Hapus vendor "${v.nama}"?`}
                            />
                          </form>
                        </div>
                      </div>
                    </div>
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
