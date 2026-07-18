import Link from "next/link";
import { getBudgetSummary, getPaymentSummary, getBookedVendorPayments } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";
import { VendorPaymentCard } from "@/components/VendorPaymentCard";

export default async function BudgetPage() {
  const b = await getBudgetSummary();
  const p = await getPaymentSummary();
  const bookedVendors = await getBookedVendorPayments();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Budget Tracker</h1>
        <p className="text-sm text-muted">
          Rencana vs biaya vendor terpilih.
        </p>
      </header>

      {b.totalAnggaran === 0 && (
        <div className="card p-4 mb-6 bg-amber-50 border-amber-200 text-amber-800 text-sm">
          Total anggaran belum diatur.{" "}
          <Link href="/pengaturan" className="font-medium underline">
            Atur di Pengaturan
          </Link>{" "}
          agar sisa anggaran bisa dihitung.
        </div>
      )}

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-xs text-muted">Total Anggaran</p>
          <p className="text-xl font-semibold mt-1">
            {formatRupiah(b.totalAnggaran)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Biaya Vendor Terpilih</p>
          <p className="text-xl font-semibold mt-1 text-primary">
            {formatRupiah(b.totalBiaya)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Sisa Anggaran</p>
          <p
            className={`text-xl font-semibold mt-1 ${
              b.isOverBudget ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {formatRupiah(b.sisa)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {b.totalAnggaran > 0 && (
        <div className="card p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Terpakai</span>
            <span
              className={`font-medium ${
                b.isOverBudget ? "text-red-600" : "text-foreground"
              }`}
            >
              {b.persenTerpakai}%
              {b.isOverBudget && " — melebihi anggaran!"}
            </span>
          </div>
          <div className="h-3 rounded-full bg-primary-soft overflow-hidden">
            <div
              className={`h-full rounded-full ${
                b.isOverBudget ? "bg-red-500" : "bg-primary"
              }`}
              style={{ width: `${Math.min(100, b.persenTerpakai)}%` }}
            />
          </div>
        </div>
      )}

      {/* Rekap per kategori */}
      <section className="mb-6">
        <h2 className="font-semibold mb-2">Biaya per Kategori</h2>
        {b.perKategori.length === 0 ? (
          <div className="card p-6 text-center text-muted text-sm">
            Belum ada vendor berstatus <b>Dipilih</b> atau <b>Booked</b>.{" "}
            <Link href="/vendor" className="text-primary underline">
              Kelola vendor
            </Link>
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {b.perKategori
              .sort((a, c) => c.total - a.total)
              .map((row) => (
                <div
                  key={row.kategori}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm">{row.kategori}</span>
                  <span className="font-medium">{formatRupiah(row.total)}</span>
                </div>
              ))}
            <div className="flex items-center justify-between px-4 py-3 bg-primary-soft/50">
              <span className="font-semibold">Total</span>
              <span className="font-semibold text-primary">
                {formatRupiah(b.totalBiaya)}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Ringkasan pembayaran */}
      <section className="mb-6">
        <h2 className="font-semibold mb-2">Pembayaran</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card p-4">
            <p className="text-xs text-muted">Total Tagihan</p>
            <p className="text-lg font-semibold mt-1">
              {formatRupiah(p.totalTagihan)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted">Sudah Dibayar</p>
            <p className="text-lg font-semibold mt-1 text-emerald-600">
              {formatRupiah(p.totalDibayar)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted">Sisa Pelunasan</p>
            <p className="text-lg font-semibold mt-1 text-amber-600">
              {formatRupiah(p.sisaBayar)}
            </p>
          </div>
        </div>
      </section>

      {/* Pembayaran per vendor (booked) */}
      <section>
        <h2 className="font-semibold mb-2">Status Pembayaran per Vendor</h2>
        {bookedVendors.length === 0 ? (
          <div className="card p-6 text-center text-muted text-sm">
            Belum ada vendor berstatus <b>Booked</b>. Tandai vendor sebagai
            Booked di{" "}
            <Link href="/vendor" className="text-primary underline">
              halaman Vendor
            </Link>{" "}
            untuk mulai catat pembayarannya di sini.
          </div>
        ) : (
          <div className="space-y-3">
            {bookedVendors.map((v) => (
              <VendorPaymentCard key={v.id} vendor={v} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
