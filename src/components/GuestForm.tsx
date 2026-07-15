"use client";

import { useEffect, useRef, useTransition } from "react";
import { createGuest } from "@/app/actions/guest";
import { KATEGORI_TAMU } from "@/lib/constants";

const STORAGE_KEY_SISI = "wp_guest_last_sisi";
const STORAGE_KEY_KATEGORI = "wp_guest_last_kategori";

export function GuestForm() {
  const namaRef = useRef<HTMLInputElement>(null);
  const kategoriRef = useRef<HTMLSelectElement>(null);
  const sisiRef = useRef<HTMLSelectElement>(null);
  const jumlahRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Server Action + revalidatePath membuat Next.js me-render ulang
  // komponen ini dari server (di mana localStorage tidak ada), jadi
  // defaultValue selalu balik ke default. Effect tanpa dependency array
  // ini berjalan setelah SETIAP render untuk memaksa nilai localStorage
  // kembali ke DOM secara imperatif, bukan cuma sekali saat mount.
  useEffect(() => {
    const savedSisi = localStorage.getItem(STORAGE_KEY_SISI);
    if ((savedSisi === "pria" || savedSisi === "wanita") && sisiRef.current) {
      sisiRef.current.value = savedSisi;
    }
    const savedKategori = localStorage.getItem(STORAGE_KEY_KATEGORI);
    if (savedKategori && kategoriRef.current) {
      kategoriRef.current.value = savedKategori;
    }
  });

  function handleAction(formData: FormData) {
    startTransition(async () => {
      await createGuest(formData);
      // Cuma kosongkan nama & jumlah; kategori & sisi sengaja dibiarkan
      // supaya cepat isi banyak tamu berturut-turut di sisi yang sama.
      if (namaRef.current) namaRef.current.value = "";
      if (jumlahRef.current) jumlahRef.current.value = "1";
      namaRef.current?.focus();
    });
  }

  return (
    <form
      action={handleAction}
      className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-end"
    >
      <div>
        <label className="label">Nama tamu / keluarga</label>
        <input
          ref={namaRef}
          name="nama"
          required
          className="input"
          placeholder="mis. Keluarga Budi"
        />
      </div>
      <div>
        <label className="label">Kategori</label>
        <select
          ref={kategoriRef}
          name="kategori"
          className="input"
          defaultValue="Teman"
          onChange={(e) => localStorage.setItem(STORAGE_KEY_KATEGORI, e.target.value)}
        >
          {KATEGORI_TAMU.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Sisi</label>
        <select
          ref={sisiRef}
          name="sisi"
          className="input"
          defaultValue="pria"
          onChange={(e) => localStorage.setItem(STORAGE_KEY_SISI, e.target.value)}
        >
          <option value="pria">Pria</option>
          <option value="wanita">Wanita</option>
        </select>
      </div>
      <div>
        <label className="label">Jml orang</label>
        <input
          ref={jumlahRef}
          name="jumlahOrang"
          type="number"
          min={1}
          defaultValue={1}
          className="input w-24"
        />
      </div>
      <button type="submit" className="btn-primary" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Tambah"}
      </button>
    </form>
  );
}
