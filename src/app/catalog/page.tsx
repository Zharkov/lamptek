import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Catalog() {
  const topCats = await db.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" } });
  const products = await db.product.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, include: { category: true } });

  return (
    <div className="container-lt py-12">
      <div className="eyebrow">Каталог</div>
      <h1 className="mt-2 font-display text-3xl font-bold">Светодиодное освещение</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {topCats.map((c) => (
          <Link key={c.id} href={`/catalog/${c.slug}`} className="btn-ghost px-4 py-2 text-sm">{c.title}</Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} p={{ slug: p.slug, title: p.title, shortDesc: p.shortDesc, mainImage: p.mainImage, categoryTitle: p.category.title }} />
        ))}
      </div>
    </div>
  );
}
