"use client";

import { useState, useTransition } from "react";
import { updateGuest } from "@/app/actions/guest";
import { KATEGORI_TAMU } from "@/lib/constants";

type Guest = {
  id: number;
  nama: string;
  kategori: string;
  sisi: string;
  jumlahOrang: number;
  status: string;
  noWhatsapp: string | null;
  catatan: string | null;
};

const STATUS_TAMU = [
  { value: "rencana", label: "Rencana" },
  { value: "diundang", label: "Diundang" },
  { value: "konfirmasi", label: "Konfirmasi" },
];

export function GuestEditDialog({ guest }: { guest: Guest }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAction(fd: FormData) {
    startTransition(async () => {
      await updateGuest(fd);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-primary hover:underline"
      >
        Edit
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="card w-full max-w-md my-8 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Tamu</h2>
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
              <input type="hidden" name="id" value={guest.id} />

              <div>
                <label className="label">Nama tamu / keluarga *</label>
                <input
                  name="nama"
                  required
                  defaultValue={guest.nama}
                  className="input"
                  placeholder="mis. Keluarga Budi"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Kategori</label>
                  <select
                    name="kategori"
                    defaultValue={guest.kategori}
                    className="input"
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
                  <select name="sisi" defaultValue={guest.sisi} className="input">
                    <option value="pria">Pria</option>
                    <option value="wanita">Wanita</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Jml orang</label>
                  <input
                    name="jumlahOrang"
                    type="number"
                    min={1}
                    defaultValue={guest.jumlahOrang}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select name="status" defaultValue={guest.status} className="input">
                    {STATUS_TAMU.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Nomor WhatsApp</label>
                <input
                  name="noWhatsapp"
                  type="tel"
                  defaultValue={guest.noWhatsapp ?? ""}
                  className="input"
                  placeholder="0812xxxxxxx (opsional)"
                />
              </div>

              <div>
                <label className="label">Catatan</label>
                <textarea
                  name="catatan"
                  defaultValue={guest.catatan ?? ""}
                  className="input min-h-16"
                  placeholder="Catatan tambahan (opsional)..."
                />
              </div>

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
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
