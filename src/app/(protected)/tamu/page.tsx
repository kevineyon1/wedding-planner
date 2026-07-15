import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { setGuestStatus, deleteGuest } from "@/app/actions/guest";
import { StatusSelect } from "@/components/StatusSelect";
import { DeleteButton } from "@/components/DeleteButton";
import { GuestForm } from "@/components/GuestForm";

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

const TABS = [
  { value: null, label: "Semua", icon: "👥" },
  { value: "pria", label: "Pria", icon: "🤵" },
  { value: "wanita", label: "Wanita", icon: "👰" },
] as const;

export default async function TamuPage({
  searchParams,
}: {
  searchParams: Promise<{ sisi?: string }>;
}) {
  const params = await searchParams;
  const filterSisi =
    params.sisi === "pria" || params.sisi === "wanita" ? params.sisi : null;

  const allGuests = await prisma.guest.findMany({
    orderBy: [{ kategori: "asc" }, { nama: "asc" }],
  });

  const guests = filterSisi
    ? allGuests.filter((g) => g.sisi === filterSisi)
    : allGuests;

  const totalOrang = guests.reduce((s, g) => s + g.jumlahOrang, 0);
  const totalPria = allGuests
    .filter((g) => g.sisi === "pria")
    .reduce((s, g) => s + g.jumlahOrang, 0);
  const totalWanita = allGuests
    .filter((g) => g.sisi === "wanita")
    .reduce((s, g) => s + g.jumlahOrang, 0);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Daftar Tamu</h1>
        <p className="text-sm text-muted">
          {allGuests.length} undangan • estimasi{" "}
          <span className="font-semibold text-primary">
            {allGuests.reduce((s, g) => s + g.jumlahOrang, 0)} orang
          </span>
        </p>
      </header>

      {/* Ringkasan Pria vs Wanita */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card p-3 text-center">
          <p className="text-xs text-muted">🤵 Pihak Pria</p>
          <p className="text-lg font-semibold">{totalPria}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-muted">👰 Pihak Wanita</p>
          <p className="text-lg font-semibold">{totalWanita}</p>
        </div>
      </div>

      {/* Tabs filter sisi */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => {
          const active = filterSisi === tab.value;
          const href = tab.value ? `/tamu?sisi=${tab.value}` : "/tamu";
          return (
            <Link
              key={tab.label}
              href={href}
              className={`text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${
                active
                  ? "bg-primary-soft text-primary"
                  : "border border-border bg-card text-foreground hover:bg-primary-soft/60"
              }`}
            >
              {tab.icon} {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Form tambah */}
      <GuestForm />

      {/* List */}
      {guests.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          {filterSisi
            ? `Belum ada tamu di sisi ${filterSisi}.`
            : "Belum ada tamu. Tambahkan tamu pertama di atas."}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted">
            Menampilkan {guests.length} undangan • {totalOrang} orang
          </p>
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
                  <span className="badge bg-primary-soft text-primary">
                    {g.sisi === "pria" ? "🤵 Pria" : "👰 Wanita"}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {g.kategori} • {g.jumlahOrang} orang
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
