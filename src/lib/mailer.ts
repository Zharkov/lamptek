import nodemailer from "nodemailer";

type LeadInput = {
  name: string; phone: string; email?: string; comment?: string;
  items: { title: string; slug: string; qty: number }[];
};

export async function notifyManager(lead: LeadInput) {
  const itemsText = lead.items.length
    ? lead.items.map((i) => `• ${i.title} — ${i.qty} шт.`).join("\n")
    : "(без товаров — общий вопрос)";

  const text =
`Новая заявка с сайта LampTek

Имя: ${lead.name}
Телефон: ${lead.phone}
Email: ${lead.email || "—"}

Товары:
${itemsText}

Комментарий: ${lead.comment || "—"}

Перезвоните клиенту.`;

  const results: string[] = [];
  if (process.env.SMTP_HOST) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MANAGER_EMAIL,
      replyTo: lead.email || undefined,
      subject: `Заявка с сайта: ${lead.name}, ${lead.phone}`,
      text,
    });
    results.push("email");
  } else {
    console.warn("[mailer] SMTP не настроен — заявка не отправлена по почте:\n" + text);
  }

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
      });
      results.push("telegram");
    } catch (e) {
      console.error("[mailer] telegram error", e);
    }
  }
  return results;
}
