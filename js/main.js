/* ============================================================
   ООО «Заряд» — скрипты
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Бургер-меню ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Закрываем меню при клике по ссылке
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Появление секций при прокрутке ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Бегущие цифры ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var decimals = (el.getAttribute('data-decimals') | 0);
    var duration = 1600;
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }

    var start = null;
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var val = target * easeOutCubic(p);
      el.textContent = val.toFixed(decimals);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(frame);
  }

  var nums = document.querySelectorAll('.num[data-target]');
  if (nums.length) {
    if ('IntersectionObserver' in window) {
      var statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateCount(e.target);
            statObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.6 });
      nums.forEach(function (n) { statObserver.observe(n); });
    } else {
      nums.forEach(animateCount);
    }
  }

  /* ---------- Форма заявки (открывает почтовый клиент) ----------
     Чтобы принимать заявки на сервер/в CRM/в Telegram-бота — замените
     обработчик ниже на отправку через fetch() на ваш бэкенд.        */
  var form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var n = form.querySelector('[name="name"]').value;
      var p = form.querySelector('[name="phone"]').value;
      var m = form.querySelector('[name="task"]').value;
      var body = encodeURIComponent('Имя/организация: ' + n + '\nТелефон: ' + p + '\nЗадача: ' + m);
      window.location.href = 'mailto:info@zaryad67.ru?subject=' +
        encodeURIComponent('Заявка с сайта') + '&body=' + body;
    });
  }
})();
