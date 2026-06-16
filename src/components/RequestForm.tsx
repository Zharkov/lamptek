"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";

export function RequestForm() {
  const { items, clear } = useCart();
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [form, setForm] = useState({ name: "", phone: "", email: "", comment: "", consent: false });

  async function submit() {
    if (!form.name || !form.phone) { setState("error"); return; }
    if (!form.consent) { setState("error"); return; }
    setState("sending");
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });
    if (res.ok) { setState("ok"); clear(); } else setState("error");
  }

  if (state === "ok")
    return (
      <div className="card p-6">
        <div className="font-display text-lg">Заявка отправлена</div>
        <p className="mt-2 text-sm text-muted">Менеджер свяжется с вами в ближайшее время и подготовит расчёт.</p>
      </div>
    );

  const field = "w-full rounded-md border border-ink-500 bg-ink-900 px-4 py-3 text-chalk placeholder:text-muted focus:border-glow focus:outline-none";

  return (
    <div className="card space-y-3 p-6">
      <div className="font-display text-lg">Оставьте контакты — перезвоним</div>
      <input className={field} placeholder="Имя *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className={field} placeholder="Телефон *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input className={field} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <textarea className={field} rows={3} placeholder="Комментарий (объект, задача, объём)" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" className="mt-0.5" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
        <span>Согласен на обработку персональных данных в соответствии с <a href="/privacy" className="text-glow underline">политикой</a> (152-ФЗ).</span>
      </label>
      {state === "error" && <p className="text-sm text-red-400">Заполните имя, телефон и отметьте согласие.</p>}
      <button className="btn-glow w-full" onClick={submit} disabled={state === "sending"}>
        {state === "sending" ? "Отправка…" : "Отправить заявку"}
      </button>
    </div>
  );
}
