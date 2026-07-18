"use client";

import { useState, useTransition } from "react";
import { createVendor, updateVendor } from "@/app/actions/vendor";
import { KATEGORI_VENDOR, STATUS_VENDOR, LABEL_STATUS_VENDOR } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";

type Vendor = {
  id: number;
  nama: string;
  kategori: string;
  kontak: string | null;
  hargaPenawaran: number;
  hargaMode: string;
  hargaPerPax: number | null;
  pax: number | null;
  deskripsiPaket: string | null;
  status: string;
  link: string | null;
  catatan: string | null;
  brosurPath: string | null;
  brosurNama: string | null;
};

function isImageFile(name: string | null | undefined): boolean {
  if (!name) return false;
  return /\.(jpe?g|png|webp|gif)$/i.test(name);
}

export function VendorFormDialog({
  vendor,
  trigger,
}: {
  vendor?: Vendor;
  trigger?: "primary" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const [kategori, setKategori] = useState(vendor?.kategori ?? "");
  const [hapusBrosur, setHapusBrosur] = useState(false);
  const [hargaMode, setHargaMode] = useState(vendor?.hargaMode ?? "total");
  const [pax, setPax] = useState(vendor?.pax?.toString() ?? "");
  const [hargaPerPax, setHargaPerPax] = useState(vendor?.hargaPerPax?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(vendor);
  const isVenue = kategori === "Venue";

  const paxNum = parseInt(pax.replace(/[^\d]/g, ""), 10) || 0;
  const hargaPerPaxNum = parseInt(hargaPerPax.replace(/[^\d]/g, ""), 10) || 0;
  const estimasiTotal = paxNum * hargaPerPaxNum;

  function handleAction(fd: FormData) {
    startTransition(async () => {
      if (isEdit) await updateVendor(fd);
      else await createVendor(fd);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={trigger === "ghost" ? "btn-ghost" : "btn-primary"}
      >
        {isEdit ? "Edit" : "+ Tambah Vendor"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="card w-full max-w-lg my-8 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {isEdit ? "Edit Vendor" : "Tambah Vendor"}
              </h2>
              <button
                onClick={() => !isPending && setOpen(false)}
                disabled={isPending}
                className="text-muted hover:text-foreground text-xl leading-none disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <form action={handleAction} className="space-y-3">
              {isEdit && <input type="hidden" name="id" value={vendor!.id} />}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Nama vendor *</label>
                  <input
                    name="nama"
                    required
                    defaultValue={vendor?.nama}
                    className="input"
                    placeholder="mis. Studio Foto ABC"
                  />
                </div>
                <div>
                  <label className="label">Kategori *</label>
                  <select
                    name="kategori"
                    required
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="input"
                  >
                    <option value="" disabled>
                      Pilih kategori
                    </option>
                    {KATEGORI_VENDOR.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isVenue && (
                <div>
                  <label className="label">Pax (kapasitas tamu)</label>
                  <input
                    name="pax"
                    inputMode="numeric"
                    value={pax}
                    onChange={(e) => setPax(e.target.value)}
                    className="input"
                    placeholder="mis. 300"
                  />
                </div>
              )}

              {isVenue && (
                <div>
                  <label className="label">Mode Harga</label>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="hargaMode"
                        value="total"
                        checked={hargaMode === "total"}
                        onChange={() => setHargaMode("total")}
                      />
                      Harga Total
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="hargaMode"
                        value="per_pax"
                        checked={hargaMode === "per_pax"}
                        onChange={() => setHargaMode("per_pax")}
                      />
                      Harga per Pax
                    </label>
                  </div>
                </div>
              )}

              {isVenue && hargaMode === "per_pax" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Harga per Pax (Rp)</label>
                    <input
                      name="hargaPerPax"
                      inputMode="numeric"
                      value={hargaPerPax}
                      onChange={(e) => setHargaPerPax(e.target.value)}
                      className="input"
                      placeholder="250000"
                    />
                    {paxNum > 0 && hargaPerPaxNum > 0 && (
                      <p className="text-xs text-muted mt-1">
                        ≈ {formatRupiah(estimasiTotal)} ({paxNum} pax ×{" "}
                        {formatRupiah(hargaPerPaxNum)})
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      name="status"
                      defaultValue={vendor?.status ?? "wishlist"}
                      className="input"
                    >
                      {STATUS_VENDOR.map((s) => (
                        <option key={s} value={s}>
                          {LABEL_STATUS_VENDOR[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">
                      {isVenue ? "Harga Total (Rp)" : "Harga penawaran (Rp)"}
                    </label>
                    <input
                      name="hargaPenawaran"
                      inputMode="numeric"
                      defaultValue={vendor?.hargaPenawaran || ""}
                      className="input"
                      placeholder="15000000"
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      name="status"
                      defaultValue={vendor?.status ?? "wishlist"}
                      className="input"
                    >
                      {STATUS_VENDOR.map((s) => (
                        <option key={s} value={s}>
                          {LABEL_STATUS_VENDOR[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="label">Kontak (WA / IG / telp)</label>
                <input
                  name="kontak"
                  defaultValue={vendor?.kontak ?? ""}
                  className="input"
                  placeholder="0812xxxx / @instagram"
                />
              </div>

              <div>
                <label className="label">Deskripsi paket</label>
                <textarea
                  name="deskripsiPaket"
                  defaultValue={vendor?.deskripsiPaket ?? ""}
                  className="input min-h-24"
                  placeholder={"Tulis 1 poin per baris, contoh:\nCrew 10-15 orang\nFull day coverage\nBonus confetti machine"}
                />
                <p className="text-xs text-muted mt-1">
                  Tekan Enter untuk poin baru — akan tampil sebagai daftar
                  bullet.
                </p>
              </div>

              <div>
                <label className="label">Link (portofolio / IG)</label>
                <input
                  name="link"
                  defaultValue={vendor?.link ?? ""}
                  className="input"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="label">Brosur / Gambar</label>
                {isEdit && vendor?.brosurPath && !hapusBrosur ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm mb-2">
                    <a
                      href={`/api/vendor-brosur/${vendor.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {isImageFile(vendor.brosurNama) ? "🖼️" : "📄"}{" "}
                      {vendor.brosurNama ?? "Lihat lampiran"}
                    </a>
                    <button
                      type="button"
                      onClick={() => setHapusBrosur(true)}
                      className="text-xs text-red-600 hover:underline shrink-0"
                    >
                      Hapus
                    </button>
                  </div>
                ) : null}
                {isEdit && (
                  <input
                    type="hidden"
                    name="hapusBrosur"
                    value={hapusBrosur ? "on" : ""}
                  />
                )}
                <input
                  type="file"
                  name="brosur"
                  accept="application/pdf,image/*"
                  className="input file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:text-primary file:text-sm"
                />
                <p className="text-xs text-muted mt-1">
                  Upload brosur/penawaran vendor dalam format PDF atau gambar
                  (JPG/PNG), opsional.
                </p>
              </div>

              <div>
                <label className="label">Catatan</label>
                <textarea
                  name="catatan"
                  defaultValue={vendor?.catatan ?? ""}
                  className="input min-h-12"
                  placeholder="Kelebihan/kekurangan, hasil nego..."
                />
              </div>

              {isPending && (
                <p className="text-xs text-primary text-center">
                  Menyimpan{" "}
                  {isEdit ? "perubahan" : "vendor"}... jangan tutup jendela ini,
                  bisa agak lama kalau ada file yang diupload.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending
                    ? "Menyimpan..."
                    : isEdit
                      ? "Simpan Perubahan"
                      : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
