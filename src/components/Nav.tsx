"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/vendor", label: "Vendor", icon: "🏷️" },
  { href: "/budget", label: "Tabungan", icon: "💰" },
  { href: "/finance", label: "Finance", icon: "🧾" },
  { href: "/todo", label: "To-Do", icon: "✅" },
  { href: "/tamu", label: "Tamu", icon: "💌" },
  { href: "/pengaturan", label: "Pengaturan", icon: "⚙️" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="md:w-60 md:min-h-screen bg-card border-b md:border-b-0 md:border-r border-border px-3 py-4 md:py-6 shrink-0">
      <div className="px-2 mb-4 md:mb-6">
        <p className="text-lg font-semibold text-primary leading-tight">
          Wedding Planner 💍
        </p>
        <p className="text-xs text-muted">Persiapan pernikahan</p>
      </div>
      <ul className="flex md:flex-col gap-1 overflow-x-auto">
        {links.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-foreground hover:bg-primary-soft/60"
                }`}
              >
                <span aria-hidden>{l.icon}</span>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <form action={logout} className="mt-4 px-2 hidden md:block">
        <button
          type="submit"
          className="text-xs text-muted hover:text-primary transition-colors"
        >
          🚪 Keluar
        </button>
      </form>
      <p className="mt-4 px-2 text-[10px] text-muted/70 hidden md:block">
        Created by Kevin Gideon
      </p>
    </nav>
  );
}
