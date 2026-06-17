"""Реальные данные каталога LampTek (перенесены со старого сайта).
Картинки локальные: /static/products, /static/drawings, /static/about."""
import json

S = '/static'

ZENITH_DESC = (
    "Светодиодный уличный светильник LampTek Zenith выполнен в алюминиевом корпусе, "
    "специально разработанном для максимально эффективного применения светодиодов, что даёт "
    "экономию электроэнергии и эксплуатационных затрат в несколько раз в сравнении с устаревшими лампами.\n\n"
    "Высокие антивандальные характеристики за счёт конструкции корпуса и ударопрочных материалов. "
    "Классическая форма гармонично вписывается в городскую черту, на автомагистралях, стоянках, в парках. "
    "Также применяется для освещения железнодорожных платформ и переездов."
)
ZENITH_FEATURES = [
    "Цельнолитое поликарбонатное стекло пропускает более 88% света весь срок службы; линзы прочны к ударам и устойчивы к УФ",
    "Блоки питания адаптированы под наши электросети, пассивная защита от 380 В, ресурс драйвера 50 000–80 000 ч",
    "Коэффициент пульсации менее 1%",
    "Высокая герметизация — работа в сложных климатических условиях",
]

def zenith_specs(lm, w, angle, dims, weight):
    return [
        {"label": "Световой поток (лм)", "value": lm},
        {"label": "Напряжение питания (В)", "value": "176–264 (AC)"},
        {"label": "Мощность, не более (Вт)", "value": w},
        {"label": "Коэффициент мощности", "value": "0,95"},
        {"label": "Температура свечения (К)", "value": "2700 / 4000 / 5000"},
        {"label": "Индекс цветопередачи (Ra)", "value": "75"},
        {"label": "Угол обзора", "value": angle},
        {"label": "Класс защиты", "value": "IP67"},
        {"label": "Температура эксплуатации (°C)", "value": "−40…+30"},
        {"label": "Габариты (мм)", "value": dims},
        {"label": "Вес (г)", "value": weight},
        {"label": "Гарантия", "value": "5 лет"},
    ]

UNIVERSAL_DESC = (
    "Недорогое и качественное решение для освещения территорий предприятий и дворовых площадей. "
    "Корпус из анодированного алюминия, обработанного дробью для увеличения теплоотвода; стекло и боковые крышки "
    "из поликарбоната; светодиоды Samsung или Osram; блок питания собственной разработки с ресурсом более 50 тыс. часов.\n\n"
    "Встроена защита от 380 В и перегрева. Световая эффективность до 120 лм/Вт (до 150 лм/Вт для спецзаказов). "
    "Большое число креплений: в комплекте DIN-рейка, дополнительно — консоль, объединяющие планки, кронштейны."
)
UNIVERSAL_FEATURES = [
    "Модульный принцип с регулированием нужной мощности",
    "Светодиоды со сроком службы до 50 000 часов",
    "Универсальные крепления: DIN-рейка, рым-болт, регулируемый поворотный кронштейн",
    "Корпус из алюминиевого профиля, пропускает 95% света, устойчив к агрессивной среде",
    "Фирменный блок питания с защитой от скачков до 380 В и перегрева",
    "Надёжная герметизация на немецких силиконовых шнурах",
]
UNIVERSAL_MOUNTS = [S + '/products/mounts/' + n for n in
                    ('din1.jpg', 'din2.jpg', 'skoba.jpg', 'consol.jpg', 'planka3.jpg', 'planka5.jpg')]

def universal_specs(lm, w, dims, weight):
    return [
        {"label": "Световой поток (лм)", "value": lm},
        {"label": "Напряжение питания (В)", "value": "176–264 (AC)"},
        {"label": "Мощность, не более (Вт)", "value": w},
        {"label": "Коэффициент мощности", "value": "0,95"},
        {"label": "Температура свечения (К)", "value": "3000 / 4000 / 5000"},
        {"label": "Индекс цветопередачи (Ra)", "value": "более 80"},
        {"label": "Угол обзора (2θ1/2, град)", "value": "120 / 70"},
        {"label": "Класс защиты", "value": "IP65"},
        {"label": "Температура эксплуатации (°C)", "value": "−40…+50"},
        {"label": "Габариты (мм)", "value": dims},
        {"label": "Вес (г)", "value": weight},
        {"label": "Гарантия", "value": "5 лет"},
    ]


def build(db, Category, Product, Lead):
    def J(x):
        return json.dumps(x, ensure_ascii=False)

    street = Category(slug='ulichnoe', title='Уличное освещение', sort_order=1)
    db.session.add_all([
        street,
        Category(slug='office', title='Офисное освещение', sort_order=2),
        Category(slug='jkh', title='Освещение ЖКХ', sort_order=3),
        Category(slug='projectors', title='Светодиодные прожекторы', sort_order=4),
        Category(slug='prom', title='Промышленное освещение', sort_order=5),
    ])
    db.session.flush()
    zenith = Category(slug='zenith', title='Zenith', parent_id=street.id, sort_order=1)
    universal = Category(slug='universal', title='Universal', parent_id=street.id, sort_order=2)
    kniks = Category(slug='kniks', title='Кникс', parent_id=street.id, sort_order=3)
    db.session.add_all([zenith, universal, kniks])
    db.session.flush()

    zd = lambda fn, cap='Габаритный чертёж': J([{"url": S + '/drawings/' + fn, "caption": cap}])

    products = [
        Product(slug='lamptek-zenith-55w', title='LampTek Zenith 55W', category_id=zenith.id,
                price=4500, sort_order=1, main_image=S + '/products/zenith-50.jpg',
                short_desc='Уличный фонарь запатентованной формы, IP67, широкая диаграмма.',
                full_desc=ZENITH_DESC, specs_json=J(zenith_specs('6050', '55', '150×80', '320 × 207 × 90', '1900')),
                features_json=J(ZENITH_FEATURES), drawings_json=zd('zenith-50.jpg')),
        Product(slug='lamptek-zenith-80w', title='LampTek Zenith 80W', category_id=zenith.id,
                price=6200, sort_order=2, main_image=S + '/products/zenith-50.jpg',
                short_desc='Уличный фонарь запатентованной формы, IP67.',
                full_desc=ZENITH_DESC, specs_json=J(zenith_specs('11500', '80', '150×80', '320 × 207 × 90', '1900')),
                features_json=J(ZENITH_FEATURES), drawings_json=zd('zenith-50.jpg')),
        Product(slug='lamptek-zenith-120w', title='LampTek Zenith 120W', category_id=zenith.id,
                price=8900, sort_order=3, main_image=S + '/products/zenith-120.jpg',
                short_desc='Уличный фонарь запатентованной формы, IP67.',
                full_desc=ZENITH_DESC, specs_json=J(zenith_specs('18600', '120', '130×50', 'уточняется', 'уточняется')),
                features_json=J(ZENITH_FEATURES), drawings_json=zd('zenith-120.jpg')),
        Product(slug='lamptek-zenith-180w', title='LampTek Zenith 180W', category_id=zenith.id,
                price=12500, sort_order=4, main_image=S + '/products/zenith-180.jpg',
                short_desc='Уличный фонарь запатентованной формы, широкая диаграмма, IP67.',
                full_desc=ZENITH_DESC, specs_json=J(zenith_specs('27900', '180', '130×50', '625 × 207 × 90', '4770')),
                features_json=J(ZENITH_FEATURES), drawings_json=zd('zenith-180.jpg')),
        Product(slug='lamptek-universal-38w', title='LampTek Universal 38W', category_id=universal.id,
                price=3200, sort_order=5, main_image=S + '/products/universal.jpg',
                short_desc='Недорогое решение для территорий предприятий и дворов.',
                full_desc=UNIVERSAL_DESC, specs_json=J(universal_specs('4100', '38', '220×97×68', '800')),
                features_json=J(UNIVERSAL_FEATURES), gallery_json=J(UNIVERSAL_MOUNTS),
                drawings_json=J([{"url": S + '/drawings/universal-38-size.jpg', "caption": "Габаритный чертёж"},
                                 {"url": S + '/drawings/universal-kss.gif', "caption": "КСС светильника"}])),
        Product(slug='lamptek-universal-50w', title='LampTek Universal 50W', category_id=universal.id,
                price=3900, sort_order=6, main_image=S + '/products/universal.jpg',
                short_desc='Недорогое решение для территорий предприятий и дворов.',
                full_desc=UNIVERSAL_DESC, specs_json=J(universal_specs('6000', '50', '320×97×68', '1200')),
                features_json=J(UNIVERSAL_FEATURES), gallery_json=J(UNIVERSAL_MOUNTS),
                drawings_json=J([{"url": S + '/drawings/universal-50-size.jpg', "caption": "Габаритный чертёж"},
                                 {"url": S + '/drawings/universal-kss.gif', "caption": "КСС светильника"}])),
        Product(slug='lamptek-kniks', title='Кникс', category_id=kniks.id,
                price=None, price_on_request=True, sort_order=7, main_image=S + '/products/kniks.jpg',
                short_desc='Уличный светильник в классическом стиле. Заказное изделие под параметры объекта.',
                full_desc=("Светодиодный уличный светильник LampTek Кникс в классическом стиле — для парков, "
                           "пешеходных улиц и автодорог благодаря широкому выбору оптики и мощности.\n\n"
                           "Заказное изделие: производится под требования заказчика к мощности и типу кривой света. "
                           "Модульная структура позволяет размещать в корпусе разные светодиодные модули, драйверы и оптику."),
                specs_json='[]', features_json=J(ZENITH_FEATURES)),
    ]
    db.session.add_all(products)

    db.session.add(Lead(
        name='Иван Петров', phone='+7 999 123-45-67', email='ivan@example.ru', consent=True,
        comment='Нужен расчёт освещения парковки, около 40 опор. Интересует Zenith 180W, сроки и цена опт.',
        items_json=J([{"title": "LampTek Zenith 180W", "slug": "lamptek-zenith-180w", "qty": 40}])))
