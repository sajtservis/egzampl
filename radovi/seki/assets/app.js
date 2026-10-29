(function(){
"use strict";
var d=document,$=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

/* meni na telefonu */
var menu=$("#menu"),nav=$("#nav");
function setMenu(o){nav.classList.toggle("open",o);menu.setAttribute("aria-expanded",String(o));menu.setAttribute("aria-label",o?"Zatvori meni":"Otvori meni")}
menu.addEventListener("click",function(){setMenu(!nav.classList.contains("open"))});
$$("a",nav).forEach(function(a){a.addEventListener("click",function(){setMenu(false)})});

/* zaglavlje, donja traka, laka paralaksa */
var top_=$("#top"),bar=$("#bar"),img=$("#heroImg"),last=0,tick=false;
function onScroll(){
  var y=window.scrollY||0,h=window.innerHeight;
  top_.classList.toggle("solid",y>h*.6);
  top_.classList.toggle("hide",y>h*.8&&y>last+4);
  if(y<last-4)top_.classList.remove("hide");
  bar.classList.toggle("on",y>h*.55);
  if(!reduce&&img&&y<h*1.2&&window.innerWidth<980)img.style.transform="translate3d(0,"+(y*-.06).toFixed(1)+"px,0)";
  last=y;tick=false;
}
window.addEventListener("scroll",function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();

/* ulazak elemenata: skriveni tek kad JS krene, bez JS-a sve je vidljivo */
if("IntersectionObserver" in window&&!reduce){
  var els=$$(".steps li,.fig,.sv li,.note,.rate>*,.faq details,.vc,.hrs div");
  els.forEach(function(e,i){e.classList.add("rv");e.style.transitionDelay=(i%4)*70+"ms"});
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{rootMargin:"0px 0px -8% 0px",threshold:.08});
  els.forEach(function(e){io.observe(e)});
  setTimeout(function(){els.forEach(function(e){e.classList.add("in")})},6000);
}

/* brojač ocene */
(function(){
  var el=$("#big");if(!el||reduce||!("IntersectionObserver" in window))return;
  var o=new IntersectionObserver(function(en){if(!en[0].isIntersecting)return;o.disconnect();
    var t0=null;(function f(t){t0=t0||t;var p=Math.min((t-t0)/1400,1),v=5*(1-Math.pow(1-p,3));el.textContent=v.toFixed(1).replace(".",",");if(p<1)requestAnimationFrame(f);else el.textContent="5,0"})(performance.now());
  },{threshold:.5});o.observe(el);
})();

/* pošalji lokaciju na WhatsApp */
var WA="381695069702";
function open_(url){window.open(url,"_blank","noopener")}
$$("[data-loc]").forEach(function(b){
  b.addEventListener("click",function(){
    var hint=$("#locHint"),base="https://wa.me/"+WA+"?text=";
    function plain(){open_(base+encodeURIComponent("Zdravo, pukla mi je guma. Nalazim se na: "))}
    if(!navigator.geolocation){plain();return}
    if(hint)hint.textContent="Tražim vašu lokaciju…";
    navigator.geolocation.getCurrentPosition(function(p){
      var u="https://www.google.com/maps?q="+p.coords.latitude.toFixed(6)+","+p.coords.longitude.toFixed(6);
      if(hint)hint.textContent="Lokacija je spremna. Otvara se WhatsApp.";
      open_(base+encodeURIComponent("Zdravo, pukla mi je guma. Evo moje lokacije: "+u));
    },function(){
      if(hint)hint.textContent="Bez lokacije: napišite u poruci gde se nalazite.";
      plain();
    },{enableHighAccuracy:true,timeout:9000,maximumAge:60000});
  });
});
})();
