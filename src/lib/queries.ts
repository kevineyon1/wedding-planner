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

export type VendorPaymentInfo = {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  totalDibayar: number;
  sisa: number;
  lunas: boolean;
  payments: {
    id: number;
    jumlah: number;
    jenis: string;
    tanggalBayar: Date | null;
    catatan: string | null;
  }[];
};

/** Vendor berstatus "booked" beserta riwayat & sisa pembayarannya. */
export async function getBookedVendorPayments(): Promise<VendorPaymentInfo[]> {
  const vendors = await prisma.vendor.findMany({
    where: { status: "booked" },
    include: { payments: { orderBy: { tanggalBayar: "desc" } } },
    orderBy: { kategori: "asc" },
  });

  return vendors.map((v) => {
    const totalDibayar = v.payments.reduce((s, p) => s + p.jumlah, 0);
    return {
      id: v.id,
      nama: v.nama,
      kategori: v.kategori,
      harga: v.hargaPenawaran,
      totalDibayar,
      sisa: Math.max(0, v.hargaPenawaran - totalDibayar),
      lunas: v.hargaPenawaran > 0 && totalDibayar >= v.hargaPenawaran,
      payments: v.payments.map((p) => ({
        id: p.id,
        jumlah: p.jumlah,
        jenis: p.jenis,
        tanggalBayar: p.tanggalBayar,
        catatan: p.catatan,
      })),
    };
  });
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

export type VendorCompareItem = {
  id: number;
  nama: string;
  status: string;
  hargaPenawaran: number;
  pax: number | null;
  isTermurah: boolean;
};

export type VendorCompareGroup = {
  kategori: string;
  vendors: VendorCompareItem[];
  maxHarga: number;
};

/** Vendor per kategori (yg punya 2+ kandidat) diurutkan harga, utk perbandingan visual. */
export async function getVendorComparison(): Promise<VendorCompareGroup[]> {
  const vendors = await prisma.vendor.findMany({
    select: { id: true, nama: true, kategori: true, status: true, hargaPenawaran: true, pax: true },
    orderBy: { hargaPenawaran: "asc" },
  });

  const grouped = new Map<string, typeof vendors>();
  for (const v of vendors) {
    if (!grouped.has(v.kategori)) grouped.set(v.kategori, []);
    grouped.get(v.kategori)!.push(v);
  }

  const groups: VendorCompareGroup[] = [];
  for (const [kategori, list] of grouped) {
    if (list.length < 2) continue; // tidak ada gunanya "bandingkan" kalau cuma 1
    const maxHarga = Math.max(...list.map((v) => v.hargaPenawaran), 1);
    const minHarga = Math.min(...list.map((v) => v.hargaPenawaran));
    groups.push({
      kategori,
      maxHarga,
      vendors: list.map((v) => ({
        id: v.id,
        nama: v.nama,
        status: v.status,
        hargaPenawaran: v.hargaPenawaran,
        pax: v.pax,
        isTermurah: v.hargaPenawaran === minHarga,
      })),
    });
  }

  return groups.sort((a, b) => a.kategori.localeCompare(b.kategori));
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
