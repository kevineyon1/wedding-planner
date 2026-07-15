import "server-only";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "./auth";

/** Panggil di awal tiap Server Action agar tidak bisa dieksekusi tanpa login. */
export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    throw new Error("Unauthorized");
  }
}
