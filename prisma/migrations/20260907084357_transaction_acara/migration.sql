-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "acara" TEXT NOT NULL DEFAULT 'wedding',
    "kategori" TEXT NOT NULL,
    "namaVendor" TEXT NOT NULL,
    "totalHarga" INTEGER NOT NULL DEFAULT 0,
    "deadline" DATETIME,
    "catatan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Transaction" ("catatan", "createdAt", "deadline", "id", "kategori", "namaVendor", "totalHarga", "updatedAt") SELECT "catatan", "createdAt", "deadline", "id", "kategori", "namaVendor", "totalHarga", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
