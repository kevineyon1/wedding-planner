import { getFinanceSummary, getTransactions } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { FinanceTable } from "@/components/FinanceTable";

export default async function FinancePage() {
  const [summary, transactions] = await Promise.all([
    getFinanceSummary(),
    getTransactions(),
  ]);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Finance</h1>
          <p className="text-sm text-muted">
            Catat transaksi, DP, cicilan, dan hutang per vendor.
          </p>
        </div>
        <TransactionFormDialog />
      </header>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-xs text-muted">Total Tagihan</p>
          <p className="text-xl font-semibold mt-1">
            {formatRupiah(summary.totalTagihan)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Sudah Dibayar</p>
          <p className="text-xl font-semibold mt-1 text-emerald-600">
            {formatRupiah(summary.totalDibayar)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Total Hutang</p>
          <p className="text-xl font-semibold mt-1 text-amber-600">
            {formatRupiah(summary.totalHutang)}
          </p>
        </div>
      </div>

      {summary.jumlahLewatDeadline > 0 && (
        <div className="card p-3 mb-6 bg-red-50 border-red-200 text-red-700 text-sm">
          ⚠️ {summary.jumlahLewatDeadline} transaksi sudah lewat deadline
          pelunasan.
        </div>
      )}

      <FinanceTable transactions={transactions} />
    </div>
  );
}
