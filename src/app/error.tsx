"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="card w-full max-w-sm p-6 text-center">
        <p className="text-4xl mb-3">🫠</p>
        <h1 className="text-lg font-semibold text-primary mb-1">
          Halaman error, mohon sabar ya
        </h1>
        <p className="text-sm text-muted mb-5">
          Ada yang tidak beres sebentar. Coba muat ulang, biasanya langsung
          normal lagi.
        </p>
        <button onClick={() => reset()} className="btn-primary w-full">
          Coba Lagi
        </button>
        {error?.digest && (
          <p className="text-[10px] text-muted/60 mt-4">
            Kode: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
