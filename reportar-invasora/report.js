/* Formulario ciudadano: prepara un correo para revisión manual. */
(function(){
'use strict';

const REPORT_TO = 'invasoras@guatoc.co';
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const RATE_LIMIT_MS = 15 * 1000;
const RATE_KEY = 'chagra:report:lastSubmit';
const JSON_URL = '/reportar-invasora/invasoras.json';

const form = document.getElementById('report-form');
const speciesSel = document.getElementById('species');
const descTa = document.getElementById('description');
const counter = document.getElementById('char-counter');
const photoInput = document.getElementById('photo');
const statusEl = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

if (!form || !speciesSel) return;

/* === honeypot field inyectado por JS (un bot ingenuo lo llena) === */
const honey = document.createElement('input');
honey.type = 'text';
honey.name = 'website';
honey.id = 'website';
honey.tabIndex = -1;
honey.autocomplete = 'off';
honey.setAttribute('aria-hidden', 'true');
honey.className = 'report-honeypot';
form.appendChild(honey);

/* === carga del catálogo === */
fetch(JSON_URL, { credentials: 'omit', cache: 'default' })
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(data => {
    const species = Array.isArray(data && data.species) ? data.species : [];
    /* sort por nombre común para UX */
    species.sort((a, b) => (a.nombre_comun || '').localeCompare(b.nombre_comun || '', 'es-CO'));
    for (const s of species) {
      const opt = document.createElement('option');
      opt.value = s.id;
      /* textContent — sin innerHTML, defensa anti-XSS por si el JSON
         se viera contaminado. AGPL-3.0 + revisión manual del catálogo
         hace este vector improbable, pero defensa en profundidad. */
      opt.textContent = (s.nombre_comun || s.id) + ' — ' + (s.nombre_cientifico || '');
      opt.dataset.cientifico = s.nombre_cientifico || '';
      opt.dataset.comun = s.nombre_comun || '';
      speciesSel.appendChild(opt);
    }
    if (species.length === 0) {
      setStatus('No se pudo cargar el catálogo de especies. Recargue la página o reporte vía SiB Colombia.', 'error');
    }
  })
  .catch(err => {
    /* sin console.log para mantener limpio el output en producción */
    setStatus('No se pudo cargar el catálogo (' + err.message + '). Recargue la página.', 'error');
  });

/* === contador caracteres descripción === */
if (descTa && counter) {
  const updateCounter = () => {
    const n = descTa.value.length;
    counter.textContent = String(n);
    counter.style.color = n > 480 ? 'var(--accent-warn, #f59e0b)' : '';
  };
  descTa.addEventListener('input', updateCounter);
  updateCounter();
}

/* === validación peso foto === */
if (photoInput) {
  photoInput.addEventListener('change', () => {
    const f = photoInput.files && photoInput.files[0];
    if (!f) return;
    if (f.size > MAX_PHOTO_BYTES) {
      setStatus('La foto pesa ' + (f.size / 1024 / 1024).toFixed(1) + ' MB — el limite es 3 MB. Comprimala y vuelva a seleccionarla.', 'error');
      photoInput.value = '';
      return;
    }
    const okType = /^image\/(jpeg|png|webp)$/.test(f.type);
    if (!okType) {
      setStatus('Tipo de archivo no soportado. Use JPEG, PNG o WebP.', 'error');
      photoInput.value = '';
      return;
    }
    setStatus('Foto cargada: ' + f.name + ' (' + (f.size / 1024).toFixed(0) + ' KB). Recuerde adjuntarla manualmente en su correo cuando se abra el cliente.', 'ok');
  });
}

/* === submit handler === */
form.addEventListener('submit', e => {
  e.preventDefault();

  /* honeypot — bot detectado, abortar silencioso */
  if (honey.value && honey.value.length > 0) {
    setStatus('Reporte recibido. Gracias.', 'ok');
    form.reset();
    return;
  }

  /* rate-limit */
  const last = parseInt(sessionStorage.getItem(RATE_KEY) || '0', 10);
  if (Date.now() - last < RATE_LIMIT_MS) {
    const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - last)) / 1000);
    setStatus('Espere ' + wait + ' segundos antes de enviar otro reporte.', 'error');
    return;
  }

  /* species requerida */
  const sid = speciesSel.value;
  if (!sid) {
    setStatus('Elija una especie del listado.', 'error');
    speciesSel.focus();
    return;
  }

  /* al menos location O coords */
  const loc = (document.getElementById('location').value || '').trim();
  const lat = (document.getElementById('lat').value || '').trim();
  const lon = (document.getElementById('lon').value || '').trim();
  if (!loc && !(lat && lon)) {
    setStatus('Ingrese al menos el nombre del sitio o las dos coordenadas (lat y lon).', 'error');
    return;
  }

  /* coords formato decimal válido si vienen */
  if (lat && !/^-?\d{1,2}(\.\d+)?$/.test(lat)) {
    setStatus('Latitud inválida. Use formato decimal, ej. 4.5294.', 'error');
    return;
  }
  if (lon && !/^-?\d{1,3}(\.\d+)?$/.test(lon)) {
    setStatus('Longitud inválida. Use formato decimal, ej. -74.0392.', 'error');
    return;
  }

  /* descripción max */
  const desc = (descTa && descTa.value || '').trim();
  if (desc.length > 500) {
    setStatus('La descripción excede 500 caracteres.', 'error');
    return;
  }

  /* acuerdo checkbox */
  const acuerdo = document.getElementById('acuerdo');
  if (!acuerdo || !acuerdo.checked) {
    setStatus('Marque la casilla de entendimiento antes de enviar.', 'error');
    return;
  }

  /* construir mailto */
  const selectedOpt = speciesSel.options[speciesSel.selectedIndex];
  const cientifico = (selectedOpt && selectedOpt.dataset.cientifico) || '';
  const comun = (selectedOpt && selectedOpt.dataset.comun) || sid;

  const lines = [];
  lines.push('Reporte ciudadano de especie invasora — sitio chagra.bio');
  lines.push('');
  lines.push('Especie:        ' + comun + ' (' + cientifico + ')');
  lines.push('Identificador del catálogo:    ' + sid);
  if (loc)   lines.push('Sitio:          ' + loc);
  if (lat && lon) lines.push('Coordenadas:    ' + lat + ', ' + lon);
  if (desc)  lines.push('Descripción:    ' + desc);
  lines.push('');
  lines.push('Foto adjunta:   ' + (photoInput.files && photoInput.files[0] ? 'SÍ — recuerde adjuntar ' + photoInput.files[0].name + ' manualmente' : 'no'));
  lines.push('');
  lines.push('---');
  lines.push('Enviado desde el formulario público /reportar-invasora/ de chagra.bio.');
  lines.push('Marco legal: Resolución 0684/2018 MinAmbiente.');
  lines.push('Este reporte es revisado manualmente por el equipo Chagra antes de incorporarse al catálogo.');
  const body = lines.join('\n');

  const subject = '[Reporte invasora] ' + comun + (loc ? ' — ' + loc : '');
  const mailto = 'mailto:' + REPORT_TO +
    '?subject=' + encodeURIComponent(subject) +
    '&body=' + encodeURIComponent(body);

  /* rate-limit set ANTES de abrir el mailto (algunos clientes no devuelven control) */
  sessionStorage.setItem(RATE_KEY, String(Date.now()));

  /* abrir el cliente de email del usuario */
  window.location.href = mailto;

  setStatus('Se abrió su cliente de correo con el reporte preparado. Si tiene foto, adjúntela antes de enviar.', 'ok');
  submitBtn.disabled = true;
  setTimeout(() => { submitBtn.disabled = false; }, RATE_LIMIT_MS);
});

function setStatus(msg, kind) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = 'report-status ' + (kind === 'error' ? 'is-error' : kind === 'ok' ? 'is-ok' : '');
}

})();
