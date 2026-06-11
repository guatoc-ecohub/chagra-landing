// === STATE ===
const SCREENS = ['portada','intro','parte_1','parte_2','parte_3','parte_4','parte_5','parte_6','parte_7','resumen'];
const LS_KEY = 'chagra_unidad_transicion_15_15_15';
let state = loadState();

// === LOCALSTORAGE ===
function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {
    user_name:'',
    started_at:new Date().toISOString(),
    last_visit:new Date().toISOString(),
    current_screen:'portada',
    screens_visited:['portada'],
    quiz_scores:{},
    completion_pct:0,
    promedio_quizzes:0,
    certificate_eligible:false,
    calculator_uses:{npk_efficiency:0,cochrane:0,bocashi:0}
  };
}
function saveState(){
  state.last_visit = new Date().toISOString();
  try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){}
}

// === NAVIGATION ===
function goTo(screenName){
  if(screenName === 'refs'){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-refs').classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
    return;
  }

  const idx = SCREENS.indexOf(screenName);
  if(idx < 0) return;

  // Hide all, show target
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const target = document.getElementById('screen-'+screenName);
  if(target) target.classList.add('active');

  // Update state
  state.current_screen = screenName;
  if(!state.screens_visited.includes(screenName)) state.screens_visited.push(screenName);
  updateProgress();
  saveState();
  window.scrollTo({top:0,behavior:'smooth'});

  // Check quiz unlocks
  updateNavButtons();

  // Special: resumen
  if(screenName === 'resumen') renderResumen();
}

function updateProgress(){
  const uniqueScreens = [...new Set(state.screens_visited)];
  const maxIdx = Math.max(...uniqueScreens.map(s=>SCREENS.indexOf(s)).filter(i=>i>=0));
  const pct = Math.round(((maxIdx + 1) / SCREENS.length) * 100);
  state.completion_pct = Math.min(pct, 100);
  document.getElementById('progressFill').style.width = state.completion_pct + '%';

  // Show previous progress on portada
  const prevBox = document.getElementById('prevProgressBox');
  const prevPct = document.getElementById('prevPct');
  if(prevBox && prevPct && state.completion_pct > 0 && state.current_screen === 'portada'){
    prevBox.classList.remove('hidden');
    prevPct.textContent = state.completion_pct + '%';
  }
}

function updateNavButtons(){
  for(let i=1;i<=7;i++){
    const btn = document.getElementById('btn-next-'+i);
    if(!btn) continue;
    const qKey = 'parte_'+i;
    const score = state.quiz_scores[qKey];
    // Enable if quiz passed (>=60%) or not yet taken (allow skip after first attempt? no, must pass)
    // Actually: enable if quiz was taken with >=60%
    if(score){
      const pct = (score.correct / score.total);
      btn.disabled = pct < 0.6;
    } else {
      btn.disabled = true; // must take quiz first
    }
  }
}

// === QUIZ SYSTEM ===
const QUIZ_CONFIG = {
  parte_1:{total:3, passing:0.6},
  parte_2:{total:4, passing:0.6},
  parte_3:{total:4, passing:0.6},
  parte_4:{total:3, passing:0.6},
  parte_5:{total:3, passing:0.6},
  parte_6:{total:3, passing:0.6},
  parte_7:{total:2, passing:0.6}
};

const QUIZ_EXPLANATIONS = {
  '1_1_c':'Correcto. 1 gramo de suelo sano contiene entre mil millones y diez mil millones de celulas microbianas (Fierer & Jackson 2006).',
  '1_2_b':'Correcto. Los suelos cafeteros colombianos perdieron aproximadamente el 50% de su materia orgánica entre 1970 y 2010 según CENICAFE.',
  '1_3_d':'Correcto. El bocashi anual APORTA materia orgánica. Las causas de perdida son laboreo profundo, ausencia de cobertura e insumos solubles continuos.',
  '2_1_b':'Correcto. En Andes tropicales, el nitrogeno aplicado como urea tiene solo 30-50% de eficiencia real (Cassman et al. 2002).',
  '2_2_b':'Correcto. Solo 15-25% del fosforo aplicado como DAP/MAP es absorbido; el resto se fija en oxidos de hierro y aluminio.',
  '2_3_c':'Correcto. La fijación biológica de nitrogeno en suelos sanos puede aportar 40-200 kg N/ha/año sin usar fertilizante.',
  '2_4_b':'Correcto. El uso continuo de NPK sin enmienda orgánica reduce la biomasa microbiana del suelo entre 30-50% (Treseder 2008).',
  '3_1_c':'Correcto. Solo la cal dolomitica (CaMg(CO3)2) es una enmienda agricola valida, y siempre bajo análisis previo de suelo.',
  '3_2_b':'Correcto. La Regla Cochrane establece dos condiciones simultaneas: pH < 5.5 Y saturacion de aluminio > 30%.',
  '3_3_b':'Correcto. La cal viva genera un choque de pH de 5 a 11 que esteriliza la microbiota, precipita fosforo, saponifica materia orgánica y volatiliza nitrogeno.',
  '3_4_b':'Correcto. Con pH 6.0 y saturacion Al de 15% NO se cumplen los criterios de Cochrane. Encalar en estas condiciones seria danino.',
  '4_1_b':'Correcto. Entre el 15% y 40% del carbono fotosintetizado se libera como exudados radiculares (Bardgett 2014).',
  '4_2_b':'Correcto. El fosforo soluble del DAP suprime la formacion de micorrizas arbusculares (Treseder & Allen 2002).',
  '4_3_b':'Correcto. La aplicación continua de urea acidifica el suelo 0.1-0.3 unidades de pH por año (Guo 2010).',
  '5_1_c':'Correcto. La base de la pirámide nutricional agroecológica (bocashi + compost + abonos verdes) aporta el 50-70% de la nutrición.',
  '5_2_b':'Correcto. El reemplazo agroecológico del DAP/MAP es roca fosforica co-compostada junto con inoculacion de micorrizas.',
  '5_3_b':'Correcto. Según las reglas duras de Chagra, el análisis de suelo debe realizarse cada 2-3 años.',
  '6_1_c':'Correcto. En el Año 1 NO se elimina el NPK. Se mantiene la dosis actual y se agrega bocashi como transición.',
  '6_2_b':'Correcto. En el Año 2 se reduce el NPK al 50% de la dosis original, aumentando el bocashi a 2 kg/m2.',
  '6_3_c':'Correcto. Un indicador de exito es pasar de 5-15 lombrices/m2 en el Año 0 a 50-150 lombrices/m2 en el Año 3.',
  '7_1_b':'Correcto. En el primer año de transición agroecológica, una caida de rendimiento del 10-25% es tipica y esperada (Seufert 2012).',
  '7_2_d':'Correcto. Los cuernos de vaca enterrados en luna llena son una práctica de la biodinamica, no de la agroecología basada en evidencia científica que promueve Chagra.'
};

document.addEventListener('click', function(e){
  const opt = e.target.closest('.quiz-option');
  if(!opt) return;

  const qId = opt.dataset.q;
  const isCorrect = opt.dataset.correct === 'true';
  const fbId = 'fb-' + qId;
  const fb = document.getElementById(fbId);
  if(!fb) return;

  // Already answered this question?
  const container = opt.closest('.quiz-container');
  const questionDiv = opt.closest('.quiz-question') || opt.previousElementSibling;
  
  // Disable all options for this question
  const allOpts = container.querySelectorAll('.quiz-option[data-q="'+qId+'"]');
  allOpts.forEach(o=>o.classList.add('disabled'));

  // Mark
  if(isCorrect){
    opt.classList.add('correct');
    fb.innerHTML = '<strong class="text-emerald">Correcto.</strong> ' + (QUIZ_EXPLANATIONS[qId+'_'+opt.dataset.opt] || '');
    fb.className = 'quiz-feedback show ok';
  } else {
    opt.classList.add('incorrect');
    // Highlight correct one
    allOpts.forEach(o=>{ if(o.dataset.correct==='true') o.classList.add('correct'); });
    fb.innerHTML = '<strong class="text-red">Incorrecto.</strong> ' + (QUIZ_EXPLANATIONS[qId+'_'+opt.dataset.opt] || 'La respuesta correcta esta marcada en verde.');
    fb.className = 'quiz-feedback show err';
  }

  // Score tracking for this part
  const partKey = qId.split('_')[0] === '1' ? 'parte_1' :
                  qId.split('_')[0] === '2' ? 'parte_2' :
                  qId.split('_')[0] === '3' ? 'parte_3' :
                  qId.split('_')[0] === '4' ? 'parte_4' :
                  qId.split('_')[0] === '5' ? 'parte_5' :
                  qId.split('_')[0] === '6' ? 'parte_6' :
                  qId.split('_')[0] === '7' ? 'parte_7' : '';

  if(partKey){
    if(!state.quiz_scores[partKey]) state.quiz_scores[partKey] = {correct:0, total:QUIZ_CONFIG[partKey].total, attempts:0, completed_at:''};
    state.quiz_scores[partKey].attempts++;
    
    // Recalculate score for this part
    const partContainer = document.getElementById('quiz-'+partKey);
    if(partContainer){
      const correctCount = partContainer.querySelectorAll('.quiz-option.correct[data-correct="true"]').length;
      state.quiz_scores[partKey].correct = correctCount;
      state.quiz_scores[partKey].completed_at = new Date().toISOString();

      // Show score
      const scoreEl = document.getElementById('score-'+partKey);
      if(scoreEl){
        scoreEl.style.display = 'block';
        scoreEl.textContent = 'Puntaje: ' + correctCount + '/' + QUIZ_CONFIG[partKey].total;
      }

      // Enable next if >= 60%
      const pct = correctCount / QUIZ_CONFIG[partKey].total;
      const btnIdx = parseInt(partKey.split('_')[1]);
      const nextBtn = document.getElementById('btn-next-'+btnIdx);
      if(nextBtn && pct >= 0.6){
        nextBtn.disabled = false;
      }
    }
    saveState();
  }
});

// === CALCULATORS ===
function calcNPK(){
  const kg = parseFloat(document.getElementById('npkKg').value) || 0;
  const nut = document.getElementById('npkNutriente').value;
  const effMap = {N:0.4, P:0.2, K:0.5};
  const eff = effMap[nut] || 0.4;
  const used = kg * eff;
  const lost = kg - used;
  const pricePerKg = 3500;
  const costLost = Math.round(lost * pricePerKg);

  const nutNames = {N:'Nitrogeno (N)', P:'Fosforo (P)', K:'Potasio (K)'};
  document.getElementById('npkOutput').innerHTML =
    'La planta usa aprox <span class="val">' + used.toFixed(1) + ' kg</span> de ' + nutNames[nut] + ' de cada ' + kg + ' kg aplicados.<br>' +
    '<span class="val">' + lost.toFixed(1) + ' kg</span> se pierden (lixivian, volatilizan o se fijan).<br>' +
    'A <span class="text-dim">$' + pricePerKg.toLocaleString() + ' COP/kg</span>, eso es <span class="val text-red">$' + costLost.toLocaleString() + ' COP</span> perdidos.';

  state.calculator_uses.npk_efficiency++;
  saveState();
}

function calcCochrane(){
  const ph = parseFloat(document.getElementById('cochranePH').value);
  const alSat = parseFloat(document.getElementById('cochraneAl').value);
  const alEx = parseFloat(document.getElementById('cochraneAlEx').value);
  const out = document.getElementById('cochraneOutput');

  if(isNaN(ph) || isNaN(alSat) || isNaN(alEx)){
    out.innerHTML = 'Por favor ingrese todos los valores.';
    return;
  }

  if(ph >= 5.5 || alSat < 30){
    out.innerHTML = '<strong class="text-red">NO debe encalar.</strong> Riesgo de dano neto: precipita fosforo, calcina microbiota benefica.<br>' +
      'Criterio: pH=' + ph + ' (&gt;=5.5) O sat.Al=' + alSat + '% (&lt;30%). Ambos deben cumplirse para encalar.';
  } else {
    const dosis = 1.5 * alEx;
    let msg = '<strong class="text-emerald">SI debe encalar.</strong> Se cumplen ambos criterios (pH&lt;5.5 Y sat.Al&gt;30%).<br>' +
      'Dosis recomendada: <span class="val">' + dosis.toFixed(1) + ' t/ha</span>.';
    if(dosis > 3){
      msg += '<br><strong class="text-amber">ADVERTENCIA:</strong> dosis &gt;3 t/ha. Particionar en dos aplicaciones separadas 60 días.';
    }
    msg += '<br><span class="text-dim">Aplicar 2-3 meses antes de siembra, incorporar 10-15 cm.</span>';
    out.innerHTML = msg;
  }

  state.calculator_uses.cochrane++;
  saveState();
}

function calcBocashi(){
  const ha = parseFloat(document.getElementById('bocashiHa').value) || 0;
  const cultivo = document.getElementById('bocashiCultivo').value;
  const kgMap = {hortalizas:3, frutales:2, cafe:1.5, pastos:0.5};
  const kgPerM2 = kgMap[cultivo] || 2;
  const totalKg = ha * 10000 * kgPerM2;
  const m3 = totalKg * 0.5 / 1000;
  const costCompra = totalKg * 4000;
  const costAuto = totalKg * 2000;
  const ahorro = costCompra - costAuto;

  document.getElementById('bocashiOutput').innerHTML =
    'Bocashi necesario por año: <span class="val">' + Math.round(totalKg).toLocaleString() + ' kg</span> (' + m3.toFixed(1) + ' m&#x00B3; aprox)<br>' +
    'Costo si compras (comercial): <span class="text-red">$' + costCompra.toLocaleString() + ' COP</span><br>' +
    'Costo si autoproduces: <span class="text-emerald">$' + costAuto.toLocaleString() + ' COP</span><br>' +
    '<strong>Ahorro por autoproducir: <span class="text-emerald">$' + ahorro.toLocaleString() + ' COP</span></strong>';

  state.calculator_uses.bocashi++;
  saveState();
}

// === SVG INTERACTIONS ===
function showCal(type){
  const rxn = document.getElementById('calReaction');
  if(type === 'cao'){
    rxn.textContent = 'CaO + H2O -> Ca(OH)2 + 63 kJ/mol (EXOTERMICA VIOLENTA, pH>12)';
    rxn.setAttribute('fill','#f87171');
  } else if(type === 'caoh'){
    rxn.textContent = 'Ca(OH)2 disuelto: pH ~12. Alcalinidad inmediata, no controlable.';
    rxn.setAttribute('fill','#fbbf24');
  } else {
    rxn.textContent = 'CaMg(CO3)2 + 2H+ -> Ca2+ + Mg2+ + 2H2O + 2CO2 (lenta, pH gradual 7-8)';
    rxn.setAttribute('fill','#10b981');
  }
}

let mycoState = true;
function toggleMyco(active){
  mycoState = active;
  document.getElementById('zoneMyco').style.display = active ? 'block' : 'none';
  document.getElementById('zoneNoMyco').style.display = active ? 'none' : 'block';
  document.getElementById('micOnBg').setAttribute('fill', active ? '#10b981' : '#334155');
  document.getElementById('micOnBg').setAttribute('stroke', active ? '#10b981' : '#475569');
  document.getElementById('micOffBg').setAttribute('fill', active ? '#334155' : '#f87171');
  document.getElementById('micOffBg').setAttribute('stroke', active ? '#475569' : '#f87171');
}

const charlaStates = [false, false, false];
function toggleCharla(idx){
  charlaStates[idx] = !charlaStates[idx];
  const texts = [
    ['RCT: NO. Chagra: NO.','RCT: NO. Chagra lo recomienda: NO'],
    ['RCT: NO. Chagra: NO.','RCT: NO. Chagra lo recomienda: NO'],
    ['RCT: NO. Chagra: NO.','RCT: NO. Chagra lo recomienda: NO']
  ];
  const el = document.getElementById('char'+idx+'res');
  if(el) el.textContent = charlaStates[idx] ? texts[idx][1] : 'Toca para ver';
  if(charlaStates[idx]){
    el.setAttribute('fill','#f87171');
  } else {
    el.setAttribute('fill','#94a3b8');
  }
}

// === RESUMEN / CERTIFICATE ===
function renderResumen(){
  // Calculate average
  const scores = Object.values(state.quiz_scores);
  let totalCorrect = 0, totalQuestions = 0;
  scores.forEach(s=>{ totalCorrect += s.correct; totalQuestions += s.total; });
  const avg = totalQuestions > 0 ? Math.round((totalCorrect/totalQuestions)*100) : 0;
  state.promedio_quizzes = avg / 100;

  document.getElementById('finalScore').textContent = avg + '%';

  // Breakdown
  const parts = ['parte_1','parte_2','parte_3','parte_4','parte_5','parte_6','parte_7'];
  const names = ['Parte 1: Suelo vivo','Parte 2: Eficiencia NPK','Parte 3: La cal','Parte 4: Ciencia 1990-2020','Parte 5: Pirámide','Parte 6: Transición 3 años','Parte 7: Honestidad'];
  let html = '';
  parts.forEach((p,i)=>{
    const s = state.quiz_scores[p];
    if(s){
      const pct = Math.round((s.correct/s.total)*100);
      const color = pct >= 60 ? 'text-emerald' : 'text-red';
      html += '<div style="display:flex;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid #1e293b">' +
        '<span>' + names[i] + '</span><span class="' + color + ' font-bold">' + s.correct + '/' + s.total + ' (' + pct + '%)</span></div>';
    } else {
      html += '<div style="display:flex;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid #1e293b;color:#94a3b8">' +
        '<span>' + names[i] + '</span><span>Sin completar</span></div>';
    }
  });
  document.getElementById('scoreBreakdown').innerHTML = html;

  // Certificate eligibility
  state.certificate_eligible = avg >= 70;
  if(state.certificate_eligible){
    document.getElementById('certSection').classList.remove('hidden');
    document.getElementById('noCertSection').classList.add('hidden');
    document.getElementById('certDate').textContent = new Date().toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'});
    if(state.user_name) updateCertName(state.user_name);
  } else {
    document.getElementById('certSection').classList.add('hidden');
    document.getElementById('noCertSection').classList.remove('hidden');
    document.getElementById('noCertScore').textContent = avg;
  }
  saveState();
}

function updateCertName(name){
  state.user_name = name;
  const disp = document.getElementById('certNameDisplay');
  if(disp) disp.textContent = name || '________________';
  saveState();
}

function shareUnit(){
  const url = 'https://chagra.bio/aprender/unidad/transición-15-15-15/';
  if(navigator.clipboard){
    navigator.clipboard.writeText(url).then(()=>{
      alert('Enlace copiado al portapapeles: ' + url);
    }).catch(()=>{
      prompt('Copia este enlace:', url);
    });
  } else {
    prompt('Copia este enlace:', url);
  }
}

// === INIT ===
function init(){
  updateProgress();
  updateNavButtons();

  // If returning to non-portada, restore position
  if(state.current_screen && state.current_screen !== 'portada' && SCREENS.includes(state.current_screen)){
    // Show saved screen
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const saved = document.getElementById('screen-'+state.current_screen);
    if(saved) saved.classList.add('active');
  }

  // Trigger carbon animation when visible
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting && entry.target.id === 'svgCarbono'){
        animateCarbono();
        observer.unobserve(entry.target);
      }
    });
  },{threshold:0.5});
  const svgC = document.getElementById('svgCarbono');
  if(svgC) observer.observe(svgC);
}

function animateCarbono(){
  // Simple animation: reduce bar height and update text
  const bar2010 = document.getElementById('bar2010');
  const txt2010 = document.getElementById('txt2010');
  if(bar2010) bar2010.setAttribute('height','75');
  if(txt2010) txt2010.textContent = '~50%';
}

// Initialize calculator defaults on load — defensivo: si el DOM ya esta listo
// (caso de script sin defer al final del body), ejecutar directamente. Si no,
// esperar DOMContentLoaded. Cubre todos los modos de carga.
function __chagraBootstrap(){
  init();
  calcNPK();
  calcCochrane();
  calcBocashi();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', __chagraBootstrap);
} else {
  __chagraBootstrap();
}
