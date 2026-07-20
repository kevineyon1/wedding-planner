/*
  Warnings:

  - You are about to drop the column `vendorId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `kategori` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namaVendor` to the `Transaction` table without a default value. This is not possible if the table is not empty.

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
INSERT INTO "new_Transaction" ("catatan", "createdAt", "deadline", "id", "totalHarga", "updatedAt") SELECT "catatan", "createdAt", "deadline", "id", "totalHarga", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
