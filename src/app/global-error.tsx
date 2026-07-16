"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
            background: "#faf7f5",
            color: "#2b2224",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "24rem",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              border: "1px solid #ece5e2",
              background: "#ffffff",
              textAlign: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ fontSize: "2.25rem", marginBottom: "0.75rem" }}>🫠</p>
            <h1
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#c2557a",
                marginBottom: "0.25rem",
              }}
            >
              Halaman error, mohon sabar ya
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#8a7d80", marginBottom: "1.25rem" }}>
              Ada yang tidak beres sebentar. Coba muat ulang, biasanya langsung
              normal lagi.
            </p>
            <button
              onClick={() => reset()}
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#c2557a",
                color: "#fff",
                fontWeight: 500,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>
            {error?.digest && (
              <p style={{ fontSize: "10px", color: "rgba(138,125,128,0.6)", marginTop: "1rem" }}>
                Kode: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
