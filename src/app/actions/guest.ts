"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/require-auth";

function str(raw: FormDataEntryValue | null): string | null {
  const v = raw ? String(raw).trim() : "";
  return v.length ? v : null;
}

export async function createGuest(formData: FormData) {
  await requireAuth();
  const nama = str(formData.get("nama"));
  if (!nama) return;
  const jumlah = Number(formData.get("jumlahOrang")) || 1;
  await prisma.guest.create({
    data: {
      nama,
      kategori: str(formData.get("kategori")) ?? "Teman",
      sisi: str(formData.get("sisi")) ?? "pria",
      jumlahOrang: jumlah < 1 ? 1 : jumlah,
      status: str(formData.get("status")) ?? "rencana",
      noWhatsapp: str(formData.get("noWhatsapp")),
      catatan: str(formData.get("catatan")),
    },
  });
  revalidatePath("/tamu");
  revalidatePath("/");
}

export async function updateGuest(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  const nama = str(formData.get("nama"));
  if (!nama) return;
  const jumlah = Number(formData.get("jumlahOrang")) || 1;
  await prisma.guest.update({
    where: { id },
    data: {
      nama,
      kategori: str(formData.get("kategori")) ?? "Teman",
      sisi: str(formData.get("sisi")) ?? "pria",
      jumlahOrang: jumlah < 1 ? 1 : jumlah,
      status: str(formData.get("status")) ?? "rencana",
      noWhatsapp: str(formData.get("noWhatsapp")),
      catatan: str(formData.get("catatan")),
    },
  });
  revalidatePath("/tamu");
  revalidatePath("/");
}

export async function setGuestStatus(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  const status = str(formData.get("status"));
  if (!id || !status) return;
  await prisma.guest.update({ where: { id }, data: { status } });
  revalidatePath("/tamu");
}

export async function deleteGuest(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.guest.delete({ where: { id } });
  revalidatePath("/tamu");
  revalidatePath("/");
}
