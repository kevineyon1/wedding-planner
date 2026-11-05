import Image from "next/image";
import bouquet from "@/assets/login-bouquet.jpg";
import { LoginForm } from "@/components/LoginForm";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

// Halaman publik: tidak membaca data pemilik akun sama sekali.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-[100dvh] grid lg:grid-cols-[1.08fr_1fr]">
      {/* Pintu: foto + hitung mundur */}
      <section className="wp-grain relative flex items-end overflow-hidden min-h-[42dvh] lg:min-h-[100dvh]">
        <Image
          src={bouquet}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="wp-drift object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f1d]/90 via-[#2a1f1d]/45 to-[#2a1f1d]/25" />

        <div className="relative w-full px-6 pb-8 sm:px-10 sm:pb-12 lg:px-14 lg:pb-16 text-white">
          <p
            className="wp-reveal text-[11px] uppercase tracking-[0.38em] text-white/65"
            style={d(60)}
          >
            Wedding Plan
          </p>

          <h1
            className="wp-reveal font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-light leading-[1.1] tracking-wide mt-3 max-w-[14ch]"
            style={d(140)}
          >
            Your story,
            <br />
            beautifully planned
          </h1>

          <div
            className="wp-reveal mt-6 h-px w-20 bg-white/35"
            style={d(240)}
            aria-hidden
          />

          <p
            className="wp-reveal mt-5 max-w-[42ch] text-sm leading-relaxed text-white/75"
            style={d(300)}
          >
            Vendor, biaya, tamu, dan daftar tugas — tercatat di satu halaman
            sampai hari-H.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="flex items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Image
            src="/logo-full.png"
            alt="Wedding Plan"
            width={520}
            height={403}
            priority
            className="wp-reveal mx-auto w-44 h-auto"
            style={d(120)}
          />

          <p
            className="wp-reveal mt-6 mb-7 text-center text-sm text-muted"
            style={d(190)}
          >
            Masuk untuk melanjutkan persiapan.
          </p>

          <LoginForm hasError={params.error === "1"} />

          <p
            className="wp-reveal mt-10 text-center text-[11px] text-muted/70"
            style={d(480)}
          >
            Akses terbatas untuk pemilik akun.
          </p>
        </div>
      </section>
    </main>
  );
}
