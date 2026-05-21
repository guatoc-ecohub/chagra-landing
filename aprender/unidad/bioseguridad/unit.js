// ============================================================
// CHAGRA BIOSEGURIDAD - UNIT CONTROLLER
// ============================================================
(function(){
'use strict';

// ===== STATE =====
const TOTAL_SCREENS = 10;
let currentScreen = 0;
const LS_KEY = 'chagra_unidad_bioseguridad';

// ===== NAVIGATION =====
function showScreen(n){
  for(let i=0;i<TOTAL_SCREENS;i++){
    document.getElementById('screen-'+i).classList.toggle('hide', i!==n);
  }
  currentScreen = n;
  updateProgress(n);
  updateHeader(n);
  saveProgress();
  window.scrollTo({top:0,behavior:'smooth'});
}

function updateProgress(n){
  const pct = Math.round((n/(TOTAL_SCREENS-1))*100);
  document.getElementById('progressFill').style.width = pct+'%';
}

function updateHeader(n){
  const labels = [
    'Portada','Introduccion','Parte 1: Como entra','Parte 2: Caso Bayer','Parte 3: Kit EPP',
    'Parte 4: Evidencia','Parte 5: Riesgos agroecología','Parte 6: Mezclas',
    'Parte 7: Practica','Resumen'
  ];
  document.getElementById('headerStep').textContent = (labels[n]||'Portada') + ' ('+n+'/'+(TOTAL_SCREENS-1)+')';
  document.getElementById('btnPrev').disabled = n===0;
  const nextBtn = document.getElementById('btnNextHeader');
  nextBtn.disabled = n===TOTAL_SCREENS-1;
  if(n===TOTAL_SCREENS-1) nextBtn.style.visibility='hidden';
  else nextBtn.style.visibility='visible';
}

function navNext(){
  if(currentScreen < TOTAL_SCREENS-1) showScreen(currentScreen+1);
}
function navPrev(){
  if(currentScreen > 0) showScreen(currentScreen-1);
}
function goTo(n){ showScreen(n); }

// Keyboard navigation
document.addEventListener('keydown', e=>{
  if(e.key==='ArrowRight' && currentScreen<TOTAL_SCREENS-1) navNext();
  if(e.key==='ArrowLeft' && currentScreen>0) navPrev();
});

// ===== LOCALSTORAGE =====
function getState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {started_at:new Date().toISOString(),current_screen:0,screens_visited:[],quiz_scores:{},completion_pct:0,promedio_quizzes:0,certificate_eligible:false,calculator_uses:{}};
}

function saveProgress(){
  const s = getState();
  s.current_screen = currentScreen;
  s.last_visit = new Date().toISOString();
  if(!s.screens_visited.includes(currentScreen)) s.screens_visited.push(currentScreen);
  s.completion_pct = Math.round((s.screens_visited.length/TOTAL_SCREENS)*100);
  // Count quiz scores
  const quizzes = Object.values(s.quiz_scores);
  if(quizzes.length>0){
    const totalCorrect = quizzes.reduce((a,q)=>a+q.correct,0);
    const totalQ = quizzes.reduce((a,q)=>a+q.total,0);
    s.promedio_quizzes = totalQ>0 ? Math.round((totalCorrect/totalQ)*1000)/1000 : 0;
    s.certificate_eligible = s.promedio_quizzes >= 0.70;
  }
  localStorage.setItem(LS_KEY, JSON.stringify(s));
  updatePreviousProgress(s);
}

function updatePreviousProgress(s){
  const box = document.getElementById('previousProgress');
  const txt = document.getElementById('previousProgressText');
  if(!s || !s.screens_visited || s.screens_visited.length<=1){
    if(box) box.style.display='none';
    return;
  }
  if(box) box.style.display='block';
  if(txt) txt.textContent = s.completion_pct+'% completado. Ultima visita: '+new Date(s.last_visit||Date.now()).toLocaleDateString('es-CO');
}

function recordQuiz(parte, correct, total){
  const s = getState();
  if(!s.quiz_scores[parte] || correct > s.quiz_scores[parte].correct){
    s.quiz_scores[parte] = {correct,total,attempts:(s.quiz_scores[parte]?.attempts||0)+1,completed_at:new Date().toISOString()};
  }else{
    s.quiz_scores[parte].attempts = (s.quiz_scores[parte].attempts||0)+1;
  }
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

// ===== QUIZ SYSTEM =====
document.querySelectorAll('.quiz-wrap').forEach(wrap=>{
  const parte = wrap.dataset.quiz;
  const items = wrap.querySelectorAll('.quiz-item');
  let correctCount = 0;

  items.forEach(item=>{
    const qnum = item.dataset.q;
    const options = item.querySelectorAll('.quiz-option');
    const feedback = item.querySelector('.quiz-feedback');

    options.forEach(opt=>{
      opt.addEventListener('click',function(){
        if(opt.disabled) return;
        const isCorrect = opt.dataset.correct==='true';

        // Disable all options for this question
        options.forEach(o=>{
          o.disabled = true;
          if(o.dataset.correct==='true') o.classList.add('correct');
          else if(o===opt && !isCorrect) o.classList.add('wrong');
        });

        // Show feedback
        if(isCorrect){
          correctCount++;
          feedback.textContent = 'Correcto. Buen trabajo.';
          feedback.className = 'quiz-feedback show correct';
        }else{
          feedback.textContent = 'Incorrecto. La respuesta correcta está marcada en verde.';
          feedback.className = 'quiz-feedback show wrong';
        }

        // Check if all answered
        const allAnswered = Array.from(items).every(it=>{
          return Array.from(it.querySelectorAll('.quiz-option')).some(o=>o.disabled);
        });

        if(allAnswered){
          const total = items.length;
          const pct = Math.round((correctCount/total)*100);
          recordQuiz(parte, correctCount, total);
          const scoreEl = wrap.querySelector('.quiz-score');
          scoreEl.textContent = 'Resultado: '+correctCount+'/'+total+' ('+pct+'%)';
          scoreEl.style.display = 'block';
          if(pct>=60){
            scoreEl.style.color = '#10b981';
          }else{
            scoreEl.style.color = '#f87171';
          }
        }
      });
    });
  });
});

// ===== CALCULATOR: EPP RISK =====
function calcEpp(){
  const items = {
    'epp-gafas':95,'epp-mascara':80,'epp-guantes':70,'epp-overol':60,'epp-botas':50,'epp-jabon':40
  };
  let totalProtection = 0;
  let checkedCount = 0;
  for(const[id,prot] of Object.entries(items)){
    if(document.getElementById(id).checked){ totalProtection+=prot; checkedCount++; }
  }
  // Compound protection (multiplicative approximation)
  const checked = Object.keys(items).filter(id=>document.getElementById(id).checked);
  let remaining = 100;
  checked.forEach(id=>{
    const prot = items[id];
    remaining *= (1 - prot/100);
  });
  const absorption = Math.round(remaining);

  const result = document.getElementById('eppResult');
  if(checkedCount===0){
    result.innerHTML = '<span class="result-num">100%</span> de absorcion de químico - sin protección alguna. Marca los items arriba.';
    result.style.borderColor = '#f87171';
  }else if(absorption<10){
    result.innerHTML = '<span class="result-num">~'+absorption+'%</span> de absorcion estimada. <strong style="color:#10b981">Excelente protección.</strong> Con este EPP reduce drasticamente el riesgo.';
    result.style.borderColor = '#10b981';
  }else if(absorption<40){
    result.innerHTML = '<span class="result-num">~'+absorption+'%</span> de absorcion estimada. <strong style="color:#fbbf24">Proteccion parcial.</strong> Considere completar el kit.';
    result.style.borderColor = '#fbbf24';
  }else{
    result.innerHTML = '<span class="result-num">~'+absorption+'%</span> de absorcion estimada. <strong style="color:#f87171">Proteccion insuficiente.</strong> Su cuerpo sigue absorbiendo mucho químico.';
    result.style.borderColor = '#f87171';
  }
  trackCalc('epp_riesgo');
}

// ===== CALCULATOR: BIO RISK DETECTOR =====
const BIO_RISKS = {
  jwa:{
    level:'danger',levelText:'ALTO RIESGO',
    text:'Hidroxido de potasio (KOH) es corrosivo grado industrial. pH ~13-14. Puede causar ceguera y quemaduras de 3er grado en menos de 30 segundos.',
    epp:'Gafas quimicas selladas + guantes nitrilo grueso + mascarilla N95 + manga larga + lugar ventilado',
    contraindicated:'Ninos, embarazadas, personas con problemas respiratorios',
    place:'Lugar ventilado al aire libre. NUNCA en cocina cerrada'
  },
  calviva:{
    level:'danger',levelText:'ALTO RIESGO',
    text:'Cal viva (CaO) produce reacciones exotermicas y quemaduras alcalinas profundas. Peor que acidas por mayor penetracion tisular.',
    epp:'Gafas + guantes nitrilo grueso + mascarilla + manga larga + lugar ventilado',
    contraindicated:'Ninos, embarazadas, personas con piel sensible',
    place:'Lugar ventilado al aire libre'
  },
  bordelés:{
    level:'warn',levelText:'RIESGO MODERADO',
    text:'Sulfato de cobre acumulativo en hígado y riñón. Toxicidad crónica por exposición repetida.',
    epp:'Mascarilla N95 para preparación + gafas + guantes',
    contraindicated:'Personas con problemas hepaticos o renales',
    place:'Lugar con ventilacion'
  },
  sulfocálcico:{
    level:'warn',levelText:'RIESGO MODERADO',
    text:'Azufre puede irritar vias respiratorias. Gases sulfurados en mezclas inadecuadas.',
    epp:'Mascarilla N95 + gafas + guantes + manga larga',
    contraindicated:'Asmaticos, personas con EPOC',
    place:'Lugar ventilado'
  },
  compost:{
    level:'info',levelText:'RIESGO BAJO (con precaución)',
    text:'Esporas de Aspergillus fumigatus pueden causar aspergilosis pulmonar en inmunocomprometidos.',
    epp:'Mascarilla N95 durante volteo',
    contraindicated:'VIH, diabetes mal controlada, EPOC, tratamiento immunosupresor',
    place:'Al aire libre'
  },
  vinagre:{
    level:'success',levelText:'RIESGO MINIMO',
    text:'Vinagre pirolenhoso es de los biopreparados más seguros. Puede irritar ojos y piel en concentraciones altas.',
    epp:'Gafas basicas recomendadas para preparación concentrada',
    contraindicated:'Ninguno especial',
    place:'Cualquier lugar ventilado'
  }
};

function showBioRisk(){
  const sel = document.getElementById('bioSelect').value;
  const result = document.getElementById('bioResult');
  if(!sel){ result.style.display='none'; return; }
  const data = BIO_RISKS[sel];
  if(!data){ result.style.display='none'; return; }

  const levelDiv = document.getElementById('bioRiskLevel');
  levelDiv.className = 'callout ' + (data.level==='danger'?'warn':data.level==='warn'?'amber':data.level==='info'?'info':'success');
  levelDiv.innerHTML = '<p class="callout-title">'+data.levelText+'</p><p>'+data.text+'</p>';

  document.getElementById('bioEPP').innerHTML = '<strong style="color:#06b6d4">EPP requerido:</strong> '+data.epp;
  document.getElementById('bioContraindicated').innerHTML = '<strong style="color:#f87171">Quienes NO deben manipularlo:</strong> '+data.contraindicated;
  document.getElementById('bioPlace').innerHTML = '<strong style="color:#fbbf24">Lugar de preparación:</strong> '+data.place;

  result.style.display = 'block';
  trackCalc('bio_detector');
}

// ===== CALCULATOR: MIX DETECTOR =====
const MIX_MATRIX = {
  'bordelés+sulfocálcico':'PROHIBIDO: Precipita CuS inutilizable + libera gases sulfurados toxicos.',
  'sulfocálcico+bordelés':'PROHIBIDO: Precipita CuS inutilizable + libera gases sulfurados toxicos.',
  'bordelés+tricho':'PROHIBIDO: El cobre mata Trichoderma. Destruye el biocontrol.',
  'tricho+bordelés':'PROHIBIDO: El cobre mata Trichoderma. Destruye el biocontrol.',
  'bordelés+bacillus':'PROHIBIDO: El cobre mata Bacillus. Destruye el biocontrol.',
  'bacillus+bordelés':'PROHIBIDO: El cobre mata Bacillus. Destruye el biocontrol.',
  'bordelés+aceites':'PROHIBIDO: Fitotoxicidad severa. Puede quemar las hojas.',
  'aceites+bordelés':'PROHIBIDO: Fitotoxicidad severa. Puede quemar las hojas.',
  'sulfocálcico+tricho':'PROHIBIDO: El azufre mata Trichoderma.',
  'tricho+sulfocálcico':'PROHIBIDO: El azufre mata Trichoderma.',
  'sulfocálcico+bacillus':'PROHIBIDO: El azufre mata Bacillus.',
  'bacillus+sulfocálcico':'PROHIBIDO: El azufre mata Bacillus.',
  'acido+cloro':'PROHIBIDO: Gas cloro (Cl2) - quemadura pulmonar, potencialmente mortal.',
  'cloro+acido':'PROHIBIDO: Gas cloro (Cl2) - quemadura pulmonar, potencialmente mortal.',
  'cloro+amonio':'PROHIBIDO: Cloramina (NH2Cl) - tóxica respiratoria.',
  'amonio+cloro':'PROHIBIDO: Cloramina (NH2Cl) - tóxica respiratoria.',
  'purin+bordelés':'PRECAUCION-48h: Esperar 48h entre aplicaciones. El hierro precipita con el cobre.',
  'bordelés+purin':'PRECAUCION-48h: Esperar 48h entre aplicaciones. El hierro precipita con el cobre.',
  'tricho+aceites':'PRECAUCION-48h: Aceites pueden afectar viabilidad de Trichoderma.',
  'aceites+tricho':'PRECAUCION-48h: Aceites pueden afectar viabilidad de Trichoderma.',
  'bacillus+aceites':'PRECAUCION-48h: Aceites pueden afectar viabilidad de Bacillus.',
  'aceites+bacillus':'PRECAUCION-48h: Aceites pueden afectar viabilidad de Bacillus.',
  'sulfocálcico+aceites':'PRECAUCION-48h: Puede aumentar fitotoxicidad del azufre.',
  'aceites+sulfocálcico':'PRECAUCION-48h: Puede aumentar fitotoxicidad del azufre.'
};

function checkMix(){
  const a = document.getElementById('mixA').value;
  const b = document.getElementById('mixB').value;
  const result = document.getElementById('mixResult');
  if(!a||!b){ result.style.display='none'; return; }
  if(a===b){ result.style.display='none'; return; }

  const key = a+'+'+b;
  const outcome = MIX_MATRIX[key];

  if(!outcome){
    result.innerHTML = '<strong style="color:#10b981">SEGURO</strong> - No hay incompatibilidad conocida entre estos productos.';
    result.style.borderColor = '#10b981';
  }else if(outcome.startsWith('PROHIBIDO')){
    result.innerHTML = '<strong style="color:#f87171">'+outcome+'</strong>';
    result.style.borderColor = '#f87171';
  }else{
    result.innerHTML = '<strong style="color:#fbbf24">'+outcome+'</strong>';
    result.style.borderColor = '#fbbf24';
  }
  result.style.display = 'block';
  trackCalc('mezclas_peligrosas');
}

// ===== CALCULATOR: COST EPP VS DISEASE =====
const RISK_TABLE = {
  glifosato:{risk:0.5,disease:'linfoma no Hodgkin',costLow:50000000,costHigh:200000000},
  paraquat:{risk:1.5,disease:'enfermedad de Parkinson',costLow:5000000,costHigh:20000000},
  clorpirifos:{risk:0.3,disease:'trastorno neurologico',costLow:30000000,costHigh:100000000},
  mancozeb:{risk:0.4,disease:'cáncer tiroideo',costLow:30000000,costHigh:100000000}
};

function calcCost(){
  const years = parseFloat(document.getElementById('workYears').value)||0;
  const chem = document.getElementById('chemicalType').value;
  const data = RISK_TABLE[chem];
  const result = document.getElementById('costResult');

  if(!data || years<=0){
    result.innerHTML = '<span class="result-num">0%</span> riesgo &middot; Ingrese años y químico arriba.';
    return;
  }

  const accumRisk = Math.min(years * data.risk, 99);
  const avgCost = Math.round((data.costLow + data.costHigh)/2);
  const projectedCost = Math.round(avgCost * (accumRisk/100));
  const kitCostPerYear = 150000;
  const totalKitCost = kitCostPerYear * years;
  const ratio = totalKitCost>0 ? Math.round(projectedCost/totalKitCost) : 0;

  let html = '<span class="result-num">'+accumRisk.toFixed(1)+'%</span> riesgo acumulado de '+data.disease+'<br>';
  html += 'Costo proyectado si enferma: <strong>$'+projectedCost.toLocaleString('es-CO')+' COP</strong><br>';
  html += 'Costo total kit EPP ('+years+' años): <strong>$'+totalKitCost.toLocaleString('es-CO')+' COP</strong><br>';
  if(ratio>0) html += '<strong style="color:#10b981">$1 en EPP = ~$'+ratio.toLocaleString('es-CO')+' ahorrado en salud</strong>';

  result.innerHTML = html;
  trackCalc('epp_vs_enfermedad');
}

// ===== ROUTINE GAME (step ordering) =====
let routineOrder = [];
const CORRECT_ROUTINE = [1,2,3,4,5,6,7]; // indices 0-based: step numbers

function selectRoutineStep(el){
  const step = parseInt(el.dataset.step);
  const numEl = document.getElementById('num-'+step);

  // If already assigned, unassign
  const existingIdx = routineOrder.indexOf(step);
  if(existingIdx>=0){
    routineOrder.splice(existingIdx,1);
    numEl.textContent = '?';
    el.classList.remove('correct','wrong');
    updateRoutineFeedback();
    return;
  }

  // Assign next number
  routineOrder.push(step);
  numEl.textContent = routineOrder.length;

  // Check if complete
  if(routineOrder.length===7){
    // Verify order
    let allCorrect = true;
    for(let i=0;i<7;i++){
      const elStep = routineOrder[i];
      const correctStep = CORRECT_ROUTINE[i];
      const item = document.querySelector('.drag-item[data-step="'+elStep+'"]');
      if(elStep===correctStep){
        item.classList.add('correct');
      }else{
        item.classList.add('wrong');
        allCorrect = false;
      }
    }
    const fb = document.getElementById('routineFeedback');
    if(allCorrect){
      fb.textContent = 'Orden correcto. Protege su cuerpo en cada paso.';
      fb.className = 'quiz-feedback show correct';
    }else{
      fb.textContent = 'Algunos pasos están en orden incorrecto. Los marcados en verde están bien, los rojos deben revisarse.';
      fb.className = 'quiz-feedback show wrong';
    }
  }
}

function resetRoutine(){
  routineOrder = [];
  document.querySelectorAll('.drag-item').forEach(el=>{
    el.classList.remove('correct','wrong');
    const step = el.dataset.step;
    document.getElementById('num-'+step).textContent = '?';
  });
  document.getElementById('routineFeedback').className = 'quiz-feedback';
  document.getElementById('routineFeedback').textContent = '';
}

function updateRoutineFeedback(){
  if(routineOrder.length<7){
    document.getElementById('routineFeedback').className = 'quiz-feedback';
    document.getElementById('routineFeedback').textContent = '';
  }
}

// ===== CERTIFICATE / SUMMARY =====
function showCertificate(){
  const s = getState();
  const quizzes = s.quiz_scores || {};
  const keys = Object.keys(quizzes);

  // Calculate average
  let totalCorrect = 0, totalQuestions = 0;
  keys.forEach(k=>{
    totalCorrect += quizzes[k].correct;
    totalQuestions += quizzes[k].total;
  });
  const avg = totalQuestions>0 ? Math.round((totalCorrect/totalQuestions)*100) : 0;

  document.getElementById('finalScore').innerHTML = avg+'<span>%</span>';

  if(avg>=70){
    document.getElementById('certTitle').textContent = 'Certificado de completitud';
    document.getElementById('certSub').textContent = 'Completaste la unidad de Bioseguridad en el campo';
    document.getElementById('certMessage').innerHTML = '<strong style="color:#10b981">Felicidades.</strong> Promedio: '+avg+'%. Has demostrado comprension de los temas de bioseguridad.';
    document.getElementById('certQR').style.display = 'block';
    document.getElementById('certQRLabel').style.display = 'block';
  }else if(avg>=40){
    document.getElementById('certTitle').textContent = 'Unidad completada';
    document.getElementById('certSub').textContent = 'Bioseguridad en el campo';
    document.getElementById('certMessage').innerHTML = 'Promedio: '+avg+'%. Te invitamos a <strong>repasar las partes con bajo puntaje</strong> y reintentar los quizzes para obtener el certificado.';
    document.getElementById('certQR').style.display = 'none';
    document.getElementById('certQRLabel').style.display = 'none';
  }else{
    document.getElementById('certTitle').textContent = 'Sigue aprendiendo';
    document.getElementById('certSub').textContent = 'Bioseguridad en el campo';
    document.getElementById('certMessage').innerHTML = 'Promedio: '+avg+'%. Te recomendamos <strong>repasar la unidad completa</strong> antes de continuar. La bioseguridad es tema de vida o muerte.';
    document.getElementById('certQR').style.display = 'none';
    document.getElementById('certQRLabel').style.display = 'none';
  }

  // Score breakdown
  const names = {
    parte_1:'Parte 1: Como entra el químico',
    parte_2:'Parte 2: Caso Bayer-Monsanto',
    parte_3:'Parte 3: Kit de protección',
    parte_4:'Parte 4: Evidencia científica',
    parte_5:'Parte 5: Riesgos agroecología',
    parte_6:'Parte 6: Mezclas prohibidas',
    parte_7:'Parte 7: Practica del agricultor'
  };
  let breakdownHtml = '';
  Object.keys(names).forEach(k=>{
    const q = quizzes[k];
    if(q){
      const pct = Math.round((q.correct/q.total)*100);
      const color = pct>=70?'#10b981':pct>=40?'#fbbf24':'#f87171';
      breakdownHtml += '<div style="margin-bottom:.5rem"><strong style="color:'+color+'">'+pct+'%</strong> - '+names[k]+' ('+q.correct+'/'+q.total+')</div>';
    }else{
      breakdownHtml += '<div style="margin-bottom:.5rem;color:#64748b">-- - '+names[k]+' (sin intentar)</div>';
    }
  });
  document.getElementById('scoreBreakdown').innerHTML = breakdownHtml;
}

// ===== TRACKING CALC USES =====
function trackCalc(name){
  const s = getState();
  s.calculator_uses = s.calculator_uses || {};
  s.calculator_uses[name] = (s.calculator_uses[name]||0)+1;
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

// ===== INIT =====
function init(){
  const s = getState();
  // If returning user, show where they left off (but allow restart)
  if(s.screens_visited && s.screens_visited.length>0){
    updatePreviousProgress(s);
  }
  // Start at screen 0 always (user can see previous progress message)
  showScreen(0);

  // Hook certificate generation when reaching screen 9
  const origGoTo = window.goTo;
  window.goTo = function(n){
    if(n===9) showCertificate();
    showScreen(n);
  };
}

// Expose to global
window.navNext = navNext;
window.navPrev = navPrev;
window.goTo = goTo;
window.calcEpp = calcEpp;
window.showBioRisk = showBioRisk;
window.checkMix = checkMix;
window.calcCost = calcCost;
window.selectRoutineStep = selectRoutineStep;
window.resetRoutine = resetRoutine;

// Start
document.addEventListener('DOMContentLoaded', init);

})();
