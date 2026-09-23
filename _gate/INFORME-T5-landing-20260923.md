# Informe T5 · Correcciones científicas en la web educativa

Fecha: 2026-09-23. Base recibida: `21b558e`. Rama: `CIENCIA-AUDIT-T5-landing-20260923`.

## Cambios realizados

| Archivo:línea | Antes | Después | Hallazgo y fuente indicada en ASTRA-2 |
|---|---|---|---|
| `aprender/mini-curso/modulo2/leccion1/index.html:71` | Recomendaba neutralizar residuos con vinagre y verterlos al drenaje. | Indica no mezclar con vinagre u otros ácidos ni verter al drenaje; remite al manejo del producto y autoridad local. | A2-01 · S1, etiqueta EPA del polisulfuro de calcio: los ácidos pueden liberar H₂S; la fuente tampoco respalda el vertimiento al drenaje. |
| `aprender/articulo/bioseguridad.html:287,293,317`; `aprender/unidad/bioseguridad/index.html:281,1167,1175,1180,1207,1209,1307,1341-1342` | Atribuía el 192 a CISPROQUIM en instrucciones, enlace, evaluación y resumen. | CISPROQUIM aparece como **01 8000 916 012**, enlace `tel:018000916012`, gratuita 24 horas. La opción correcta del quiz es ese número; se eliminaron las menciones del 192 de `aprender/`. | A2-02 · directorio OPS de centros toxicológicos (2021), fila Colombia, según la verificación consignada en el hallazgo. No se añadió el número fijo de Bogotá ni se afirmó que el 192 no exista. |
| `aprender/articulo/bioseguridad.html:154`; `aprender/unidad/bioseguridad/index.html:737` | Presentaba “hepatotoxicidad crónica a dosis bajas” como afirmación general. | Atribuye las alteraciones hepáticas observadas a ratas expuestas crónicamente a una formulación de Roundup y aclara que el resultado no establece por sí solo efecto o riesgo en personas. | A2-05 · S4, Mesnage et al. 2017. |
| `aprender/articulo/bioseguridad.html:308`; `aprender/unidad/bioseguridad/index.html:1330` | Referencia Mesnage con año de publicación incorrecto y localizador bibliográfico asociado. | Corrige a 2014 y `BioMed Res Int 2014:179691`. | A2-06 · S5, registro Crossref DOI `10.1155/2014/179691`. |
| `aprender/articulo/transicion-15-15-15.html:146`; `aprender/unidad/transicion-15-15-15/index.html:500,561`; `aprender/unidad/transicion-15-15-15/unit.js:112` | Atribuía al NPK continuo una reducción microbiana de 30–50%. | Informa el promedio de 15% del metaanálisis de adición de nitrógeno, con variación; aclara que no predice toda aplicación de NPK. El quiz pregunta por ese resultado y conserva una respuesta correcta verdadera. | A2-07 · S6, Treseder 2008. |
| `aprender/articulo/transicion-15-15-15.html:245`; `aprender/unidad/transicion-15-15-15/index.html:784` | Afirmaba 20–40% más rendimiento con rotación de 4+ cultivos en años de estrés. | Describe el resultado de Renard y Tilman sobre diversidad y estabilidad interanual de la cosecha nacional, sin asignar una ventaja numérica a una finca. | A2-08 · S7, Renard y Tilman 2019. |
| `aprender/articulo/transicion-15-15-15.html:339`; `aprender/unidad/transicion-15-15-15/index.html:1105`; `aprender/unidad/transicion-15-15-15/unit.js:126` | Prometía caída típica de 10–25%, recuperación en año 2 y superación en años 3–4. | Explica que la diferencia depende de cultivo, sitio y manejo; Seufert et al. no permiten prometer esa trayectoria. El quiz también quedó sin cifras ni trayectoria universal. | A2-09 · S8, Seufert et al. 2012. |
| `aprender/articulo/transicion-15-15-15.html:81`; `aprender/unidad/transicion-15-15-15/index.html:395-406`; `aprender/unidad/transicion-15-15-15/unit.js:107` | Afirmaba pérdida colombiana de 50% entre 1970 y 2010 y la atribuía a Cenicafé; incluía una visualización y quiz con ese dato. | Retira cifra, periodo, atribución, visualización y causalidad; el quiz ahora pregunta por la necesidad de mediciones comparables en cada zona. | A2-10 · fuente NO VERIFICADA; corrección limitada a quitar/suavizar la cifra. |
| `aprender/articulo/transicion-15-15-15.html:190`; `aprender/unidad/transicion-15-15-15/index.html:667` | Afirmaba esterilización y reducción de 60–80% en los primeros 5 cm, atribuida a Bezdicek. | Dice que la cal viva es cáustica, puede elevar el pH local y que no se dispone aquí de fuente verificada para cuantificar esa reducción. Retira la referencia bibliográfica dudosa de ambas páginas. | A2-11 · fuente NO VERIFICADA; corrección limitada a quitar/suavizar. |
| `reportar-invasora/invasoras.json:23` | Nombre anterior con género no aceptado. | `Neustanthus phaseoloides` con el sinónimo entre paréntesis; conserva el ID `pueraria_phaseoloides`. | A2-18 · G1, GBIF. |
| `aprender/mini-curso/modulo3/leccion5/index.html:74` | Nombre anterior del hongo | `Purpureocillium lilacinum`, seguido de su sinónimo taxonómico entre paréntesis. | A2-19 · G2, GBIF. |

## Verificación

- Antes de editar: `tests/mini-curso-smoke.sh` y `tests/smoke-css-coverage.sh` pasaron.
- Después de editar: ambas pruebas pasaron; también `node --check aprender/unidad/transicion-15-15-15/unit.js` y `git diff --check` pasaron.
- `git grep -n '192' -- aprender/` no devuelve coincidencias en el árbol final.
- La búsqueda literal pedida en `origin/main` da 7 coincidencias por archivo: bioseguridad (3), transición (1), lección M2L1 (1), lección M3L5 (1), JSON invasoras (1).
- En el árbol final la misma búsqueda deja dos coincidencias, ambas limitadas a los sinónimos taxonómicos entre paréntesis conforme al requisito taxonómico. La exigencia simultánea de cero coincidencias para esos literales y de conservarlos como sinónimos es contradictoria; se priorizó explicitar los sinónimos aceptados. No se modificaron los IDs.
- El diff de contenido comprende únicamente los ocho archivos de la tabla; se suma este informe bajo `_gate/`.

## Commits

- `401c414 fix(seguridad): corregir manejo de residuos y contacto toxicológico` — primero, A2-01 y A2-02.
- El resto de hallazgos y este informe se entregan en el commit siguiente.

La rama se empujó y se verificó con `git ls-remote`; se abrió un PR en borrador contra `main`. No se publicó ni desplegó el sitio.
