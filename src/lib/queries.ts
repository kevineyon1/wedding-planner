import { prisma } from "./prisma";
import { ACARA_TRANSAKSI } from "./constants";

/** Ambil setting global (single-row), buat default jika belum ada.
 *  Pakai upsert agar aman dari race condition saat dipanggil paralel. */
export async function getSetting() {
  return prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

export type TabunganRow = {
  id: number;
  jumlah: number;
  tanggal: Date;
  catatan: string | null;
};

/** Ringkasan tabungan (aset): total & riwayat tiap kali nambah, terbaru dulu. */
export async function getTabunganSummary() {
  const entries = await prisma.tabungan.findMany({
    orderBy: { tanggal: "desc" },
  });
  const total = entries.reduce((s, e) => s + e.jumlah, 0);
  return {
    total,
    entries: entries.map((e) => ({
      id: e.id,
      jumlah: e.jumlah,
      tanggal: e.tanggal,
      catatan: e.catatan,
    })) as TabunganRow[],
  };
}

/** Ringkasan progres to-do */
export async function getTodoSummary() {
  const [total, selesai] = await Promise.all([
    prisma.todo.count(),
    prisma.todo.count({ where: { status: "selesai" } }),
  ]);
  return {
    total,
    selesai,
    persen: total > 0 ? Math.round((selesai / total) * 100) : 0,
  };
}

/** Ringkasan tamu, termasuk breakdown sisi pria/wanita */
export async function getGuestSummary() {
  const guests = await prisma.guest.findMany({ select: { jumlahOrang: true, sisi: true } });
  const totalPria = guests
    .filter((g) => g.sisi === "pria")
    .reduce((s, g) => s + g.jumlahOrang, 0);
  const totalWanita = guests
    .filter((g) => g.sisi === "wanita")
    .reduce((s, g) => s + g.jumlahOrang, 0);

  return {
    totalUndangan: guests.length,
    totalOrang: guests.reduce((s, g) => s + g.jumlahOrang, 0),
    totalPria,
    totalWanita,
  };
}

export type TransactionRow = {
  id: number;
  acara: string;
  kategori: string;
  namaVendor: string;
  qty: number;
  totalHarga: number;
  totalDibayar: number;
  sisaHutang: number;
  lunas: boolean;
  deadline: Date | null;
  catatan: string | null;
  payments: {
    id: number;
    jumlah: number;
    jenis: string;
    tanggalBayar: Date | null;
    catatan: string | null;
  }[];
};

/** Semua transaksi finance beserta riwayat & sisa pembayarannya, diurutkan deadline terdekat dulu. */
export async function getTransactions(): Promise<TransactionRow[]> {
  const transactions = await prisma.transaction.findMany({
    include: {
      payments: { orderBy: { tanggalBayar: "desc" } },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const rows = transactions.map((t) => {
    const totalDibayar = t.payments.reduce((s, p) => s + p.jumlah, 0);
    return {
      id: t.id,
      acara: t.acara,
      kategori: t.kategori,
      namaVendor: t.namaVendor,
      qty: t.qty,
      totalHarga: t.totalHarga,
      totalDibayar,
      sisaHutang: Math.max(0, t.totalHarga - totalDibayar),
      lunas: t.totalHarga > 0 && totalDibayar >= t.totalHarga,
      deadline: t.deadline,
      catatan: t.catatan,
      payments: t.payments.map((p) => ({
        id: p.id,
        jumlah: p.jumlah,
        jenis: p.jenis,
        tanggalBayar: p.tanggalBayar,
        catatan: p.catatan,
      })),
    };
  });

  // Belum lunas & ada deadline duluan (terdekat dulu), lalu belum lunas tanpa deadline, lalu yang lunas
  return rows.sort((a, b) => {
    if (a.lunas !== b.lunas) return a.lunas ? 1 : -1;
    if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime();
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });
}

/** Transaksi sebuah acara, dipetakan berdasarkan nama item (kategori),
 *  supaya checklist bisa langsung mencocokkan tiap baris dgn datanya. */
export async function getTransactionsByItem(
  acara: string
): Promise<Record<string, TransactionRow>> {
  const all = await getTransactions();
  const map: Record<string, TransactionRow> = {};
  for (const t of all) {
    if (t.acara === acara) map[t.kategori] = t;
  }
  return map;
}

/** Ringkasan finance: total tagihan, dibayar, hutang (gabungan semua acara),
 *  dan jumlah transaksi lewat deadline — plus breakdown per acara (wedding/sanjit). */
export async function getFinanceSummary() {
  const transactions = await getTransactions();
  const totalTagihan = transactions.reduce((s, t) => s + t.totalHarga, 0);
  const totalDibayar = transactions.reduce((s, t) => s + t.totalDibayar, 0);
  const totalHutang = transactions.reduce((s, t) => s + t.sisaHutang, 0);

  const now = new Date();
  const jumlahLewatDeadline = transactions.filter(
    (t) => !t.lunas && t.deadline && t.deadline.getTime() < now.getTime()
  ).length;

  const perAcara: Record<
    string,
    { totalTagihan: number; totalDibayar: number; totalHutang: number; jumlahTransaksi: number }
  > = {};
  for (const acara of ACARA_TRANSAKSI) {
    const list = transactions.filter((t) => t.acara === acara);
    perAcara[acara] = {
      totalTagihan: list.reduce((s, t) => s + t.totalHarga, 0),
      totalDibayar: list.reduce((s, t) => s + t.totalDibayar, 0),
      totalHutang: list.reduce((s, t) => s + t.sisaHutang, 0),
      jumlahTransaksi: list.length,
    };
  }

  return {
    totalTagihan,
    totalDibayar,
    totalHutang,
    jumlahTransaksi: transactions.length,
    jumlahLewatDeadline,
    perAcara,
  };
}
