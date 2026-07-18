"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/require-auth";

function parseRupiah(raw: FormDataEntryValue | null): number {
  if (!raw) return 0;
  const digits = String(raw).replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function str(raw: FormDataEntryValue | null): string | null {
  const v = raw ? String(raw).trim() : "";
  return v.length ? v : null;
}

export async function addPayment(formData: FormData) {
  await requireAuth();
  const vendorId = Number(formData.get("vendorId"));
  const jumlah = parseRupiah(formData.get("jumlah"));
  if (!vendorId || jumlah <= 0) return;

  const tglRaw = str(formData.get("tanggalBayar"));

  await prisma.payment.create({
    data: {
      vendorId,
      jumlah,
      jenis: str(formData.get("jenis")) ?? "dp",
      tanggalBayar: tglRaw ? new Date(tglRaw) : new Date(),
      status: "lunas",
      catatan: str(formData.get("catatan")),
    },
  });

  revalidatePath("/budget");
  revalidatePath("/");
}

export async function deletePayment(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.payment.delete({ where: { id } });
  revalidatePath("/budget");
  revalidatePath("/");
}
