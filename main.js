(function(){
'use strict';

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

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href');
    if(id==='#')return;
    const target=document.querySelector(id);
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
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

/* ===== CAROUSEL ===== */
const track=document.querySelector('.carousel-track');
const dots=document.querySelectorAll('.carousel-dot');
if(track&&dots.length){
  let current=0;
  function scrollToSlide(i){
    const cards=track.querySelectorAll('.impact-card');
    if(!cards[i])return;
    cards[i].scrollIntoView({behavior:'smooth',inline:'start',block:'nearest'});
    dots.forEach((d,j)=>d.classList.toggle('active',j===i));
    current=i;
  }
  dots.forEach((d,i)=>d.addEventListener('click',()=>scrollToSlide(i)));
  // Auto-advance every 5s
  let auto=setInterval(()=>{
    current=(current+1)%dots.length;
    scrollToSlide(current);
  },5000);
  // Pause on interaction
  track.addEventListener('pointerdown',()=>clearInterval(auto));
  // Sync dots with scroll
  track.addEventListener('scroll',()=>{
    const cards=Array.from(track.querySelectorAll('.impact-card'));
    const idx=cards.findIndex(c=>{
      const r=c.getBoundingClientRect();
      return r.left>=0&&r.left<window.innerWidth/2;
    });
    if(idx>=0){
      dots.forEach((d,j)=>d.classList.toggle('active',j===idx));
      current=idx;
    }
  },{passive:true});
}

/* ===== HEADER SHADOW ON SCROLL ===== */
const header=document.querySelector('.site-header');
window.addEventListener('scroll',()=>{
  if(window.scrollY>10){
    header.style.borderBottomColor='rgba(254,243,199,.15)';
  }else{
    header.style.borderBottomColor='rgba(254,243,199,.08)';
  }
},{passive:true});

/* ===== SECTION FADE-IN ON SCROLL ===== */
const sections=document.querySelectorAll('.mision-section,.agente-section,.audiencias-section,.soberania-section,.comparativa-section,.equipo-section');
const secObserver=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.opacity='1';
      entry.target.style.transform='translateY(0)';
      secObserver.unobserve(entry.target);
    }
  });
},{threshold:.15});
sections.forEach(s=>{
  s.style.opacity='0';
  s.style.transform='translateY(20px)';
  s.style.transition='opacity .6s ease, transform .6s ease';
  secObserver.observe(s);
});

})();
