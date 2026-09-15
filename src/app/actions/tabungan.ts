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

export async function addTabungan(formData: FormData) {
  await requireAuth();
  const jumlah = parseRupiah(formData.get("jumlah"));
  if (jumlah <= 0) return;

  const tglRaw = str(formData.get("tanggal"));

  await prisma.tabungan.create({
    data: {
      jumlah,
      tanggal: tglRaw ? new Date(tglRaw) : new Date(),
      catatan: str(formData.get("catatan")),
    },
  });

  revalidatePath("/budget");
  revalidatePath("/");
}

export async function deleteTabungan(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.tabungan.delete({ where: { id } });
  revalidatePath("/budget");
  revalidatePath("/");
}
