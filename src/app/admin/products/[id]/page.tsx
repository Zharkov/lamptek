import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";
import { updateProduct } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id: params.id } }),
    db.category.findMany({ orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] }),
  ]);
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);
  return (
    <div>
      <h1 className="mb-6 font-display text-xl font-bold">Редактирование: {product.title}</h1>
      <ProductForm action={action} categories={categories.map((c) => ({ id: c.id, title: c.title }))} product={product} />
    </div>
  );
}
