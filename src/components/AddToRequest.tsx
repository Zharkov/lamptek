"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";

export function AddToRequest({ slug, title }: { slug: string; title: string }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-md border border-ink-500">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-muted hover:text-chalk" aria-label="Меньше">−</button>
        <input value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          className="w-12 bg-transparent text-center font-mono" inputMode="numeric" aria-label="Количество" />
        <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 text-muted hover:text-chalk" aria-label="Больше">+</button>
      </div>
      <button className="btn-glow" onClick={() => { add({ slug, title }, qty); setDone(true); setTimeout(() => setDone(false), 1800); }}>
        {done ? "Добавлено ✓" : "В заявку"}
      </button>
      <span className="text-sm text-muted">Цена — по запросу. Менеджер перезвонит.</span>
    </div>
  );
}
