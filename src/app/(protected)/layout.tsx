import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { Nav } from "@/components/Nav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!verifySessionToken(token)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Nav />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-5xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
