import Link from "next/link";
import { getFinanceSummary, getTransactions } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { FinanceTable } from "@/components/FinanceTable";
import { ACARA_TRANSAKSI, LABEL_ACARA } from "@/lib/constants";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ acara?: string }>;
}) {
  const params = await searchParams;
  const filterAcara = (ACARA_TRANSAKSI as readonly string[]).includes(params.acara ?? "")
    ? params.acara!
    : null;

  const [summary, allTransactions] = await Promise.all([
    getFinanceSummary(),
    getTransactions(),
  ]);

  const transactions = filterAcara
    ? allTransactions.filter((t) => t.acara === filterAcara)
    : allTransactions;

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Finance</h1>
          <p className="text-sm text-muted">
            Catat transaksi, DP, cicilan, dan hutang per vendor — Wedding &amp;
            Sanjit.
          </p>
        </div>
        <TransactionFormDialog />
      </header>

      {/* Ringkasan gabungan — selalu total semua acara, terlepas dari filter di bawah */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div className="card p-4">
          <p className="text-xs text-muted">Total Tagihan (Gabungan)</p>
          <p className="text-xl font-semibold mt-1">
            {formatRupiah(summary.totalTagihan)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Sudah Dibayar (Gabungan)</p>
          <p className="text-xl font-semibold mt-1 text-emerald-600">
            {formatRupiah(summary.totalDibayar)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Total Hutang (Gabungan)</p>
          <p className="text-xl font-semibold mt-1 text-amber-600">
            {formatRupiah(summary.totalHutang)}
          </p>
        </div>
      </div>

      {/* Rincian per acara */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {ACARA_TRANSAKSI.map((a) => {
          const s = summary.perAcara[a];
          return (
            <div key={a} className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">{LABEL_ACARA[a]}</p>
                <span className="text-xs text-muted">
                  {s.jumlahTransaksi} transaksi
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted">Tagihan</p>
                  <p className="font-medium">{formatRupiah(s.totalTagihan)}</p>
                </div>
                <div>
                  <p className="text-muted">Dibayar</p>
                  <p className="font-medium text-emerald-600">
                    {formatRupiah(s.totalDibayar)}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Hutang</p>
                  <p className="font-medium text-amber-600">
                    {formatRupiah(s.totalHutang)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {summary.jumlahLewatDeadline > 0 && (
        <div className="card p-3 mb-6 bg-red-50 border-red-200 text-red-700 text-sm">
          ⚠️ {summary.jumlahLewatDeadline} transaksi sudah lewat deadline
          pelunasan.
        </div>
      )}

      {/* Tabs filter acara */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/finance"
          className={`text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${
            !filterAcara
              ? "bg-primary-soft text-primary"
              : "border border-border bg-card text-foreground hover:bg-primary-soft/60"
          }`}
        >
          Semua ({allTransactions.length})
        </Link>
        {ACARA_TRANSAKSI.map((a) => (
          <Link
            key={a}
            href={`/finance?acara=${a}`}
            className={`text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${
              filterAcara === a
                ? "bg-primary-soft text-primary"
                : "border border-border bg-card text-foreground hover:bg-primary-soft/60"
            }`}
          >
            {LABEL_ACARA[a]} ({summary.perAcara[a].jumlahTransaksi})
          </Link>
        ))}
      </div>

      <FinanceTable transactions={transactions} />
    </div>
  );
}
