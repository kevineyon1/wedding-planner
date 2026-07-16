import "server-only";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "vendor-brosur");

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** Tentukan Content-Type berdasarkan ekstensi file (fallback: octet-stream). */
export function brosurMimeType(diskName: string): string {
  const ext = path.extname(diskName).toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
}

/** Simpan file brosur/gambar vendor ke disk (di luar public/), kembalikan nama file unik di disk. */
export async function saveBrosurFile(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".pdf";
  const diskName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, diskName), buffer);
  return diskName;
}

export async function deleteBrosurFile(diskName: string): Promise<void> {
  try {
    await unlink(path.join(UPLOAD_DIR, diskName));
  } catch {
    // file mungkin sudah tidak ada; abaikan
  }
}

export function brosurFilePath(diskName: string): string {
  return path.join(UPLOAD_DIR, diskName);
}
