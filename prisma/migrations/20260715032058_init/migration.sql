-- CreateTable
CREATE TABLE "Vendor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "kontak" TEXT,
    "hargaPenawaran" INTEGER NOT NULL DEFAULT 0,
    "deskripsiPaket" TEXT,
    "status" TEXT NOT NULL DEFAULT 'wishlist',
    "link" TEXT,
    "catatan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 0,
    "jenis" TEXT NOT NULL DEFAULT 'dp',
    "tanggalBayar" DATETIME,
    "tanggalJatuhTempo" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'belum',
    "catatan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Todo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "judul" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'Umum',
    "status" TEXT NOT NULL DEFAULT 'belum',
    "prioritas" TEXT NOT NULL DEFAULT 'normal',
    "deadline" DATETIME,
    "catatan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'Teman',
    "sisi" TEXT NOT NULL DEFAULT 'pria',
    "jumlahOrang" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'rencana',
    "catatan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "namaKategori" TEXT NOT NULL,
    "alokasiRencana" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "namaPengantin1" TEXT NOT NULL DEFAULT '',
    "namaPengantin2" TEXT NOT NULL DEFAULT '',
    "tanggalHariH" DATETIME,
    "totalAnggaran" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BudgetCategory_namaKategori_key" ON "BudgetCategory"("namaKategori");
