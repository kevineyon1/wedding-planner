/*
  Warnings:

  - You are about to drop the column `vendorId` on the `Transaction` table.
  - Added the required columns `kategori` and `namaVendor` to the `Transaction` table.

  Data lama DIPERTAHANKAN: kategori & namaVendor dibackfill dari data Vendor
  yang sebelumnya terhubung lewat vendorId (JOIN), bukan dihapus/dikosongkan.
  Pakai COALESCE langsung di dalam INSERT (bukan UPDATE sesudahnya) supaya
  tidak pernah mencoba masukkan NULL ke kolom NOT NULL. Riwayat pembayaran
  (TransactionPayment) juga tetap utuh krn id Transaction dipertahankan.
*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kategori" TEXT NOT NULL,
    "namaVendor" TEXT NOT NULL,
    "totalHarga" INTEGER NOT NULL DEFAULT 0,
    "deadline" DATETIME,
    "catatan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Transaction" ("id", "kategori", "namaVendor", "totalHarga", "deadline", "catatan", "createdAt", "updatedAt")
SELECT t."id",
       COALESCE(v."kategori", 'Lainnya'),
       COALESCE(v."nama", 'Vendor (tidak diketahui)'),
       t."totalHarga", t."deadline", t."catatan", t."createdAt", t."updatedAt"
FROM "Transaction" t
LEFT JOIN "Vendor" v ON v."id" = t."vendorId";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
