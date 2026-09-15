-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TransactionPayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transactionId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 0,
    "jenis" TEXT NOT NULL DEFAULT 'dp',
    "sumber" TEXT NOT NULL DEFAULT 'tabungan',
    "tanggalBayar" DATETIME,
    "catatan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionPayment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Pembayaran yang sudah tercatat sebelum fitur ini dibayar dari luar tabungan.
INSERT INTO "new_TransactionPayment" ("catatan", "createdAt", "id", "jenis", "sumber", "jumlah", "tanggalBayar", "transactionId") SELECT "catatan", "createdAt", "id", "jenis", 'luar', "jumlah", "tanggalBayar", "transactionId" FROM "TransactionPayment";
DROP TABLE "TransactionPayment";
ALTER TABLE "new_TransactionPayment" RENAME TO "TransactionPayment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
