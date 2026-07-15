"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function parseRupiah(raw: FormDataEntryValue | null): number {
  if (!raw) return 0;
  const digits = String(raw).replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export async function updateSetting(formData: FormData) {
  const namaPengantin1 = String(formData.get("namaPengantin1") ?? "").trim();
  const namaPengantin2 = String(formData.get("namaPengantin2") ?? "").trim();
  const totalAnggaran = parseRupiah(formData.get("totalAnggaran"));
  const tglRaw = String(formData.get("tanggalHariH") ?? "").trim();
  const tanggalHariH = tglRaw ? new Date(tglRaw) : null;

  await prisma.setting.upsert({
    where: { id: 1 },
    update: { namaPengantin1, namaPengantin2, totalAnggaran, tanggalHariH },
    create: { id: 1, namaPengantin1, namaPengantin2, totalAnggaran, tanggalHariH },
  });

  revalidatePath("/");
  revalidatePath("/budget");
  revalidatePath("/pengaturan");
}
