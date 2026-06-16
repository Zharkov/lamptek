import Link from "next/link";
import Image from "next/image";

type P = { slug: string; title: string; shortDesc: string; mainImage: string; categoryTitle?: string };

export function ProductCard({ p }: { p: P }) {
  return (
    <Link href={`/product/${p.slug}`} className="card group flex flex-col overflow-hidden p-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-ink-900">
        {p.mainImage ? (
          <Image src={p.mainImage} alt={p.title} fill sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain p-4 transition duration-300 group-hover:scale-105" />
        ) : null}
        {/* свечение при наведении */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
          style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(255,179,71,0.18), transparent 70%)" }} />
      </div>
      {p.categoryTitle && <div className="eyebrow mt-4">{p.categoryTitle}</div>}
      <h3 className="mt-1 font-display text-base font-semibold">{p.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{p.shortDesc}</p>
      <span className="mt-3 text-sm text-glow opacity-0 transition group-hover:opacity-100">Подробнее →</span>
    </Link>
  );
}
