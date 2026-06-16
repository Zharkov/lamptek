import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const clients = ["Россети", "РЖД", "Роснефть", "X5 Group"];

export default async function Home() {
  const featured = await db.product.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    take: 4,
    include: { category: true },
  });

  return (
    <>
      {/* HERO — тезис: свет в темноте */}
      <section className="relative overflow-hidden">
        <div className="container-lt grid gap-10 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div>
            <div className="eyebrow">Производство светодиодных светильников</div>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Свет, который<br /><span className="text-glow">держит нагрузку</span>
            </h1>
            <p className="mt-6 max-w-md text-muted">
              Уличное, промышленное и офисное освещение для объектов, где важны надёжность,
              ресурс и климат. Подберём решение под задачу и рассчитаем проект.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className="btn-glow">Смотреть каталог</Link>
              <Link href="/cart" className="btn-ghost">Запросить расчёт</Link>
            </div>
          </div>
          {/* визуальная сигнатура: «луч» */}
          <div className="relative hidden md:block">
            <div className="absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,179,71,0.35), transparent 65%)", filter: "blur(8px)" }} />
            <div className="relative grid grid-cols-3 gap-3">
              {["2700K", "4000K", "5000K"].map((k, i) => (
                <div key={k} className="card flex aspect-square flex-col items-center justify-center gap-2">
                  <span className="h-8 w-8 rounded-full"
                    style={{ background: [ "#FFB347", "#FFD9A0", "#CFE3FF" ][i], boxShadow: `0 0 24px 4px ${["#FFB347","#FFD9A0","#CFE3FF"][i]}66` }} />
                  <span className="font-mono text-xs text-muted">{k}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center font-mono text-xs text-muted">цветовая температура</p>
          </div>
        </div>
      </section>

      {/* КЛИЕНТЫ — триггер доверия */}
      <section className="border-y border-ink-600 bg-ink-800/50">
        <div className="container-lt flex flex-wrap items-center justify-between gap-6 py-8">
          <span className="eyebrow">Нам доверяют</span>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
            {clients.map((c) => (
              <span key={c} className="font-display text-lg font-semibold text-muted">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* РЕКОМЕНДУЕМ */}
      <section className="container-lt py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Рекомендуем</h2>
          <Link href="/catalog" className="text-sm text-glow hover:underline">Весь каталог →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} p={{ slug: p.slug, title: p.title, shortDesc: p.shortDesc, mainImage: p.mainImage, categoryTitle: p.category.title }} />
          ))}
        </div>
      </section>
    </>
  );
}
