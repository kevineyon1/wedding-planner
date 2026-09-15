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

  const beban = finance.totalDibayar; // uang yg sudah benar2 keluar, sesuai tanggal bayar di Finance
  const saldo = tabungan.total - beban;
  const defisit = saldo < 0;

  const totalAnggaran = setting.totalAnggaran;
  const persenTarget =
    totalAnggaran > 0 ? Math.min(100, Math.round((tabungan.total / totalAnggaran) * 100)) : 0;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Tabungan</h1>
        <p className="text-sm text-muted">
          Aset tabungan vs beban pengeluaran — beban ditarik otomatis dari{" "}
          <Link href="/finance" className="text-primary underline">
            halaman Finance
          </Link>
          .
        </p>
      </header>

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-xs text-muted">Total Tabungan (Aset)</p>
          <p className="text-xl font-semibold mt-1 text-primary">
            {formatRupiah(tabungan.total)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Total Beban (dari Finance)</p>
          <p className="text-xl font-semibold mt-1 text-amber-600">
            {formatRupiah(beban)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Saldo</p>
          <p
            className={`text-xl font-semibold mt-1 ${
              defisit ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {formatRupiah(saldo)}
          </p>
        </div>
      </div>

      {defisit && (
        <div className="card p-3 mb-6 bg-red-50 border-red-200 text-red-700 text-sm">
          ⚠️ Beban sudah melebihi tabungan yang ada — sisa hutang{" "}
          {formatRupiah(Math.abs(saldo))} belum ada dananya.
        </div>
      )}

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

      {/* Beban per acara — ditarik dari Finance */}
      <section className="mb-6">
        <h2 className="font-semibold mb-2">Beban per Acara</h2>
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
                  {formatRupiah(s.totalDibayar)}
                </p>
                <p className="text-xs text-muted">
                  sudah dibayar dari total {formatRupiah(s.totalTagihan)}
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
