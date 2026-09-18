/* STREFA ZIELENI - interakcje strony */
(function () {
  'use strict';

  var TEL = '48694015371';

  /* --- nawigacja: tlo po scrollu + menu mobilne --- */
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('solid', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var o = nav.classList.contains('open');
      document.body.style.overflow = o ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    Array.prototype.forEach.call(nav.querySelectorAll('.nav-links a'), function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- pojawianie sie sekcji --- */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    Array.prototype.forEach.call(items, function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    Array.prototype.forEach.call(items, function (el) { el.classList.add('in'); });
  }

  /* --- liczniki --- */
  var nums = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && nums.length) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io2.unobserve(el);
        var end = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suf = el.getAttribute('data-suffix') || '';
        var t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 1100, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(nums, function (el) { io2.observe(el); });
  }

  /* --- filtry galerii --- */
  var filterBtns = document.querySelectorAll('.filters button');
  var cells = document.querySelectorAll('.masonry .cell');
  var counter = document.querySelector('[data-gal-count]');

  function applyFilter(cat) {
    var shown = 0;
    Array.prototype.forEach.call(cells, function (c) {
      var ok = cat === 'all' || c.getAttribute('data-cat') === cat;
      c.classList.toggle('hide', !ok);
      if (ok) shown++;
    });
    if (counter) counter.textContent = shown;
  }

  Array.prototype.forEach.call(filterBtns, function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(filterBtns, function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      applyFilter(b.getAttribute('data-filter'));
    });
  });

  /* --- lightbox --- */
  var lb = document.querySelector('.lb');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lb-cap');
    var openable = [];
    var idx = 0;

    function collect() {
      openable = Array.prototype.filter.call(
        document.querySelectorAll('[data-full]'),
        function (el) { return !el.classList.contains('hide'); }
      );
    }
    function show(i) {
      if (!openable.length) return;
      idx = (i + openable.length) % openable.length;
      var el = openable[idx];
      lbImg.src = el.getAttribute('data-full');
      lbImg.alt = el.getAttribute('data-cap') || '';
      if (lbCap) lbCap.textContent = el.getAttribute('data-cap') || '';
    }
    function open(el) {
      collect();
      var i = openable.indexOf(el);
      show(i < 0 ? 0 : i);
      lb.classList.add('on');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('on');
      document.body.style.overflow = '';
      lbImg.src = '';
    }

    document.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('[data-full]') : null;
      if (t) { ev.preventDefault(); open(t); }
    });
    lb.querySelector('.lb-x').addEventListener('click', close);
    lb.querySelector('.lb-p').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    lb.querySelector('.lb-n').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });

    /* przesuwanie palcem */
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  }

  /* --- hero: przewijane kadry --- */
  var heroBox = document.querySelector('[data-hero]');
  if (heroBox) {
    var slides = heroBox.querySelectorAll('.slide');
    var dots = document.querySelectorAll('[data-hero-dots] button');
    var cur = 0;
    var timer = null;
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function goTo(i) {
      cur = (i + slides.length) % slides.length;
      Array.prototype.forEach.call(slides, function (s, n) { s.classList.toggle('on', n === cur); });
      Array.prototype.forEach.call(dots, function (d, n) { d.classList.toggle('on', n === cur); });
    }
    function play() {
      if (still || slides.length < 2) return;
      clearInterval(timer);
      timer = setInterval(function () { goTo(cur + 1); }, 7000);
    }
    Array.prototype.forEach.call(dots, function (d, n) {
      d.addEventListener('click', function () { goTo(n); play(); });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearInterval(timer); } else { play(); }
    });
    play();
  }

  /* --- kreator zapytania: sklada gotowa wiadomosc na WhatsApp --- */
  var kre = document.querySelector('[data-kre]');
  if (kre) {
    var prev = kre.querySelector('[data-kre-prev]');
    var waBtn = kre.querySelector('[data-kre-wa]');
    var miasto = kre.querySelector('[data-kre-miasto]');
    var termin = kre.querySelector('[data-kre-termin]');
    var pick = { co: 'koszenie', ile: 'do 20 arów' };

    function build() {
      var m = (miasto && miasto.value.trim()) || '';
      var t = termin ? termin.options[termin.selectedIndex].value : '';
      var txt = 'Dzień dobry, piszę ze strony Strefy Zieleni. Potrzebuję: ' + pick.co +
        ' (' + pick.ile + ')' + (m ? ', miejscowość: ' + m : '') +
        '. Termin: ' + t + '. Proszę o kontakt i wstępną wycenę.';
      if (prev) {
        prev.innerHTML = '<b>Treść wiadomości:</b><br>' + txt.replace(/</g, '&lt;');
      }
      if (waBtn) {
        waBtn.setAttribute('href', 'https://wa.me/' + TEL + '?text=' + encodeURIComponent(txt));
      }
    }

    Array.prototype.forEach.call(kre.querySelectorAll('[data-kre-group]'), function (grp) {
      var key = grp.getAttribute('data-kre-group');
      Array.prototype.forEach.call(grp.querySelectorAll('button'), function (b) {
        b.addEventListener('click', function () {
          Array.prototype.forEach.call(grp.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          pick[key] = b.getAttribute('data-val');
          build();
        });
      });
    });
    if (miasto) miasto.addEventListener('input', build);
    if (termin) termin.addEventListener('change', build);
    build();
  }

  /* --- przed / po: suwak --- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-ba]'), function (ba) {
    var r = ba.querySelector('input');
    function set() { ba.style.setProperty('--pos', r.value + '%'); }
    r.addEventListener('input', set);
    set();
  });

  /* --- formularz kontaktowy (FormSubmit, bez przeładowania strony) --- */
  var form = document.querySelector('[data-form]');
  if (form) {
    var msg = form.querySelector('.f-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('.hp input').value) return;
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      fetch(form.getAttribute('action'), {
        method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form)
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (String(j.success) !== 'true') throw new Error(j.message || 'blad');
        msg.className = 'f-msg ok';
        msg.textContent = 'Dziękujemy! Wiadomość dotarła. Oddzwonimy, jak tylko zejdziemy z maszyny.';
        form.reset();
      }).catch(function () {
        msg.className = 'f-msg err';
        msg.innerHTML = 'Nie udało się wysłać. Proszę zadzwonić: <a href="tel:+48694015371">694 015 371</a>.';
      }).then(function () { btn.disabled = false; });
    });
  }

  /* --- rok w stopce --- */
  var y = document.querySelectorAll('[data-year]');
  Array.prototype.forEach.call(y, function (el) { el.textContent = new Date().getFullYear(); });
})();
