"use client";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { RequestForm } from "@/components/RequestForm";

export default function CartPage() {
  const { items, setQty, remove } = useCart();

  return (
    <div className="container-lt py-12">
      <div className="eyebrow">Заявка</div>
      <h1 className="mt-2 font-display text-3xl font-bold">Запрос расчёта</h1>
      <p className="mt-2 max-w-xl text-muted">
        Оплата на сайте не нужна. Соберите позиции, оставьте контакты — менеджер свяжется,
        уточнит детали и подготовит расчёт под ваш объект.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <div>
          {items.length === 0 ? (
            <div className="card p-8 text-center text-muted">
              Список пуст. <Link href="/catalog" className="text-glow hover:underline">Перейти в каталог →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.slug} className="card flex items-center justify-between gap-4 p-4">
                  <Link href={`/product/${i.slug}`} className="font-medium hover:text-glow">{i.title}</Link>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-md border border-ink-500">
                      <button onClick={() => setQty(i.slug, i.qty - 1)} className="px-3 py-1.5 text-muted hover:text-chalk">−</button>
                      <span className="w-10 text-center font-mono">{i.qty}</span>
                      <button onClick={() => setQty(i.slug, i.qty + 1)} className="px-3 py-1.5 text-muted hover:text-chalk">+</button>
                    </div>
                    <button onClick={() => remove(i.slug)} className="text-sm text-muted hover:text-red-400">Убрать</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <RequestForm />
      </div>
    </div>
  );
}
