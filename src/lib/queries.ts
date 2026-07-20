import { prisma } from "./prisma";
import { STATUS_TERPILIH } from "./constants";

/** Ambil setting global (single-row), buat default jika belum ada.
 *  Pakai upsert agar aman dari race condition saat dipanggil paralel. */
export async function getSetting() {
  return prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

/** Ringkasan budget: total anggaran, biaya vendor terpilih, sisa */
export async function getBudgetSummary() {
  const setting = await getSetting();

  const vendorTerpilih = await prisma.vendor.findMany({
    where: { status: { in: STATUS_TERPILIH } },
    select: { id: true, nama: true, kategori: true, hargaPenawaran: true, status: true },
  });

  const totalBiaya = vendorTerpilih.reduce((sum, v) => sum + v.hargaPenawaran, 0);
  const totalAnggaran = setting.totalAnggaran;
  const sisa = totalAnggaran - totalBiaya;

  // Rekap biaya per kategori (dari vendor terpilih)
  const perKategori = new Map<string, number>();
  for (const v of vendorTerpilih) {
    perKategori.set(v.kategori, (perKategori.get(v.kategori) ?? 0) + v.hargaPenawaran);
  }

  return {
    totalAnggaran,
    totalBiaya,
    sisa,
    isOverBudget: totalAnggaran > 0 && totalBiaya > totalAnggaran,
    persenTerpakai: totalAnggaran > 0 ? Math.min(100, Math.round((totalBiaya / totalAnggaran) * 100)) : 0,
    vendorTerpilih,
    perKategori: Array.from(perKategori.entries()).map(([kategori, total]) => ({ kategori, total })),
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
  kategori: string;
  namaVendor: string;
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
      kategori: t.kategori,
      namaVendor: t.namaVendor,
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

/** Ringkasan finance: total tagihan, dibayar, hutang, dan jumlah transaksi lewat deadline. */
export async function getFinanceSummary() {
  const transactions = await getTransactions();
  const totalTagihan = transactions.reduce((s, t) => s + t.totalHarga, 0);
  const totalDibayar = transactions.reduce((s, t) => s + t.totalDibayar, 0);
  const totalHutang = transactions.reduce((s, t) => s + t.sisaHutang, 0);

  const now = new Date();
  const jumlahLewatDeadline = transactions.filter(
    (t) => !t.lunas && t.deadline && t.deadline.getTime() < now.getTime()
  ).length;

  return {
    totalTagihan,
    totalDibayar,
    totalHutang,
    jumlahTransaksi: transactions.length,
    jumlahLewatDeadline,
  };
}
