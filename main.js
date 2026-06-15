(function(){
'use strict';

const root=document.documentElement;

/* ===== I18N + AUDIENCIA · toggles ===== */
/* El contenido vive duplicado en el HTML con [data-lang-block="es|en"] y, donde
   aplica, [data-aud-show="campesino|institucion"]. JS solo alterna atributos en
   <html> y la visibilidad real; sin texto inyectado (compatible con CSP estricta
   y con SEO: ambos idiomas están en el DOM). */

function applyVisibility(){
  const lang=root.getAttribute('data-lang')||'es';
  const aud=root.getAttribute('data-aud')||'campesino';
  // Bloques por idioma
  document.querySelectorAll('[data-lang-block]').forEach(el=>{
    const matchLang=el.getAttribute('data-lang-block')===lang;
    // Si además depende de audiencia, ambos deben coincidir
    const audAttr=el.getAttribute('data-aud-show');
    const matchAud=!audAttr||audAttr===aud;
    el.hidden=!(matchLang&&matchAud);
  });
  // Elementos que SOLO dependen de audiencia (sin data-lang-block propio)
  document.querySelectorAll('[data-aud-show]:not([data-lang-block])').forEach(el=>{
    el.hidden=el.getAttribute('data-aud-show')!==aud;
  });
}

function setLang(lang){
  root.setAttribute('data-lang',lang);
  root.setAttribute('lang',lang==='en'?'en':'es-CO');
  document.querySelectorAll('[data-lang-set]').forEach(b=>{
    const on=b.getAttribute('data-lang-set')===lang;
    b.classList.toggle('is-active',on);
    b.setAttribute('aria-pressed',on?'true':'false');
  });
  try{localStorage.setItem('chagra-lang',lang);}catch(e){/* private mode */}
  applyVisibility();
}

function setAud(aud){
  root.setAttribute('data-aud',aud);
  document.querySelectorAll('[data-aud-set]').forEach(b=>{
    const on=b.getAttribute('data-aud-set')===aud;
    b.classList.toggle('is-active',on);
    b.setAttribute('aria-pressed',on?'true':'false');
  });
  try{localStorage.setItem('chagra-aud',aud);}catch(e){/* private mode */}
  applyVisibility();
}

document.querySelectorAll('[data-lang-set]').forEach(b=>{
  b.addEventListener('click',()=>setLang(b.getAttribute('data-lang-set')));
});
document.querySelectorAll('[data-aud-set]').forEach(b=>{
  b.addEventListener('click',()=>setAud(b.getAttribute('data-aud-set')));
});

// Restaurar preferencias guardadas o detectar idioma del navegador
(function initPrefs(){
  let lang='es',aud='campesino';
  try{
    const sl=localStorage.getItem('chagra-lang');
    const sa=localStorage.getItem('chagra-aud');
    if(sl==='es'||sl==='en')lang=sl;
    else if((navigator.language||'').toLowerCase().startsWith('en'))lang='en';
    if(sa==='campesino'||sa==='institucion')aud=sa;
  }catch(e){/* private mode */}
  setLang(lang);
  setAud(aud);
})();

/* ===== MOBILE MENU ===== */
const toggle=document.querySelector('.mobile-menu-toggle');
const nav=document.getElementById('primary-nav');
if(toggle&&nav){
  toggle.addEventListener('click',()=>{
    const expanded=toggle.getAttribute('aria-expanded')==='true';
    toggle.setAttribute('aria-expanded',!expanded);
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    toggle.setAttribute('aria-expanded','false');
    nav.classList.remove('open');
  }));
}

/* ===== ANCHOR LINKS ===== */
/* Sin smooth-scroll: peleaba con el control del usuario y se sentia jumpy
   en mobile (operator report 2026-05-19). Anchor links nativos + el ajuste
   manual de offset por el header fixed lo resuelve sin animacion forzada. */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href');
    if(id==='#')return;
    const target=document.querySelector(id);
    if(target){
      e.preventDefault();
      const headerH=60;
      const top=target.getBoundingClientRect().top+window.scrollY-headerH-8;
      window.scrollTo(0,top);
    }
  });
});

/* ===== COUNTER ANIMATION ===== */
const counters=document.querySelectorAll('.stat-num[data-target]');
function animateCounter(el){
  const target=parseInt(el.dataset.target,10);
  const duration=1500;
  const start=performance.now();
  function tick(now){
    const elapsed=now-start;
    const progress=Math.min(elapsed/duration,1);
    const eased=1-Math.pow(1-progress,3);
    el.textContent=Math.round(eased*target);
    if(progress<1)requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counterObserver=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
},{threshold:.5});
counters.forEach(c=>counterObserver.observe(c));

/* ===== HEADER SHADOW ON SCROLL ===== */
const header=document.querySelector('.site-header');
if(header){
  window.addEventListener('scroll',()=>{
    header.style.borderBottomColor=window.scrollY>10
      ?'rgba(248,250,252,.15)':'rgba(248,250,252,.08)';
  },{passive:true});
}

})();
