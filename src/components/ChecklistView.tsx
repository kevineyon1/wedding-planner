import { formatRupiah } from "@/lib/format";
import { CHECKLIST_ACARA, LABEL_ACARA } from "@/lib/constants";
import type { TransactionRow } from "@/lib/queries";
import { ChecklistItemCard } from "@/components/ChecklistItemCard";

export function ChecklistView({
  acara,
  byItem,
}: {
  acara: string;
  byItem: Record<string, TransactionRow>;
}) {
  const grup = CHECKLIST_ACARA[acara] ?? [];
  const semuaItem = grup.flatMap((g) => g.items);

  const terisi = semuaItem.filter((i) => byItem[i]).length;
  const totalBiaya = semuaItem.reduce(
    (s, i) => s + (byItem[i]?.totalHarga ?? 0),
    0
  );
  const totalDibayar = semuaItem.reduce(
    (s, i) => s + (byItem[i]?.totalDibayar ?? 0),
    0
  );
  const totalSisa = semuaItem.reduce(
    (s, i) => s + (byItem[i]?.sisaHutang ?? 0),
    0
  );
  const persen = semuaItem.length
    ? Math.round((terisi / semuaItem.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Progres checklist acara ini */}
      <div className="card p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold">
            Checklist {LABEL_ACARA[acara] ?? acara}
          </span>
          <span className="text-muted text-xs">
            {terisi} dari {semuaItem.length} item terisi
          </span>
        </div>
        <div className="h-2 rounded-full bg-primary-soft overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${persen}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-muted">Total Biaya</p>
            <p className="font-semibold">{formatRupiah(totalBiaya)}</p>
          </div>
          <div>
            <p className="text-muted">Sudah Dibayar</p>
            <p className="font-semibold text-emerald-600">
              {formatRupiah(totalDibayar)}
            </p>
          </div>
          <div>
            <p className="text-muted">Sisa</p>
            <p className="font-semibold text-amber-600">
              {formatRupiah(totalSisa)}
            </p>
          </div>
        </div>
      </div>

      {/* Daftar item per grup */}
      {grup.map((g) => {
        const grupTerisi = g.items.filter((i) => byItem[i]).length;
        return (
          <section key={g.grup}>
            <div className="flex items-baseline justify-between mb-2 px-1">
              <h2 className="text-sm font-semibold">{g.grup}</h2>
              <span className="text-xs text-muted">
                {grupTerisi}/{g.items.length}
              </span>
            </div>
            <div className="card overflow-hidden">
              {g.items.map((item) => (
                <ChecklistItemCard
                  key={item}
                  item={item}
                  acara={acara}
                  transaction={byItem[item] ?? null}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
