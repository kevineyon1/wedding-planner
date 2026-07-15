import { prisma } from "@/lib/prisma";
import { KATEGORI_TAMU } from "@/lib/constants";
import { createGuest, setGuestStatus, deleteGuest } from "@/app/actions/guest";
import { StatusSelect } from "@/components/StatusSelect";
import { DeleteButton } from "@/components/DeleteButton";

const STATUS_TAMU = [
  { value: "rencana", label: "Rencana" },
  { value: "diundang", label: "Diundang" },
  { value: "konfirmasi", label: "Konfirmasi" },
];

const STATUS_STYLE: Record<string, string> = {
  rencana: "bg-gray-100 text-gray-600",
  diundang: "bg-amber-100 text-amber-700",
  konfirmasi: "bg-emerald-100 text-emerald-700",
};

export default async function TamuPage() {
  const guests = await prisma.guest.findMany({
    orderBy: [{ kategori: "asc" }, { nama: "asc" }],
  });

  const totalOrang = guests.reduce((s, g) => s + g.jumlahOrang, 0);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Daftar Tamu</h1>
        <p className="text-sm text-muted">
          {guests.length} undangan • estimasi{" "}
          <span className="font-semibold text-primary">{totalOrang} orang</span>
        </p>
      </header>

      {/* Form tambah */}
      <form
        action={createGuest}
        className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-end"
      >
        <div>
          <label className="label">Nama tamu / keluarga</label>
          <input name="nama" required className="input" placeholder="mis. Keluarga Budi" />
        </div>
        <div>
          <label className="label">Kategori</label>
          <select name="kategori" className="input" defaultValue="Teman">
            {KATEGORI_TAMU.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Sisi</label>
          <select name="sisi" className="input" defaultValue="pria">
            <option value="pria">Pria</option>
            <option value="wanita">Wanita</option>
          </select>
        </div>
        <div>
          <label className="label">Jml orang</label>
          <input
            name="jumlahOrang"
            type="number"
            min={1}
            defaultValue={1}
            className="input w-24"
          />
        </div>
        <button type="submit" className="btn-primary">
          Tambah
        </button>
      </form>

      {/* List */}
      {guests.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          Belum ada tamu. Tambahkan tamu pertama di atas.
        </div>
      ) : (
        <div className="space-y-2">
          {guests.map((g) => (
            <div
              key={g.id}
              className="card p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{g.nama}</span>
                  <span className={`badge ${STATUS_STYLE[g.status]}`}>
                    {STATUS_TAMU.find((s) => s.value === g.status)?.label ??
                      g.status}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {g.kategori} • sisi {g.sisi} • {g.jumlahOrang} orang
                </p>
              </div>
              <div className="flex items-center gap-3">
                <form action={setGuestStatus}>
                  <input type="hidden" name="id" value={g.id} />
                  <StatusSelect
                    value={g.status}
                    options={STATUS_TAMU}
                    className="input py-1 text-xs w-auto"
                  />
                </form>
                <form action={deleteGuest}>
                  <input type="hidden" name="id" value={g.id} />
                  <DeleteButton confirmText={`Hapus tamu "${g.nama}"?`} />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
