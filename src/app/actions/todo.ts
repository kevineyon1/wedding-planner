"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/require-auth";

function str(raw: FormDataEntryValue | null): string | null {
  const v = raw ? String(raw).trim() : "";
  return v.length ? v : null;
}

export async function createTodo(formData: FormData) {
  await requireAuth();
  const judul = str(formData.get("judul"));
  if (!judul) return;
  const deadlineRaw = str(formData.get("deadline"));
  await prisma.todo.create({
    data: {
      judul,
      kategori: str(formData.get("kategori")) ?? "Umum",
      prioritas: str(formData.get("prioritas")) ?? "normal",
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      catatan: str(formData.get("catatan")),
    },
  });
  revalidatePath("/todo");
  revalidatePath("/");
}

export async function setTodoStatus(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  const status = str(formData.get("status"));
  if (!id || !status) return;
  await prisma.todo.update({ where: { id }, data: { status } });
  revalidatePath("/todo");
  revalidatePath("/");
}

export async function deleteTodo(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.todo.delete({ where: { id } });
  revalidatePath("/todo");
  revalidatePath("/");
}
