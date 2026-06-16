# LampTek — новый сайт (Next.js + Prisma)

Кастомный B2B-сайт светодиодного освещения. Каталог с админкой (CRUD товаров),
корзина-заявка без оплаты: при отправке менеджеру летит уведомление (email + опц. Telegram).

## Стек
- **Next.js 14** (App Router, SSR — важно для SEO)
- **Prisma** + SQLite (dev) / PostgreSQL (prod)
- **Tailwind CSS** — дизайн-система «свет в темноте»
- **Nodemailer** — уведомления менеджеру

## Запуск (локально)
```bash
npm install
cp .env.example .env        # заполните значения
npm run db:push             # создаёт схему в SQLite
npm run db:seed             # заливает 7 реальных товаров + категории
npm run dev                 # http://localhost:3000
```
Админка: `http://localhost:3000/admin` (логин/пароль из `.env`).

## Что уже работает
- Главная, каталог, категории+серии, карточка товара с тех. характеристиками
- Корзина → заявка с согласием на обработку ПДн (152-ФЗ) → запись в БД + письмо менеджеру
- Админка: список заявок со сменой статуса (Новая/Позвонили/Закрыта), CRUD товаров,
  динамические характеристики, загрузка фото, публикация/скрытие
- Защита `/admin` через cookie-сессию (middleware)

## Перед продакшеном (важно)
1. **БД:** в `prisma/schema.prisma` смените `provider = "postgresql"`, в `.env` — `DATABASE_URL` на Postgres. Хостинг в РФ (Selectel/Timeweb/Yandex Cloud) — требование 152-ФЗ для перс. данных.
2. **Картинки:** загрузка сейчас пишет в `public/uploads` (только для dev). Замените `src/app/api/upload/route.ts` на загрузку в S3 (Yandex Object Storage). В `next.config.mjs` добавьте домен CDN.
3. **Почта:** настройте транзакционный SMTP с SPF/DKIM (Unisender Go, SMTP.bz), иначе письма уйдут в спам. Заполните `TELEGRAM_*` для дубля заявки.
4. **SEO-переезд:** старые URL `/product/...` и `/product-category/...` сохранены по структуре. Перед заменой сайта повесьте 301-редиректы со старых WordPress-адресов (часть была с кириллицей в URL) на новые. Не терять позиции в Яндекс/Google.
5. **Контент-заглушки:** страницы «О нас», «Контакты», «Политика» — шаблоны, заменить реальным текстом. Политику ПДн — обязательно полным текстом.
6. **Характеристики:** полностью заполнен только Zenith 180W (с сайта). Остальные — заказчик уточнит, редактируется через админку.

## Структура
```
prisma/schema.prisma   модель: Category (с сериями), Product (JSON-характеристики), Lead
src/app/               публичные страницы + /admin + /api
src/components/         Header, Footer, ProductCard, CartProvider, RequestForm, ProductForm
src/lib/               db, auth (cookie-сессия), mailer (email+telegram)
```
