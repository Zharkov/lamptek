import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-600 bg-ink-800">
      <div className="container-lt grid gap-8 py-12 md:grid-cols-3">
        <div>
          <div className="font-display text-lg font-extrabold">LampTek</div>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Светодиодное освещение для города и промышленности. Производство, расчёт проекта, поставка.
          </p>
        </div>
        <div className="text-sm">
          <div className="eyebrow mb-3">Разделы</div>
          <ul className="space-y-2 text-muted">
            <li><Link href="/catalog" className="hover:text-chalk">Каталог</Link></li>
            <li><Link href="/about" className="hover:text-chalk">О нас</Link></li>
            <li><Link href="/contacts" className="hover:text-chalk">Контакты</Link></li>
            <li><Link href="/privacy" className="hover:text-chalk">Политика обработки данных</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="eyebrow mb-3">Контакты</div>
          <p className="text-muted">тел. +7 (___) ___-__-__<br />info@lamptek.ru</p>
        </div>
      </div>
      <div className="border-t border-ink-600">
        <div className="container-lt py-5 text-xs text-muted">© {new Date().getFullYear()} LampTek</div>
      </div>
    </footer>
  );
}
