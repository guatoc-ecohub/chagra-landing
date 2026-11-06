#!/usr/bin/env python3
"""Verifique por GET la navegación pública y la migración de cursos en Pages."""
import argparse
import hashlib
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.error import HTTPError
from urllib.parse import unquote, urljoin, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, build_opener
import xml.etree.ElementTree as ET


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids = set()
        self.links = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'a' and attrs.get('name'):
            self.ids.add(attrs['name'])
        for attr in ('href', 'src', 'poster'):
            if attrs.get(attr):
                self.links.append(attrs[attr])
        if attrs.get('property') == 'og:image':
            self.links.append(attrs['content'])
        if attrs.get('srcset'):
            self.links.extend(part.strip().split()[0] for part in attrs['srcset'].split(','))


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def page_path(path):
    if path.name == 'index.html':
        return '/' + str(path.parent).strip('/') + '/' if path.parent != Path('.') else '/'
    return '/' + str(path.with_suffix(''))


def legacy_routes():
    edu = 'https://edu.chagra.bio/'
    courses = {
        '/aprender/curso': edu + 'cursos/aprende-a-usar-chagra/',
        '/aprender/bioseguridad': edu + 'cursos/bioseguridad/',
        '/aprender/transicion-15-15-15': edu + 'cursos/transicion-15-15-15/',
        '/aprender/unidad/bioseguridad': edu + 'cursos/bioseguridad/',
        '/aprender/unidad/transicion-15-15-15': edu + 'cursos/transicion-15-15-15/',
        '/aprender/mini-curso': edu,
    }
    for module, lessons in ((1, 3), (2, 5), (3, 5)):
        for lesson in range(1, lessons + 1):
            target = ('cursos/aprende-a-usar-chagra/' if module == 1 else
                      'compost/' if module == 2 and lesson == 5 else
                      'biopreparados/' if module == 2 else 'control-biologico/')
            courses[f'/aprender/mini-curso/modulo{module}/leccion{lesson}'] = edu + target
    return [(source + suffix, target) for source, target in courses.items()
            for suffix in ('', '/', '/index.html')]


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('url')
    ap.add_argument('--root', type=Path, default=Path(__file__).resolve().parent.parent)
    args = ap.parse_args()
    base = args.url.rstrip('/')
    opener = build_opener(NoRedirect)
    opener.addheaders = [("User-Agent", "curl/8.14.1")]
    cache = {}
    failures = []

    def fail(message):
        failures.append(message)
        print('FAIL:', message)

    def get(url):
        if url not in cache:
            try:
                response = opener.open(url, timeout=30)
            except HTTPError as error:
                response = error
            with response:
                cache[url] = (response.status, dict(response.headers), response.read())
        return cache[url]

    def resolve(url):
        for _ in range(8):
            code, headers, body = get(url)
            if code in (301, 302, 303, 307, 308):
                url = urljoin(url, headers.get('Location', headers.get('location', '')))
                continue
            return url, code, body
        raise RuntimeError('Cadena de redirecciones demasiado larga: ' + url)

    code, _, home = get(base + '/')
    if code != 200 or b'id="lienzo"' not in home:
        raise RuntimeError('El servidor no responde con la portada esperada')
    home_hash = hashlib.sha256(home).digest()
    references = set()
    pages = 0
    for file in sorted(args.root.rglob('*.html')):
        relative = file.relative_to(args.root)
        if any(part.startswith('.') or part in ('node_modules', '_gate') for part in relative.parts):
            continue
        source = page_path(relative)
        doc = Document(file.read_text())
        pages += 1
        references.add((source, source))
        references.update((source, value) for value in doc.links)
    for source, value in sorted(references):
        link = urlsplit(urljoin('https://chagra.bio' + source, value))
        if link.scheme not in ('http', 'https') or link.netloc != 'chagra.bio':
            continue
        url = base + urlunsplit(('', '', link.path, link.query, ''))
        final, code, body = resolve(url)
        if code != 200:
            fail(f'{source} → {value}: HTTP {code}')
        elif link.path != '/' and hashlib.sha256(body).digest() == home_hash:
            fail(f'{source} → {value}: devuelve la portada')
        elif link.fragment and unquote(link.fragment) not in Document(body.decode(errors='replace')).ids:
            fail(f'{source} → {value}: ancla ausente')
    for source, target in legacy_routes():
        code, headers, _ = get(base + source)
        location = headers.get('Location', headers.get('location'))
        if code != 301 or location != target:
            fail(f'{source}: esperado 301 → {target}; recibido {code} → {location}')
    for target in sorted({target for _, target in legacy_routes()}):
        final, code, body = resolve(target)
        if code != 200 or b'<canvas' not in body or b'<title>' not in body:
            fail(f'Destino educativo sin contenido: {target} HTTP {code}')
    for js in args.root.rglob('*.js'):
        relative = js.relative_to(args.root)
        if any(part.startswith('.') or part in ('node_modules', '_gate') for part in relative.parts):
            continue
        for value in re.findall(r"fetch\(['\"]([^'\"]+)['\"]", js.read_text()):
            link = urljoin(base + '/' + str(relative), value)
            if urlsplit(link).netloc == urlsplit(base).netloc and get(link)[0] != 200:
                fail(f'{relative}: recurso de fetch no disponible')
    retired = ['/huella-nevado', '/huella-nevado.html']
    retired += [f'/manual/mv-{topic}{suffix}' for topic in ('milpa', 'siembra', 'sipsa', 'voz-registro')
                for suffix in ('', '.html')]
    for path in retired:
        if get(base + path)[0] != 404:
            fail('La página retirada sigue disponible: ' + path)
    _, _, robots = get(base + '/robots.txt')
    if b'Sitemap: https://chagra.bio/sitemap.xml' not in robots:
        fail('robots.txt apunta a otro sitemap')
    code, _, xml = get(base + '/sitemap.xml')
    if code != 200:
        fail('sitemap no disponible')
    else:
        for loc in ET.fromstring(xml).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
            link = urlsplit(loc.text)
            if link.netloc != 'chagra.bio' or get(base + link.path)[0] != 200:
                fail('El sitemap incluye una URL ajena o redirigida: ' + loc.text)
    code, _, body = get(base + '/control-ruta-inexistente-bio')
    if code != 404 or body == home:
        fail('Control negativo: la ruta inexistente debe dar 404 propio')
    code, _, body = get(base + '/.git/config')
    if code != 404:
        fail('El servidor expone metadatos de git')
    targets = {target for _, target in legacy_routes()}
    print(f'HTML: {pages}; referencias: {len(references)}; redirecciones antiguas: {len(legacy_routes())}; destinos educativos: {len(targets)}; fallos: {len(failures)}')
    return bool(failures)


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as error:
        print('NO SÉ: no se pudo completar la verificación:', error, file=sys.stderr)
        sys.exit(2)
