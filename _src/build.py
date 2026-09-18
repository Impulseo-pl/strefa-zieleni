# Generator strony Strefy Zieleni.
# Wspólny nagłówek, stopka i klocki są tutaj, treść podstron w _src/pages/*.html.
# Uruchomienie z katalogu repo:  python _src/build.py
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / '_src' / 'pages'
DOMAIN = 'https://strefazielenipajeczno.pl/'
VER = '3'
# Podgląd na github.io NIE może wpaść do Google (zasada dla dem). Po podpięciu domeny
# strefazielenipajeczno.pl ustawić INDEKSUJ = True i przebudować.
INDEKSUJ = False

# Dane firmy - uzupełnić NIP, gdy klient poda (pusty = linijka się nie wyświetla)
FIRMA = {
    'nazwa': 'Strefa Zieleni Szymon Browarski',
    'adres': 'Cmentarna 46, 98-330 Pajęczno',
    'nip': '',
}

I = {
 'tel': '<svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.58 3.6a1 1 0 0 1-.25 1l-2.23 2.2Z"/></svg>',
 'wa': '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-2.9.8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.1 2-.4 3.4a10 10 0 0 0 4.6 4.4c1.9.8 2.6.7 3.3.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3Z"/></svg>',
 'pin': '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
 'mail': '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.2L4 7.3V17h16V7.3l-8 4.9Zm0-2.3L19.2 7H4.8L12 9.9Z"/></svg>',
 'check': '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L21 7.5l-1.4-1.4z"/></svg>',
 'star': '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.85 5.8 6.4.93-4.63 4.5 1.1 6.37L12 17.4l-5.72 3 1.1-6.37-4.63-4.5 6.4-.93L12 2.8Z"/></svg>',
 'info': '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"/></svg>',
 'geo': '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 3h-2.07A7 7 0 0 0 13 5.07V3h-2v2.07A7 7 0 0 0 5.07 11H3v2h2.07A7 7 0 0 0 11 18.93V21h2v-2.07A7 7 0 0 0 18.93 13H21v-2Zm-9 6a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/></svg>',
 'clock': '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.6-3.6-2.1V6.5H13v3.4l2.6 1.5-1 1.2Z"/></svg>',
 'arrows': '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7 3 12l5 5v-4h8v4l5-5-5-5v4H8z"/></svg>',
}
STARS = '<span class="st">' + I['star'] * 5 + '</span>'

TEL_HREF = 'tel:+48694015371'
WA_HREF = 'https://wa.me/48694015371'

NAV = [('oferta.html', 'Oferta', 'oferta'), ('index.html#realizacje', 'Realizacje', 'real'),
       ('obszar-dzialania.html', 'Obszar działania', 'obszar'), ('o-nas.html', 'O nas', 'onas'),
       ('kontakt.html', 'Kontakt', 'kontakt')]


def header(active):
    links = ''.join(
        f'<a href="{h}"{" aria-current=page" if k == active else ""}>{t}</a>' for h, t, k in NAV)
    return f'''<a class="skip" href="#tresc">Przejdź do treści</a>
<header class="nav">
  <div class="wrap nav-inner">
    <a class="brand" href="index.html" aria-label="Strefa Zieleni - strona główna"><img src="img/logo.png" alt="Strefa Zieleni - usługi ogrodnicze" width="228" height="100"></a>
    <nav class="nav-links" aria-label="Menu główne">
      {links}
      <span class="nav-cta">
        <a class="nav-tel" href="{TEL_HREF}">{I['tel']} 694 015 371</a>
        <a class="btn btn-olive btn-sm" href="{TEL_HREF}">Bezpłatna wycena</a>
      </span>
    </nav>
    <button class="nav-toggle" aria-label="Otwórz menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>
<main id="tresc">'''


def footer():
    nip = f'<p>NIP {FIRMA["nip"]}</p>' if FIRMA['nip'] else ''
    return f'''</main>
<div class="lb" role="dialog" aria-modal="true" aria-label="Podgląd zdjęcia">
  <button class="lb-x" aria-label="Zamknij">&times;</button>
  <button class="lb-p" aria-label="Poprzednie zdjęcie">&#8249;</button>
  <button class="lb-n" aria-label="Następne zdjęcie">&#8250;</button>
  <img alt="">
  <div class="lb-cap"></div>
</div>
<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <span class="foot-logo"><img src="img/logo.png" alt="Strefa Zieleni" width="228" height="100" loading="lazy"></span>
        <p>Koszenie, wycinki, pielęgnacja ogrodów i sadów, czyszczenie działek, zimą odśnieżanie. Pajęczno i okolice do 40 km.</p>
      </div>
      <div>
        <h4>Usługi</h4>
        <a href="oferta.html#koszenie">Koszenie</a><a href="oferta.html#wycinka">Wycinka drzew</a>
        <a href="oferta.html#ogrody">Ogrody i sady</a><a href="oferta.html#dzialki">Czyszczenie działek</a>
        <a href="oferta.html#odsniezanie">Odśnieżanie</a>
      </div>
      <div>
        <h4>Strona</h4>
        <a href="obszar-dzialania.html">Obszar działania</a><a href="index.html#realizacje">Realizacje</a>
        <a href="o-nas.html">O nas</a><a href="kontakt.html">Kontakt</a><a href="polityka-prywatnosci.html">Polityka prywatności</a>
      </div>
      <div>
        <h4>Kontakt</h4>
        <a href="{TEL_HREF}">+48 694 015 371</a>
        <a href="mailto:sbrowarski89@gmail.com">sbrowarski89@gmail.com</a>
        <p style="margin-top:12px">{FIRMA['nazwa']}<br>{FIRMA['adres']}</p>
        {nip}
        <p>Wystawiamy faktury.</p>
      </div>
    </div>
    <div class="foot-bot">
      <span>&copy; <span data-year>2026</span> Strefa Zieleni &middot; Szymon Browarski</span>
      <span>Projekt i wykonanie: <a href="https://impulseo.pl" target="_blank" rel="noopener">Impulseo</a></span>
    </div>
  </div>
</footer>
<div class="sticky-bar">
  <a class="s-tel" href="{TEL_HREF}">{I['tel']} Zadzwoń</a>
  <a class="s-wa" href="{WA_HREF}" target="_blank" rel="noopener">{I['wa']} WhatsApp</a>
</div>'''


BLOCKS = {}

BLOCKS['AREA'] = f'''<div class="area reveal" data-area>
  <div class="area-side">
    <h3>Czy do Ciebie dojedziemy?</h3>
    <div class="area-legend">
      <div><i class="lg-base"></i>Baza: Cmentarna 46, Pajęczno</div>
      <div><i class="lg-free"></i><span><b>Do 10 km</b>: wycena i dojazd gratis</span></div>
      <div><i class="lg-range"></i><span><b>Do 40 km</b>: dojeżdżamy z całym sprzętem</span></div>
    </div>
    <div class="area-search">
      <label for="area-q">Wpisz miejscowość</label>
      <input id="area-q" type="text" autocomplete="off" placeholder="np. Działoszyn" data-area-q>
      <div class="sug" data-area-sug role="listbox"></div>
    </div>
    <div class="area-chips" data-area-chips></div>
    <button type="button" class="area-geo" data-area-geo>{I['geo']} Użyj mojej lokalizacji</button>
    <div class="area-res" data-area-res>
      <p class="d">Wybierz miejscowość albo <b>kliknij dowolne miejsce na mapie</b>. Pokażemy odległość od naszej bazy i warunki dojazdu.</p>
    </div>
    <p class="area-hint">Odległość liczona w linii prostej od bazy w Pajęcznie. Drogą wychodzi zwykle trochę więcej, a dokładne warunki ustalamy przez telefon.</p>
  </div>
  <div class="area-map"><div class="map" role="application" aria-label="Mapa obszaru działania Strefy Zieleni"></div></div>
</div>'''

BLOCKS['KRE'] = f'''<section class="tinted" id="zapytanie">
  <div class="wrap">
    <div class="head center reveal">
      <span class="eyebrow">Zapytanie w minutę</span>
      <h2>Zaznacz, co trzeba zrobić</h2>
      <p>Złożymy z tego gotową wiadomość na WhatsApp. Wystarczy ją wysłać, a najlepiej dołączyć zdjęcie terenu.</p>
    </div>
    <div class="kre-box reveal" data-kre>
      <div class="kre-form">
        <div class="kre-step">
          <div class="kre-lab"><i>1</i> Usługa</div>
          <div class="kre-opts" data-kre-group="co">
            <button type="button" class="on" data-val="koszenie">Koszenie</button>
            <button type="button" data-val="wycinka drzew">Wycinka drzew</button>
            <button type="button" data-val="przycinka drzew lub żywopłotu">Przycinka</button>
            <button type="button" data-val="pielęgnacja ogrodu lub sadu">Ogród / sad</button>
            <button type="button" data-val="czyszczenie działki pod budowę">Działka pod budowę</button>
            <button type="button" data-val="stała obsługa terenu przez cały rok">Stała obsługa</button>
            <button type="button" data-val="odśnieżanie">Odśnieżanie</button>
          </div>
        </div>
        <div class="kre-step">
          <div class="kre-lab"><i>2</i> Wielkość terenu</div>
          <div class="kre-opts" data-kre-group="ile">
            <button type="button" class="on" data-val="do 20 arów">Do 20 arów</button>
            <button type="button" data-val="od 20 arów do hektara">20 arów - 1 ha</button>
            <button type="button" data-val="powyżej hektara">Powyżej 1 ha</button>
            <button type="button" data-val="wielkość do ustalenia">Nie wiem</button>
          </div>
        </div>
        <div class="kre-step">
          <div class="kre-lab"><i>3</i> Gdzie i kiedy</div>
          <div class="kre-row">
            <input class="kre-in" type="text" data-kre-miasto placeholder="Miejscowość" aria-label="Miejscowość">
            <select class="kre-in" data-kre-termin aria-label="Termin">
              <option value="jak najszybciej">Jak najszybciej</option>
              <option value="w ciągu 2-3 tygodni">W ciągu 2-3 tygodni</option>
              <option value="w tym sezonie">W tym sezonie</option>
              <option value="dopiero planuję">Dopiero planuję</option>
            </select>
          </div>
        </div>
        <div class="kre-prev" data-kre-prev></div>
        <div class="kre-send">
          <a class="btn btn-wa" data-kre-wa href="{WA_HREF}" target="_blank" rel="noopener">{I['wa']} Wyślij na WhatsApp</a>
          <span class="kre-hint">Otworzy się WhatsApp z gotową treścią. Nic nie wyśle się bez Twojego kliknięcia.</span>
        </div>
      </div>
      <div class="kre-side">
        <h3>Wolisz zadzwonić?</h3>
        <p>Jeden telefon wystarczy, żeby ustalić, o jaki teren chodzi i kiedy przyjedziemy go obejrzeć. Jeśli nie odbieramy, jesteśmy przy maszynie. Oddzwonimy.</p>
        <a class="kre-tel" href="{TEL_HREF}">{I['tel']} 694 015 371</a>
      </div>
    </div>
  </div>
</section>'''

BLOCKS['CTA'] = f'''<section class="cta">
  <img src="img/sz/09_ciagnik-kosiarka-bijakowa-w-akcji-m.jpg" alt="" loading="lazy">
  <div class="wrap reveal">
    <span class="eyebrow">Bezpłatna wycena</span>
    <h2>Pokaż nam teren, podamy cenę</h2>
    <p>Do 10 km od Pajęczna przyjeżdżamy obejrzeć teren i wyceniamy bez opłat. Dalej, do 40 km, też dojeżdżamy, a koszt dojazdu mówimy od razu przez telefon.</p>
    <div class="cta-act">
      <a class="btn btn-olive" href="{TEL_HREF}">{I['tel']} Zadzwoń 694 015 371</a>
      <a class="btn btn-wa" href="{WA_HREF}" target="_blank" rel="noopener">{I['wa']} Wyślij zdjęcie na WhatsApp</a>
    </div>
  </div>
</section>'''

BLOCKS.update({k.upper(): v for k, v in I.items()})
BLOCKS['STARS'] = STARS
BLOCKS['TEL_HREF'] = TEL_HREF
BLOCKS['WA_HREF'] = WA_HREF

LOCALBIZ = {
  "@context": "https://schema.org", "@type": "LandscapingBusiness", "@id": DOMAIN + "#firma",
  "name": "Strefa Zieleni", "legalName": FIRMA['nazwa'], "url": DOMAIN,
  "description": "Koszenie, wycinka i przycinka drzew, pielęgnacja ogrodów i sadów, czyszczenie działek pod budowę, stała obsługa terenów zielonych i odśnieżanie. Pajęczno i okolice do 40 km.",
  "telephone": "+48694015371", "email": "sbrowarski89@gmail.com",
  "image": DOMAIN + "img/sz/11_rebak-Negri-sprzet.jpg", "logo": DOMAIN + "img/logo.png",
  "founder": {"@type": "Person", "name": "Szymon Browarski"},
  "address": {"@type": "PostalAddress", "streetAddress": "Cmentarna 46", "addressLocality": "Pajęczno",
              "postalCode": "98-330", "addressRegion": "łódzkie", "addressCountry": "PL"},
  "geo": {"@type": "GeoCoordinates", "latitude": 51.1469952, "longitude": 19.0115607},
  "areaServed": {"@type": "GeoCircle", "geoMidpoint": {"@type": "GeoCoordinates", "latitude": 51.1469952, "longitude": 19.0115607}, "geoRadius": "40000"},
  "aggregateRating": {"@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "22", "bestRating": "5"},
  "hasMap": "https://www.google.com/maps?cid=9829793342128266522",
  "knowsAbout": ["koszenie nieużytków", "wycinka drzew", "przycinka drzew", "pielęgnacja sadów", "czyszczenie działek pod budowę", "odśnieżanie", "rębak do gałęzi"],
}


def page(src):
    raw = src.read_text(encoding='utf-8')
    m = re.match(r'<!--(.*?)-->\s*', raw, re.S)
    meta = json.loads(m.group(1))
    body = raw[m.end():]
    for k, v in BLOCKS.items():
        body = body.replace('{{' + k + '}}', v)
    left = re.findall(r'\{\{[A-Z_]+\}\}', body)
    assert not left, f'{src.name}: niepodstawione {left}'
    out = meta['out']
    canon = DOMAIN + ('' if out == 'index.html' else out)
    og = DOMAIN + meta.get('og', 'img/sz/11_rebak-Negri-sprzet.jpg')
    ld = [LOCALBIZ] + meta.get('ld', [])
    if out != 'index.html':
        ld.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Strona główna", "item": DOMAIN},
            {"@type": "ListItem", "position": 2, "name": meta['crumb'], "item": canon}]})
    lds = '\n'.join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False) + '</script>' for x in ld)
    leaflet = ('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" crossorigin="anonymous">\n'
               if meta.get('map') else '')
    leaflet_js = ('<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js" crossorigin="anonymous"></script>\n'
                  f'<script src="assets/area.js?v={VER}"></script>\n' if meta.get('map') else '')
    robots = '<meta name="robots" content="noindex,follow">\n' if (meta.get('noindex') or not INDEKSUJ) else ''
    preload = f'<link rel="preload" as="image" href="{meta["preload"]}" fetchpriority="high">\n' if meta.get('preload') else ''
    html = f'''<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{meta['title']}</title>
<meta name="description" content="{meta['desc']}">
{robots}<link rel="canonical" href="{canon}">
<meta name="theme-color" content="#27533C">
<meta property="og:type" content="website">
<meta property="og:locale" content="pl_PL">
<meta property="og:site_name" content="Strefa Zieleni">
<meta property="og:title" content="{meta['title']}">
<meta property="og:description" content="{meta['desc']}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{og}">
<link rel="icon" type="image/png" href="img/favicon.png">
<link rel="apple-touch-icon" href="img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
{preload}{leaflet}<link rel="stylesheet" href="assets/styles.css?v={VER}">
{lds}
</head>
<body>
{header(meta.get('nav', ''))}
{body.strip()}
{footer()}
{leaflet_js}<script src="assets/main.js?v={VER}"></script>
</body>
</html>
'''
    (ROOT / out).write_text(html, encoding='utf-8')
    return out, meta


if __name__ == '__main__':
    urls = []
    for f in sorted(SRC.glob('*.html')):
        out, meta = page(f)
        if not meta.get('noindex'):
            urls.append((out, meta.get('prio', '0.7')))
        print('ok', out)
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for out, p in sorted(urls, key=lambda x: -float(x[1])):
        sm.append(f'  <url><loc>{DOMAIN}{"" if out == "index.html" else out}</loc><priority>{p}</priority></url>')
    sm.append('</urlset>')
    (ROOT / 'sitemap.xml').write_text('\n'.join(sm) + '\n', encoding='utf-8')
    robots_txt = (f'User-agent: *\nAllow: /\nDisallow: /_src/\n\nSitemap: {DOMAIN}sitemap.xml\n' if INDEKSUJ
                  else 'User-agent: *\nDisallow: /\n')
    (ROOT / 'robots.txt').write_text(robots_txt, encoding='utf-8')
    print('ok sitemap.xml robots.txt')
