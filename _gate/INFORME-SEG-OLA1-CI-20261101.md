# SEG-OLA1-CI — hardening de GitHub Actions

Fecha: 2026-11-01

Base recibida: `d518a97` (`origin/main`, actualizado con `git fetch origin main`)
Repositorio: `guatoc-ecohub/chagra-landing`

## Antes

- Solo existe `.github/workflows/smoke-deploy.yml`; no declaraba `permissions:` y usaba `actions/checkout@v4` por tag mutable.
- `smoke-test` corre en `ubuntu-latest`, se activa con `push` a `main` o `workflow_dispatch`; no tiene eventos `pull_request` ni `pull_request_target`, y no usa runners `self-hosted`/`alpha`.
- Aunque el workflow se llama `smoke deploy`, no despliega: espera el despliegue de Pages y consulta el sitio ya publicado.
- GitHub confirmó que el repo es **público**. El brief también lo llama privado en el apéndice; traté el dato medido como público y limité el cambio a configuración genérica de Actions.

## Cambios

- Añadí `permissions: contents: read` como permiso predeterminado del workflow y `permissions: contents: read` en el único job, `smoke-test`.
- Fijé `actions/checkout` al commit `11bd71901bbe5b1630ceea73d27597364c9af683`, verificado contra el tag upstream `v4.2.2`; dejé `# v4.2.2` como comentario de versión. [Release oficial](https://github.com/actions/checkout/releases/tag/v4.2.2).
- El único job necesita `contents: read` para checkout. No hay job de despliegue ni permiso de Pages que conservar en este repo.
- Ningún workflow ejecuta código de forks en runners alpha: el único workflow no escucha eventos de PR y usa el runner hospedado `ubuntu-latest`.

## Ajuste de configuración que queda al operador

Consulta de solo lectura a la configuración de GitHub: `default_workflow_permissions=read`, `approval_policy=first_time_contributors`, `sha_pinning_required=false`. Cambiar la política de aprobación a **Require approval for all outside collaborators** en *Settings → Actions → General → Approval for running fork pull request workflows from contributors*. La política observada hoy solo exige aprobación a contribuidores primerizos; no la cambié desde la API. GitHub documenta la política y la ruta en [Actions settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository). Esta aprobación controla cuándo arranca un workflow de PR de fork; el YAML actual tampoco tiene trigger de PR.

La política global de pinning está desactivada (`sha_pinning_required=false`), pero el único `uses:` de este cambio está fijado por SHA. Habilitar esa política sería una protección adicional; no es necesaria para cumplir este cambio de workflow.

## Verificación post-integración, con controles

Ejecutar desde la raíz del repo después de integrar:

1. Permisos en todos los YAML de workflow (incluido el criterio solicitado):

   ```sh
   missing=$(grep -L '^permissions:' .github/workflows/*.yml || true)
   test -z "$missing"
   ```

   Control negativo: poner temporalmente un YAML sin `permissions:` en `.github/workflows/` y comprobar que `grep -L` lo enumera; retirarlo al terminar.

2. Actions de terceros fijadas por SHA completa:

   ```sh
   uses=$(grep -RhE '^[[:space:]]*(-[[:space:]]*)?uses:' .github/workflows)
   test -n "$uses"
   bad=$(printf '%s\n' "$uses" | grep -Ev '^[[:space:]]*(-[[:space:]]*)?uses:[[:space:]]*(\./[^[:space:]]+|[^@[:space:]]+@[[:xdigit:]]{40})([[:space:]]|$)' || true)
   test -z "$bad"
   ```

   Control positivo del detector: añadir temporalmente `uses: actions/checkout@v4` a un fixture YAML bajo `.github/workflows/` y comprobar que `bad` deja de estar vacío; retirar el fixture al terminar. El comentario `# v4.2.2` documenta la versión, no sustituye el SHA.

3. Ningún trigger de PR ni runner alpha/autohospedado en los workflows:

   ```sh
   ! grep -RniE '^[[:space:]]*(pull_request|pull_request_target):|^[[:space:]]*(-[[:space:]]*)?(self-hosted|alpha)([[:space:]]|$)' .github/workflows
   ```

   Control positivo del detector: con una entrada temporal `pull_request:` y `runs-on: self-hosted`, comprobar que la orden encuentra ambas; retirar el fixture al terminar.

4. Aprobación de forks (consulta de configuración, después del ajuste del operador):

   ```sh
   gh api repos/guatoc-ecohub/chagra-landing/actions/permissions/fork-pr-contributor-approval --jq .approval_policy
   ```

   Esperado: `all_external_contributors`. Control: el valor medido antes del ajuste fue `first_time_contributors`, distinto del esperado.

## No verificado

- No se ejecutó el workflow en GitHub ni se modificó la configuración del repo; la aprobación de PR de forks queda pendiente del operador.
- No se ejecutó un despliegue; este workflow no despliega.
