"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/require-auth";
import { saveBrosurFile, deleteBrosurFile } from "@/lib/upload";

function parseRupiah(raw: FormDataEntryValue | null): number {
  if (!raw) return 0;
  // buang semua karakter non-digit (mis. "Rp 15.000.000" -> 15000000)
  const digits = String(raw).replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function parseIntOrNull(raw: FormDataEntryValue | null): number | null {
  if (!raw) return null;
  const digits = String(raw).replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : null;
}

function str(raw: FormDataEntryValue | null): string | null {
  const v = raw ? String(raw).trim() : "";
  return v.length ? v : null;
}

/** Ambil file brosur dari form, hanya jika benar-benar ada isinya (bukan input kosong). */
function getBrosurFile(formData: FormData): File | null {
  const file = formData.get("brosur");
  if (file instanceof File && file.size > 0) return file;
  return null;
}

/** Hitung hargaPenawaran (total) & hargaPerPax dari mode yang dipilih di form. */
function resolveHarga(formData: FormData) {
  const hargaMode = str(formData.get("hargaMode")) === "per_pax" ? "per_pax" : "total";
  const pax = parseIntOrNull(formData.get("pax"));

  if (hargaMode === "per_pax") {
    const hargaPerPax = parseRupiah(formData.get("hargaPerPax"));
    const hargaPenawaran = pax && pax > 0 ? hargaPerPax * pax : hargaPerPax;
    return { hargaMode, hargaPerPax, hargaPenawaran };
  }

  return {
    hargaMode,
    hargaPerPax: null,
    hargaPenawaran: parseRupiah(formData.get("hargaPenawaran")),
  };
}

export async function createVendor(formData: FormData) {
  await requireAuth();
  const nama = str(formData.get("nama"));
  const kategori = str(formData.get("kategori"));
  if (!nama || !kategori) return;

  const brosurFile = getBrosurFile(formData);
  const brosurPath = brosurFile ? await saveBrosurFile(brosurFile) : null;
  const harga = resolveHarga(formData);

  await prisma.vendor.create({
    data: {
      nama,
      kategori,
      kontak: str(formData.get("kontak")),
      hargaPenawaran: harga.hargaPenawaran,
      hargaMode: harga.hargaMode,
      hargaPerPax: harga.hargaPerPax,
      pax: parseIntOrNull(formData.get("pax")),
      deskripsiPaket: str(formData.get("deskripsiPaket")),
      status: str(formData.get("status")) ?? "wishlist",
      link: str(formData.get("link")),
      catatan: str(formData.get("catatan")),
      brosurPath,
      brosurNama: brosurFile ? brosurFile.name : null,
    },
  });

  revalidatePath("/vendor");
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function updateVendor(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  const nama = str(formData.get("nama"));
  const kategori = str(formData.get("kategori"));
  if (!nama || !kategori) return;

  const brosurFile = getBrosurFile(formData);
  const hapusBrosur = formData.get("hapusBrosur") === "on";

  const existing = await prisma.vendor.findUnique({
    where: { id },
    select: { brosurPath: true },
  });

  let brosurPath = existing?.brosurPath ?? null;
  let brosurNama: string | null | undefined = undefined; // undefined = jangan ubah

  if (brosurFile) {
    // Ganti file: hapus yang lama (kalau ada), simpan yang baru
    if (existing?.brosurPath) await deleteBrosurFile(existing.brosurPath);
    brosurPath = await saveBrosurFile(brosurFile);
    brosurNama = brosurFile.name;
  } else if (hapusBrosur && existing?.brosurPath) {
    await deleteBrosurFile(existing.brosurPath);
    brosurPath = null;
    brosurNama = null;
  }

  const harga = resolveHarga(formData);

  await prisma.vendor.update({
    where: { id },
    data: {
      nama,
      kategori,
      kontak: str(formData.get("kontak")),
      hargaPenawaran: harga.hargaPenawaran,
      hargaMode: harga.hargaMode,
      hargaPerPax: harga.hargaPerPax,
      pax: parseIntOrNull(formData.get("pax")),
      deskripsiPaket: str(formData.get("deskripsiPaket")),
      status: str(formData.get("status")) ?? "wishlist",
      link: str(formData.get("link")),
      catatan: str(formData.get("catatan")),
      brosurPath,
      ...(brosurNama !== undefined ? { brosurNama } : {}),
    },
  });

  revalidatePath("/vendor");
  revalidatePath("/budget");
  revalidatePath("/");
}

/** Ubah status cepat (mis. dari dropdown di list) */
export async function setVendorStatus(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  const status = str(formData.get("status"));
  if (!id || !status) return;
  await prisma.vendor.update({ where: { id }, data: { status } });
  revalidatePath("/vendor");
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function deleteVendor(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;

  const existing = await prisma.vendor.findUnique({
    where: { id },
    select: { brosurPath: true },
  });
  if (existing?.brosurPath) await deleteBrosurFile(existing.brosurPath);

  await prisma.vendor.delete({ where: { id } });
  revalidatePath("/vendor");
  revalidatePath("/budget");
  revalidatePath("/");
}
