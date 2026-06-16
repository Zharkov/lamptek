import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AddToRequest } from "@/components/AddToRequest";

export const dynamic = "force-dynamic";

type Spec = { label: string; value: string };

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await db.product.findUnique({ where: { slug: params.slug }, include: { category: true } });
  if (!p || !p.published) notFound();

  const specs: Spec[] = JSON.parse(p.specsJson || "[]");
  const features: string[] = JSON.parse(p.featuresJson || "[]");
  const gallery: string[] = JSON.parse(p.galleryJson || "[]");

  return (
    <div className="container-lt py-10">
      <div className="text-sm text-muted">
        <Link href="/catalog" className="hover:text-chalk">Каталог</Link>
        {" / "}<Link href={`/catalog/${p.category.slug}`} className="hover:text-chalk">{p.category.title}</Link>
      </div>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div>
          <div className="card relative aspect-square overflow-hidden">
            {p.mainImage && <Image src={p.mainImage} alt={p.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-contain p-8" />}
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50% 50% at 50% 45%, rgba(255,179,71,0.12), transparent 70%)" }} />
          </div>
          {gallery.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {gallery.map((g, i) => (
                <div key={i} className="card relative aspect-square overflow-hidden"><Image src={g} alt="" fill className="object-contain p-2" /></div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="eyebrow">{p.category.title}</div>
          <h1 className="mt-2 font-display text-3xl font-extrabold">{p.title}</h1>
          <p className="mt-4 text-muted">{p.shortDesc}</p>
          <div className="mt-7"><AddToRequest slug={p.slug} title={p.title} /></div>

          {specs.length > 0 && (
            <div className="mt-9">
              <h2 className="eyebrow mb-2">Технические характеристики</h2>
              <div>
                {specs.map((s, i) => (
                  <div key={i} className="spec-row"><span className="spec-label">{s.label}</span><span className="spec-value">{s.value}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {p.fullDesc && (
        <section className="mt-14 max-w-3xl">
          <h2 className="font-display text-xl font-bold">Описание</h2>
          <p className="mt-3 whitespace-pre-line text-muted">{p.fullDesc}</p>
        </section>
      )}

      {features.length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="font-display text-xl font-bold">Особенности</h2>
          <ul className="mt-4 space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex gap-3 text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-glow" />{f}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
