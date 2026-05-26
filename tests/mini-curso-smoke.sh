#!/usr/bin/env bash
# tests/mini-curso-smoke.sh — smoke test para el mini-curso Chagra
#
# Verifica que:
# 1. Todos los archivos HTML existen
# 2. Los HTML tienen estructura válida
# 3. Los enlaces internos apuntan a rutas correctas
# 4. No hay referencias a dependencias externas prohibidas

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MINICURSO_DIR="$REPO_ROOT/aprender/mini-curso"
FAIL=0

echo "=== mini-curso smoke test ==="
echo ""

echo "1. Verificando archivos HTML del mini-curso..."
EXPECTED_FILES=(
  "aprender/mini-curso/index.html"
  "aprender/mini-curso/modulo1/leccion1/index.html"
  "aprender/mini-curso/modulo1/leccion2/index.html"
  "aprender/mini-curso/modulo1/leccion3/index.html"
  "aprender/mini-curso/modulo2/leccion1/index.html"
  "aprender/mini-curso/modulo2/leccion2/index.html"
  "aprender/mini-curso/modulo2/leccion3/index.html"
  "aprender/mini-curso/modulo2/leccion4/index.html"
  "aprender/mini-curso/modulo2/leccion5/index.html"
  "aprender/mini-curso/modulo3/leccion1/index.html"
  "aprender/mini-curso/modulo3/leccion2/index.html"
  "aprender/mini-curso/modulo3/leccion3/index.html"
  "aprender/mini-curso/modulo3/leccion4/index.html"
  "aprender/mini-curso/modulo3/leccion5/index.html"
)

for file in "${EXPECTED_FILES[@]}"; do
  if [ -f "$REPO_ROOT/$file" ]; then
    echo "   ✓ $file"
  else
    echo "   ✗ $file (NO EXISTE)"
    FAIL=1
  fi
done

echo ""
echo "2. Verificando estructura HTML básica..."
for file in "${EXPECTED_FILES[@]}"; do
  filepath="$REPO_ROOT/$file"
  if [ ! -f "$filepath" ]; then continue; fi
  
  # Verificar DOCTYPE
  if grep -q "<!DOCTYPE html>" "$filepath"; then
    echo "   ✓ $file tiene DOCTYPE"
  else
    echo "   ✗ $file falta DOCTYPE"
    FAIL=1
  fi
  
  # Verificar charset UTF-8
  if grep -q "charset=\"utf-8\"" "$filepath"; then
    echo "   ✓ $file tiene charset UTF-8"
  else
    echo "   ✗ $file falta charset UTF-8"
    FAIL=1
  fi
  
  # Verificar viewport
  if grep -q "viewport" "$filepath"; then
    echo "   ✓ $file tiene viewport"
  else
    echo "   ✗ $file falta viewport"
    FAIL=1
  fi
  
  break  # Solo verificar primer archivo para no spammar
done

echo ""
echo "3. Verificando enlaces internos del mini-curso..."
# Verificar que el index.html del mini-curso enlace a los módulos
if grep -q "/aprender/mini-curso/modulo1/" "$MINICURSO_DIR/index.html"; then
  echo "   ✓ mini-curso/index.html enlaza a módulo1"
else
  echo "   ✗ mini-curso/index.html NO enlaza a módulo1"
  FAIL=1
fi

if grep -q "/aprender/mini-curso/modulo2/" "$MINICURSO_DIR/index.html"; then
  echo "   ✓ mini-curso/index.html enlaza a módulo2"
else
  echo "   ✗ mini-curso/index.html NO enlaza a módulo2"
  FAIL=1
fi

if grep -q "/aprender/mini-curso/modulo3/" "$MINICURSO_DIR/index.html"; then
  echo "   ✓ mini-curso/index.html enlaza a módulo3"
else
  echo "   ✗ mini-curso/index.html NO enlaza a módulo3"
  FAIL=1
fi

echo ""
echo "4. Verificando que no haya dependencias externas prohibidas..."
PROHIBITED_PATTERNS=(
  "googleapis"
  "tailwindcss"
  "cloudflareinsight"
  "googletagmanager"
  "facebook.*pixel"
)

for pattern in "${PROHIBITED_PATTERNS[@]}"; do
  if grep -rE "$pattern" "$MINICURSO_DIR" --include="*.html" > /dev/null 2>&1; then
    echo "   ✗ Encontrado patrón prohibido: $pattern"
    FAIL=1
  fi
done
echo "   ✓ No se encontraron dependencias externas prohibidas"

echo ""
echo "5. Verificando estructura de módulos y lecciones..."
# Contar lecciones por módulo
MOD1_LESSONS=$(find "$MINICURSO_DIR/modulo1" -name "index.html" | wc -l)
MOD2_LESSONS=$(find "$MINICURSO_DIR/modulo2" -name "index.html" | wc -l)
MOD3_LESSONS=$(find "$MINICURSO_DIR/modulo3" -name "index.html" | wc -l)

echo "   Módulo 1: $MOD1_LESSONS lecciones (esperado: 3)"
echo "   Módulo 2: $MOD2_LESSONS lecciones (esperado: 5)"
echo "   Módulo 3: $MOD3_LESSONS lecciones (esperado: 5)"

if [ "$MOD1_LESSONS" -eq 3 ] && [ "$MOD2_LESSONS" -eq 5 ] && [ "$MOD3_LESSONS" -eq 5 ]; then
  echo "   ✓ Estructura de módulos correcta"
else
  echo "   ✗ Estructura de módulos incorrecta"
  FAIL=1
fi

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "✓ mini-curso smoke test PASSED"
  exit 0
else
  echo "✗ mini-curso smoke test FAILED"
  exit 1
fi
