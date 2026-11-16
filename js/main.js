/* класс js ставим сразу (defer-скрипт), чтобы не было мигания анимаций */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function(){
  'use strict';
  var $ = function(id){return document.getElementById(id)};
  var store = {
    get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},
    set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  };
  // Ссылки WhatsApp настраивает js/i18n.js (с учётом языка).

  // scroll progress + header
  var prog=$('progress'), header=$('header');
  var tick=false;
  window.addEventListener('scroll',function(){
    if(tick) return; tick=true;
    requestAnimationFrame(function(){
      var h=document.documentElement.scrollHeight-window.innerHeight;
      prog.style.width=(h>0?(window.scrollY/h)*100:0)+'%';
      header.classList.toggle('scrolled',window.scrollY>30);
      tick=false;
    });
  },{passive:true});

  // Nav active on scroll
  var navLinks=document.querySelectorAll('#nav a');
  var ids=['top','obuchenie','perevody','o-sebe','kontakty'];
  var navTick=false;
  function navScroll(){
    var cur='top';
    for(var i=0;i<ids.length;i++){
      var el=$(ids[i]);
      if(el && el.getBoundingClientRect().top<160) cur=ids[i];
    }
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
      cur = 'kontakty';
    }
    navLinks.forEach(function(a){
      a.classList.toggle('on',a.getAttribute('data-sec')===cur);
    });
    navTick=false;
  }
  window.addEventListener('scroll',function(){if(navTick)return;navTick=true;requestAnimationFrame(navScroll)},{passive:true});
  navScroll();

  // Global Focus Trap & Focus Return
  var lastFocusedElement = null;

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab' && e.keyCode !== 9) return;
    var activeOverlay = document.querySelector('.modal.on') || document.querySelector('.panel.on');
    if (!activeOverlay) return;

    var focusableContent = activeOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableContent.length === 0) return;

    var firstFocusableElement = focusableContent[0];
    var lastFocusableElement = focusableContent[focusableContent.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  });

  function anyOpen(){
    return $('panel').classList.contains('on') || document.querySelector('.modal.on');
  }
  function unlock(){ if(!anyOpen()) document.body.classList.remove('lock'); }

  // Mobile menu
  var burger=$('burger'), panel=$('panel'), overlay=$('overlay');
  function openPanel(){
    lastFocusedElement = document.activeElement;
    panel.classList.add('on'); overlay.classList.add('on');
    burger.classList.add('on'); burger.setAttribute('aria-expanded','true');
    document.body.classList.add('lock');
    setTimeout(function(){ $('panelClose').focus(); }, 100);
  }
  function closePanel(){
    panel.classList.remove('on'); overlay.classList.remove('on');
    burger.classList.remove('on'); burger.setAttribute('aria-expanded','false');
    unlock();
    if(lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  }
  burger.addEventListener('click',function(){panel.classList.contains('on')?closePanel():openPanel()});
  overlay.addEventListener('click',closePanel);
  $('panelClose').addEventListener('click',closePanel);
  panel.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closePanel)});
  $('logoLink').addEventListener('click',function(e){
    e.preventDefault();
    if(panel.classList.contains('on')) closePanel();
    window.scrollTo({top:0,behavior:'smooth'});
  });

  // Modals
  document.querySelectorAll('[data-modal]').forEach(function(t){
    t.addEventListener('click',function(e){
      e.preventDefault();
      lastFocusedElement = document.activeElement;
      document.querySelectorAll('.modal.on').forEach(function(m){m.classList.remove('on')});
      var modal = $(t.getAttribute('data-modal'));
      modal.classList.add('on');
      document.body.classList.add('lock');
      setTimeout(function(){
        var closeBtn = modal.querySelector('.mclose');
        if(closeBtn) closeBtn.focus();
      }, 100);
    });
  });
  document.querySelectorAll('[data-close]').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.modal.on').forEach(function(m){m.classList.remove('on')});
      unlock();
      if(lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
      }
    });
  });
  document.querySelectorAll('.modal').forEach(function(m){
    m.addEventListener('click',function(e){
      if(e.target===m){
        m.classList.remove('on');
        unlock();
        if(lastFocusedElement) {
          lastFocusedElement.focus();
          lastFocusedElement = null;
        }
      }
    });
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'||e.keyCode===27){
      closePanel();
      document.querySelectorAll('.modal.on').forEach(function(m){m.classList.remove('on')});
      unlock();
      if(lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
      }
    }
  });

  // Promo: показывается один раз через 1,8 с, закрытие запоминается
  var promo=$('promo');
  setTimeout(function(){
    if(store.get('promo')==='hide' || store.get('promoShown')) return;
    store.set('promoShown','1');
    promo.classList.add('on');
  },1800);
  $('promoClose').addEventListener('click',function(){
    promo.classList.remove('on');
    store.set('promo','hide');
  });

  // Reveal
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add('on');obs.unobserve(e.target)}
      });
    },{threshold:.1});
    document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el)});
    setTimeout(function(){
      document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('on')});
    },3500);
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('on')});
  }

  // Карта: грузим только по клику — до этого внешних запросов нет
  var mapFrame=$('mapFrame'), mapWrap=$('mapWrap'), mapLoad=$('mapLoad');
  function loadMap(){
    if(!mapFrame || mapWrap.dataset.loaded) return;
    mapWrap.dataset.loaded='1';
    if(mapFrame.dataset.src) mapFrame.src=mapFrame.dataset.src;
    if(mapLoad) mapLoad.classList.add('off');
  }
  if(mapLoad) mapLoad.addEventListener('click', loadMap);

  // Отзывы Яндекса: тяжёлый виджет грузим только при приближении
  var revFrame=$('yaRev');
  if(revFrame && revFrame.dataset.src){
    if('IntersectionObserver' in window){
      var revObs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ revFrame.src=revFrame.dataset.src; revObs.disconnect(); }
        });
      },{rootMargin:'300px'});
      revObs.observe(revFrame);
    } else {
      revFrame.src=revFrame.dataset.src;
    }
  }

  // Cookie
  var cookie=$('cookie');
  if(!store.get('ck')) cookie.classList.add('on');
  function applyCk(){
    var on=cookie.classList.contains('on');
    document.body.classList.toggle('ck-on',on);
    document.documentElement.style.setProperty('--ck-h',on?(cookie.offsetHeight+22)+'px':'22px');
  }
  applyCk();
  window.addEventListener('resize',applyCk);
  $('ckAll').addEventListener('click',function(){store.set('ck','all');cookie.classList.remove('on');applyCk()});
  $('ckReq').addEventListener('click',function(){store.set('ck','req');cookie.classList.remove('on');applyCk()});

  // Custom FAQ Accordion
  var faqBtns = document.querySelectorAll('.faq-btn');
  faqBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var parent = this.closest('.faq');
      var isOpen = parent.classList.contains('open');
      
      // Close all
      document.querySelectorAll('.faq').forEach(function(f) {
        f.classList.remove('open');
        var b = f.querySelector('.faq-btn');
        if(b) b.setAttribute('aria-expanded', 'false');
      });
      
      // Toggle current
      if (!isOpen) {
        parent.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Year
  $('year').textContent=new Date().getFullYear();
});
