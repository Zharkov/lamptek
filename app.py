"""
LampTek — сайт светодиодного освещения.
Flask + Flask-SQLAlchemy + Flask-Login + SQLite.
Каталог с админкой (CRUD) и корзиной-заявкой без оплаты: при отправке
менеджеру летит уведомление (email + опционально Telegram).
"""
import os
import json
import smtplib
import urllib.request
import urllib.parse
from functools import wraps
from datetime import datetime
from email.mime.text import MIMEText

from flask import (Flask, render_template, request, redirect, url_for, flash,
                   jsonify, session, abort)
from flask_sqlalchemy import SQLAlchemy
from flask_login import (LoginManager, UserMixin, login_user, logout_user,
                         login_required, current_user)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'change-me-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///lamptek.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(app.static_folder, 'uploads')

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'admin_login'
login_manager.login_message = 'Войдите, чтобы открыть админку.'

# ==================== МОДЕЛИ ====================

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='admin')

    def set_password(self, pw):
        self.password_hash = generate_password_hash(pw)

    def check_password(self, pw):
        return check_password_hash(self.password_hash, pw)


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(80), unique=True, nullable=False)
    title = db.Column(db.String(160), nullable=False)
    sort_order = db.Column(db.Integer, default=0)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    children = db.relationship('Category', backref=db.backref('parent', remote_side=[id]))
    products = db.relationship('Product', backref='category', lazy=True)


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(120), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    short_desc = db.Column(db.Text, default='')
    full_desc = db.Column(db.Text, default='')
    main_image = db.Column(db.String(300), default='')
    specs_json = db.Column(db.Text, default='[]')      # [{"label","value"}]
    features_json = db.Column(db.Text, default='[]')   # ["..."]
    gallery_json = db.Column(db.Text, default='[]')    # ["/static/.."]
    drawings_json = db.Column(db.Text, default='[]')   # [{"url","caption"}]
    price = db.Column(db.Integer)                      # рубли, может быть NULL
    price_on_request = db.Column(db.Boolean, default=True)
    published = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Lead(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(60), nullable=False)
    email = db.Column(db.String(160), default='')
    comment = db.Column(db.Text, default='')
    items_json = db.Column(db.Text, default='[]')      # [{"title","slug","qty"}]
    consent = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='new')   # new | called | closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


@login_manager.user_loader
def load_user(uid):
    return db.session.get(User, int(uid))


def admin_required(f):
    @wraps(f)
    @login_required
    def wrapper(*a, **kw):
        if current_user.role != 'admin':
            abort(403)
        return f(*a, **kw)
    return wrapper


# ==================== JINJA ХЕЛПЕРЫ ====================

@app.template_filter('fromjson')
def fromjson(s):
    try:
        return json.loads(s or '[]')
    except Exception:
        return []


@app.template_filter('price_label')
def price_label(product):
    if product.price_on_request or not product.price:
        return 'Цена по запросу'
    return '≈ {:,} ₽'.format(product.price).replace(',', ' ')


@app.context_processor
def inject_nav():
    cats = Category.query.filter_by(parent_id=None).order_by(Category.sort_order).all()
    return dict(nav_categories=cats, now_year=datetime.now().year)


# ==================== УВЕДОМЛЕНИЯ ====================

def notify_manager(lead):
    items = json.loads(lead.items_json or '[]')
    items_txt = '\n'.join('• {} — {} шт.'.format(i['title'], i['qty']) for i in items) or '(без товаров)'
    text = (
        'Новая заявка с сайта LampTek\n\n'
        'Имя: {name}\nТелефон: {phone}\nEmail: {email}\n\n'
        'Товары:\n{items}\n\nКомментарий: {comment}\n\nПерезвоните клиенту.'
    ).format(name=lead.name, phone=lead.phone, email=lead.email or '—',
             items=items_txt, comment=lead.comment or '—')

    host = os.environ.get('SMTP_HOST')
    if host:
        try:
            msg = MIMEText(text, 'plain', 'utf-8')
            msg['Subject'] = 'Заявка с сайта: {}, {}'.format(lead.name, lead.phone)
            msg['From'] = os.environ.get('MAIL_FROM', 'noreply@lamptek.ru')
            msg['To'] = os.environ.get('MANAGER_EMAIL', 'manager@lamptek.ru')
            port = int(os.environ.get('SMTP_PORT', 587))
            s = smtplib.SMTP(host, port, timeout=10)
            s.starttls()
            if os.environ.get('SMTP_USER'):
                s.login(os.environ['SMTP_USER'], os.environ.get('SMTP_PASS', ''))
            s.send_message(msg)
            s.quit()
        except Exception as e:
            app.logger.warning('SMTP error: %s', e)
    else:
        app.logger.info('[mailer] SMTP не настроен, заявка:\n%s', text)

    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat = os.environ.get('TELEGRAM_CHAT_ID')
    if token and chat:
        try:
            data = urllib.parse.urlencode({'chat_id': chat, 'text': text}).encode()
            urllib.request.urlopen(
                'https://api.telegram.org/bot{}/sendMessage'.format(token), data=data, timeout=10)
        except Exception as e:
            app.logger.warning('Telegram error: %s', e)


# ==================== ПУБЛИЧНЫЕ РОУТЫ ====================

@app.route('/')
def index():
    featured = Product.query.filter_by(published=True).order_by(Product.sort_order).limit(4).all()
    clients = [
        ('Россети',   'Электросети',   '/static/company/cl_Rosseti.png'),
        ('РЖД',       'Транспорт',     '/static/company/cl_rjd.png'),
        ('Роснефть',  'Промышленность','/static/company/cl_rosneft.png'),
        ('X5 Group',  'Ритейл',        '/static/company/cl_x5group.png'),
    ]
    return render_template('index.html', featured=featured, clients=clients)


@app.route('/catalog')
def catalog():
    top = Category.query.filter_by(parent_id=None).order_by(Category.sort_order).all()
    products = Product.query.filter_by(published=True).order_by(Product.sort_order).all()
    return render_template('catalog.html', top_categories=top, products=products)


@app.route('/catalog/<slug>')
def category(slug):
    cat = Category.query.filter_by(slug=slug).first_or_404()
    child_ids = [c.id for c in cat.children]
    products = (Product.query
                .filter(Product.published == True,
                        Product.category_id.in_([cat.id] + child_ids))
                .order_by(Product.sort_order).all())
    return render_template('category.html', cat=cat, products=products)


@app.route('/product/<slug>')
def product(slug):
    p = Product.query.filter_by(slug=slug).first_or_404()
    if not p.published:
        abort(404)
    related = (Product.query
               .filter_by(published=True, category_id=p.category_id)
               .filter(Product.id != p.id)
               .order_by(Product.sort_order).limit(4).all())
    return render_template('product.html', p=p, related=related)


@app.route('/cart')
def cart():
    return render_template('cart.html')


@app.route('/lead', methods=['POST'])
def lead():
    data = request.get_json(silent=True) or request.form
    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    consent = data.get('consent') in (True, 'true', 'on', '1')
    if not name or not phone:
        return jsonify(error='Имя и телефон обязательны'), 400
    if not consent:
        return jsonify(error='Нужно согласие на обработку данных'), 400

    items = data.get('items')
    if isinstance(items, str):
        items = json.loads(items or '[]')
    items = items or []
    clean = [{'title': str(i.get('title')), 'slug': str(i.get('slug')),
              'qty': int(i.get('qty') or 1)} for i in items]

    lead_row = Lead(name=name, phone=phone, email=(data.get('email') or '').strip(),
                    comment=(data.get('comment') or '').strip(), consent=True,
                    items_json=json.dumps(clean, ensure_ascii=False))
    db.session.add(lead_row)
    db.session.commit()
    try:
        notify_manager(lead_row)
    except Exception as e:
        app.logger.warning('notify failed: %s', e)
    return jsonify(ok=True)


@app.route('/about')
def about():
    production = ['/static/about/prod-{}.jpg'.format(i) for i in range(1, 9)]
    stats = [('5 лет', 'гарантия на светильники'),
             ('50 000+ ч', 'ресурс источников питания'),
             ('до 150 лм/Вт', 'световая эффективность'),
             ('IP65–IP67', 'защита для любого климата')]
    return render_template('about.html', production=production, stats=stats)


@app.route('/contacts')
def contacts():
    return render_template('contacts.html')


@app.route('/privacy')
def privacy():
    return render_template('privacy.html')


# ==================== АДМИНКА ====================

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        u = User.query.filter_by(username=request.form.get('username')).first()
        if u and u.check_password(request.form.get('password', '')):
            login_user(u)
            return redirect(url_for('admin'))
        flash('Неверный логин или пароль', 'error')
    return render_template('admin/login.html')


@app.route('/admin/logout')
@login_required
def admin_logout():
    logout_user()
    return redirect(url_for('admin_login'))


@app.route('/admin')
@admin_required
def admin():
    products = Product.query.order_by(Product.sort_order).all()
    leads = Lead.query.order_by(Lead.created_at.desc()).limit(100).all()
    return render_template('admin/dashboard.html', products=products, leads=leads)


def _parse_product_form(form):
    labels = form.getlist('spec_label')
    values = form.getlist('spec_value')
    specs = [{'label': l, 'value': values[i] if i < len(values) else ''}
             for i, l in enumerate(labels) if l.strip()]
    features = [s.strip() for s in (form.get('features') or '').splitlines() if s.strip()]
    price_raw = (form.get('price') or '').replace(' ', '')
    return dict(
        title=(form.get('title') or '').strip(),
        slug=(form.get('slug') or '').strip(),
        category_id=int(form.get('category_id')) if form.get('category_id') else None,
        short_desc=form.get('short_desc') or '',
        full_desc=form.get('full_desc') or '',
        main_image=form.get('main_image') or '',
        specs_json=json.dumps(specs, ensure_ascii=False),
        features_json=json.dumps(features, ensure_ascii=False),
        gallery_json=form.get('gallery_json') or '[]',
        drawings_json=form.get('drawings_json') or '[]',
        price=int(price_raw) if price_raw.isdigit() else None,
        price_on_request=form.get('price_on_request') == 'on',
        published=form.get('published') == 'on',
        sort_order=int(form.get('sort_order') or 0),
    )


@app.route('/admin/products/new', methods=['GET', 'POST'])
@admin_required
def product_new():
    cats = Category.query.order_by(Category.parent_id, Category.sort_order).all()
    if request.method == 'POST':
        data = _parse_product_form(request.form)
        if not data['title'] or not data['slug'] or not data['category_id']:
            flash('Заполните название, slug и категорию', 'error')
            return render_template('admin/product_form.html', cats=cats, p=None, form=request.form)
        if Product.query.filter_by(slug=data['slug']).first():
            flash('Slug уже занят', 'error')
            return render_template('admin/product_form.html', cats=cats, p=None, form=request.form)
        db.session.add(Product(**data))
        db.session.commit()
        flash('Товар создан', 'success')
        return redirect(url_for('admin'))
    return render_template('admin/product_form.html', cats=cats, p=None, form=None)


@app.route('/admin/products/<int:pid>/edit', methods=['GET', 'POST'])
@admin_required
def product_edit(pid):
    p = db.session.get(Product, pid) or abort(404)
    cats = Category.query.order_by(Category.parent_id, Category.sort_order).all()
    if request.method == 'POST':
        data = _parse_product_form(request.form)
        exists = Product.query.filter_by(slug=data['slug']).first()
        if exists and exists.id != p.id:
            flash('Slug уже занят', 'error')
            return render_template('admin/product_form.html', cats=cats, p=p, form=request.form)
        for k, v in data.items():
            setattr(p, k, v)
        db.session.commit()
        flash('Сохранено', 'success')
        return redirect(url_for('admin'))
    return render_template('admin/product_form.html', cats=cats, p=p, form=None)


@app.route('/admin/products/<int:pid>/delete', methods=['POST'])
@admin_required
def product_delete(pid):
    p = db.session.get(Product, pid) or abort(404)
    db.session.delete(p)
    db.session.commit()
    flash('Товар удалён', 'success')
    return redirect(url_for('admin'))


@app.route('/admin/products/<int:pid>/sort', methods=['POST'])
@admin_required
def product_sort(pid):
    p = db.session.get(Product, pid) or abort(404)
    p.sort_order = int((request.get_json() or {}).get('sort_order') or 0)
    db.session.commit()
    return jsonify(ok=True)


@app.route('/admin/leads/<int:lid>/status', methods=['POST'])
@admin_required
def lead_status(lid):
    l = db.session.get(Lead, lid) or abort(404)
    status = (request.get_json() or {}).get('status')
    if status in ('new', 'called', 'closed'):
        l.status = status
        db.session.commit()
    return jsonify(ok=True)


@app.route('/admin/upload', methods=['POST'])
@admin_required
def admin_upload():
    f = request.files.get('file')
    if not f:
        return jsonify(error='Нет файла'), 400
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    name = '{}-{}'.format(int(datetime.utcnow().timestamp()), secure_filename(f.filename))
    f.save(os.path.join(app.config['UPLOAD_FOLDER'], name))
    return jsonify(url=url_for('static', filename='uploads/' + name))


@app.errorhandler(404)
def e404(e):
    return render_template('404.html'), 404


# ==================== СИДЫ ====================

def init_db():
    db.create_all()
    if User.query.first() is None:
        admin_user = User(username=os.environ.get('ADMIN_LOGIN', 'admin'), role='admin')
        admin_user.set_password(os.environ.get('ADMIN_PASSWORD', 'admin123'))
        db.session.add(admin_user)
    if Category.query.first() is None:
        seed_catalog()
    db.session.commit()


def seed_catalog():
    from seed_data import build
    build(db, Category, Product, Lead)


with app.app_context():
    init_db()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
