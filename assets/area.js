/* STREFA ZIELENI - interaktywna mapa obszaru działania (Leaflet + OpenStreetMap)
   Strefy: do 10 km wycena i dojazd gratis, do 40 km dojeżdżamy. Odległości w linii prostej od bazy. */
(function () {
  'use strict';
  if (!window.L) return;

  var BASE = [51.1469952, 19.0115607];          // Cmentarna 46, Pajęczno
  var FREE_KM = 10, RANGE_KM = 40;
  var TEL = '48694015371';

  // [nazwa, lat, lon, typ]  typ: 1 = główne miejscowości, 2 = siedziby gmin, 0 = pozostałe
  var TOWNS = [
    ['Pajęczno', 51.1447, 18.9990, 1], ['Działoszyn', 51.1168, 18.8652, 1], ['Trębaczew', 51.1301, 18.9215, 1],
    ['Raciszyn', 51.1045, 18.8678, 1], ['Sulmierzyce', 51.1867, 19.2012, 1],
    ['Siemkowice', 51.2033, 18.9012, 2], ['Kiełczygłów', 51.2388, 18.9874, 2], ['Rząśnia', 51.2218, 19.0423, 2],
    ['Nowa Brzeźnica', 51.0791, 19.1801, 2], ['Strzelce Wielkie', 51.1396, 19.1433, 2], ['Popów', 51.0391, 18.9328, 2],
    ['Rusiec', 51.3245, 18.9860, 2], ['Szczerców', 51.3303, 19.1143, 2], ['Osjaków', 51.2890, 18.7911, 2],
    ['Lgota Wielka', 51.1485, 19.3286, 2], ['Wierzchlas', 51.2044, 18.6648, 2], ['Ładzice', 51.0817, 19.3569, 2],
    ['Konopnica', 51.3541, 18.8225, 2], ['Kruszyna', 50.9687, 19.2764, 2], ['Dobryszyce', 51.1460, 19.4089, 2],
    ['Kłobuck', 50.9026, 18.9372, 2], ['Pątnów', 51.1441, 18.6145, 2], ['Mykanów', 50.9233, 19.1993, 2],
    ['Radomsko', 51.0675, 19.4446, 2], ['Wieluń', 51.2205, 18.5701, 2], ['Kamieńsk', 51.2042, 19.4971, 2],
    ['Czarnożyły', 51.2815, 18.5634, 2], ['Gidle', 50.9641, 19.4685, 2],
    ['Dylów Szlachecki', 51.1536, 18.9730, 0], ['Dylów A', 51.1652, 18.9826, 0], ['Makowiska', 51.1167, 19.0286, 0],
    ['Chorzew', 51.2059, 18.9536, 0], ['Patrzyków', 51.0765, 19.0109, 0], ['Zalesiaki', 51.0996, 18.9061, 0],
    ['Lipie', 51.2705, 18.9394, 0], ['Ważne Młyny', 51.0415, 19.1486, 0], ['Złotniki', 51.2118, 19.2280, 0],
    ['Żłobnica', 51.2220, 19.2609, 0], ['Ostrowy nad Okszą', 50.9743, 19.0573, 0], ['Mierzyce', 51.1556, 18.6927, 0],
    ['Załęcze Wielkie', 51.0863, 18.6859, 0], ['Wiewiórów', 51.1602, 19.3674, 0], ['Wierzbica', 51.1100, 19.3722, 0],
    ['Stobiecko Szlacheckie', 51.1038, 19.3944, 0], ['Masłowice', 51.2562, 18.6397, 0]
  ];

  function km(a, b) {
    var R = 6371, r = Math.PI / 180;
    var dp = (b[0] - a[0]) * r, dl = (b[1] - a[1]) * r;
    var h = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function fmt(n) { return (Math.round(n * 10) / 10).toString().replace('.', ','); }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l'); }
  function zone(d) { return d <= FREE_KM ? 'free' : d <= RANGE_KM ? 'range' : 'far'; }

  TOWNS.forEach(function (t) { t.d = km(BASE, [t[1], t[2]]); });

  Array.prototype.forEach.call(document.querySelectorAll('[data-area]'), init);

  function init(box) {
    var mapEl = box.querySelector('.map');
    var res = box.querySelector('[data-area-res]');
    var input = box.querySelector('[data-area-q]');
    var sug = box.querySelector('[data-area-sug]');
    var geoBtn = box.querySelector('[data-area-geo]');
    var chipsBox = box.querySelector('[data-area-chips]');
    var compact = box.hasAttribute('data-compact');

    var map = L.map(mapEl, {
      scrollWheelZoom: false, zoomSnap: 0.25,
      dragging: !L.Browser.mobile          // na telefonie palec przewija stronę, mapę przybliża się dwoma palcami
    }).setView(BASE, 9);                   // widok musi istnieć, zanim policzymy granice okręgu
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 17, className: 'osm-tiles',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // kółko myszy przybliża dopiero po kliknięciu w mapę - strona przewija się normalnie
    map.on('focus click', function () { map.scrollWheelZoom.enable(); });
    mapEl.addEventListener('mouseleave', function () { map.scrollWheelZoom.disable(); });

    var range = L.circle(BASE, { radius: RANGE_KM * 1000, color: '#13302A', weight: 2, dashArray: '7 7', fillColor: '#13302A', fillOpacity: 0.06 }).addTo(map);
    L.circle(BASE, { radius: FREE_KM * 1000, color: '#137A49', weight: 2, fillColor: '#3ED08A', fillOpacity: 0.28 }).addTo(map)
      .bindTooltip('Do 10 km: wycena i dojazd gratis', { sticky: true });

    L.marker(BASE, { icon: L.divIcon({ className: '', html: '<div class="pin-base"></div>', iconSize: [22, 22], iconAnchor: [11, 11] }), zIndexOffset: 1000, keyboard: false })
      .addTo(map)
      .bindPopup('<b>Strefa Zieleni</b>Baza: Cmentarna 46, 98-330 Pajęczno<br>stąd wyjeżdża sprzęt');

    var small = L.layerGroup();
    TOWNS.forEach(function (t) {
      if (t.d > RANGE_KM + 2) return;
      var cls = t[3] === 1 ? 'pin-town key' : 'pin-town';
      var sz = t[3] === 1 ? 16 : 12;
      var m = L.marker([t[1], t[2]], { icon: L.divIcon({ className: '', html: '<div class="' + cls + '"></div>', iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2] }), title: t[0] });
      m.on('click', function () { pick([t[1], t[2]], t[0]); });
      if (t[3] > 0) {
        m.bindTooltip(t[0], { permanent: true, direction: 'right', className: 'town-lab' + (t[3] === 2 ? ' small' : ''), offset: [4, 0] });
        m.addTo(map);
      } else {
        m.bindTooltip(t[0], { permanent: true, direction: 'right', className: 'town-lab small', offset: [4, 0] });
        small.addLayer(m);
      }
    });
    function toggleSmall() { if (map.getZoom() >= 10.5) small.addTo(map); else small.remove(); }
    map.on('zoomend', toggleSmall);

    map.fitBounds(range.getBounds(), { padding: compact ? [4, 4] : [10, 10] });
    toggleSmall();

    var pickM = null, line = null;
    function pick(ll, name) {
      var d = km(BASE, ll), z = zone(d);
      if (pickM) map.removeLayer(pickM);
      if (line) map.removeLayer(line);
      line = L.polyline([BASE, ll], { color: '#13302A', weight: 3, dashArray: '2 8', lineCap: 'round' }).addTo(map);
      pickM = L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="pin-pick"></div>', iconSize: [20, 20], iconAnchor: [10, 20] }), zIndexOffset: 900 }).addTo(map);
      var label = name || 'Wskazane miejsce';
      var txt = {
        free: ['Wycena i dojazd gratis', 'Jesteś w strefie do 10 km od naszej bazy. Przyjedziemy obejrzeć teren i podamy cenę bez żadnych opłat.'],
        range: ['Dojeżdżamy', 'To w naszym zasięgu do 40 km. Koszt dojazdu ustalimy przez telefon, zanim cokolwiek zaczniemy.'],
        far: ['Zadzwoń, ustalimy', 'To dalej niż nasz zwykły zasięg 40 km. Przy większym zleceniu przyjedziemy, więc warto zapytać.']
      }[z];
      if (res) {
        res.className = 'area-res ' + z;
        var msg = 'Dzień dobry, piszę ze strony Strefy Zieleni. Chodzi o teren: ' + label + ' (ok. ' + fmt(d) + ' km od Pajęczna). Proszę o kontakt w sprawie wyceny.';
        res.innerHTML =
          '<div class="km">' + fmt(d) + ' km</div>' +
          '<div class="t">' + escapeHtml(label) + ': ' + txt[0] + '</div>' +
          '<p class="d">' + txt[1] + '</p>' +
          '<a class="btn btn-wa btn-sm" href="https://wa.me/' + TEL + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">Zapytaj o wycenę na WhatsApp</a>';
      }
      map.flyTo(ll, Math.max(map.getZoom(), compact ? 9.5 : 10.5), { duration: 0.8 });
      if (chipsBox) Array.prototype.forEach.call(chipsBox.querySelectorAll('button'), function (b) { b.classList.toggle('on', b.textContent === name); });
    }

    map.on('click', function (e) {
      var ll = [e.latlng.lat, e.latlng.lng], near = null;
      TOWNS.forEach(function (t) { var dd = km(ll, [t[1], t[2]]); if (dd < 2.2 && (!near || dd < near.dd)) near = { t: t, dd: dd }; });
      pick(ll, near ? 'okolice: ' + near.t[0] : null);
    });

    if (chipsBox) {
      TOWNS.filter(function (t) { return t[3] === 1; }).forEach(function (t) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = t[0];
        b.addEventListener('click', function () { pick([t[1], t[2]], t[0]); });
        chipsBox.appendChild(b);
      });
    }

    // wyszukiwarka miejscowości
    if (input && sug) {
      var act = -1, list = [];
      function render() {
        var q = norm(input.value.trim());
        list = !q ? [] : TOWNS.filter(function (t) { return norm(t[0]).indexOf(q) === 0 || norm(t[0]).indexOf(' ' + q) > -1; })
          .sort(function (a, b) { return a.d - b.d; }).slice(0, 8);
        act = -1;
        sug.innerHTML = list.length ? list.map(function (t, i) {
          return '<button type="button" data-i="' + i + '">' + t[0] + '<small>' + fmt(t.d) + ' km</small></button>';
        }).join('') : (q ? '<button type="button" disabled>Nie ma na liście. Kliknij to miejsce na mapie.</button>' : '');
        sug.classList.toggle('on', !!q);
      }
      function choose(i) {
        var t = list[i]; if (!t) return;
        input.value = t[0]; sug.classList.remove('on'); pick([t[1], t[2]], t[0]);
      }
      input.addEventListener('input', render);
      input.addEventListener('keydown', function (e) {
        if (!sug.classList.contains('on')) return;
        var btns = sug.querySelectorAll('button[data-i]');
        if (e.key === 'ArrowDown') { act = Math.min(act + 1, btns.length - 1); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { act = Math.max(act - 1, 0); e.preventDefault(); }
        else if (e.key === 'Enter') { choose(act < 0 ? 0 : act); e.preventDefault(); return; }
        else if (e.key === 'Escape') { sug.classList.remove('on'); return; }
        Array.prototype.forEach.call(btns, function (b, i) { b.classList.toggle('act', i === act); });
      });
      sug.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-i]'); if (b) choose(+b.getAttribute('data-i'));
      });
      document.addEventListener('click', function (e) { if (!box.querySelector('.area-search').contains(e.target)) sug.classList.remove('on'); });
    }

    // moja lokalizacja
    if (geoBtn) {
      if (!('geolocation' in navigator)) geoBtn.hidden = true;
      geoBtn.addEventListener('click', function () {
        geoBtn.disabled = true;
        navigator.geolocation.getCurrentPosition(function (p) {
          geoBtn.disabled = false; pick([p.coords.latitude, p.coords.longitude], 'Twoja lokalizacja');
        }, function () {
          geoBtn.disabled = false;
          if (res) { res.className = 'area-res'; res.innerHTML = '<p class="d">Nie udało się pobrać lokalizacji. Wpisz miejscowość albo kliknij na mapie.</p>'; }
        }, { enableHighAccuracy: false, timeout: 8000 });
      });
    }

    // mapa w zwiniętym kontenerze / po zmianie rozmiaru
    window.addEventListener('resize', function () { map.invalidateSize(); });
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
})();
