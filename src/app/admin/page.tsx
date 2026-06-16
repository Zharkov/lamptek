import Link from "next/link";
import { db } from "@/lib/db";
import { deleteProduct, setLeadStatus } from "./actions";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = { new: "Новая", called: "Позвонили", closed: "Закрыта" };

export default async function AdminHome() {
  const [products, leads] = await Promise.all([
    db.product.findMany({ orderBy: { sortOrder: "asc" }, include: { category: true } }),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div className="space-y-12">
      {/* ЗАЯВКИ */}
      <section>
        <h1 className="font-display text-xl font-bold">Заявки</h1>
        <div className="mt-4 space-y-3">
          {leads.length === 0 && <p className="text-muted">Заявок пока нет.</p>}
          {leads.map((l) => {
            const items = JSON.parse(l.itemsJson || "[]") as { title: string; qty: number }[];
            return (
              <div key={l.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-medium">{l.name}</span>
                    <span className="ml-3 font-mono text-glow">{l.phone}</span>
                    {l.email && <span className="ml-3 text-sm text-muted">{l.email}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{new Date(l.createdAt).toLocaleString("ru-RU")}</span>
                    <form action={async () => { "use server"; await setLeadStatus(l.id, l.status === "new" ? "called" : l.status === "called" ? "closed" : "new"); }}>
                      <button className="rounded border border-ink-500 px-2 py-1 text-xs hover:border-glow">{statusLabel[l.status]}</button>
                    </form>
                  </div>
                </div>
                {items.length > 0 && <div className="mt-2 text-sm text-muted">{items.map((i) => `${i.title} × ${i.qty}`).join("; ")}</div>}
                {l.comment && <div className="mt-1 text-sm text-muted">«{l.comment}»</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ТОВАРЫ */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Товары ({products.length})</h2>
          <Link href="/admin/products/new" className="btn-glow text-sm">+ Добавить товар</Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-ink-600">
          <table className="w-full text-sm">
            <thead className="bg-ink-700 text-left text-muted">
              <tr><th className="p-3">Название</th><th className="p-3">Категория</th><th className="p-3">Статус</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-ink-600">
                  <td className="p-3">{p.title}</td>
                  <td className="p-3 text-muted">{p.category.title}</td>
                  <td className="p-3">{p.published ? <span className="text-glow">опубликован</span> : <span className="text-muted">скрыт</span>}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/products/${p.id}`} className="text-glow hover:underline">Изменить</Link>
                    <form action={async () => { "use server"; await deleteProduct(p.id); }} className="ml-3 inline">
                      <button className="text-muted hover:text-red-400">Удалить</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
