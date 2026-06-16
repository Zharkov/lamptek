"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";

const nav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "О нас" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-ink-600 bg-ink-900/80 backdrop-blur">
      <div className="container-lt flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-glow shadow-[0_0_12px_2px_rgba(255,179,71,0.7)]" />
          <span className="font-display text-lg font-extrabold tracking-tight">LampTek</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm text-muted transition hover:text-chalk">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/cart" className="btn-ghost px-4 py-2 text-sm">
          Заявка
          {count > 0 && (
            <span className="ml-2 rounded bg-glow px-1.5 text-xs font-semibold text-ink-900">{count}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
