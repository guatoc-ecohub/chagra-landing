# Chagra · landing page (chagra.app + chagra.bio)

Landing estática minimalista para presentar la PWA Chagra en
`chagra.app` y `chagra.bio`. Pensada para deploy a **Cloudflare Pages**.

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

### 4.1 Registrar los dominios

`chagra.app` y `chagra.bio` no están registrados todavía. Opciones
recomendadas (no requieren cuenta corporativa, aceptan tarjeta CO):

| Registrar | `.app` aprox | `.bio` aprox | Notas |
|---|---|---|---|
| **Cloudflare Registrar** | ~14 USD/año | ~50 USD/año | At-cost, sin markup. Ideal si los DNS ya están en CF. |
| **Porkbun** | ~12 USD/año | ~45 USD/año | UX simple, WHOIS privacy gratis. |
| **Namecheap** | ~14 USD/año | ~50 USD/año | Conocido en LATAM. |

**Recomendación:** comprar `chagra.app` ya (más fácil de recordar
para usuarios y aliados). `chagra.bio` puede esperar 24-48h si presupuesto justo.

### 4.2 Apuntar DNS a Cloudflare

Si compras en **Cloudflare Registrar**: los nameservers ya quedan en
CF; salta al paso 4.3.

Si compras en **Porkbun / Namecheap**:

1. Crear cuenta gratis en https://dash.cloudflare.com
2. *Add Site* → escribir `chagra.app` → plan Free.
3. CF te dará 2 nameservers tipo `xxx.ns.cloudflare.com`.
4. En el registrar, panel DNS → cambiar nameservers por los dos de CF.
5. Esperar 5–30 minutos (a veces hasta 4h) para propagación.
6. Repetir para `chagra.bio`.

Verificar:

```bash
dig +short NS chagra.app
dig +short NS chagra.bio
```

Ambos deben mostrar los nameservers de Cloudflare.

### 4.3 Crear el proyecto en Cloudflare Pages

Hay dos vías. Elegir una:

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

### 4.4 Asociar los dominios custom

Una vez el proyecto `chagra-landing` esté creado:

1. Pages → proyecto `chagra-landing` → *Custom domains*.
2. *Set up a custom domain* → `chagra.app` → CF crea automáticamente
   el registro `CNAME chagra.app → chagra-landing.pages.dev` (porque
   los NS ya están en CF).
3. Esperar el SSL (Let's Encrypt vía CF, suele tardar 1–3 min).
4. Repetir para `chagra.bio`.
5. Opcional: redirigir `www.chagra.app` → `chagra.app` con un Page
   Rule o Bulk Redirect.

### 4.5 Verificación post-deploy

```bash
# SSL y respuesta
curl -I https://chagra.app
curl -I https://chagra.bio

# CSP y headers de seguridad activos
curl -sI https://chagra.app | grep -iE 'content-security|x-frame|strict-transport'

# CTA apuntando a la PWA
curl -s https://chagra.app | grep -o 'href="https://chagra.guatoc.co"'

# Lighthouse desde CLI (opcional)
npx lighthouse https://chagra.app --only-categories=performance,accessibility,seo
```

Lighthouse esperado: ≥ 95 en las 4 categorías (página sin JS, sin
imágenes grandes hasta que entren los screenshots reales).

---

## 5. Cambios futuros

- **Antes de mergear** cualquier copy nuevo, probar local con
  `python3 -m http.server 8080` y revisar en móvil emulado.
- **URL de la PWA** (`https://chagra.guatoc.co`) es placeholder.
  Cuando esté la URL final (ej. `https://app.chagra.app`), buscar y
  reemplazar en `index.html` (3 ocurrencias).
- **Logo oficial**: reemplazar `assets/chagra-logo.svg` manteniendo
  el viewbox 64×64 para no romper el header.

---

## 6. Soberanía — checklist a mantener intacta

Cualquier PR a esta landing debe seguir cumpliendo:

- [ ] 0 dominios externos en HTML/CSS (`grep -E 'https?://' index.html`
      sólo debe mostrar URLs hacia `chagra.guatoc.co`, GitHub, AGPL).
- [ ] 0 `<script>` en runtime (excepto la inline `onerror` de imágenes).
- [ ] CSP en `_headers` permanece `default-src 'self'`.
- [ ] Peso total `< 200 KB` con los 3 PNG de screenshots ya optimizados.
- [ ] `robots.txt` sigue bloqueando crawlers LLM.

---

## 7. Licencia

Esta landing es parte de Chagra y se publica bajo **AGPL-3.0**,
mismo régimen que la PWA. Ver `/LICENSE` en el repo público de Chagra.
