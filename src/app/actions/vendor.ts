"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function parseRupiah(raw: FormDataEntryValue | null): number {
  if (!raw) return 0;
  // buang semua karakter non-digit (mis. "Rp 15.000.000" -> 15000000)
  const digits = String(raw).replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function str(raw: FormDataEntryValue | null): string | null {
  const v = raw ? String(raw).trim() : "";
  return v.length ? v : null;
}

export async function createVendor(formData: FormData) {
  const nama = str(formData.get("nama"));
  const kategori = str(formData.get("kategori"));
  if (!nama || !kategori) return;

  await prisma.vendor.create({
    data: {
      nama,
      kategori,
      kontak: str(formData.get("kontak")),
      hargaPenawaran: parseRupiah(formData.get("hargaPenawaran")),
      deskripsiPaket: str(formData.get("deskripsiPaket")),
      status: str(formData.get("status")) ?? "wishlist",
      link: str(formData.get("link")),
      catatan: str(formData.get("catatan")),
    },
  });

  revalidatePath("/vendor");
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function updateVendor(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  const nama = str(formData.get("nama"));
  const kategori = str(formData.get("kategori"));
  if (!nama || !kategori) return;

  await prisma.vendor.update({
    where: { id },
    data: {
      nama,
      kategori,
      kontak: str(formData.get("kontak")),
      hargaPenawaran: parseRupiah(formData.get("hargaPenawaran")),
      deskripsiPaket: str(formData.get("deskripsiPaket")),
      status: str(formData.get("status")) ?? "wishlist",
      link: str(formData.get("link")),
      catatan: str(formData.get("catatan")),
    },
  });

  revalidatePath("/vendor");
  revalidatePath("/budget");
  revalidatePath("/");
}

/** Ubah status cepat (mis. dari dropdown di list) */
export async function setVendorStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = str(formData.get("status"));
  if (!id || !status) return;
  await prisma.vendor.update({ where: { id }, data: { status } });
  revalidatePath("/vendor");
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function deleteVendor(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.vendor.delete({ where: { id } });
  revalidatePath("/vendor");
  revalidatePath("/budget");
  revalidatePath("/");
}
