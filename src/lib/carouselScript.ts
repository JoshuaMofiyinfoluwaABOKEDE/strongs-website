/** Wires up every [data-carousel] on the page. Shared by the site and the preview. */
export const carouselScript = `(function(){
function init(){document.querySelectorAll('[data-carousel]').forEach(function(c){
if(c.hasAttribute('data-ready'))return;
var t=c.querySelector('[data-carousel-track]'),p=c.querySelector('[data-carousel-prev]'),n=c.querySelector('[data-carousel-next]');
if(!t||!p||!n)return;
function step(){return Math.max(t.clientWidth*0.85,220)}
function upd(){p.disabled=t.scrollLeft<=4;n.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-4;
if(t.scrollWidth>t.clientWidth+4){c.setAttribute('data-overflow','')}else{c.removeAttribute('data-overflow')}}
p.addEventListener('click',function(){t.scrollBy({left:-step(),behavior:'smooth'})});
n.addEventListener('click',function(){t.scrollBy({left:step(),behavior:'smooth'})});
t.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);
c.setAttribute('data-ready','');upd();});}
window.strongsCarousels=init;
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else{init()}
})();`;
