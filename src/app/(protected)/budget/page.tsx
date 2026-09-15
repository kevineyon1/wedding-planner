import Link from "next/link";
import { getTabunganSummary, getFinanceSummary, getSetting } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";
import { TabunganManager } from "@/components/TabunganManager";
import { ACARA_TRANSAKSI, LABEL_ACARA } from "@/lib/constants";

export default async function TabunganPage() {
  const [tabungan, finance, setting] = await Promise.all([
    getTabunganSummary(),
    getFinanceSummary(),
    getSetting(),
  ]);

  // Hanya pembayaran bersumber "tabungan" yg memotong saldo; yg dari luar cuma mengurangi hutang.
  const dipakai = finance.dibayarDariTabungan;
  const saldo = tabungan.total - dipakai;
  const dibayarLuar = finance.totalDibayar - dipakai;
  const sisaHutang = finance.totalHutang;
  const selisih = saldo - sisaHutang;
  const kurang = selisih < 0;

  const totalAnggaran = setting.totalAnggaran;
  const persenTarget =
    totalAnggaran > 0 ? Math.min(100, Math.round((tabungan.total / totalAnggaran) * 100)) : 0;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Tabungan</h1>
        <p className="text-sm text-muted">
          Tabungan untuk melunasi sisa hutang — sisa hutang ditarik otomatis dari{" "}
          <Link href="/finance" className="text-primary underline">
            halaman Finance
          </Link>
          .
        </p>
      </header>

      <div className="card p-5 mb-3 bg-primary-soft/40 border-primary/20">
        <p className="text-xs text-muted">Saldo Tabungan</p>
        <p
          className={`text-3xl font-bold mt-1 ${saldo < 0 ? "text-red-600" : "text-primary"}`}
        >
          {formatRupiah(saldo)}
        </p>
        <p className="text-xs text-muted mt-1">
          setoran {formatRupiah(tabungan.total)} − dipakai bayar vendor{" "}
          {formatRupiah(dipakai)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-xs text-muted">🏦 Dibayar pakai Tabungan</p>
          <p className="text-lg font-semibold mt-1 text-sky-700">
            {formatRupiah(dipakai)}
          </p>
          <p className="text-xs text-muted mt-0.5">
            💵 luar tabungan {formatRupiah(dibayarLuar)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Sisa Hutang (dari Finance)</p>
          <p className="text-lg font-semibold mt-1 text-amber-600">
            {formatRupiah(sisaHutang)}
          </p>
          <p className="text-xs text-muted mt-0.5">belum dibayar</p>
        </div>
        <div
          className={`card p-4 ${
            kurang ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <p className="text-xs text-muted">
            {kurang ? "Tabungan Kurang" : "Tabungan Lebih"}
          </p>
          <p
            className={`text-lg font-semibold mt-1 ${
              kurang ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {formatRupiah(Math.abs(selisih))}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {kurang ? "lagi untuk melunasi semua hutang" : "setelah semua hutang lunas"}
          </p>
        </div>
      </div>

      {/* Progres vs target anggaran (opsional, kalau sudah diatur) */}
      {totalAnggaran > 0 && (
        <div className="card p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">
              Target tabungan: {formatRupiah(totalAnggaran)}
            </span>
            <span className="font-medium">{persenTarget}%</span>
          </div>
          <div className="h-3 rounded-full bg-primary-soft overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${persenTarget}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-2">
            Kurang {formatRupiah(Math.max(0, totalAnggaran - tabungan.total))} lagi
            dari target.{" "}
            <Link href="/pengaturan" className="text-primary underline">
              Ubah target
            </Link>
          </p>
        </div>
      )}

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Sisa Hutang per Acara</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACARA_TRANSAKSI.map((a) => {
            const s = finance.perAcara[a];
            return (
              <div key={a} className="card p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{LABEL_ACARA[a]}</p>
                  <Link
                    href={`/finance?acara=${a}`}
                    className="text-xs text-primary hover:underline"
                  >
                    lihat →
                  </Link>
                </div>
                <p className="text-lg font-semibold text-amber-600">
                  {formatRupiah(s.totalHutang)}
                </p>
                <p className="text-xs text-muted">
                  belum dibayar dari total {formatRupiah(s.totalTagihan)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Kelola tabungan */}
      <TabunganManager entries={tabungan.entries} />
    </div>
  );
}
