import Image from "next/image";
import { login } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="card w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <Image
            src="/logo-full.png"
            alt="Wedding Plan"
            width={520}
            height={403}
            priority
            className="mx-auto w-56 h-auto"
          />
          <p className="text-sm text-muted mt-3">Masuk untuk melanjutkan</p>
        </div>

        {hasError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            Username atau password salah.
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              name="username"
              required
              autoFocus
              className="input"
              placeholder="Username"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              name="password"
              type="password"
              required
              className="input"
              placeholder="Password"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
