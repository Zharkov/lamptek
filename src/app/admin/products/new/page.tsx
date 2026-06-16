import { db } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";
import { createProduct } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const categories = await db.category.findMany({ orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] });
  return (
    <div>
      <h1 className="mb-6 font-display text-xl font-bold">Новый товар</h1>
      <ProductForm action={createProduct} categories={categories.map((c) => ({ id: c.id, title: c.title }))} />
    </div>
  );
}
