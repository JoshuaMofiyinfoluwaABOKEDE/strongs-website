/**
 * Wires up carousels ([data-carousel]), self-advancing slideshows ([data-slideshow])
 * and countdowns ([data-countdown]). Shared by the site and the preview.
 */
export const carouselScript = `(function(){
function each(root,sel,fn){[].forEach.call(root.querySelectorAll(sel),fn)}
function carousels(){each(document,'[data-carousel]',function(c){
if(c.hasAttribute('data-ready'))return;
var t=c.querySelector('[data-carousel-track]');if(!t)return;
var ps=c.querySelectorAll('[data-carousel-prev]'),ns=c.querySelectorAll('[data-carousel-next]');
function step(){return Math.max(t.clientWidth*0.85,220)}
function upd(){var a=t.scrollLeft<=4,b=t.scrollLeft+t.clientWidth>=t.scrollWidth-4;
[].forEach.call(ps,function(p){p.disabled=a});[].forEach.call(ns,function(n){n.disabled=b});
if(t.scrollWidth>t.clientWidth+4){c.setAttribute('data-overflow','')}else{c.removeAttribute('data-overflow')}
c.toggleAttribute('data-at-end',b)}
[].forEach.call(ps,function(p){p.addEventListener('click',function(){t.scrollBy({left:-step(),behavior:'smooth'})})});
[].forEach.call(ns,function(n){n.addEventListener('click',function(){t.scrollBy({left:step(),behavior:'smooth'})})});
t.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);
var cnt=c.querySelector('[data-carousel-count]');if(cnt)cnt.textContent='· '+t.children.length+' in all';
c.setAttribute('data-ready','');upd();setTimeout(upd,600);});}
function shows(){each(document,'[data-slideshow]',function(s){
if(s.hasAttribute('data-ready'))return;
var slides=s.querySelectorAll('[data-slide]'),dots=s.querySelectorAll('[data-slide-dot]');
if(slides.length<2)return;
var i=0,ms=+s.getAttribute('data-interval')||6000,timer=null,paused=false,hover=false,pb=s.querySelector('[data-slide-pause]');
function show(k){i=(k+slides.length)%slides.length;
[].forEach.call(slides,function(el,j){el.setAttribute('data-active',j===i?'true':'false');el.setAttribute('aria-hidden',j===i?'false':'true')});
[].forEach.call(dots,function(d,j){d.setAttribute('aria-current',j===i?'true':'false')})}
function stop(){if(timer){clearInterval(timer);timer=null}}
function start(){stop();if(paused||hover)return;timer=setInterval(function(){if(!document.contains(s)){stop();return}show(i+1)},ms)}
each(s,'[data-slide-prev]',function(b){b.addEventListener('click',function(){show(i-1);start()})});
each(s,'[data-slide-next]',function(b){b.addEventListener('click',function(){show(i+1);start()})});
[].forEach.call(dots,function(d,j){d.addEventListener('click',function(){show(j);start()})});
if(pb)pb.addEventListener('click',function(){paused=!paused;pb.setAttribute('aria-pressed',paused?'true':'false');s.toggleAttribute('data-paused',paused);paused?stop():start()});
s.addEventListener('mouseenter',function(){hover=true;stop()});s.addEventListener('mouseleave',function(){hover=false;start()});
var x0=null;s.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
s.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40){show(dx<0?i+1:i-1);start()}},{passive:true});
s.setAttribute('data-ready','');show(0);start();});}
function countdowns(){each(document,'[data-countdown]',function(c){
if(c.hasAttribute('data-ready'))return;
var t=Date.parse(c.getAttribute('data-countdown')),end=Date.parse(c.getAttribute('data-countdown-end')||'')||t,h;
function set(k,v){each(c,'[data-cd="'+k+'"]',function(el){el.textContent=v})}
function pad(n){return n<10?'0'+n:''+n}
function tick(){if(!document.contains(c)){clearInterval(h);return}
var now=Date.now(),d=t-now;
if(d<=0){c.setAttribute('data-state',now<end?'live':'over');clearInterval(h);return}
var s=Math.floor(d/1000);set('days',Math.floor(s/86400));set('hours',pad(Math.floor(s%86400/3600)));set('minutes',pad(Math.floor(s%3600/60)));set('seconds',pad(s%60));c.setAttribute('data-state','soon')}
c.setAttribute('data-ready','');tick();h=setInterval(tick,1000);});}
function menus(){if(window.__strongsMenu)return;window.__strongsMenu=true;
function closeAll(except){each(document,'details[data-menu][open]',function(d){if(d!==except)d.removeAttribute('open')})}
document.addEventListener('click',function(e){var d=e.target.closest&&e.target.closest('details[data-menu]');
if(!d){closeAll(null);return}
if(e.target.closest('nav a')){setTimeout(function(){d.removeAttribute('open')},50)}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){var o=document.querySelector('details[data-menu][open]');if(o){o.removeAttribute('open');var s=o.querySelector('summary');if(s)s.focus()}}});}
function init(){carousels();shows();countdowns();menus()}
window.strongsCarousels=init;
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else{init()}
})();`;
