"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import clsx from "clsx";
import { ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reports", label: "Reports" }
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 border-r border-slate-200 bg-white">
        <div className="p-6">
          <div className="text-xl font-semibold text-brand-700">Tijarat Admin</div>
          <p className="mt-2 text-sm text-slate-500">Role: {session?.user?.role ?? "-"}</p>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-lg px-4 py-2 text-sm font-medium",
                  active
                    ? "bg-brand-50 text-brand-800 ring-1 ring-brand-100"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4 text-sm text-slate-600">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin</h1>
            <p className="text-sm text-slate-500">Manage the UAE COD commerce operations.</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <div>{session?.user?.email}</div>
            <div className="text-xs">Secured session</div>
          </div>
        </header>
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
}
