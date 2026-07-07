# Propuesta de copy honesto — landing chagra.bio

> **Estado: BORRADOR para aprobación del operador.** No publicar sin visto bueno.
> El operador controla el mensaje de marketing. Esta rama trae los cambios ya
> aplicados a `index.html` y `legal/index.html` para revisar el "antes / después"
> frase por frase y aceptar, ajustar o descartar.

## Por qué

El landing sobre-prometía de formas que **no son literalmente ciertas** y que erosionan
la confianza (y crean riesgo reputacional/legal). El patrón repetido era dar a entender
que **la IA vive dentro del teléfono** ("IA local en el celular", "on-device AI",
"100% LOCAL", "la imagen se procesa en el dispositivo") y que **los datos jamás salen
del celular**.

La fuerza del mensaje (soberanía, campo sin señal, no-nube-extranjera, energía solar,
software libre, datos que no se venden) **se mantiene intacta** — solo se corrige lo que
no era verdad, y se hace la distinción con gracia.

## La realidad técnica (lo que sí / lo que no)

| Afirmación | ¿Cierto? | Matiz |
|---|---|---|
| Funciona sin señal en el campo (offline-first) | ✅ Sí | La app (PWA) guarda y consulta lo que ya está en el celular sin conexión. |
| La IA/agente vive en el teléfono ("on-device", "100% local") | ❌ No | El modelo de lenguaje corre en un **servidor propio** (autoalojado, energía solar), **no en el celular**. El agente se consulta **por red**. |
| El agente responde aunque no haya señal | ❌ No | Necesita señal para pensar. Sin señal, la app sigue guardando/consultando lo local. |
| Las fotos se procesan en el dispositivo | ❌ No | El reconocimiento por visión ocurre en el servidor propio cuando hay señal. |
| Tus datos **nunca** salen del celular | ⚠️ Parcial | Los registros de campo se guardan **primero** en el celular (local) y son del usuario; hay **sincronización opcional** con farmOS (servidor). No es "nunca salen". |
| Sin nube **extranjera** / no Big Tech cloud | ✅ Sí | Infraestructura propia autoalojada, no AWS/Google/OpenAI. Diferencial real y verdadero. |
| 100% energía solar off-grid | ✅ Sí | El servidor que sirve la IA corre con energía solar autogenerada. |
| IA que no inventa (anclada a catálogo verificado) | ✅ Sí | Grounding sobre catálogo con fuentes (AGROSAVIA, ICA, IDEAM, Humboldt). |
| Software libre AGPL-3.0, auditable | ✅ Sí | Público en GitHub. |
| Los datos del usuario no se venden | ✅ Sí | Diferencial vs. apps comerciales. |

**Distinción clave que ahora hace el copy:**
_"Funciona sin señal"_ (cierto, es la app) **≠** _"la IA vive en tu teléfono"_ (falso).
Línea puente usada: **"Cuando hay señal, Chagra piensa con más fuerza; sin señal, sigue
guardando y cuidando tu finca."**

---

## Antes / Después — `index.html`

### 1. Meta description (SEO/preview)
- **Antes:** "…Conocimiento agroecológico verificado **en el celular** del campesino colombiano. **Sin internet**, sin nube extranjera, 100% energía solar off-grid. **Una IA local** que no inventa. Open source AGPL-3.0."
- **Después:** "…Conocimiento agroecológico verificado **para** el campesino colombiano. **Funciona en el campo sin señal**, con **IA soberana** alimentada por energía solar off-grid, sin nube extranjera. Una IA que no inventa: anclada a un catálogo verificado. Software libre AGPL-3.0."

### 2. Open Graph description
- **Antes:** "…una **IA local** que no inventa, 100% energía solar off-grid. Asesor agroecológico que **funciona sin internet**…"
- **Después:** "…una **IA soberana** que no inventa, alimentada 100% con energía solar off-grid. Asesor agroecológico **offline-first** que responde en el campo…"

### 3. Hero — descripción campesino (ES)
- **Antes:** "…una **IA local en el celular** del campesino. **Sin internet.** Sin nube extranjera. Sin agroquímicos. Con energía del sol."
- **Después:** "…una **IA soberana al servicio** del campesino. **Funciona sin señal en el campo.** Sin nube extranjera. Sin agroquímicos. Con energía del sol."

### 4. Hero — descripción institución (ES)
- **Antes:** "…una **IA local** que no inventa. **Funciona sin internet, sin nube** y 100% con energía solar off-grid."
- **Después:** "…una IA que no inventa, **anclada a un catálogo con fuentes**. **Offline-first, sin nube extranjera** y alimentada 100% con energía solar off-grid."

### 5. Hero — descripción campesino (EN)
- **Antes:** "…a **local AI in the farmer's phone**. **Offline.** No foreign cloud…"
- **Después:** "…a **sovereign AI serving the farmer**. **Works offline in the field.** No foreign cloud…"

### 6. Hero — descripción institución (EN)
- **Antes:** "…an **on-device AI** that does not hallucinate. **Runs offline, with no cloud**…"
- **Después:** "…an AI that does not hallucinate, **grounded in a sourced catalogue**. **Offline-first, with no foreign cloud**…"

### 7. Sello de soberanía (SVG circular + aria-label) — CAMBIO VISUAL
- **Antes:** aria-label "…**100% local**…" · texto del sello "· SIN NUBE · **100% LOCAL** · ENERGÍA SOLAR"
- **Después:** aria-label "…**soberana**…" · texto del sello "· SIN NUBE · **SOBERANA** · ENERGÍA SOLAR"
- _Nota:_ es el único cambio con impacto **visual** (el sello del hero). Requiere OK visual del operador.

### 8. Pilar 01 — "Soberanía total"
- **Antes:** "…La IA corre en un servidor propio, alimentado por el sol. **Cero nube, cero red. Tu dato nunca sale del celular.**"
- **Después:** "…La IA corre en un servidor propio **de la comunidad**, alimentado por el sol — **no en las nubes de las multinacionales**. **Tus datos de campo se guardan primero en tu celular y son tuyos: nunca se venden.**"
- _Por qué:_ "cero red" contradice que la IA está en un servidor (necesita red); "nunca sale del celular" es falso por la sincronización.

### 9. Pilar 02 — asesor por voz
- **Antes:** título "Asesor **sin internet**, por voz" · "PWA offline-first: **responde en la finca aunque no haya señal.** Pregúntale hablando…"
- **Después:** título "Asesor por voz, **offline-first**" · "PWA offline-first: **guarda y consulta tu finca aunque no haya señal. Cuando vuelve la red**, pregúntale hablando y te contesta en voz alta…"

### 10. Capacidad — foto de planta/plaga
- **Antes:** "…el agente la reconoce… **La imagen se procesa en el dispositivo, no se sube a ninguna nube.**"
- **Después:** "…**cuando hay señal**, el agente la reconoce… **Tus fotos se guardan en tu celular y solo se procesan en nuestro servidor propio — nunca en una nube extranjera.**"

### 11. Capacidad — "Funciona sin internet" (PWA)
- **Antes:** "…offline-first: **responde en la finca aunque no haya señal y tus datos nunca salen del celular.**"
- **Después:** "…offline-first: **guarda y consulta tu finca aunque no haya señal, y tus datos se quedan en tu celular hasta que tú decidas sincronizarlos. Cuando hay señal, Chagra piensa con más fuerza.**"
- _Nota:_ el título de la sección "Funciona sin internet" se conserva (es cierto a nivel de app: la PWA funciona offline).

### 12. Tarjeta de confianza — IA
- **Antes:** título "**IA local en el dispositivo**" · "…un modelo de lenguaje abierto **y local**, y lee las fotos con **visión por computador**. Sin nube de terceros."
- **Después:** título "**IA soberana, sin nube extranjera**" · "…un modelo de lenguaje abierto que **corre en nuestro propio servidor solar, no en la nube de una multinacional. Cuando hay señal**, también lee las fotos con visión por computador."

### 13. Sección soberanía — título
- **Antes:** "**Cero nube, cero red.** Soberanía completa."
- **Después:** "**Sin nube extranjera. Con el sol.** Soberanía real."

### 14. Bullet soberanía — IA
- **Antes:** título "**IA local groundeada**" · "…un modelo abierto **y local** anclado al catálogo… **Visión por computador en el dispositivo**, sin nube de terceros."
- **Después:** título "**IA soberana y groundeada**" · "…un modelo abierto, **alojado en nuestro propio servidor**, anclado al catálogo… **Cuando hay señal**, también lee fotos con visión por computador — sin nube extranjera."

### 15. Tabla comparativa — fila "Inteligencia artificial"
- **Antes:** "**Local en el dispositivo**" (vs. "Nube de terceros")
- **Después:** "**Soberana · sin nube extranjera**" (vs. "Nube de terceros")

### 16. Tabla comparativa — fila "Datos del usuario"
- **Antes:** "**Nunca salen del celular**" (vs. "Captura y monetización")
- **Después:** "**Tuyos · se guardan en tu celular · nunca se venden**" (vs. "Captura y monetización")

---

## Antes / Después — `legal/index.html`

La página legal ya era **la más honesta** del sitio (la cláusula 4.1 reconoce
explícitamente la sincronización opcional con farmOS). Solo se alinea el término
"IA local" para quitar la lectura de "on-device":

### 17. Naturaleza del servicio (cláusula 3)
- **Antes:** "Funcionalidad de **IA local** (modelos abiertos)… sin envío de datos a servicios de terceros."
- **Después:** "Funcionalidad de **IA soberana** (modelos abiertos **autoalojados en infraestructura propia, no en nubes de terceros**)… sin envío de datos a servicios de terceros."

### 18. Limitación de responsabilidad (cláusula 6)
- **Antes:** "…falsos positivos/negativos de los modelos de **IA locales**."
- **Después:** "…falsos positivos/negativos de los modelos de **IA**."

---

## Lo que se conservó intacto (el diferencial verdadero)

- **Offline-first** de la app (funciona sin señal para lo guardado) — cierto y central.
- **Sin nube extranjera** / no Big Tech — cierto, es el diferencial de soberanía.
- **100% energía solar off-grid** del servidor — cierto y único.
- **IA que no inventa** (grounding sobre catálogo con fuentes) — cierto.
- **Software libre AGPL-3.0, auditable** — cierto.
- **Datos que no se venden** — cierto (contraste con apps comerciales).
- Fila "Funciona sin internet → Sí — PWA offline" de la tabla — se conserva
  (es cierto a nivel de app; el matiz de que la IA necesita señal ya está en el copy).

## Verificación hecha

- `index.html`: 0 residuos de `IA local` / `on-device` / `100% local` / `nunca sale(n)`
  / `cero red` / `se procesa en el dispositivo`.
- `legal/index.html`: 0 residuos de `IA local` / `modelos de IA locales`.
- Bloques de idioma balanceados (167 `es` / 167 `en`) — no se rompió el toggle ES/EN.
- Smoke de CSS (`tests/smoke-css-coverage.sh`) en verde. Solo se tocó **texto**, no CSS ni clases.

## Puntos abiertos para el operador

1. **OK visual** del sello del hero (cambio "100% LOCAL" → "SOBERANA").
2. Madurez real del **reconocimiento por foto** (visión): el copy dice "cuando hay señal…";
   verificar que la capacidad esté a la altura de lo prometido antes de destacarla.
3. ¿Se aprueba también el ajuste en `legal/` (texto que controla el DPO)?
