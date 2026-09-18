"use client";

import { useMemo, useState, useTransition } from "react";
import { createTodo, setTodoStatus, deleteTodo } from "@/app/actions/todo";
import { KATEGORI_TODO } from "@/lib/constants";

export type TodoItem = {
  id: number;
  judul: string;
  kategori: string;
  status: string;
  prioritas: string;
  deadline: string | null; // YYYY-MM-DD
};

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const NEXT_STATUS: Record<string, string> = { belum: "proses", proses: "selesai", selesai: "belum" };
const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  belum: { label: "Belum", cls: "bg-gray-100 text-gray-600" },
  proses: { label: "Proses", cls: "bg-amber-100 text-amber-700" },
  selesai: { label: "Selesai", cls: "bg-emerald-100 text-emerald-700" },
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function keyOf(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatKey(k: string) {
  const [y, m, d] = k.split("-").map(Number);
  return `${d} ${BULAN[m - 1]} ${y}`;
}
function daysBetween(fromKey: string, toKey: string) {
  const a = new Date(fromKey + "T00:00:00");
  const b = new Date(toKey + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function TodoBoard({ todos, hariH }: { todos: TodoItem[]; hariH: string | null }) {
  const todayKey = keyOf(new Date());
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const byDate = useMemo(() => {
    const m = new Map<string, TodoItem[]>();
    for (const t of todos) {
      if (!t.deadline) continue;
      if (!m.has(t.deadline)) m.set(t.deadline, []);
      m.get(t.deadline)!.push(t);
    }
    return m;
  }, [todos]);

  const total = todos.length;
  const selesai = todos.filter((t) => t.status === "selesai").length;
  const proses = todos.filter((t) => t.status === "proses").length;
  const isLate = (t: TodoItem) => t.status !== "selesai" && !!t.deadline && t.deadline < todayKey;
  const terlambat = todos.filter(isLate).length;
  const persen = total ? Math.round((selesai / total) * 100) : 0;

  // Grid kalender, mulai Senin
  const cells = useMemo(() => {
    const first = new Date(month);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      return { key: keyOf(d), day: d.getDate(), inMonth: d.getMonth() === month.getMonth() };
    });
  }, [month]);

  const visible = selected ? todos.filter((t) => t.deadline === selected) : todos;
  const aktif = visible.filter((t) => t.status !== "selesai");
  const groups = [
    { title: "⚠️ Terlambat", tone: "text-red-600", items: aktif.filter(isLate) },
    {
      title: "📅 7 hari ke depan",
      tone: "text-amber-700",
      items: aktif.filter((t) => t.deadline && !isLate(t) && daysBetween(todayKey, t.deadline) <= 7),
    },
    {
      title: "🗓️ Nanti",
      tone: "text-foreground",
      items: aktif.filter((t) => t.deadline && daysBetween(todayKey, t.deadline) > 7),
    },
    { title: "📝 Tanpa deadline", tone: "text-foreground", items: aktif.filter((t) => !t.deadline) },
  ];
  const done = visible.filter((t) => t.status === "selesai");

  function run(action: (fd: FormData) => Promise<void>, data: Record<string, string>) {
    startTransition(async () => {
      const fd = new FormData();
      for (const [k, v] of Object.entries(data)) fd.set(k, v);
      await action(fd);
    });
  }

  function shiftMonth(n: number) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  }

  return (
    <div className={isPending ? "opacity-80 transition-opacity" : "transition-opacity"}>
      {/* Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Stat label="Total tugas" value={total} tone="text-foreground" />
        <Stat label="Selesai" value={selesai} tone="text-emerald-600" />
        <Stat label="Sedang proses" value={proses} tone="text-amber-600" />
        <Stat label="Terlambat" value={terlambat} tone={terlambat ? "text-red-600" : "text-muted"} />
      </div>
      <div className="card p-4 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Progres persiapan</span>
          <span className="text-muted">{persen}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-primary-soft overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${persen}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
        {/* Kalender */}
        <div className="card p-4 lg:sticky lg:top-4">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => shiftMonth(-1)} className="btn-ghost px-2.5 py-1" aria-label="Bulan sebelumnya">
              ‹
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
              }}
              className="font-semibold text-sm hover:text-primary"
              title="Kembali ke bulan ini"
            >
              {BULAN[month.getMonth()]} {month.getFullYear()}
            </button>
            <button type="button" onClick={() => shiftMonth(1)} className="btn-ghost px-2.5 py-1" aria-label="Bulan berikutnya">
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted mb-1">
            {HARI.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((c) => {
              const list = byDate.get(c.key) ?? [];
              const allDone = list.length > 0 && list.every((t) => t.status === "selesai");
              const late = list.some(isLate);
              const isToday = c.key === todayKey;
              const isHariH = c.key === hariH;
              const isSel = c.key === selected;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelected(isSel ? null : c.key)}
                  className={`relative aspect-square rounded-lg text-sm flex flex-col items-center justify-center transition-colors ${
                    isSel
                      ? "bg-primary text-white"
                      : isHariH
                        ? "bg-primary-soft text-primary font-semibold"
                        : list.length
                          ? "bg-primary-soft/40 hover:bg-primary-soft"
                          : "hover:bg-primary-soft/40"
                  } ${c.inMonth ? "" : "opacity-35"} ${isToday && !isSel ? "ring-2 ring-primary/50" : ""}`}
                  title={
                    isHariH
                      ? "Hari-H 💍"
                      : list.length
                        ? list.map((t) => t.judul).join(", ")
                        : undefined
                  }
                >
                  <span className="leading-none">{c.day}</span>
                  {isHariH ? (
                    <span className="text-[10px] leading-none mt-0.5">💍</span>
                  ) : list.length > 0 ? (
                    <span
                      className={`mt-0.5 text-[9px] leading-none font-semibold rounded-full px-1 ${
                        isSel
                          ? "bg-white/25 text-white"
                          : late
                            ? "bg-red-100 text-red-600"
                            : allDone
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {allDone ? "✓" : "📌"}
                      {list.length > 1 ? list.length : ""}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[11px] text-muted">
            <span><span className="text-amber-700">📌</span> ada deadline</span>
            <span><span className="text-red-600">●</span> terlambat</span>
            <span><span className="text-emerald-600">✓</span> selesai</span>
            <span>💍 hari-H</span>
          </div>
        </div>

        {/* Daftar tugas */}
        <div className="space-y-5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {selected ? (
              <p className="text-sm">
                Deadline <b>{formatKey(selected)}</b> · {visible.length} tugas{" "}
                <button type="button" onClick={() => setSelected(null)} className="text-primary text-xs hover:underline ml-1">
                  × tampilkan semua
                </button>
              </p>
            ) : (
              <p className="text-sm text-muted">Klik tanggal di kalender untuk filter.</p>
            )}
            <button type="button" onClick={() => setShowForm((s) => !s)} className="btn-primary py-1.5">
              {showForm ? "Tutup" : "+ Tambah tugas"}
            </button>
          </div>

          {showForm && (
            <form
              action={(fd) =>
                startTransition(async () => {
                  await createTodo(fd);
                  setShowForm(false);
                })
              }
              className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div className="sm:col-span-2">
                <label className="label">Tugas</label>
                <input name="judul" required autoFocus className="input" placeholder="mis. Urus surat nikah di KUA" />
              </div>
              <div>
                <label className="label">Kategori</label>
                <select name="kategori" className="input" defaultValue="Umum">
                  {KATEGORI_TODO.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Prioritas</label>
                <select name="prioritas" className="input" defaultValue="normal">
                  <option value="tinggi">🔥 Tinggi</option>
                  <option value="normal">Normal</option>
                  <option value="rendah">Rendah</option>
                </select>
              </div>
              <div>
                <label className="label">Deadline</label>
                <input type="date" name="deadline" defaultValue={selected ?? ""} className="input" />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={isPending} className="btn-primary w-full disabled:opacity-50">
                  {isPending ? "Menyimpan..." : "Simpan tugas"}
                </button>
              </div>
            </form>
          )}

          {groups.map((g) =>
            g.items.length ? (
              <section key={g.title}>
                <h2 className={`text-sm font-semibold mb-2 px-1 ${g.tone}`}>
                  {g.title} <span className="text-muted font-normal">({g.items.length})</span>
                </h2>
                <div className="card divide-y divide-border overflow-hidden">
                  {g.items.map((t) => (
                    <TodoRow key={t.id} t={t} todayKey={todayKey} late={isLate(t)} run={run} />
                  ))}
                </div>
              </section>
            ) : null
          )}

          {aktif.length === 0 && done.length === 0 && (
            <div className="card p-8 text-center text-muted text-sm">
              {selected ? "Tidak ada tugas dengan deadline di tanggal ini." : "Belum ada tugas. Klik + Tambah tugas."}
            </div>
          )}
          {aktif.length === 0 && done.length > 0 && (
            <div className="card p-6 text-center text-emerald-700 text-sm bg-emerald-50 border-emerald-200">
              🎉 Semua tugas{selected ? " di tanggal ini" : ""} sudah selesai!
            </div>
          )}

          {done.length > 0 && (
            <section>
              <button
                type="button"
                onClick={() => setShowDone((s) => !s)}
                className="text-sm font-semibold mb-2 px-1 text-emerald-700 hover:underline"
              >
                {showDone ? "▾" : "▸"} ✅ Selesai ({done.length})
              </button>
              {showDone && (
                <div className="card divide-y divide-border overflow-hidden">
                  {done.map((t) => (
                    <TodoRow key={t.id} t={t} todayKey={todayKey} late={false} run={run} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${tone}`}>{value}</p>
    </div>
  );
}

function TodoRow({
  t,
  todayKey,
  late,
  run,
}: {
  t: TodoItem;
  todayKey: string;
  late: boolean;
  run: (action: (fd: FormData) => Promise<void>, data: Record<string, string>) => void;
}) {
  const done = t.status === "selesai";
  const sisa = t.deadline ? daysBetween(todayKey, t.deadline) : null;
  const pill = STATUS_PILL[t.status] ?? STATUS_PILL.belum;

  let deadlineText = "";
  let deadlineCls = "bg-gray-100 text-gray-600";
  if (t.deadline && sisa !== null) {
    if (done) deadlineText = formatKey(t.deadline);
    else if (late) {
      deadlineText = `terlambat ${-sisa} hari`;
      deadlineCls = "bg-red-100 text-red-700";
    } else if (sisa === 0) {
      deadlineText = "hari ini";
      deadlineCls = "bg-red-100 text-red-700";
    } else if (sisa <= 7) {
      deadlineText = `${sisa} hari lagi`;
      deadlineCls = "bg-amber-100 text-amber-700";
    } else deadlineText = formatKey(t.deadline);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 group">
      <button
        type="button"
        onClick={() => run(setTodoStatus, { id: String(t.id), status: done ? "belum" : "selesai" })}
        className={`size-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
          done
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
        }`}
        aria-label={done ? "Tandai belum selesai" : "Tandai selesai"}
      >
        {done ? "✓" : ""}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${done ? "line-through text-muted" : ""}`}>
          {t.prioritas === "tinggi" && !done && <span title="Prioritas tinggi">🔥 </span>}
          {t.judul}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
          <span className="rounded-md bg-primary-soft/70 text-primary px-1.5 py-0.5">{t.kategori}</span>
          {deadlineText && (
            <span className={`rounded-md px-1.5 py-0.5 ${deadlineCls}`}>📅 {deadlineText}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => run(setTodoStatus, { id: String(t.id), status: NEXT_STATUS[t.status] ?? "belum" })}
        className={`badge shrink-0 cursor-pointer hover:opacity-80 ${pill.cls}`}
        title="Klik untuk ganti status"
      >
        {pill.label}
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Hapus tugas "${t.judul}"?`)) run(deleteTodo, { id: String(t.id) });
        }}
        className="shrink-0 text-muted hover:text-red-600 text-lg leading-none sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        aria-label="Hapus tugas"
      >
        ×
      </button>
    </div>
  );
}
