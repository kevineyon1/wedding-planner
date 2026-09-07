/** Kategori vendor standar untuk pernikahan */
export const KATEGORI_VENDOR = [
  "Venue",
  "Catering",
  "Wedding Organizer",
  "WO All In",
  "Photography",
  "MUA",
  "Attire",
  "Hand Bouquet",
  "Decoration",
  "Entertainment",
  "MCU (Cek Kesehatan)",
  "Lainnya",
] as const;

/** Status pilihan vendor */
export const STATUS_VENDOR = ["wishlist", "shortlist", "dipilih", "booked"] as const;
export type StatusVendor = (typeof STATUS_VENDOR)[number];

export const LABEL_STATUS_VENDOR: Record<string, string> = {
  wishlist: "Wishlist",
  shortlist: "Shortlist",
  dipilih: "Dipilih",
  booked: "Booked",
};

/** Vendor yang dihitung masuk total biaya */
export const STATUS_TERPILIH: string[] = ["dipilih", "booked"];

export const KATEGORI_TODO = [
  "Administrasi",
  "Venue & Acara",
  "Dekorasi",
  "Katering",
  "Busana",
  "Dokumentasi",
  "Tamu & Undangan",
  "Umum",
] as const;

export const STATUS_TODO = ["belum", "proses", "selesai"] as const;
export const LABEL_STATUS_TODO: Record<string, string> = {
  belum: "Belum",
  proses: "Proses",
  selesai: "Selesai",
};

export const KATEGORI_TAMU = ["Keluarga", "Teman", "Kolega", "Tetangga", "Lainnya"] as const;

/** Acara transaksi finance: pernikahan utama vs sanjit (seserahan/gift exchange) */
export const ACARA_TRANSAKSI = ["wedding", "sanjit"] as const;
export type AcaraTransaksi = (typeof ACARA_TRANSAKSI)[number];

export const LABEL_ACARA: Record<string, string> = {
  wedding: "Wedding",
  sanjit: "Sanjit",
};
