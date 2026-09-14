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

/** Satu grup item checklist biaya dalam sebuah acara. */
export type ChecklistGrup = { grup: string; items: string[] };

/** Checklist biaya Sanjit — dipakai sbg daftar tetap supaya tidak ada pos yang kelewat.
 *  Nama item di sini disimpan apa adanya ke Transaction.kategori. */
export const CHECKLIST_SANJIT: ChecklistGrup[] = [
  { grup: "Vendor Utama", items: ["Venue", "WO", "MC"] },
  {
    grup: "Makeup",
    items: [
      "Makeup Wanita",
      "Makeup Pria",
      "Makeup Mamah (Wanita)",
      "Makeup Papah (Wanita)",
      "Makeup Mamah (Pria)",
      "Makeup Papah (Pria)",
    ],
  },
  {
    grup: "Baju Sanjit",
    items: [
      "Baju Sanjit Wanita",
      "Baju Sanjit Pria",
      "Baju Sanjit Mamah (Wanita)",
      "Baju Sanjit Papah (Wanita)",
      "Baju Sanjit Mamah (Pria)",
      "Baju Sanjit Papah (Pria)",
    ],
  },
  {
    grup: "Dekorasi & Dokumentasi",
    items: [
      "Bakie (Isi + Desain)",
      "Decor Sanjit",
      "Souvenir Sanjit",
      "Photographer",
      "Videographer",
    ],
  },
  { grup: "Lainnya", items: ["WCC", "Seserahan Pria", "Seserahan Wanita"] },
];

/** Checklist per acara. Wedding masih kosong — daftarnya menyusul dari user. */
export const CHECKLIST_ACARA: Record<string, ChecklistGrup[]> = {
  sanjit: CHECKLIST_SANJIT,
  wedding: [],
};

/** Semua nama item checklist sebuah acara (flat), utk hitung progres/pencocokan. */
export function checklistItems(acara: string): string[] {
  return (CHECKLIST_ACARA[acara] ?? []).flatMap((g) => g.items);
}
