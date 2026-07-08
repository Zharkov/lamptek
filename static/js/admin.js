(function () {
  var csrfMeta = document.querySelector('meta[name="csrf-token"]');
  var CSRF_TOKEN = csrfMeta ? csrfMeta.content : '';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ===== Заявки: окно =====
  var modal = document.getElementById('lead-modal');
  if (modal) {
    document.querySelectorAll('.js-lead').forEach(function (row) {
      row.addEventListener('click', function () {
        var d = row.dataset;
        document.getElementById('m-name').textContent = d.name;
        document.getElementById('m-phone').textContent = d.phone;
        document.getElementById('m-date').textContent = d.date;
        var er = document.getElementById('m-email-row');
        if (d.email) { document.getElementById('m-email').textContent = d.email; er.style.display = ''; } else er.style.display = 'none';
        var items = []; try { items = JSON.parse(d.items || '[]'); } catch (e) {}
        var iw = document.getElementById('m-items-wrap');
        if (items.length) { iw.style.display = ''; document.getElementById('m-items').innerHTML = items.map(function (i) { return '<li class="between" style="border-bottom:1px solid var(--border);padding-bottom:4px"><span>' + esc(i.title) + '</span><span class="mono muted">' + esc(i.qty) + ' шт.</span></li>'; }).join(''); }
        else iw.style.display = 'none';
        var cw = document.getElementById('m-comment-wrap');
        if (d.comment) { cw.style.display = ''; document.getElementById('m-comment').textContent = d.comment; } else cw.style.display = 'none';
        modal.hidden = false;
      });
    });
    function close() { modal.hidden = true; }
    modal.addEventListener('click', close);
    document.getElementById('m-close').addEventListener('click', close);
  }

  // ===== Статус заявки =====
  document.querySelectorAll('.js-status').forEach(function (sel) {
    sel.addEventListener('change', function () {
      var card = sel.closest('.card');
      var dot = card && card.querySelector('.lead__dot');
      fetch('/admin/leads/' + sel.dataset.id + '/status', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
        body: JSON.stringify({ status: sel.value })
      }).then(function () {
        // Обновить цвет точки
        if (dot) {
          dot.className = 'lead__dot dot-' + sel.value;
        }
        // Закрыта → убрать с дашборда (вправо)
        if (sel.value === 'closed' && sel.dataset.autoArchive && card) {
          card.style.transition = 'opacity .35s, transform .35s';
          card.style.opacity = '0';
          card.style.transform = 'translateX(20px)';
          setTimeout(function () { card.remove(); }, 380);
        }
        // Активный статус → убрать из архива (влево)
        if (sel.value !== 'closed' && sel.dataset.autoUnarchive && card) {
          card.style.transition = 'opacity .35s, transform .35s';
          card.style.opacity = '0';
          card.style.transform = 'translateX(-20px)';
          setTimeout(function () { card.remove(); }, 380);
        }
      });
    });
  });

  // ===== Переключение публикации товара =====
  document.querySelectorAll('.js-toggle-pub').forEach(function (btn) {
    btn.addEventListener('click', function () {
      fetch('/admin/products/' + btn.dataset.id + '/toggle', { method: 'POST', headers: { 'X-CSRFToken': CSRF_TOKEN } })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          btn.textContent = j.published ? 'опубликован' : 'скрыт';
          btn.style.color = j.published ? 'var(--glow-text)' : 'var(--muted)';
          btn.style.borderColor = j.published ? 'var(--glow)' : 'var(--border2)';
          btn.style.background = j.published ? 'var(--glow-soft)' : 'transparent';
          btn.title = j.published ? 'Нажмите, чтобы снять с публикации' : 'Нажмите, чтобы опубликовать';
        });
    });
  });

  // ===== Инлайн-сортировка товаров =====
  document.querySelectorAll('.js-sort').forEach(function (inp) {
    var prev = inp.value;
    inp.addEventListener('blur', function () {
      if (inp.value === prev) return; prev = inp.value;
      fetch('/admin/products/' + inp.dataset.id + '/sort', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
        body: JSON.stringify({ sort_order: parseInt(inp.value) || 0 })
      });
    });
  });

  // ===== Форма товара: характеристики =====
  var specsList = document.getElementById('specs-list');
  if (specsList) {
    document.getElementById('add-spec').addEventListener('click', function () {
      var row = document.createElement('div');
      row.className = 'flex js-spec'; row.style.flexWrap = 'nowrap';
      row.innerHTML = '<input class="field" name="spec_label" placeholder="Параметр"><input class="field mono" name="spec_value" placeholder="Значение"><button type="button" class="add-link js-spec-del">✕</button>';
      specsList.appendChild(row);
    });
    specsList.addEventListener('click', function (e) { if (e.target.classList.contains('js-spec-del')) e.target.closest('.js-spec').remove(); });
  }

  // ===== Загрузка изображений (главное / галерея / чертежи) =====
  function uploadFile(file, cb) {
    var fd = new FormData(); fd.append('file', file);
    fetch('/admin/upload', { method: 'POST', headers: { 'X-CSRFToken': CSRF_TOKEN }, body: fd }).then(function (r) { return r.json(); }).then(function (j) { if (j.url) cb(j.url); });
  }

  var galleryJson = document.getElementById('gallery_json');
  var drawJson = document.getElementById('drawings_json');

  function renderGallery() {
    var list = document.getElementById('gallery-list'); if (!list) return;
    var arr = JSON.parse(galleryJson.value || '[]');
    list.innerHTML = arr.map(function (u, i) {
      return '<div class="card" style="position:relative;width:64px;height:64px;overflow:hidden"><img src="' + u + '" style="width:100%;height:100%;object-fit:contain"><button type="button" data-gi="' + i + '" style="position:absolute;top:0;right:0;background:rgba(0,0,0,.6);color:#f88;border:0;cursor:pointer">✕</button></div>';
    }).join('');
    list.querySelectorAll('[data-gi]').forEach(function (b) { b.onclick = function () { var a = JSON.parse(galleryJson.value); a.splice(+b.dataset.gi, 1); galleryJson.value = JSON.stringify(a); renderGallery(); }; });
  }
  function renderDraw() {
    var list = document.getElementById('draw-list'); if (!list) return;
    var arr = JSON.parse(drawJson.value || '[]');
    list.innerHTML = arr.map(function (d, i) {
      return '<div class="flex" style="flex-wrap:nowrap"><div class="card" style="width:56px;height:56px;flex:0 0 auto;overflow:hidden;background:#fff"><img src="' + d.url + '" style="width:100%;height:100%;object-fit:contain"></div>' +
        '<input class="field" data-dc="' + i + '" value="' + (d.caption || '').replace(/"/g, '&quot;') + '" placeholder="Подпись"><button type="button" class="add-link" data-dd="' + i + '">✕</button></div>';
    }).join('');
    list.querySelectorAll('[data-dc]').forEach(function (inp) { inp.oninput = function () { var a = JSON.parse(drawJson.value); a[+inp.dataset.dc].caption = inp.value; drawJson.value = JSON.stringify(a); }; });
    list.querySelectorAll('[data-dd]').forEach(function (b) { b.onclick = function () { var a = JSON.parse(drawJson.value); a.splice(+b.dataset.dd, 1); drawJson.value = JSON.stringify(a); renderDraw(); }; });
  }
  if (galleryJson) renderGallery();
  if (drawJson) renderDraw();

  document.querySelectorAll('.js-upload').forEach(function (inp) {
    inp.addEventListener('change', function () {
      var f = inp.files[0]; if (!f) return;
      var t = inp.dataset.target;
      uploadFile(f, function (url) {
        if (t === 'main') { document.getElementById('main_image').value = url; document.getElementById('main-img').src = url; document.getElementById('main-prev').style.display = ''; }
        else if (t === 'gallery') { var a = JSON.parse(galleryJson.value || '[]'); a.push(url); galleryJson.value = JSON.stringify(a); renderGallery(); }
        else if (t === 'draw') { var a = JSON.parse(drawJson.value || '[]'); a.push({ url: url, caption: '' }); drawJson.value = JSON.stringify(a); renderDraw(); }
        inp.value = '';
      });
    });
  });
})();
