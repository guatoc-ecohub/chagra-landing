#!/usr/bin/env bash
# tests/smoke-css-coverage.sh — detecta regresiones tipo "icono gigante" / "se ve asqueroso"
#
# Verifica que styles.css en producción contiene las clases críticas y que
# los HTMLs referencian CSS con cache-bust. Detecta el bug 2026-05-21 donde
# Cloudflare cacheó styles.css 24h y servía version vieja sin .aprender-card.
#
# Uso:
#   ./tests/smoke-css-coverage.sh                  # verifica producción
#   ./tests/smoke-css-coverage.sh https://staging  # verifica staging
#
# Exit codes:
#   0 — OK
#   1 — CSS critical class missing in production
#   2 — HTML reference CSS without cache-bust query string

set -euo pipefail

BASE_URL="${1:-https://chagra.bio}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

REQUIRED_CLASSES=(
  "\.aprender-grid"
  "\.aprender-card"
  "\.aprender-card-icon"
  "\.article-page"
  "\.aprender-tag"
)

FAIL=0

echo "=== smoke-css-coverage.sh @ $BASE_URL ==="

echo ""
echo "1. ¿styles.css en producción contiene las clases críticas?"
REMOTE_CSS=$(curl -sf "$BASE_URL/styles.css?cb=$(date +%s)" || echo "")
if [ -z "$REMOTE_CSS" ]; then
  echo "   FAIL: no se pudo descargar /styles.css"
  exit 1
fi
for CLS in "${REQUIRED_CLASSES[@]}"; do
  COUNT=$(echo "$REMOTE_CSS" | grep -cE "$CLS" || true)
  if [ "$COUNT" -eq 0 ]; then
    echo "   FAIL: clase $CLS NO aparece en /styles.css (cache stale o regresión)"
    FAIL=1
  else
    echo "   OK:   $CLS ($COUNT match)"
  fi
done

echo ""
echo "2. ¿Local styles.css == Remote styles.css (sin cache)?"
LOCAL_SIZE=$(wc -c < "$REPO_ROOT/styles.css")
REMOTE_SIZE=$(echo -n "$REMOTE_CSS" | wc -c)
DIFF=$((LOCAL_SIZE > REMOTE_SIZE ? LOCAL_SIZE - REMOTE_SIZE : REMOTE_SIZE - LOCAL_SIZE))
echo "   Local:  $LOCAL_SIZE bytes"
echo "   Remote: $REMOTE_SIZE bytes (diff $DIFF)"
if [ "$DIFF" -gt 2000 ]; then
  echo "   WARN: diferencia >2KB sugiere cache stale o deploy no aplicado"
  FAIL=1
fi

echo ""
echo "3. ¿Cada HTML que use /styles.css tiene cache-bust (?v=)?"
HTMLS=$(find "$REPO_ROOT" -name "*.html" -not -path "*/.git/*" -not -path "*/.claude/*" -not -path "*/node_modules/*")
for HTML in $HTMLS; do
  REL=${HTML#$REPO_ROOT/}
  if grep -qE 'href="/?styles\.css"' "$HTML"; then
    echo "   FAIL: $REL referencia styles.css sin ?v= cache-bust"
    FAIL=2
  fi
done

echo ""
echo "4. ¿/aprender/ index.html no tiene SVGs huérfanos (sin width/height/class/style)?"
APRENDER_INDEX="$REPO_ROOT/aprender/index.html"
if [ -f "$APRENDER_INDEX" ]; then
  UNSIZED=$(python3 -c "
import re
with open('$APRENDER_INDEX') as f:
    content = f.read()
unsized = []
for m in re.finditer(r'<svg([^>]*)>', content):
    attrs = m.group(1)
    if not re.search(r'width=|height=|class=|style=', attrs):
        unsized.append(attrs[:80])
for u in unsized:
    print(u)
")
  if [ -n "$UNSIZED" ]; then
    echo "   FAIL: aprender/index.html tiene SVGs sin tamaño/clase:"
    echo "$UNSIZED" | sed 's/^/         /'
    FAIL=1
  else
    echo "   OK:   todos los SVGs de aprender/index.html tienen tamaño/clase"
  fi
fi

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "smoke-css-coverage OK"
  exit 0
else
  echo "smoke-css-coverage FAIL (exit $FAIL)"
  exit "$FAIL"
fi
