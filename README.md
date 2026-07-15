# Kevin Wedding Planner

Aplikasi internal persiapan pernikahan (bukan undangan publik). Lihat [../PRD.md](../PRD.md).

## Stack
Next.js 16 (App Router) · React 19 · Prisma 6 + SQLite · Tailwind CSS v4 · TypeScript.

## Menjalankan (dev)
```bash
npm install
npx prisma migrate dev   # buat / update database (dev.db)
npm run dev              # http://localhost:3000
```

## Fitur (Fase 1 — sudah jalan)
- **Dashboard** — countdown hari-H, ringkasan budget, progres to-do, tamu.
- **Vendor** — kelola kandidat vendor per kategori, tandai *Dipilih/Booked*; total biaya dihitung otomatis.
- **Budget** — total anggaran vs biaya terpilih, sisa, indikator over-budget, rekap per kategori.
- **To-Do** — checklist persiapan per kategori & status.
- **Tamu** — daftar tamu + estimasi jumlah orang.
- **Pengaturan** — nama pengantin, tanggal hari-H, total anggaran.

## Catatan teknis
- Angka turunan (total biaya, sisa, %) **dihitung on-the-fly** di `src/lib/queries.ts`, tidak disimpan di DB.
- Mutasi lewat Server Actions di `src/app/actions/`.
- Vendor yang dihitung masuk total = berstatus `dipilih` atau `booked` (lihat `STATUS_TERPILIH` di `src/lib/constants.ts`).

## Belum dibangun (fase lanjut)
Pembayaran per-vendor (DP/pelunasan detail), timeline rundown, seting login/passcode.
