import { getSetting } from "@/lib/queries";
import { updateSetting } from "@/app/actions/setting";

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default async function PengaturanPage() {
  const s = await getSetting();

  return (
    <div className="max-w-lg">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Pengaturan</h1>
        <p className="text-sm text-muted">
          Data dasar pernikahan, dipakai di dashboard & budget.
        </p>
      </header>

      <form action={updateSetting} className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nama Pengantin 1</label>
            <input
              name="namaPengantin1"
              defaultValue={s.namaPengantin1}
              className="input"
              placeholder="Kevin"
            />
          </div>
          <div>
            <label className="label">Nama Pengantin 2</label>
            <input
              name="namaPengantin2"
              defaultValue={s.namaPengantin2}
              className="input"
              placeholder="Pasangan"
            />
          </div>
        </div>

        <div>
          <label className="label">Tanggal Hari-H</label>
          <input
            type="date"
            name="tanggalHariH"
            defaultValue={toDateInput(s.tanggalHariH)}
            className="input"
          />
        </div>

        <div>
          <label className="label">Total Anggaran (Rp)</label>
          <input
            name="totalAnggaran"
            inputMode="numeric"
            defaultValue={s.totalAnggaran || ""}
            className="input"
            placeholder="150000000"
          />
          <p className="text-xs text-muted mt-1">
            Ketik angka tanpa titik, mis. 150000000.
          </p>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
