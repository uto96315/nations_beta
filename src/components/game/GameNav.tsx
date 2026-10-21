"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { POLICY_CATEGORY_LABELS, type PolicyCategoryId } from "@/lib/game/types";

const LINKS = [
  { href: "/game", label: "ダッシュボード" },
  { href: "/game/policy", label: "政策" },
  { href: "/game/news", label: "ニュース" },
  { href: "/game/budget", label: "予算編成" },
];

const CATEGORIES = Object.entries(POLICY_CATEGORY_LABELS) as [PolicyCategoryId, string][];

export function GameNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-sm font-bold text-slate-800">メニュー</h2>
        <ul className="mt-2 space-y-1">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  "block rounded px-2 py-1.5 text-sm",
                  pathname === l.href
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          政策カテゴリ
        </h3>
        <ul className="mt-2 space-y-1 text-xs text-slate-600">
          {CATEGORIES.map(([, label]) => (
            <li key={label} className="px-2 py-0.5">
              {label}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
