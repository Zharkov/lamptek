import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// Картинки временно ссылаются на старый сайт. При переносе перезалейте в S3/uploads.
const IMG = "https://lamptek.ru/wp-content/uploads";

async function main() {
  await db.lead.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();

  // --- Категории верхнего уровня (как в меню старого сайта) ---
  const street = await db.category.create({ data: { slug: "ulichnoe", title: "Уличное освещение", sortOrder: 1 } });
  await db.category.create({ data: { slug: "office", title: "Офисное освещение", sortOrder: 2 } });
  await db.category.create({ data: { slug: "jkh", title: "Освещение ЖКХ", sortOrder: 3 } });
  await db.category.create({ data: { slug: "projectors", title: "Светодиодные прожекторы", sortOrder: 4 } });
  await db.category.create({ data: { slug: "prom", title: "Промышленное освещение", sortOrder: 5 } });

  // --- Серии внутри «Уличного» ---
  const zenith = await db.category.create({ data: { slug: "zenith", title: "Zenith", parentId: street.id, sortOrder: 1 } });
  const universal = await db.category.create({ data: { slug: "universal", title: "Universal", parentId: street.id, sortOrder: 2 } });
  const kniks = await db.category.create({ data: { slug: "kniks", title: "Кникс", parentId: street.id, sortOrder: 3 } });

  // Полный набор характеристик есть только у Zenith 180W (с сайта). Остальное — заготовки, заказчик уточнит.
  const zenith180Specs = [
    { label: "Световой поток (лм)", value: "27900" },
    { label: "Напряжение питания (В)", value: "176–264 (AC)" },
    { label: "Мощность, не более (Вт)", value: "180" },
    { label: "Коэффициент мощности", value: "0,95" },
    { label: "Температура свечения (К)", value: "2700 / 4000 / 5000" },
    { label: "Индекс цветопередачи (Ra)", value: "75" },
    { label: "Угол обзора", value: "130×50" },
    { label: "Класс защиты", value: "IP67" },
    { label: "Температура эксплуатации (°C)", value: "−40…+30" },
    { label: "Габариты (мм)", value: "625 × 207 × 90" },
    { label: "Вес (г)", value: "4770" },
    { label: "Гарантия", value: "5 лет" },
  ];
  const zenithFeatures = [
    "Цельнолитое поликарбонатное стекло пропускает более 88% света весь срок службы",
    "Блоки питания с пассивной защитой от 380 В, ресурс драйвера 50 000–80 000 ч",
    "Коэффициент пульсации менее 1%",
    "Высокая герметизация — работа в сложных климатических условиях",
  ];
  const zenithDesc =
    "Уличный светодиодный светильник LampTek Zenith в алюминиевом корпусе, разработанном для максимально эффективного применения светодиодов. Высокие антивандальные характеристики, классическая форма — гармонично вписывается в городскую черту, на автомагистралях, стоянках, в парках. Применяется для освещения железнодорожных платформ и переездов.";

  const products = [
    { slug: "lamptek-zenith-180w", title: "LampTek Zenith 180W", categoryId: zenith.id, mainImage: `${IMG}/2025/03/Zenith_180-img-600x514.jpg`, shortDesc: "Уличный фонарь запатентованной формы, широкая диаграмма, IP67.", fullDesc: zenithDesc, specsJson: JSON.stringify(zenith180Specs), featuresJson: JSON.stringify(zenithFeatures), sortOrder: 1 },
    { slug: "lamptek-zenith-120w", title: "LampTek Zenith 120W", categoryId: zenith.id, mainImage: `${IMG}/2025/03/Zenith_120-img-300x300.jpg`, shortDesc: "Уличный светодиодный светильник серии Zenith.", fullDesc: zenithDesc, specsJson: JSON.stringify(zenith180Specs.map(s => s.label === "Мощность, не более (Вт)" ? { ...s, value: "120" } : s)), featuresJson: JSON.stringify(zenithFeatures), sortOrder: 2 },
    { slug: "lamptek-zenith-80w", title: "LampTek Zenith 80W", categoryId: zenith.id, mainImage: `${IMG}/2025/03/Zenith_50-img-300x300.jpg`, shortDesc: "Уличный светодиодный светильник серии Zenith.", fullDesc: zenithDesc, specsJson: JSON.stringify(zenith180Specs.map(s => s.label === "Мощность, не более (Вт)" ? { ...s, value: "80" } : s)), featuresJson: JSON.stringify(zenithFeatures), sortOrder: 3 },
    { slug: "lamptek-zenith-55w", title: "LampTek Zenith 55W", categoryId: zenith.id, mainImage: `${IMG}/2025/03/Zenith_50-img-300x300.jpg`, shortDesc: "Уличный светодиодный светильник серии Zenith.", fullDesc: zenithDesc, specsJson: JSON.stringify(zenith180Specs.map(s => s.label === "Мощность, не более (Вт)" ? { ...s, value: "55" } : s)), featuresJson: JSON.stringify(zenithFeatures), sortOrder: 4 },
    { slug: "lamptek-universal-50w", title: "LampTek Universal 50W", categoryId: universal.id, mainImage: `${IMG}/2025/02/LamTek-universal-300x300.jpg`, shortDesc: "Универсальный уличный светильник.", fullDesc: "Светильник серии Universal. Характеристики уточняются.", specsJson: "[]", featuresJson: "[]", sortOrder: 5 },
    { slug: "lamptek-universal-38w", title: "LampTek Universal 38W", categoryId: universal.id, mainImage: `${IMG}/2025/02/LamTek-universal-300x300.jpg`, shortDesc: "Универсальный уличный светильник.", fullDesc: "Светильник серии Universal. Характеристики уточняются.", specsJson: "[]", featuresJson: "[]", sortOrder: 6 },
    { slug: "lamptek-kniks", title: "Кникс", categoryId: kniks.id, mainImage: `${IMG}/2025/04/kniks-1-300x300.jpg`, shortDesc: "Светильник серии Кникс.", fullDesc: "Светильник серии Кникс. Характеристики уточняются.", specsJson: "[]", featuresJson: "[]", sortOrder: 7 },
  ];

  for (const p of products) await db.product.create({ data: p });

  // Демо-заявка, чтобы было видно в админке
  await db.lead.create({ data: { name: "Иван Петров", phone: "+7 999 123-45-67", email: "ivan@example.ru", comment: "Нужен расчёт освещения парковки, ~40 опор.", itemsJson: JSON.stringify([{ title: "LampTek Zenith 180W", slug: "lamptek-zenith-180w", qty: 40 }]), consent: true } });

  console.log("Сид готов: категории, 7 товаров, 1 демо-заявка.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
