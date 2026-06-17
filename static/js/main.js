(function () {
  // ===== Тема =====
  var toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', cur);
    try { localStorage.setItem('lt_theme', cur); } catch (e) {}
  });

  // ===== Корзина (localStorage) =====
  var KEY = 'lt_cart';
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function write(items) { localStorage.setItem(KEY, JSON.stringify(items)); render(); }
  function qtyOf(slug) { var x = read().find(function (i) { return i.slug === slug; }); return x ? x.qty : 0; }
  function add(slug, title, n) {
    var items = read(); var ex = items.find(function (i) { return i.slug === slug; });
    if (ex) ex.qty += (n || 1); else items.push({ slug: slug, title: title, qty: n || 1 });
    write(items);
  }
  function setQty(slug, n) {
    var items = read();
    if (n <= 0) items = items.filter(function (i) { return i.slug !== slug; });
    else { var ex = items.find(function (i) { return i.slug === slug; }); if (ex) ex.qty = n; }
    write(items);
  }
  window.LTCart = { read: read, add: add, setQty: setQty, qtyOf: qtyOf };

  function count() { return read().reduce(function (s, i) { return s + i.qty; }, 0); }

  // Рисуем контролы «в заявку» (каталог + карточка товара) и счётчик в шапке
  function render() {
    var c = count();
    var badge = document.getElementById('cart-count');
    if (badge) { badge.textContent = c; badge.hidden = c === 0; }
    var badgeM = document.getElementById('cart-count-m');
    if (badgeM) { badgeM.textContent = c; badgeM.hidden = c === 0; }

    document.querySelectorAll('.cart-control').forEach(function (el) {
      var slug = el.dataset.slug, title = el.dataset.title, big = el.dataset.size === 'big';
      var q = qtyOf(slug);
      if (q === 0) {
        el.innerHTML = big
          ? '<button class="btn btn--glow js-add">В заявку</button><span class="muted" style="margin-left:10px">Цена по запросу</span>'
          : '<button class="add-link js-add">+ В заявку</button>';
      } else {
        var label = big ? '<span class="muted" style="margin-right:8px">В заявке:</span>' : '';
        el.innerHTML = label +
          '<span class="stepper stepper--glow"><button class="js-dec">−</button><span class="qty">' + q + '</span><button class="js-inc">+</button></span>' +
          (big ? '<span style="margin-left:8px">шт.</span> <a href="/cart" class="btn btn--glow btn--sm" style="margin-left:10px">К заявке</a>' : '');
      }
      el.querySelector('.js-add') && el.querySelector('.js-add').addEventListener('click', function (e) { e.preventDefault(); add(slug, title, big ? (parseInt(el.dataset.qty) || 1) : 1); });
      el.querySelector('.js-inc') && el.querySelector('.js-inc').addEventListener('click', function () { setQty(slug, qtyOf(slug) + 1); });
      el.querySelector('.js-dec') && el.querySelector('.js-dec').addEventListener('click', function () { setQty(slug, qtyOf(slug) - 1); });
    });

    // Страница заявки
    var box = document.getElementById('cart-items');
    if (box) {
      var items = read();
      if (!items.length) {
        box.innerHTML = '<div class="card" style="padding:32px;text-align:center" class="muted">Список пуст. <a href="/catalog" style="color:var(--glow)">Перейти в каталог →</a></div>';
      } else {
        box.innerHTML = items.map(function (i) {
          return '<div class="card between" style="padding:16px">' +
            '<a href="/product/' + i.slug + '" style="font-weight:600">' + i.title + '</a>' +
            '<span class="flex"><span class="stepper"><button data-d="' + i.slug + '">−</button><span class="qty">' + i.qty + '</span><button data-i="' + i.slug + '">+</button></span>' +
            '<button class="add-link" data-rm="' + i.slug + '">Убрать</button></span></div>';
        }).join('');
        box.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { setQty(b.dataset.i, qtyOf(b.dataset.i) + 1); }; });
        box.querySelectorAll('[data-d]').forEach(function (b) { b.onclick = function () { setQty(b.dataset.d, qtyOf(b.dataset.d) - 1); }; });
        box.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { setQty(b.dataset.rm, 0); }; });
      }
    }
  }
  render();

  // Большой степпер на карточке товара: количество для добавления
  document.querySelectorAll('.qty-pick').forEach(function (el) {
    var val = el.querySelector('.qty'), tgt = el.dataset.target;
    el.querySelector('.dec').onclick = function () { var n = Math.max(1, (parseInt(val.textContent) || 1) - 1); val.textContent = n; setData(n); };
    el.querySelector('.inc').onclick = function () { var n = (parseInt(val.textContent) || 1) + 1; val.textContent = n; setData(n); };
    function setData(n) { var c = document.querySelector('.cart-control[data-slug="' + tgt + '"]'); if (c) c.dataset.qty = n; }
  });

  // ===== Цветовая температура (hero) =====
  var slider = document.getElementById('temp-slider');
  if (slider) {
    var stops = [[2700, [255, 179, 71]], [4000, [255, 224, 170]], [5000, [207, 227, 255]]];
    function colorFor(k) {
      if (k <= 2700) return stops[0][1]; if (k >= 5000) return stops[2][1];
      for (var i = 0; i < 2; i++) { var a = stops[i], b = stops[i + 1]; if (k >= a[0] && k <= b[0]) { var t = (k - a[0]) / (b[0] - a[0]); return a[1].map(function (v, j) { return Math.round(v + (b[1][j] - v) * t); }); } }
      return stops[0][1];
    }
    function paint() {
      var k = +slider.value, c = colorFor(k), rgb = 'rgb(' + c.join(',') + ')';
      document.getElementById('temp-val').textContent = k + ' K';
      var lens = document.getElementById('lamp-lens'); if (lens) lens.setAttribute('fill', rgb);
      var beam = document.getElementById('lamp-beam'); if (beam) beam.style.stopColor = rgb;
      var spot = document.getElementById('lamp-spot'); if (spot) spot.setAttribute('fill', rgb);
      slider.style.accentColor = rgb;
      var b0 = document.getElementById('beam-0'), b1 = document.getElementById('beam-1');
      if (b0) b0.setAttribute('stop-color', 'rgba(' + c.join(',') + ',.55)');
      if (b1) b1.setAttribute('stop-color', 'rgba(' + c.join(',') + ',.05)');
    }
    slider.addEventListener('input', paint); paint();
  }

  // ===== Лайтбокс (увеличение чертежей/галереи) =====
  document.addEventListener('click', function (e) {
    var z = e.target.closest('[data-zoom]'); if (!z) return;
    var group = Array.prototype.slice.call(z.parentElement.querySelectorAll('[data-zoom]'));
    if (!group.length) group = [z];
    var idx = group.indexOf(z); if (idx === -1) { group = [z]; idx = 0; }
    var many = group.length > 1;
    var lb = document.createElement('div'); lb.className = 'lightbox';
    lb.innerHTML =
      '<button class="lightbox__close" aria-label="Закрыть">×</button>' +
      (many ? '<button class="lightbox__arrow lightbox__prev">&#8249;</button>' : '') +
      '<img src="" alt="">' +
      (many ? '<button class="lightbox__arrow lightbox__next">&#8250;</button>' : '') +
      '<div class="lightbox__cap"></div>';
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lightbox__cap');
    function paint() {
      var el = group[idx];
      lbImg.src = el.getAttribute('data-zoom');
      lbCap.textContent = el.getAttribute('data-cap') || '';
    }
    paint();
    document.body.appendChild(lb); document.body.style.overflow = 'hidden';
    function close() { lb.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); }
    function go(n) { idx = (n + group.length) % group.length; paint(); }
    lb.addEventListener('click', function (ev) { if (ev.target === lb) close(); });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    var lbPrev = lb.querySelector('.lightbox__prev');
    var lbNext = lb.querySelector('.lightbox__next');
    if (lbPrev) lbPrev.addEventListener('click', function (ev) { ev.stopPropagation(); go(idx - 1); });
    if (lbNext) lbNext.addEventListener('click', function (ev) { ev.stopPropagation(); go(idx + 1); });
    function onKey(ev) {
      if (ev.key === 'Escape') close();
      if (ev.key === 'ArrowLeft') go(idx - 1);
      if (ev.key === 'ArrowRight') go(idx + 1);
    }
    document.addEventListener('keydown', onKey);
  });

  // ===== Галерея на странице товара =====
  var prodMainImg = document.getElementById('prod-main-img');
  if (prodMainImg) {
    var prodMain = document.getElementById('prod-main');
    var thumbEls = Array.prototype.slice.call(document.querySelectorAll('.thumbs .thumb'));
    var srcs = thumbEls.map(function (t) { return t.dataset.src; });
    var gIdx = 0;
    function goProd(n) {
      gIdx = (n + srcs.length) % srcs.length;
      prodMainImg.src = srcs[gIdx];
      if (prodMain) { prodMain.dataset.zoom = srcs[gIdx]; }
      thumbEls.forEach(function (t, i) { t.classList.toggle('active', i === gIdx); });
    }
    thumbEls.forEach(function (t, i) { t.addEventListener('click', function () { goProd(i); }); });
    var gPrev = document.querySelector('.prod-prev');
    var gNext = document.querySelector('.prod-next');
    if (gPrev) gPrev.addEventListener('click', function () { goProd(gIdx - 1); });
    if (gNext) gNext.addEventListener('click', function () { goProd(gIdx + 1); });
  }

  // ===== Автопрокрутка карусели клиентов =====
  var trustTrack = document.querySelector('.trust .grid--4');
  if (trustTrack) {
    var trustPaused = false;
    trustTrack.addEventListener('touchstart', function () { trustPaused = true; }, { passive: true });
    trustTrack.addEventListener('touchend', function () { setTimeout(function () { trustPaused = false; }, 1500); }, { passive: true });
    setInterval(function () {
      if (trustPaused) return;
      var maxScroll = trustTrack.scrollWidth - trustTrack.clientWidth;
      if (maxScroll <= 0) return; // не карусель (десктоп)
      var next = trustTrack.scrollLeft + trustTrack.clientWidth * 0.72 + 12;
      if (next >= maxScroll - 4) next = 0; // перемотка в начало
      trustTrack.scrollTo({ left: next, behavior: 'smooth' });
    }, 2800);
  }

  // ===== Кнопка наверх =====
  var backTop = document.getElementById('back-top');
  if (backTop) {
    window.addEventListener('scroll', function () { backTop.classList.toggle('visible', window.scrollY > 300); });
    backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // ===== Мобильное меню =====
  var menuBtn = document.getElementById('menu-btn');
  var mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var open = !mobileNav.hidden;
      mobileNav.hidden = open;
      menuBtn.textContent = open ? '☰' : '✕';
    });
    // Закрывать при клике по ссылке
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mobileNav.hidden = true; menuBtn.textContent = '☰'; });
    });
  }

  // ===== Поиск по каталогу =====
  var catalogSearch = document.getElementById('catalog-search');
  if (catalogSearch) {
    catalogSearch.addEventListener('input', function () {
      var q = catalogSearch.value.trim().toLowerCase();
      var cards = document.querySelectorAll('#catalog-grid .product-card');
      var visible = 0;
      cards.forEach(function (card) {
        var title = (card.querySelector('h3') || {}).textContent || '';
        var show = !q || title.toLowerCase().indexOf(q) !== -1;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      var empty = document.getElementById('catalog-empty');
      if (empty) empty.style.display = visible === 0 ? '' : 'none';
    });
  }

  // ===== Копировать реквизиты =====
  var copyReqBtn = document.getElementById('copy-req');
  if (copyReqBtn) {
    copyReqBtn.addEventListener('click', function () {
      var rows = document.querySelectorAll('#req-table .between');
      var text = Array.prototype.map.call(rows, function (row) {
        var spans = row.querySelectorAll('span');
        return spans[0].textContent.trim() + ': ' + spans[1].textContent.trim();
      }).join('\n');
      navigator.clipboard.writeText(text).then(function () {
        copyReqBtn.textContent = 'Скопировано ✓';
        setTimeout(function () { copyReqBtn.textContent = 'Скопировать'; }, 2000);
      });
    });
  }

  // ===== Маска телефона =====
  document.querySelectorAll('input[name="phone"]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var raw = inp.value.replace(/\D/g, '');
      if (raw.length && raw[0] === '8') raw = '7' + raw.slice(1);
      if (raw.length && raw[0] !== '7') raw = '7' + raw;
      raw = raw.slice(0, 11);
      var out = raw.length ? '+7' : '';
      if (raw.length > 1) out += ' (' + raw.slice(1, 4);
      if (raw.length >= 4) out += ') ' + raw.slice(4, 7);
      if (raw.length >= 7) out += '-' + raw.slice(7, 9);
      if (raw.length >= 9) out += '-' + raw.slice(9, 11);
      inp.value = out;
    });
  });

  // ===== Слайдер фото в карточке =====
  document.querySelectorAll('.product-slider').forEach(function (sl) {
    var imgs = sl.querySelectorAll('img');
    var dots = sl.querySelectorAll('.slider__dot');
    var idx = 0;
    function go(n) {
      imgs[idx].classList.remove('active');
      if (dots[idx]) dots[idx].classList.remove('active');
      idx = (n + imgs.length) % imgs.length;
      imgs[idx].classList.add('active');
      if (dots[idx]) dots[idx].classList.add('active');
    }
    go(0);
    var prev = sl.querySelector('.slider__prev');
    var next = sl.querySelector('.slider__next');
    if (prev) prev.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); go(idx - 1); });
    if (next) next.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); go(idx + 1); });
  });

  // ===== Форма заявки =====
  var form = document.getElementById('lead-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var note = document.getElementById('lead-note');
    if (!fd.get('name') || !fd.get('phone') || !form.querySelector('[name=consent]').checked) {
      note.textContent = 'Заполните имя, телефон и отметьте согласие.'; note.className = 'alert alert--error'; return;
    }
    var payload = { name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'), comment: fd.get('comment'), consent: true, items: read() };
    fetch('/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok) { write([]); form.reset(); note.textContent = 'Заявка отправлена. Менеджер свяжется с вами и подготовит расчёт.'; note.className = 'alert alert--success'; }
        else { note.textContent = res.j.error || 'Ошибка'; note.className = 'alert alert--error'; }
      })
      .catch(function () { note.textContent = 'Ошибка сети'; note.className = 'alert alert--error'; });
  });
})();
