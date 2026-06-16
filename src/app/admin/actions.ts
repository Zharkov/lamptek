"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function login(_prev: unknown, formData: FormData) {
  const login = String(formData.get("login") || "");
  const password = String(formData.get("password") || "");
  if (login === process.env.ADMIN_LOGIN && password === process.env.ADMIN_PASSWORD) {
    cookies().set(SESSION_COOKIE, await createSessionToken(), {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 7 * 864e2,
    });
    redirect("/admin");
  }
  return { error: "Неверный логин или пароль" };
}

export async function logout() {
  cookies().delete(SESSION_COOKIE);
  redirect("/admin/login");
}

function parseProduct(fd: FormData) {
  const labels = fd.getAll("spec_label").map(String);
  const values = fd.getAll("spec_value").map(String);
  const specs = labels.map((l, i) => ({ label: l, value: values[i] || "" })).filter((s) => s.label.trim());
  const features = String(fd.get("features") || "").split("\n").map((s) => s.trim()).filter(Boolean);
  return {
    title: String(fd.get("title") || "").trim(),
    slug: String(fd.get("slug") || "").trim(),
    categoryId: String(fd.get("categoryId") || ""),
    shortDesc: String(fd.get("shortDesc") || ""),
    fullDesc: String(fd.get("fullDesc") || ""),
    mainImage: String(fd.get("mainImage") || ""),
    specsJson: JSON.stringify(specs),
    featuresJson: JSON.stringify(features),
    published: fd.get("published") === "on",
    sortOrder: Number(fd.get("sortOrder") || 0),
  };
}

export async function createProduct(_prev: unknown, fd: FormData) {
  const data = parseProduct(fd);
  if (!data.title || !data.slug || !data.categoryId) return { error: "Заполните название, slug и категорию" };
  try {
    await db.product.create({ data });
  } catch {
    return { error: "Не удалось создать (возможно, slug занят)" };
  }
  revalidatePath("/admin"); revalidatePath("/catalog");
  redirect("/admin");
}

export async function updateProduct(id: string, _prev: unknown, fd: FormData) {
  const data = parseProduct(fd);
  try {
    await db.product.update({ where: { id }, data });
  } catch {
    return { error: "Не удалось сохранить (возможно, slug занят)" };
  }
  revalidatePath("/admin"); revalidatePath("/catalog"); revalidatePath(`/product/${data.slug}`);
  redirect("/admin");
}

export async function deleteProduct(id: string) {
  await db.product.delete({ where: { id } });
  revalidatePath("/admin"); revalidatePath("/catalog");
}

export async function setLeadStatus(id: string, status: string) {
  await db.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
}
