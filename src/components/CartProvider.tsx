"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = { slug: string; title: string; qty: number };

type Ctx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "lt_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add: Ctx["add"] = (item, qty = 1) =>
    setItems((p) => {
      const ex = p.find((i) => i.slug === item.slug);
      if (ex) return p.map((i) => (i.slug === item.slug ? { ...i, qty: i.qty + qty } : i));
      return [...p, { ...item, qty }];
    });
  const setQty: Ctx["setQty"] = (slug, qty) =>
    setItems((p) => p.map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, qty) } : i)));
  const remove: Ctx["remove"] = (slug) => setItems((p) => p.filter((i) => i.slug !== slug));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart вне CartProvider");
  return c;
}
