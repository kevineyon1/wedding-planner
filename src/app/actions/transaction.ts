"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/require-auth";
import { ACARA_TRANSAKSI, SUMBER_DANA } from "@/lib/constants";

function parseSumber(raw: FormDataEntryValue | null): string {
  const v = String(raw ?? "");
  return (SUMBER_DANA as readonly string[]).includes(v) ? v : "tabungan";
}

function parseAcara(raw: FormDataEntryValue | null): string {
  const v = String(raw ?? "");
  return (ACARA_TRANSAKSI as readonly string[]).includes(v) ? v : "wedding";
}

function parseRupiah(raw: FormDataEntryValue | null): number {
  if (!raw) return 0;
  const digits = String(raw).replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Qty kosong/tidak valid dianggap 1. Mengembalikan undefined kalau field tidak dikirim, supaya qty lama tidak ter-reset. */
function parseQty(raw: FormDataEntryValue | null): number | undefined {
  if (raw === null) return undefined;
  const n = parseInt(String(raw).replace(/[^\d]/g, ""), 10);
  return n > 0 ? n : 1;
}

function str(raw: FormDataEntryValue | null): string | null {
  const v = raw ? String(raw).trim() : "";
  return v.length ? v : null;
}

function toDate(raw: FormDataEntryValue | null): Date | null {
  const v = str(raw);
  return v ? new Date(v) : null;
}

/** Buat transaksi baru; kalau DP diisi, otomatis dicatat sbg pembayaran pertama. */
export async function createTransaction(formData: FormData) {
  await requireAuth();
  const kategori = str(formData.get("kategori"));
  const namaVendor = str(formData.get("namaVendor"));
  if (!kategori || !namaVendor) return;

  const totalHarga = parseRupiah(formData.get("totalHarga"));
  const dp = parseRupiah(formData.get("dp"));
  const tanggalDp = toDate(formData.get("tanggalDp"));
  const deadline = toDate(formData.get("deadline"));
  const catatan = str(formData.get("catatan"));

  await prisma.transaction.create({
    data: {
      acara: parseAcara(formData.get("acara")),
      kategori,
      namaVendor,
      qty: parseQty(formData.get("qty")),
      totalHarga,
      deadline,
      catatan,
      ...(dp > 0
        ? {
            payments: {
              create: {
                jumlah: dp,
                jenis: "dp",
                sumber: parseSumber(formData.get("sumber")),
                tanggalBayar: tanggalDp ?? new Date(),
              },
            },
          }
        : {}),
    },
  });

  revalidatePath("/finance");
  revalidatePath("/");
}

export async function updateTransaction(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  const kategori = str(formData.get("kategori"));
  const namaVendor = str(formData.get("namaVendor"));
  if (!kategori || !namaVendor) return;

  const totalHarga = parseRupiah(formData.get("totalHarga"));
  const deadline = toDate(formData.get("deadline"));
  const catatan = str(formData.get("catatan"));

  await prisma.transaction.update({
    where: { id },
    data: {
      acara: parseAcara(formData.get("acara")),
      kategori,
      namaVendor,
      qty: parseQty(formData.get("qty")),
      totalHarga,
      deadline,
      catatan,
    },
  });

  revalidatePath("/finance");
  revalidatePath("/");
}

export async function deleteTransaction(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/finance");
  revalidatePath("/");
}

/** Catat pembayaran baru (cicilan/pelunasan/dll) untuk transaksi yang sudah ada. */
export async function addTransactionPayment(formData: FormData) {
  await requireAuth();
  const transactionId = Number(formData.get("transactionId"));
  const jumlah = parseRupiah(formData.get("jumlah"));
  if (!transactionId || jumlah <= 0) return;

  await prisma.transactionPayment.create({
    data: {
      transactionId,
      jumlah,
      jenis: str(formData.get("jenis")) ?? "cicilan",
      sumber: parseSumber(formData.get("sumber")),
      tanggalBayar: toDate(formData.get("tanggalBayar")) ?? new Date(),
      catatan: str(formData.get("catatan")),
    },
  });

  revalidatePath("/finance");
  revalidatePath("/budget");
  revalidatePath("/");
}

/** Ganti sumber dana pembayaran yang sudah tercatat (koreksi salah pilih). */
export async function updatePaymentSumber(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.transactionPayment.update({
    where: { id },
    data: { sumber: parseSumber(formData.get("sumber")) },
  });
  revalidatePath("/finance");
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function deleteTransactionPayment(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.transactionPayment.delete({ where: { id } });
  revalidatePath("/finance");
  revalidatePath("/");
}
