"use client";

import { useState } from "react";
import { createVendor, updateVendor } from "@/app/actions/vendor";
import { KATEGORI_VENDOR, STATUS_VENDOR, LABEL_STATUS_VENDOR } from "@/lib/constants";

type Vendor = {
  id: number;
  nama: string;
  kategori: string;
  kontak: string | null;
  hargaPenawaran: number;
  deskripsiPaket: string | null;
  status: string;
  link: string | null;
  catatan: string | null;
};

export function VendorFormDialog({
  vendor,
  trigger,
}: {
  vendor?: Vendor;
  trigger?: "primary" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(vendor);

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
          onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground text-xl leading-none"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <form
              action={async (fd) => {
                if (isEdit) await updateVendor(fd);
                else await createVendor(fd);
                setOpen(false);
              }}
              className="space-y-3"
            >
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
                    defaultValue={vendor?.kategori ?? ""}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Harga penawaran (Rp)</label>
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
                  className="input min-h-16"
                  placeholder="Apa saja yang termasuk dalam paket..."
                />
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
                <label className="label">Catatan</label>
                <textarea
                  name="catatan"
                  defaultValue={vendor?.catatan ?? ""}
                  className="input min-h-12"
                  placeholder="Kelebihan/kekurangan, hasil nego..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-ghost"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {isEdit ? "Simpan Perubahan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
