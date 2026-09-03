# Chagra · landing page (chagra.bio)

Landing estática minimalista para presentar la PWA Chagra, que vive en
`chagra.app` (canónico de producción). Desplegada en **Cloudflare
Pages** y servida en `chagra.bio` — estado medido 2026-09-03, ver §4.1.

- **Sin Google Fonts**, sin Tailwind CDN, sin analítica de Big Tech.
- **CSP estricta**: `default-src 'self'`.
- **Tamaño objetivo:** < 100 KB (HTML + CSS + logo). Los screenshots
  PNG son lo único que puede empujar el total — comprimirlos siempre
  con `pngquant` antes de comitear.
- **Stack:** HTML5 + CSS plano + 1 KB de JS self-hosted (`main.js`)
  cuya única función es degradar imágenes rotas al placeholder SVG.
  Sin frameworks, sin librerías, sin trackers.

---

## 1. Estructura

```
landing/
├── index.html                  # página única
├── styles.css                  # CSS self-hosted
├── main.js                     # ~1 KB; solo degrada imgs rotas
├── _headers                    # cabeceras seguridad (Cloudflare Pages)
├── _redirects                  # bloqueo crawlers LLM + atajos
├── robots.txt                  # opt-out crawlers LLM
├── sitemap.xml                 # sitemap mínimo
├── README.md                   # este archivo
└── assets/
    ├── chagra-logo.svg         # logo placeholder verde (operator
    │                             reemplaza por el oficial)
    ├── screenshot-placeholder.svg  # fallback si los PNG no están
    ├── chagra-screenshot-1.png.PLACEHOLDER  # tomar captura real
    ├── chagra-screenshot-2.png.PLACEHOLDER  # tomar captura real
    └── chagra-screenshot-3.png.PLACEHOLDER  # tomar captura real
```

---

## 2. Tomar y reemplazar screenshots

Cada `.PLACEHOLDER` describe qué pantalla capturar. Resumen:

1. `chagra-screenshot-1.png` → modal WelcomeStatsHero expandido.
2. `chagra-screenshot-2.png` → diagnóstico foto IA.
3. `chagra-screenshot-3.png` → agente conversacional.

Resolución sugerida: 375×812 (iPhone X) o 360×800 (Android mid-range).

Optimizar siempre:

```bash
pngquant --quality=65-80 --strip --output chagra-screenshot-1.png chagra-screenshot-1.png
```

Si al deploy aún no hay PNGs reales, la landing degrada
automáticamente al `screenshot-placeholder.svg` vía el `onerror`
del `<img>`. **No rompe la página**, sólo se ve "captura pendiente".

---

## 3. Probar localmente

```bash
cd /home/kortux/Workspace/Chagra-strategy/landing
python3 -m http.server 8080
# Abrir http://localhost:8080
```

Verificar en DevTools (Network tab):
- 0 requests a dominios externos.
- 0 cookies de terceros.
- Lighthouse → Performance, Accessibility, Best Practices, SEO.

---

## 4. Deploy a Cloudflare Pages

### 4.1 Estado de los dominios (verificado 2026-09-03)

Ambos dominios están **registrados y activos** — la compra ya se hizo.
(En qué registrar y precio de renovación: sin verificar, WHOIS no
disponible desde este entorno.) `chagra.app` es el canónico de
producción de la PWA: `chagra.guatoc.co` responde `301 → https://chagra.app/`.

| Dominio | Qué sirve (medido 2026-09-03) | Verificación |
|---|---|---|
| `chagra.app` | La **PWA** de producción, no esta landing | `curl -s -o /dev/null -w '%{http_code}' https://chagra.app` → `200` |
| `chagra.bio` | **Esta landing** (HTML idéntico a `chagra-landing.pages.dev` salvo la ofuscación de emails que Cloudflare inyecta) | `curl -s -o /dev/null -w '%{http_code}' https://chagra.bio` → `200` |

Para re-medir en vez de creerle a este archivo:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://chagra.app   # 200
curl -s -o /dev/null -w '%{http_code}\n' https://chagra.bio   # 200
curl -sI https://chagra.guatoc.co | grep -i '^location'       # location: https://chagra.app/
```

### 4.2 DNS en Cloudflare — ya hecho

Ambas zonas ya viven en Cloudflare, cada dominio en su propia zona
(pares de NS distintos). Medido 2026-09-03:

```bash
dig +short NS chagra.app
# kurt.ns.cloudflare.com.
# tia.ns.cloudflare.com.
dig +short NS chagra.bio
# paige.ns.cloudflare.com.
# sri.ns.cloudflare.com.
```

### 4.3 Crear el proyecto en Cloudflare Pages

**Ya ejecutado (Vía A):** este repo (`guatoc-ecohub/chagra-landing`,
ver `git remote -v`) está conectado, y `chagra-landing.pages.dev`
sirve el `index.html` de `main` idéntico byte a byte (sha256
comparado 2026-09-03). Lo que sigue queda como referencia:

#### Vía A — Conectar repo Git (recomendada, auto-deploy en cada push)

1. Subir esta carpeta `landing/` como repo standalone, por ejemplo
   `kortux/chagra-landing` (puede ser público o privado). El repo
   `Chagra-strategy` es privado y NO debería conectarse directo a CF
   Pages porque expone más de lo necesario.
2. Cloudflare Dashboard → *Workers & Pages* → *Create application* →
   *Pages* → *Connect to Git* → autorizar la cuenta GitHub →
   seleccionar `chagra-landing`.
3. Configuración del build:
   - **Framework preset:** *None*.
   - **Build command:** dejar vacío.
   - **Build output directory:** `/` (raíz).
4. *Save and deploy*. CF da una URL tipo `chagra-landing.pages.dev`.

#### Vía B — Subir manualmente con Wrangler (sin Git)

```bash
npm install -g wrangler
wrangler login
cd /home/kortux/Workspace/Chagra-strategy/landing
wrangler pages deploy . --project-name=chagra-landing
```

Útil para iteración rápida hoy/mañana, pero perdés auto-deploy.

### 4.4 Dominios custom — estado real (verificado 2026-09-03)

El plan original (ambos dominios apuntando a esta landing) no se
aplicó así:

- `chagra.bio` **sí** sirve esta landing (HTML idéntico al de
  `chagra-landing.pages.dev`; solo difiere la ofuscación de emails
  que Cloudflare inyecta al vuelo).
- `chagra.app` sirve la **PWA** de producción, no esta landing: no
  apunta a `chagra-landing.pages.dev`.
- `www` sigue sin funcionar: `dig www.chagra.app` → `NXDOMAIN`, y
  `www.chagra.bio` resuelve pero responde `522` (Cloudflare no llega
  al origen). La redirección www → apex queda pendiente.

(El registro CNAME exacto de cada dominio no es observable desde
fuera — el proxy de Cloudflare oculta el origen. Lo anterior se midió
comparando el HTML y los headers servidos por cada dominio.)

### 4.5 Verificación post-deploy

```bash
# SSL y respuesta
curl -I https://chagra.app
curl -I https://chagra.bio

# CSP y headers de seguridad activos (en la landing: chagra.bio)
curl -sI https://chagra.bio | grep -iE 'content-security|x-frame|strict-transport'

# CTA apuntando a la PWA (la landing vive en chagra.bio)
curl -s https://chagra.bio | grep -c 'href="https://chagra.app"'   # → 2

# Lighthouse desde CLI (opcional)
npx lighthouse https://chagra.app --only-categories=performance,accessibility,seo
```

Lighthouse esperado: ≥ 95 en las 4 categorías (página sin JS, sin
imágenes grandes hasta que entren los screenshots reales).

---

## 5. Cambios futuros

- **Antes de mergear** cualquier copy nuevo, probar local con
  `python3 -m http.server 8080` y revisar en móvil emulado.
- **URL de la PWA:** ya resuelta — `https://chagra.app` es producción
  y `chagra.guatoc.co` hace `301` hacia ella (medido 2026-09-03).
  `index.html` ya apunta ahí: 3 ocurrencias de `https://chagra.app`,
  0 de `chagra.guatoc.co`. Pendiente menor (fuera de esta corrección
  de docs): `_redirects` sigue mandando `/app` → `chagra.guatoc.co`
  (cadena 302 → 301, indirecta).
- **Logo oficial**: reemplazar `assets/chagra-logo.svg` manteniendo
  el viewbox 64×64 para no romper el header.

---

## 6. Soberanía — checklist a mantener intacta

Cualquier PR a esta landing debe seguir cumpliendo:

- [ ] 0 dominios externos en HTML/CSS (`grep -E 'https?://' index.html`
      sólo debe mostrar URLs hacia `chagra.app`, `guatoc.co`,
      `chagra.bio` (assets) y GitHub — inventario medido 2026-09-03).
- [ ] 0 `<script>` en runtime (excepto la inline `onerror` de imágenes).
- [ ] CSP en `_headers` permanece `default-src 'self'`.
- [ ] Peso total `< 200 KB` con los 3 PNG de screenshots ya optimizados.
- [ ] `robots.txt` sigue bloqueando crawlers LLM.

---

## 7. Licencia

Esta landing es parte de Chagra y se publica bajo **AGPL-3.0**,
mismo régimen que la PWA. Ver `/LICENSE` en el repo público de Chagra.
