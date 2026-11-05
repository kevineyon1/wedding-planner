# Design System — Wedding Plan

## 0. Dials
VARIANCE 7 | MOTION 5 | DENSITY 3

## 1. Atmosphere
Buku harian pernikahan, bukan dashboard SaaS. Hangat, lapang, sedikit editorial.
Halaman login adalah "pintu": satu foto besar golden-hour di satu sisi, satu kolom
form tenang di sisi lain. Bagian dalam aplikasi tetap padat dan fungsional.

## 1b. Signature element (satu, wajib)
**Tagline yang diukir besar** — baris milik merek sendiri, "Your story, beautifully
planned", diambil dari logo dan dipasang sebesar judul di atas foto golden-hour,
dengan garis rambut di bawahnya. Layer: tipografi + materialitas.
Berlanjut di: logo WP penuh di halaman login dan monogram di sidebar.

## 1c. Aturan white-label (produk ini bisa dijual)
Halaman publik (login, metadata, favicon) tidak boleh memuat nama pasangan, tanggal
hari-H, angka keuangan, atau nama pembuat. Semua data pemilik akun hanya muncul
setelah login. Countdown hari-H hidup di Dashboard, bukan di pintu masuk.

## 2. Palette
- **Linen** `#faf7f5` — ground halaman
- **Ink** `#2b2224` — teks utama (off-black, bukan #000)
- **Deep Rose** `#c2557a` — aksen tunggal (sat 47%)
- **Rose Veil** `#f7e8ee` — tint aksen
- **Taupe** `#b08d7f` — tinta logo, garis tipis
- **Mocha Night** `#2a1f1d` — dasar overlay foto

## 3. Typography
- Display: **Cormorant Garamond** — dipilih karena serif terukir di logo WP; dipakai
  hanya untuk angka countdown, nama pasangan, dan judul pintu.
- Body/UI: **Geist** — seluruh isi aplikasi.
- Dilarang: Inter; serif di dalam aplikasi (hanya untuk halaman login).

## 4. Components
Tombol: `:active` turun 1px, tanpa glow. Input: label di atas, error di bawah, focus
ring aksen. Loading: tombol berubah jadi "Memeriksa…" + disabled. Error: kotak inline
beranimasi masuk. Tanpa spinner generik, tanpa floating label.

## 5. Layout
Grid asimetris 1.08fr/1fr di ≥1024px; di bawah itu menumpuk satu kolom, foto jadi
banner 42dvh. `min-h-[100dvh]`, bukan `h-screen`. Tanpa elemen bertumpuk.

## 6. Motion
Tier paling ringan: CSS murni, nol JS animasi. Reveal bertahap (`--d` stagger),
drift lambat pada foto. Hanya `transform`/`opacity`. Semua di dalam
`prefers-reduced-motion: no-preference`; konten terlihat penuh secara default.

## 7. Anti-patterns (BANNED)
Emoji di halaman login, Inter, `#000`, neon/glow, gradient teks di judul, kursor
kustom, tiga kartu identik, nama palsu, "Elevate/Seamless", chevron memantul,
"Scroll to explore".

## 8. Asset
`src/assets/login-bouquet.jpg` — Unsplash (`photo-1519741497674-611481863552`),
Unsplash License (gratis, boleh dipakai komersial, atribusi tidak wajib).
Di-host sendiri agar tidak bergantung pada CDN pihak ketiga.
