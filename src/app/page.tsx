import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bouquet from "@/assets/login-bouquet.jpg";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import {
  VendorMock,
  FinanceMock,
  TabunganMock,
  TodoMock,
} from "@/components/landing/FeatureMocks";

export const metadata: Metadata = {
  title: "Wedding Plan — catat persiapan pernikahan sampai hari-H",
  description:
    "Survey vendor, biaya dan pelunasan, tabungan, daftar tamu, dan checklist tugas dalam satu halaman.",
};

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

const FITUR = [
  {
    nomor: "01",
    judul: "Survey Vendor",
    ringkas:
      "Kumpulkan semua kandidat per kategori, bandingkan harganya, lalu tandai mana yang dipilih.",
    poin: [
      "Status Wishlist, Shortlist, Dipilih, sampai Booked",
      "Rentang harga tiap kategori terlihat sebelum memutuskan",
      "Harga paket atau per pax, lengkap dengan brosur dan kontak",
    ],
    mock: <VendorMock />,
  },
  {
    nomor: "02",
    judul: "Biaya & pelunasan",
    ringkas:
      "Checklist biaya per acara supaya tidak ada pos yang kelewat, plus catatan DP dan cicilan.",
    poin: [
      "Acara Wedding dan Sanjit dipisah, totalnya tetap digabung",
      "Tiap pos punya riwayat pembayaran dan sisa hutangnya",
      "Isi 0 untuk pos yang sudah termasuk paket vendor lain",
    ],
    mock: <FinanceMock />,
  },
  {
    nomor: "03",
    judul: "Tabungan",
    ringkas:
      "Catat setoran, lalu bandingkan dengan sisa hutang agar tahu dananya cukup atau belum.",
    poin: [
      "Tiap pembayaran ditandai dari tabungan atau luar tabungan",
      "Saldo hanya berkurang oleh pembayaran yang memakai tabungan",
      "Target tabungan dengan progres yang terus berjalan",
    ],
    mock: <TabunganMock />,
  },
  {
    nomor: "04",
    judul: "Tugas & kalender",
    ringkas:
      "Daftar tugas yang dikelompokkan menurut waktu, dengan kalender penanda deadline.",
    poin: [
      "Tanggal ber-deadline ditandai di kalender, merah kalau lewat",
      "Dikelompokkan jadi terlambat, 7 hari ke depan, dan nanti",
      "Hari-H ikut tampil supaya sisa waktunya terasa",
    ],
    mock: <TodoMock />,
  },
];

const LAINNYA = [
  {
    judul: "Daftar tamu",
    isi: "Catat undangan per pihak pria dan wanita, lengkap dengan jumlah orang dan nomor WhatsApp — angkanya dipakai untuk memperkirakan porsi katering dan souvenir.",
  },
  {
    judul: "Dashboard sekali lihat",
    isi: "Sisa hari menuju hari-H, saldo tabungan, total hutang, progres tugas, dan estimasi tamu dalam satu layar. Nominalnya bisa disembunyikan saat dibuka di tempat ramai.",
  },
  {
    judul: "Hanya untuk Anda",
    isi: "Satu akun berpassword, data tersimpan di server sendiri. Tidak ada halaman publik yang menampilkan nama, tanggal, atau angka keuangan Anda.",
  },
];

export default async function LandingPage() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (verifySessionToken(token)) redirect("/dashboard");

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <span className="flex items-center gap-2.5">
            <Image src="/logo-mark.png" alt="" width={34} height={34} priority />
            <span className="text-sm font-semibold tracking-wide text-primary">
              Wedding Plan
            </span>
          </span>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#b24a6d] active:translate-y-px"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main>
        {/* Hero — split asimetris, bukan hero tengah */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-12 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pt-20 lg:pb-24">
          <div>
            <p
              className="wp-reveal text-[11px] uppercase tracking-[0.34em] text-muted"
              style={d(40)}
            >
              Perencana pernikahan
            </p>
            <h1
              className="wp-reveal font-display mt-4 text-4xl font-light leading-[1.08] tracking-wide sm:text-5xl lg:text-[3.6rem]"
              style={d(110)}
            >
              Dari survey vendor
              <br />
              sampai pelunasan
              <br />
              terakhir.
            </h1>
            <p
              className="wp-reveal mt-6 max-w-[52ch] leading-relaxed text-muted"
              style={d(200)}
            >
              Catatan vendor di WhatsApp, budget di spreadsheet, daftar tamu di
              kertas. Semuanya pindah ke satu halaman yang langsung menghitung
              sisa hutang, sisa tabungan, dan sisa hari.
            </p>
            <div className="wp-reveal mt-8 flex flex-wrap items-center gap-3" style={d(280)}>
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition-all hover:bg-[#b24a6d] active:translate-y-px"
              >
                Masuk ke akun
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <a
                href="#fitur"
                className="rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium transition-colors hover:bg-primary-soft/60"
              >
                Lihat fiturnya
              </a>
            </div>
          </div>

          <div className="wp-reveal wp-grain relative aspect-[4/5] overflow-hidden rounded-2xl" style={d(160)}>
            <Image
              src={bouquet}
              alt=""
              fill
              priority
              placeholder="blur"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f1d]/80 via-transparent to-transparent" />
            <p className="font-display absolute bottom-6 left-6 right-6 text-2xl font-light leading-snug text-white sm:text-3xl">
              Your story,
              <br />
              beautifully planned
            </p>
          </div>
        </section>

        {/* Fitur — zig-zag, tidak ada tiga kartu kembar */}
        <section id="fitur" className="scroll-mt-16 border-t border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
            <h2 className="wp-inview font-display max-w-[20ch] text-3xl font-light leading-tight sm:text-4xl">
              Empat hal yang paling sering bikin pusing, dihitung otomatis.
            </h2>

            <div className="mt-14 space-y-16 lg:space-y-24">
              {FITUR.map((f, i) => (
                <article
                  key={f.nomor}
                  className="wp-inview grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
                >
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-2xl font-light text-primary/50">
                        {f.nomor}
                      </span>
                      <h3 className="font-display text-2xl font-light sm:text-3xl">
                        {f.judul}
                      </h3>
                    </div>
                    <p className="mt-3 max-w-[48ch] leading-relaxed text-muted">
                      {f.ringkas}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {f.poin.map((p) => (
                        <li key={p} className="flex gap-2.5 text-sm leading-relaxed">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mt-0.5 shrink-0 text-primary"
                            aria-hidden
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>{f.mock}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Lainnya — daftar bergaris, bukan kartu */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <h2 className="wp-inview font-display text-3xl font-light sm:text-4xl">
              Dan beberapa hal kecil
            </h2>
            <dl className="mt-8 divide-y divide-border border-t border-border">
              {LAINNYA.map((l) => (
                <div
                  key={l.judul}
                  className="wp-inview grid gap-2 py-6 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-8"
                >
                  <dt className="font-medium">{l.judul}</dt>
                  <dd className="max-w-[60ch] leading-relaxed text-muted">{l.isi}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Penutup */}
        <section className="border-t border-border bg-primary-soft/40">
          <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8">
            <Image
              src="/logo-full.png"
              alt="Wedding Plan"
              width={520}
              height={403}
              className="wp-inview mx-auto h-auto w-40"
            />
            <p className="wp-inview mx-auto mt-6 max-w-[42ch] leading-relaxed text-muted">
              Satu akun untuk Anda berdua, dipakai dari hari pertama survey
              sampai pelunasan terakhir.
            </p>
            <Link
              href="/login"
              className="wp-inview mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#b24a6d] active:translate-y-px"
            >
              Masuk ke akun
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <p className="mx-auto max-w-6xl px-5 py-6 text-center text-[11px] text-muted/70 sm:px-8">
          Wedding Plan — your story, beautifully planned
        </p>
      </footer>
    </div>
  );
}
