# INFORME BIO-CLOUDFLARE-20261008 — previews de Cloudflare Pages y www.chagra.bio

**Estado: PARADO por permisos, como pide el encargo. No se borró ni se cambió nada.**

## Por qué paré

El token del fichero local de DNS está activo, pero solo tiene alcance de zona con lectura de DNS.
No tiene ningún permiso de cuenta: `GET /accounts` devuelve una lista vacía.

Permisos que faltan, con el nombre que usa el panel de Cloudflare:

| Para qué | Permiso que falta | Alcance |
|---|---|---|
| Borrar los 4 deployments y desactivar las previews de ramas | **Account → Cloudflare Pages → Edit** | la cuenta dueña de la zona `chagra.bio` |
| Redirigir www → apex con una Single Redirect Rule | **Zone → Single Redirect → Edit** (en tokens antiguos se llama «Dynamic Redirect») | zona `chagra.bio` |
| Alternativa a la regla: añadir `www.chagra.bio` como dominio del proyecto Pages | cubierta por **Cloudflare Pages → Edit** | — |

Con solo `Cloudflare Pages → Edit` se resuelven las dos cosas: borrar previews y añadir www como
dominio del proyecto, que deja de dar 522. Para que www responda **301 hacia el apex** hace falta
además la Redirect Rule (o una regla `_redirects`/Function por host, que en Pages no es fiable
para cambiar de host). Recomiendo pedir los dos permisos.

## Llamadas a la API hechas (el token nunca se imprimió)

Helper: `_gate/cf.sh` lee el token del fichero local y lo pasa en la cabecera; solo imprime la respuesta.

| # | Llamada | Respuesta |
|---|---|---|
| 1 | `GET /user/tokens/verify` | `success:true`, `status:active` |
| 2 | `GET /accounts` | `success:true`, lista **vacía** (sin permisos de cuenta) |
| 3 | `GET /zones?name=chagra.bio` | `success:true`, zona activa; trae el id de la cuenta dueña |
| 4 | `GET /accounts/<cuenta>/pages/projects` | `success:false`, `10000 Authentication error` |
| 5 | `GET /accounts/<cuenta>/pages/projects/chagra-landing` | `success:false`, `10000 Authentication error` |
| 6 | `GET /zones/<zona>/dns_records?per_page=100` | `success:true`, 14 registros (ver abajo) |
| 7 | `GET /zones/<zona>/rulesets/phases/http_request_dynamic_redirect/entrypoint` | `success:false`, `10000 Authentication error` |
| 8 | `GET /zones/<zona>/pagerules` | `success:false`, `9109 Unauthorized to access requested resource` |
| 9 | `GET /user/tokens/<id>` (para listar las políticas del token) | `success:false`, `9109 Unauthorized` |

Ninguna llamada de escritura (DELETE/PATCH/POST/PUT).

## Estado medido (2026-10-08, antes de cualquier cambio)

```
feat-aprende-chagra-curso.chagra-landing.pages.dev   200
glm-smoke2-meta.chagra-landing.pages.dev             200
feat-web-update-2026-06.chagra-landing.pages.dev     200
feat-seccion-como-funciona.chagra-landing.pages.dev  200
no-existe-control-xyz.chagra-landing.pages.dev       404   (control)
https://www.chagra.bio/   522  (sin redirect)
https://chagra.bio/       200
```

Los 4 criterios de aceptación siguen **sin cumplirse**.

## Causa probable del 522 en www

DNS: `www.chagra.bio` CNAME → `chagra.bio` (proxied), y `chagra.bio` CNAME → `chagra-landing.pages.dev`.
Pages solo responde a los hosts que tiene como dominio personalizado; si `www` no está en la lista del
proyecto, el borde no tiene origen válido y da 522. No pude leer la lista de dominios del proyecto
(llamada 5 denegada), así que esto **no está verificado**.

## Qué haría con el permiso (para quien siga)

1. `GET /accounts/<cuenta>/pages/projects/chagra-landing/deployments?env=preview` — ubicar los ids
   de las 4 ramas.
2. `DELETE …/deployments/<id>?force=true` por cada uno. Si una rama tiene alias activo, borrar
   todos sus deployments, no solo el último.
3. `PATCH …/projects/chagra-landing` con
   `{"source":{"config":{"preview_deployment_setting":"none"}}}` (o `"custom"` con
   `preview_branch_includes:[]`). Ojo: si el proyecto es de subida directa y no de Git, ese campo no
   aplica; hay que verificarlo en la respuesta del GET.
4. Single Redirect Rule en la zona: `http.host eq "www.chagra.bio"` → `concat("https://chagra.bio", http.request.uri.path)`,
   301, conservar query string.
5. Re-medir con `curl -sS -o /dev/null -w '%{http_code} %{redirect_url}'` las 4 previews y www.

## Lo que no pude verificar

- Las políticas exactas del token (llamada 9 denegada); lo deduzco de qué endpoints responden.
- Si el proyecto Pages está ligado a Git o es de subida directa.
- Si `www.chagra.bio` figura como dominio del proyecto.

## Nota de entrega

El encargo pide PR en borrador, pero `chagra-landing` es público y la propia auditoría marca como
problema que haya `_gate/INFORME-*.md` en su `main`. Resuelvo por lo conservador: el informe queda
commiteado en una rama **local**, sin push ni PR. El id de la cuenta y de la zona no van aquí.
