import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const cat = await db.category.findUnique({ where: { slug: params.category }, include: { children: { orderBy: { sortOrder: "asc" } } } });
  if (!cat) notFound();

  // товары категории + всех её серий
  const childIds = cat.children.map((c) => c.id);
  const products = await db.product.findMany({
    where: { published: true, categoryId: { in: [cat.id, ...childIds] } },
    orderBy: { sortOrder: "asc" },
    include: { category: true },
  });

  return (
    <div className="container-lt py-12">
      <Link href="/catalog" className="text-sm text-muted hover:text-chalk">← Каталог</Link>
      <h1 className="mt-3 font-display text-3xl font-bold">{cat.title}</h1>

      {cat.children.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {cat.children.map((c) => (
            <Link key={c.id} href={`/catalog/${c.slug}`} className="rounded-md border border-ink-600 px-3 py-1.5 text-sm text-muted hover:border-glow hover:text-glow">{c.title}</Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="mt-10 text-muted">В этом разделе пока нет товаров. Раздел заполняется.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} p={{ slug: p.slug, title: p.title, shortDesc: p.shortDesc, mainImage: p.mainImage, categoryTitle: p.category.title }} />
          ))}
        </div>
      )}
    </div>
  );
}
