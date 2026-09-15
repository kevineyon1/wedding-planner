import Link from "next/link";
import {
  getSetting,
  getTabunganSummary,
  getTodoSummary,
  getGuestSummary,
  getFinanceSummary,
} from "@/lib/queries";
import { formatRupiah, formatTanggal, hariMenuju } from "@/lib/format";

export default async function DashboardPage() {
  const [setting, tabungan, todo, guest, finance] = await Promise.all([
    getSetting(),
    getTabunganSummary(),
    getTodoSummary(),
    getGuestSummary(),
    getFinanceSummary(),
  ]);

  const saldo = tabungan.total - finance.dibayarDariTabungan;
  const selisih = saldo - finance.totalHutang;

  const sisaHari = hariMenuju(setting.tanggalHariH);
  const namaPasangan =
    setting.namaPengantin1 && setting.namaPengantin2
      ? `${setting.namaPengantin1} & ${setting.namaPengantin2}`
      : "Pernikahan Kita";

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{namaPasangan}</h1>
        <p className="text-sm text-muted">
          {setting.tanggalHariH
            ? formatTanggal(setting.tanggalHariH)
            : "Atur tanggal di Pengaturan"}
        </p>
      </header>

      {/* Countdown */}
      <div className="card p-6 mb-6 text-center bg-primary-soft/60 border-primary/20">
        {sisaHari === null ? (
          <p className="text-muted">
            Belum ada tanggal hari-H.{" "}
            <Link href="/pengaturan" className="text-primary underline">
              Atur sekarang
            </Link>
          </p>
        ) : sisaHari >= 0 ? (
          <>
            <p className="text-5xl font-bold text-primary">{sisaHari}</p>
            <p className="text-sm text-muted mt-1">hari menuju hari bahagia 💍</p>
          </>
        ) : (
          <p className="text-lg font-medium text-primary">
            Selamat menempuh hidup baru! 🎉
          </p>
        )}
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tabungan */}
        <Link href="/budget" className="card p-5 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">💰 Tabungan</h2>
            <span className="text-xs text-muted">lihat →</span>
          </div>
          <p
            className={`text-2xl font-semibold ${saldo < 0 ? "text-red-600" : "text-primary"}`}
          >
            {formatRupiah(saldo)}
          </p>
          <p
            className={`text-xs mt-1 ${
              selisih < 0 ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {selisih < 0
              ? `Kurang ${formatRupiah(-selisih)} untuk lunasi hutang`
              : `Cukup lunasi hutang, lebih ${formatRupiah(selisih)}`}
          </p>
        </Link>

        {/* To-Do */}
        <Link href="/todo" className="card p-5 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">✅ To-Do</h2>
            <span className="text-xs text-muted">lihat →</span>
          </div>
          <p className="text-2xl font-semibold">
            {todo.selesai}
            <span className="text-base text-muted">/{todo.total}</span>
          </p>
          <p className="text-xs text-muted">tugas selesai</p>
          <div className="h-2 rounded-full bg-primary-soft overflow-hidden mt-3">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${todo.persen}%` }}
            />
          </div>
          <p className="text-xs mt-2 text-muted">{todo.persen}% progres</p>
        </Link>

        {/* Finance */}
        <Link href="/finance" className="card p-5 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">🧾 Finance</h2>
            <span className="text-xs text-muted">lihat →</span>
          </div>
          <p className="text-sm text-muted">Total Hutang</p>
          <p className="text-xl font-semibold text-amber-600">
            {formatRupiah(finance.totalHutang)}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            Sudah dibayar: {formatRupiah(finance.totalDibayar)}
          </p>
          {finance.jumlahLewatDeadline > 0 && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ {finance.jumlahLewatDeadline} transaksi lewat deadline
            </p>
          )}
        </Link>

        {/* Tamu */}
        <Link href="/tamu" className="card p-5 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">💌 Tamu</h2>
            <span className="text-xs text-muted">lihat →</span>
          </div>
          <p className="text-2xl font-semibold">{guest.totalOrang}</p>
          <p className="text-xs text-muted">
            estimasi orang • {guest.totalUndangan} undangan
          </p>
          <div className="flex gap-4 mt-3 pt-3 border-t border-border text-xs">
            <span className="text-muted">
              🤵 Pria <b className="text-foreground">{guest.totalPria}</b>
            </span>
            <span className="text-muted">
              👰 Wanita <b className="text-foreground">{guest.totalWanita}</b>
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
