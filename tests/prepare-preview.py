#!/usr/bin/env python3
"""Prepare el árbol público para Wrangler sin archivos locales ni metadatos git."""
from pathlib import Path
import shutil
import sys

root = Path(__file__).resolve().parent.parent
output = root / '_gate' / 'preview'
if len(sys.argv) > 1:
    output = Path(sys.argv[1]).resolve()
if not output.is_relative_to(root / '_gate'):
    raise SystemExit('La salida del preview debe estar dentro de _gate.')
if output.exists():
    raise SystemExit('La salida ya existe; use otro nombre para conservar la evidencia.')
output.mkdir(parents=True)
for name in ('index.html', '404.html', 'styles.css', 'main.js', '_headers',
             '_redirects', 'robots.txt', 'sitemap.xml', 'assets', 'aprender',
             'legal', 'reportar-invasora'):
    source = root / name
    if source.is_dir():
        shutil.copytree(source, output / name)
    else:
        shutil.copy2(source, output / name)
print('Árbol público preparado para Wrangler.')
