-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vendor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "kontak" TEXT,
    "hargaPenawaran" INTEGER NOT NULL DEFAULT 0,
    "hargaMode" TEXT NOT NULL DEFAULT 'total',
    "hargaPerPax" INTEGER,
    "pax" INTEGER,
    "deskripsiPaket" TEXT,
    "status" TEXT NOT NULL DEFAULT 'wishlist',
    "link" TEXT,
    "catatan" TEXT,
    "brosurPath" TEXT,
    "brosurNama" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Vendor" ("brosurNama", "brosurPath", "catatan", "createdAt", "deskripsiPaket", "hargaPenawaran", "id", "kategori", "kontak", "link", "nama", "pax", "status", "updatedAt") SELECT "brosurNama", "brosurPath", "catatan", "createdAt", "deskripsiPaket", "hargaPenawaran", "id", "kategori", "kontak", "link", "nama", "pax", "status", "updatedAt" FROM "Vendor";
DROP TABLE "Vendor";
ALTER TABLE "new_Vendor" RENAME TO "Vendor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
