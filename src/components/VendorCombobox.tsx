"use client";

import { useEffect, useRef, useState } from "react";

export type VendorOption = {
  id: number;
  nama: string;
  kategori: string;
  hargaPenawaran: number;
};

export function VendorCombobox({
  vendors,
  value,
  onSelect,
}: {
  vendors: VendorOption[];
  value: string;
  onSelect: (vendor: VendorOption | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = vendors.find((v) => v.id === Number(value)) ?? null;

  // Sinkronkan teks tampilan saat vendor terpilih berubah dari luar (mis. reset form)
  useEffect(() => {
    setQuery(selected ? `${selected.kategori} — ${selected.nama}` : "");
  }, [selected?.id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = vendors.filter((v) =>
    `${v.kategori} ${v.nama}`.toLowerCase().includes(q)
  );

  // Kelompokkan per kategori, urutan sudah kategori→nama dari query server
  const grouped: { kategori: string; items: VendorOption[] }[] = [];
  for (const v of filtered) {
    let g = grouped.find((g) => g.kategori === v.kategori);
    if (!g) {
      g = { kategori: v.kategori, items: [] };
      grouped.push(g);
    }
    g.items.push(v);
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        className="input"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (selected) onSelect(null);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Ketik atau pilih kategori / nama vendor..."
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {grouped.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">Vendor tidak ditemukan.</p>
          ) : (
            grouped.map((g) => (
              <div key={g.kategori}>
                <div className="px-3 py-1.5 text-xs font-semibold text-muted bg-primary-soft/50 sticky top-0">
                  {g.kategori}
                </div>
                {g.items.map((v) => (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => {
                      onSelect(v);
                      setQuery(`${v.kategori} — ${v.nama}`);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-primary-soft/60"
                  >
                    {v.nama}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
