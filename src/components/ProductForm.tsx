"use client";
import { useFormState } from "react-dom";
import { useState } from "react";
import Image from "next/image";

type Cat = { id: string; title: string };
type Spec = { label: string; value: string };
type Product = {
  id: string; title: string; slug: string; categoryId: string; shortDesc: string;
  fullDesc: string; mainImage: string; specsJson: string; featuresJson: string;
  published: boolean; sortOrder: number;
};

export function ProductForm({
  action, categories, product,
}: {
  action: (prev: unknown, fd: FormData) => Promise<{ error?: string } | void>;
  categories: Cat[];
  product?: Product;
}) {
  const [state, formAction] = useFormState(action as any, null as null | { error?: string });
  const [specs, setSpecs] = useState<Spec[]>(product ? JSON.parse(product.specsJson || "[]") : []);
  const [mainImage, setMainImage] = useState(product?.mainImage || "");
  const [uploading, setUploading] = useState(false);

  const field = "w-full rounded-md border border-ink-500 bg-ink-900 px-4 py-2.5 focus:border-glow focus:outline-none";
  const label = "mb-1 block text-sm text-muted";

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await res.json();
    if (j.url) setMainImage(j.url);
    setUploading(false);
  }

  return (
    <form action={formAction} className="grid max-w-3xl gap-5">
      <div><label className={label}>Название *</label><input name="title" defaultValue={product?.title} className={field} /></div>
      <div className="grid gap-5 md:grid-cols-2">
        <div><label className={label}>Slug (адрес) *</label><input name="slug" defaultValue={product?.slug} placeholder="lamptek-zenith-200w" className={`${field} font-mono`} /></div>
        <div>
          <label className={label}>Категория *</label>
          <select name="categoryId" defaultValue={product?.categoryId} className={field}>
            <option value="">— выберите —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Главное фото</label>
        <input type="hidden" name="mainImage" value={mainImage} />
        <div className="flex items-center gap-4">
          {mainImage && <div className="card relative h-20 w-20 overflow-hidden"><Image src={mainImage} alt="" fill className="object-contain p-1" /></div>}
          <label className="btn-ghost cursor-pointer text-sm">
            {uploading ? "Загрузка…" : "Загрузить"}
            <input type="file" accept="image/*" className="hidden" onChange={upload} />
          </label>
          {mainImage && <button type="button" onClick={() => setMainImage("")} className="text-sm text-muted hover:text-red-400">Убрать</button>}
        </div>
      </div>

      <div><label className={label}>Краткое описание</label><input name="shortDesc" defaultValue={product?.shortDesc} className={field} /></div>
      <div><label className={label}>Полное описание</label><textarea name="fullDesc" defaultValue={product?.fullDesc} rows={4} className={field} /></div>

      <div>
        <label className={label}>Технические характеристики</label>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input name="spec_label" value={s.label} placeholder="Параметр (напр. Мощность, Вт)"
                onChange={(e) => setSpecs(specs.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} className={field} />
              <input name="spec_value" value={s.value} placeholder="Значение"
                onChange={(e) => setSpecs(specs.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} className={`${field} font-mono`} />
              <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="px-3 text-muted hover:text-red-400">✕</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setSpecs([...specs, { label: "", value: "" }])} className="mt-2 text-sm text-glow hover:underline">+ Добавить характеристику</button>
      </div>

      <div>
        <label className={label}>Особенности (по одной на строку)</label>
        <textarea name="features" rows={4} defaultValue={product ? JSON.parse(product.featuresJson || "[]").join("\n") : ""} className={field} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div><label className={label}>Порядок сортировки</label><input name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} className={field} /></div>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
          <input type="checkbox" name="published" defaultChecked={product ? product.published : true} /> Опубликован
        </label>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <div className="flex gap-3"><button className="btn-glow">Сохранить</button><a href="/admin" className="btn-ghost">Отмена</a></div>
    </form>
  );
}
