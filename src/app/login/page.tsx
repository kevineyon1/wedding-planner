import Image from "next/image";
import bouquet from "@/assets/login-bouquet.jpg";
import { getSetting } from "@/lib/queries";
import { formatTanggal, hariMenuju } from "@/lib/format";
import { LoginForm } from "@/components/LoginForm";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [params, setting] = await Promise.all([searchParams, getSetting()]);
  const sisaHari = hariMenuju(setting.tanggalHariH);
  const pasangan =
    setting.namaPengantin1 && setting.namaPengantin2
      ? `${setting.namaPengantin1} & ${setting.namaPengantin2}`
      : null;

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

          {pasangan && (
            <h1
              className="wp-reveal font-display text-4xl sm:text-5xl lg:text-6xl font-light tracking-wide mt-2"
              style={d(140)}
            >
              {pasangan}
            </h1>
          )}

          {sisaHari !== null && sisaHari >= 0 ? (
            <div className="wp-reveal mt-5 flex items-end gap-4" style={d(230)}>
              <span className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.8] font-light">
                {sisaHari}
              </span>
              <span className="text-sm leading-snug text-white/75 pb-1">
                hari menuju
                <br />
                <span className="text-white/95">{formatTanggal(setting.tanggalHariH)}</span>
              </span>
            </div>
          ) : (
            <p className="wp-reveal mt-5 text-sm text-white/75" style={d(230)}>
              {sisaHari === null
                ? "Semua persiapan, dalam satu tempat."
                : "Selamat menempuh hidup baru."}
            </p>
          )}

          <div
            className="wp-reveal mt-7 h-px w-20 bg-white/35"
            style={d(320)}
            aria-hidden
          />
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
            Halaman pribadi · Kevin Gideon
          </p>
        </div>
      </section>
    </main>
  );
}
