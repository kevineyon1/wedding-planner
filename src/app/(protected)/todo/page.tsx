import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/queries";
import { TodoBoard, type TodoItem } from "@/components/TodoBoard";

// Deadline disimpan sbg tanggal UTC tengah malam (dari input date), jadi ambil bagian tanggalnya saja.
const toKey = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export default async function TodoPage() {
  const [todos, setting] = await Promise.all([
    prisma.todo.findMany({ orderBy: [{ deadline: "asc" }, { createdAt: "desc" }] }),
    getSetting(),
  ]);

  const items: TodoItem[] = todos.map((t) => ({
    id: t.id,
    judul: t.judul,
    kategori: t.kategori,
    status: t.status,
    prioritas: t.prioritas,
    deadline: toKey(t.deadline),
  }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">To-Do Persiapan</h1>
        <p className="text-sm text-muted">Checklist tugas &amp; kalender deadline menuju hari-H.</p>
      </header>
      <TodoBoard todos={items} hariH={toKey(setting.tanggalHariH)} />
    </div>
  );
}
