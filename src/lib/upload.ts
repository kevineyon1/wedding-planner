import "server-only";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "vendor-brosur");

/** Simpan file PDF brosur ke disk (di luar public/), kembalikan nama file unik di disk. */
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
