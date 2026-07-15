import { prisma } from "@/lib/prisma";
import { formatTanggal } from "@/lib/format";
import {
  KATEGORI_TODO,
  STATUS_TODO,
  LABEL_STATUS_TODO,
} from "@/lib/constants";
import { createTodo, setTodoStatus, deleteTodo } from "@/app/actions/todo";
import { StatusSelect } from "@/components/StatusSelect";
import { DeleteButton } from "@/components/DeleteButton";

const STATUS_STYLE: Record<string, string> = {
  belum: "bg-gray-100 text-gray-600",
  proses: "bg-amber-100 text-amber-700",
  selesai: "bg-emerald-100 text-emerald-700",
};

const PRIORITAS_STYLE: Record<string, string> = {
  tinggi: "text-red-600",
  normal: "text-muted",
  rendah: "text-muted",
};

export default async function TodoPage() {
  const todos = await prisma.todo.findMany({
    orderBy: [{ status: "asc" }, { deadline: "asc" }, { createdAt: "desc" }],
  });

  const statusOptions = STATUS_TODO.map((s) => ({
    value: s,
    label: LABEL_STATUS_TODO[s],
  }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">To-Do Persiapan</h1>
        <p className="text-sm text-muted">Checklist tugas menuju hari-H.</p>
      </header>

      {/* Form tambah */}
      <form
        action={createTodo}
        className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-end"
      >
        <div>
          <label className="label">Tugas baru</label>
          <input
            name="judul"
            required
            className="input"
            placeholder="mis. Urus surat nikah di KUA"
          />
        </div>
        <div>
          <label className="label">Kategori</label>
          <select name="kategori" className="input" defaultValue="Umum">
            {KATEGORI_TODO.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Prioritas</label>
          <select name="prioritas" className="input" defaultValue="normal">
            <option value="tinggi">Tinggi</option>
            <option value="normal">Normal</option>
            <option value="rendah">Rendah</option>
          </select>
        </div>
        <div>
          <label className="label">Deadline</label>
          <input type="date" name="deadline" className="input" />
        </div>
        <button type="submit" className="btn-primary">
          Tambah
        </button>
      </form>

      {/* List */}
      {todos.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          Belum ada tugas. Tambahkan tugas pertama di atas.
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((t) => (
            <div
              key={t.id}
              className={`card p-4 flex flex-wrap items-center justify-between gap-3 ${
                t.status === "selesai" ? "opacity-60" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-medium ${
                      t.status === "selesai" ? "line-through" : ""
                    }`}
                  >
                    {t.judul}
                  </span>
                  <span className={`badge ${STATUS_STYLE[t.status]}`}>
                    {LABEL_STATUS_TODO[t.status]}
                  </span>
                  {t.prioritas === "tinggi" && (
                    <span className={`text-xs ${PRIORITAS_STYLE.tinggi}`}>
                      ● prioritas tinggi
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {t.kategori}
                  {t.deadline && ` • deadline ${formatTanggal(t.deadline)}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <form action={setTodoStatus}>
                  <input type="hidden" name="id" value={t.id} />
                  <StatusSelect
                    value={t.status}
                    options={statusOptions}
                    className="input py-1 text-xs w-auto"
                  />
                </form>
                <form action={deleteTodo}>
                  <input type="hidden" name="id" value={t.id} />
                  <DeleteButton confirmText={`Hapus tugas "${t.judul}"?`} />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
