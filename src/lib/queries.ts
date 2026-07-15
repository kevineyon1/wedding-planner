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

/** Ringkasan pembayaran: total tagihan vendor terpilih, sudah dibayar, sisa */
export async function getPaymentSummary() {
  const summary = await getBudgetSummary();
  const totalTagihan = summary.totalBiaya;

  const payments = await prisma.payment.findMany({
    where: { vendor: { status: { in: STATUS_TERPILIH } } },
    select: { jumlah: true },
  });
  const totalDibayar = payments.reduce((s, p) => s + p.jumlah, 0);

  return {
    totalTagihan,
    totalDibayar,
    sisaBayar: totalTagihan - totalDibayar,
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

/** Ringkasan tamu */
export async function getGuestSummary() {
  const guests = await prisma.guest.findMany({ select: { jumlahOrang: true } });
  return {
    totalUndangan: guests.length,
    totalOrang: guests.reduce((s, g) => s + g.jumlahOrang, 0),
  };
}
