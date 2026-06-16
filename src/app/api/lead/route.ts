import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyManager } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, comment, consent, items } = body;

    if (!name || !phone) return NextResponse.json({ error: "Имя и телефон обязательны" }, { status: 400 });
    if (!consent) return NextResponse.json({ error: "Нужно согласие на обработку данных" }, { status: 400 });

    const cleanItems = Array.isArray(items)
      ? items.map((i: any) => ({ title: String(i.title), slug: String(i.slug), qty: Number(i.qty) || 1 }))
      : [];

    await db.lead.create({
      data: { name, phone, email: email || "", comment: comment || "", consent: true, itemsJson: JSON.stringify(cleanItems) },
    });

    // уведомление менеджеру (email + telegram). Не валим заявку, если канал недоступен.
    try { await notifyManager({ name, phone, email, comment, items: cleanItems }); }
    catch (e) { console.error("notify failed", e); }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
