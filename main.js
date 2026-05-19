/*
 * Chagra landing · main.js
 * AGPL-3.0 · Guatoc-EcoHub
 *
 * Único script de la landing. Self-hosted, sin dependencias.
 * Función: si un screenshot PNG no carga (porque aún es placeholder
 * o falló el rsync), degradar al SVG genérico sin romper la página.
 *
 * NO recopila datos, NO hace fetch a terceros, NO usa cookies.
 */
(function () {
  "use strict";
  var PLACEHOLDER = "/assets/screenshot-placeholder.svg";

  function onErr(ev) {
    var img = ev.target;
    if (!img || img.dataset.fallbackApplied === "1") return;
    img.dataset.fallbackApplied = "1";
    img.src = PLACEHOLDER;
  }

  function init() {
    var imgs = document.querySelectorAll("img.js-screenshot");
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].addEventListener("error", onErr);
      // Si la imagen ya falló antes de que el script cargase,
      // complete=true && naturalWidth=0 lo indica.
      if (imgs[i].complete && imgs[i].naturalWidth === 0) {
        onErr({ target: imgs[i] });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
