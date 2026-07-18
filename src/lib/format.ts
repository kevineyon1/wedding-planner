/** Format angka Rupiah tanpa desimal, mis. 15000000 -> "Rp 15.000.000" */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

/** Format tanggal Indonesia, mis. "15 Juli 2026" */
export function formatTanggal(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Ubah nomor telepon Indonesia (format bebas) jadi link wa.me, mis. "0812..." -> "https://wa.me/62812..." */
export function waLink(nomor: string): string {
  const digits = nomor.replace(/[^\d]/g, "");
  const normalized = digits.startsWith("0")
    ? "62" + digits.slice(1)
    : digits.startsWith("62")
      ? digits
      : "62" + digits;
  return `https://wa.me/${normalized}`;
}

/** Sisa hari menuju tanggal target (bisa negatif jika sudah lewat) */
export function hariMenuju(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const target = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
