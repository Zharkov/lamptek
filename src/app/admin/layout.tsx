import Link from "next/link";
import { logout } from "./actions";

export const metadata = { title: "Админка — LampTek" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900">
      <div className="border-b border-ink-600 bg-ink-800">
        <div className="container-lt flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display font-bold">LampTek · админка</Link>
            <Link href="/admin" className="text-sm text-muted hover:text-chalk">Товары и заявки</Link>
            <Link href="/" className="text-sm text-muted hover:text-chalk" target="_blank">Открыть сайт ↗</Link>
          </div>
          <form action={logout}><button className="text-sm text-muted hover:text-red-400">Выйти</button></form>
        </div>
      </div>
      <div className="container-lt py-8">{children}</div>
    </div>
  );
}
