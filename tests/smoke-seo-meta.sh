#!/usr/bin/env bash
# tests/smoke-seo-meta.sh — verifica meta description y comentarios HTML útiles
#
# Smoke test para detectar regresiones en SEO básico:
# - Meta description presente y bajo 160 caracteres
# - Comentarios HTML que guían futuros maintainers
#
# Uso:
#   ./tests/smoke-seo-meta.sh
#
# Exit codes:
#   0 — OK
#   1 — Meta description faltante o demasiado larga
#   2 — Comentario HTML faltante

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INDEX_HTML="$REPO_ROOT/index.html"

FAIL=0

echo "=== smoke-seo-meta.sh ==="
echo ""

echo "1. ¿index.html tiene <meta name=\"description\">?"
if ! grep -q '<meta name="description"' "$INDEX_HTML"; then
    echo "   FAIL: meta description faltante"
    FAIL=1
else
    echo "   OK:   meta description presente"
fi

echo ""
echo "2. ¿Meta description ≤ 160 caracteres (límite SERP)?"
META_DESC=$(grep -oP '(?<=<meta name="description" content=")[^"]+' "$INDEX_HTML" || echo "")
if [ -z "$META_DESC" ]; then
    echo "   FAIL: no se pudo extraer meta description"
    FAIL=1
else
    LEN=${#META_DESC}
    echo "   Longitud: $LEN caracteres"
    echo "   Contenido: \"$META_DESC\""
    if [ "$LEN" -gt 160 ]; then
        echo "   FAIL: meta description excede 160 caracteres (será truncada)"
        FAIL=1
    else
        echo "   OK:   longitud apropiada para SERPs"
    fi
fi

echo ""
echo "3. ¿Hay comentario HTML útil cerca de meta description?"
# Busca en las 3 líneas anteriores y posteriores a la meta description
CONTEXT=$(grep -B3 -A3 '<meta name="description"' "$INDEX_HTML" || echo "")
if echo "$CONTEXT" | grep -q 'SEO.*Meta description'; then
    echo "   OK:   comentario HTML presente"
else
    echo "   FAIL: comentario HTML faltante (ayuda a futuros maintainers)"
    FAIL=2
fi

echo ""
if [ "$FAIL" -eq 0 ]; then
    echo "smoke-seo-meta OK"
    exit 0
else
    echo "smoke-seo-meta FAIL (exit $FAIL)"
    exit "$FAIL"
fi
