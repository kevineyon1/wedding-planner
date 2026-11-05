/** Miniatur tampilan aplikasi, digambar dengan CSS — bukan screenshot.
 *  Halaman ini publik, jadi semua nama dan angka di sini contoh, bukan data pemilik akun. */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden bg-card/90 p-4 shadow-[0_18px_40px_-28px_rgba(43,34,36,0.45)]">
      {children}
    </div>
  );
}

export function VendorMock() {
  const pills = [
    { label: "Wishlist", n: 10, cls: "bg-gray-100 text-gray-600" },
    { label: "Shortlist", n: 1, cls: "bg-amber-100 text-amber-700" },
    { label: "Dipilih", n: 2, cls: "bg-primary-soft text-primary" },
    { label: "Booked", n: 3, cls: "bg-emerald-100 text-emerald-700" },
  ];
  return (
    <Frame>
      <div className="grid grid-cols-4 gap-2">
        {pills.map((p) => (
          <div key={p.label} className="rounded-lg border border-border px-2 py-2">
            <span className={`badge ${p.cls} text-[10px]`}>{p.label}</span>
            <p className="mt-1.5 text-lg font-semibold">{p.n}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1.5 text-xs">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2">
          <div className="flex justify-between">
            <span className="font-medium">Decoration</span>
            <span className="text-muted">2 kandidat</span>
          </div>
          <p className="mt-0.5 text-emerald-700">Kirana Dekorasi · sudah dipilih</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <div className="flex justify-between">
            <span className="font-medium">Photography</span>
            <span className="text-muted">3 kandidat</span>
          </div>
          <p className="mt-0.5 text-muted">Rp 7.850.000 – Rp 12.400.000</p>
        </div>
      </div>
    </Frame>
  );
}

export function FinanceMock() {
  return (
    <Frame>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">Checklist Wedding</span>
        <span className="text-muted">14 dari 25 item terisi</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-soft">
        <div className="h-full w-[56%] rounded-full bg-primary" />
      </div>

      <div className="mt-3 divide-y divide-border rounded-lg border border-border text-xs">
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="font-medium">Venue</span>
            <span className="badge bg-amber-100 text-amber-700 text-[10px]">Belum lunas</span>
          </div>
          <div className="mt-1.5 grid grid-cols-[1fr_auto_auto] items-center gap-2">
            <span className="truncate rounded-md border border-border px-2 py-1 text-muted">
              Grand Permata Hall
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-muted">24.600.000</span>
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">
              Sisa Rp 18.600.000
            </span>
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="font-medium">WO</span>
            <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">Lunas</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="badge bg-primary-soft text-primary">DP</span>
            <span className="badge bg-sky-100 text-sky-700">Tabungan</span>
            <span className="text-muted">Rp 6.000.000 · 2 Juni</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function TabunganMock() {
  return (
    <Frame>
      <p className="text-[11px] text-muted">Saldo Tabungan</p>
      <p className="font-display text-3xl font-light text-primary">Rp 86.350.000</p>
      <p className="mt-0.5 text-[11px] text-muted">
        setoran Rp 92.000.000 − dipakai bayar vendor Rp 5.650.000
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] text-muted">Dibayar pakai Tabungan</p>
          <p className="mt-0.5 font-semibold text-sky-700">Rp 5.650.000</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-2">
          <p className="text-[10px] text-muted">Tabungan kurang</p>
          <p className="mt-0.5 font-semibold text-red-600">Rp 41.280.000</p>
        </div>
      </div>
    </Frame>
  );
}

export function TodoMock() {
  // 0 = kosong, 1 = ada deadline, 2 = terlambat, 3 = selesai, 4 = hari-H
  const days: number[] = [
    0, 0, 0, 0, 0, 1, 0,
    0, 0, 2, 0, 0, 0, 0,
    0, 3, 0, 0, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 4,
  ];
  const dot: Record<number, string> = {
    1: "bg-amber-400",
    2: "bg-red-500",
    3: "bg-emerald-500",
    4: "bg-primary",
  };
  return (
    <Frame>
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-muted">
        {["S", "S", "R", "K", "J", "S", "M"].map((h, i) => (
          <span key={i}>{h}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((state, i) => (
          <div
            key={i}
            className={`flex aspect-square flex-col items-center justify-center rounded-md text-[10px] ${
              state ? "bg-primary-soft/50" : "bg-background"
            }`}
          >
            <span>{i + 1}</span>
            {state > 0 && (
              <span className={`mt-0.5 size-1 rounded-full ${dot[state]}`} aria-hidden />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 divide-y divide-border rounded-lg border border-border text-xs">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="size-4 shrink-0 rounded-full border-2 border-gray-300" aria-hidden />
          <span className="flex-1 truncate">Urus surat nikah di KUA</span>
          <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] text-red-700">
            terlambat 3 hari
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 text-muted">
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
            ✓
          </span>
          <span className="flex-1 truncate line-through">Cari fotografer</span>
        </div>
      </div>
    </Frame>
  );
}
