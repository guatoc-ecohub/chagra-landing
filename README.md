# Chagra · chagra.bio

Sitio estático de presentación de Chagra: portada, notas técnicas, términos de uso
y formulario de reporte ciudadano. Los cursos están en edu.chagra.bio.

Cloudflare Pages publica la raíz del repositorio, sin compilación. `_redirects`
conserva las URL de los cursos anteriores con redirecciones HTTP 301;
`_headers` define la política de seguridad. `404.html` evita devolver la portada
para rutas inexistentes. `robots.txt` y `sitemap.xml` describen el sitio actual.

Para revisar las redirecciones localmente, use Wrangler Pages:

```sh
python3 tests/prepare-preview.py
npx wrangler pages dev _gate/preview --ip 127.0.0.1 --port 8080
python3 tests/check-site.py http://127.0.0.1:8080
bash tests/smoke-css-coverage.sh http://127.0.0.1:8080
```

Un servidor HTTP estático sencillo permite revisar el HTML, pero no aplica las
reglas de Cloudflare. El verificador usa GET, comprueba anclas y recursos,
detecta el fallback de la portada y exige el estado 301 y el destino de cada
curso anterior. También prueba una ruta inexistente como control negativo.

Revise la portada a 390 px en español e inglés: la pregunta debe leerse completa,
los controles deben caber y el carril de capturas debe desplazarse dentro de su
contenedor. Las imágenes de revisión están en `assets/revision-bio/`.

Los archivos de entorno y los artefactos locales de verificación están ignorados
por git y no forman parte de la entrega. Agregue archivos por ruta explícita.
