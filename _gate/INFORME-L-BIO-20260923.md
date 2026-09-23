# Informe L-BIO · Bioseguridad y calculadoras

Fecha: 2026-09-23  
Rama: `CIENCIA-AUDIT-L-BIO-20260923`  
Base recibida: `0922071`  
PR borrador: #22  
Fuente científica permitida: expediente `OPUS-5-expediente-agrotoxicos.md` indicado por el operador.

## Entrega

El primer commit fue `2ff2ef4 fix(bioseguridad): corregir estado colombiano del clorpirifos`; corrige el texto y el gráfico sobre el clorpirifos en Colombia, y quedó empujado antes de continuar. El PR borrador #22 se abrió tras ese commit. Los cambios posteriores actualizan los tres archivos pedidos y este informe. No se desplegó el sitio.

## Correcciones del punto 1 y tabla de cifras

| Cifra o corrección | Sección del expediente | Fuente indicada por el expediente |
|---|---|---|
| Clorpirifos: ICA suspendió y canceló registros el 06-jun-2023; se elimina el estado anterior | §1E–1F | Resolución ICA 00006365 de 2023; Sentencia T-343 de 2022 |
| EE. UU.: EPA revocó tolerancias en 2021; el Octavo Circuito anuló la medida en 2023; tolerancias restablecidas en 2024 | §1F | Federal Register 2024-02153 y 2024-28332 |
| Clorpirifos en Brasil: se quita la prohibición de 2022 | §1F | El expediente lo marca no verificado / probablemente falso |
| ETU: Grupo 3, no Grupo 2B | §1F | IARC, volumen 79; CAS 96-45-7 |
| Se retira la asociación de mancozeb con cáncer tiroideo | §1F | El expediente indica que no tiene fuente |
| Bayer: acuerdo 2020 ~USD 10.000M (hasta 10.900M), ~65.000 reclamaciones; propuesta colectiva USD 7.250M en 2026 | §1F | Cifras verificables que lista el expediente; se retiran >USD 15.000M y >125.000 demandas |
| Paraquat–Parkinson: OR 2,5 (1,4–4,7); metaanálisis OR 1,64 (1,27–2,13) | §1F | Tanner 2011, DOI 10.1289/ehp.1002839; metaanálisis DOI 10.1080/19338244.2018.1492894 |
| Engel 2007: referencia corregida | §1F | *American Journal of Epidemiology* 165:1397; DOI 10.1093/aje/kwm029 |
| Tang 2020: se identifica como estudio en ratas | §1F | *Environmental Pollution* 261:114129 |
| Wéry 2014: DOI corregido | §1F | DOI 10.3389/fcimb.2014.00042 |

## Glifosato: magnitud y límites expresados

| Cifra o afirmación | Sección del expediente | Fuente indicada por el expediente |
|---|---|---|
| IARC Grupo 2A; evidencia limitada en personas significa asociación sin descartar azar, sesgo o confusión; peligro no equivale a riesgo a una dosis | §1A | Guyton 2015; Monografía IARC 112; P&R y Preámbulo IARC |
| RR 1,41 (IC 95 % 1,13–1,75), exposición acumulada más alta | §1A | Zhang 2019, DOI 10.1016/j.mrrev.2019.02.001 |
| Resultados que no hallan exceso: Boffetta 2021; cohorte de 54.251 aplicadores, cuartil mayor RR 0,87 (0,64–1,20) | §1A | Boffetta DOI 10.23749/mdl.v112i3.11123; Andreotti 2018 DOI 10.1093/jnci/djx233 |
| EFSA 2023: sin área crítica de preocupación; epidemiología no concluyente; vacíos en coformulantes e impurezas | §1B | EFSA, DOI 10.2903/j.efsa.2023.8164 |
| Ocho de nueve formulaciones hasta mil veces más tóxicas en células que sus principios activos; se delimita como evidencia in vitro | §1C | Mesnage 2014, DOI 10.1155/2014/179691 |
| POE-tallowamina prohibida en productos de la UE en 2016 | §1C | Reglamento de Ejecución (UE) 2016/1313 |
| 96–100 % de larvas en estanques experimentales; contrapeso: 36 estudios sin cambio significativo de biomasa microbiana total a dosis de campo | §1D | Relyea 2005, DOI 10.1890/04-1291; Nguyen 2016, DOI 10.1016/j.soilbio.2015.09.014 |
| 6.729 intoxicaciones por plaguicidas en Colombia durante 2024; paraquat 29,3 % de suicidios consumados reportados | §1E | INS, Informe de evento 2024 |
| T-236 de 2017: condiciones para reanudar aspersión aérea | §1E | Sentencia T-236 de 2017 |
| GLOBOCAN: cerca de 6 por 1.000 con linfoma no Hodgkin antes de los 75; escenario de exposición alta, cerca de 9 por 1.000 | §2b | GLOBOCAN 2022; Zhang 2019. La pantalla dice explícitamente que no es probabilidad personal |

La frase recomendada por el expediente está reproducida literalmente en unidad y artículo. La página explica por qué IARC y reguladores difieren, la incertidumbre sobre riesgo individual, las formulaciones/coadyuvantes, el suelo con el contrapeso de Nguyen, y las cifras del INS. No se incorporan los elementos que el expediente marca NO VERIFICADO.

## Calculadora EPA de EPP

Se reemplazó la composición de porcentajes inventados por la tabla EPA para bomba de espalda. El usuario ingresa concentración (g/L), volumen (L/ha) y área (ha/día); la aplicación calcula libras de ingrediente activo manipuladas y estima exposición externa dérmica e inhalatoria en mg/día. Opciones dérmicas EPA: 13.200, 11.200 y 6.230 µg/lb; inhalatoria: 140 y 14 µg/lb con factor de protección 10. El jabón no es factor de reducción y queda descrito como higiene. Se muestran las dos advertencias pedidas.

Control reproducible en Node con la función `calcEpp()` del propio `unit.js`, 3 L/ha × 360 g/L × 1 ha/día: dérmica 31,4 mg (una capa), 26,7 mg (guantes), 14,8 mg (doble capa y guantes). `node --check` pasó.

## Calculadora de riesgo y cierre práctico

Se eliminó `años × tasa`, el costo proyectado, y los campos de años/químico. Solo queda la frecuencia natural de linfoma del expediente en dos grupos explicativos, con fuente y advertencia de que no es probabilidad personal. El cierre recomienda reducir exposición hoy y enlaza al módulo existente de biopreparados y a la unidad existente de transición agroecológica.

## Verificación

- `git grep -c -F 'ICA registrado' HEAD -- aprender/`: 0, después del commit final.
- `bash tests/smoke-css-coverage.sh`: PASS. Producción respondió; estilos local/remoto difirieron en 1 byte.
- `bash tests/mini-curso-smoke.sh`: PASS.
- `node --check aprender/unidad/bioseguridad/unit.js`: PASS.
- Control de cálculo EPA: PASS con 31,4 / 26,7 / 14,8 mg dérmicos.
- `git diff --check`: PASS.

## No verificado en esta entrega

- No se hizo juicio visual headed; el criterio visual corresponde al orquestador.
- No se desplegó ni se verificó la nueva versión en producción; el smoke de CSS solo comprobó el CSS del sitio publicado.
- El estimador informa exposición externa, no dosis absorbida ni probabilidad de enfermedad. No calcula comparación con AOEL.
- El estado actual del registro colombiano de paraquat sigue sin verificar, conforme al expediente; el texto solo afirma la prohibición de aplicación aérea.
