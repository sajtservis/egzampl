/* Ignis hair — Sajt Servis */
(function () {
  "use strict";
  var doc = document.documentElement;
  var tiho = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 0. Snimak stoji ako korisnik ne zeli pokret */
  if (tiho) {
    document.querySelectorAll("video").forEach(function (v) { v.autoplay = false; v.pause(); });
  }

  /* 1. Ulaz vrha stranice */
  requestAnimationFrame(function () { doc.classList.add("spreman"); });

  /* 2. Ulaz delova svake sekcije.
        Provera na skrol, ne IntersectionObserver: radi i kad se skroluje naglo,
        pa nijedan deo ne ostane zauvek nevidljiv. */
  var meta = Array.prototype.slice.call(document.querySelectorAll("section, .pano, .citat, footer"));
  if (tiho) {
    meta.forEach(function (e) { e.classList.add("vid"); });
  } else {
    var ceka = false;
    function provera() {
      ceka = false;
      for (var i = meta.length - 1; i >= 0; i--) {
        if (meta[i].getBoundingClientRect().top < window.innerHeight * 0.92) {
          meta[i].classList.add("vid");
          meta.splice(i, 1);
        }
      }
      if (!meta.length) {
        window.removeEventListener("scroll", zakaži);
        window.removeEventListener("resize", zakaži);
      }
    }
    function zakaži() { if (!ceka) { ceka = true; requestAnimationFrame(provera); } }
    window.addEventListener("scroll", zakaži, { passive: true });
    window.addEventListener("resize", zakaži);
    provera();
    setTimeout(provera, 400);
  }

  /* 3. Opis usluge na prelazak mišem (desktop) */
  var op = document.getElementById("op");
  var podrazumevano = op ? op.textContent : "";
  document.querySelectorAll(".names button").forEach(function (b) {
    function prikazi() {
      if (!op) return;
      op.textContent = b.dataset.op;
      document.querySelectorAll(".names button").forEach(function (x) { x.removeAttribute("aria-current"); });
      b.setAttribute("aria-current", "true");
    }
    b.addEventListener("mouseenter", prikazi);
    b.addEventListener("focus", prikazi);
    b.addEventListener("click", prikazi);
  });
  var kolone = document.querySelector(".cols");
  if (kolone && op) {
    kolone.addEventListener("mouseleave", function () {
      op.textContent = podrazumevano;
      document.querySelectorAll(".names button").forEach(function (x) { x.removeAttribute("aria-current"); });
    });
  }

  /* 4. Prilika: kartice */
  var jezicci = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function izaberi(t) {
    jezicci.forEach(function (j) {
      var aktivan = j === t;
      j.setAttribute("aria-selected", aktivan ? "true" : "false");
      j.tabIndex = aktivan ? 0 : -1;
      var panel = document.getElementById(j.getAttribute("aria-controls"));
      if (panel) panel.hidden = !aktivan;
    });
  }
  jezicci.forEach(function (t, i) {
    t.addEventListener("click", function () { izaberi(t); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, n = null;
      if (k === "ArrowRight") n = jezicci[(i + 1) % jezicci.length];
      if (k === "ArrowLeft") n = jezicci[(i - 1 + jezicci.length) % jezicci.length];
      if (k === "Home") n = jezicci[0];
      if (k === "End") n = jezicci[jezicci.length - 1];
      if (n) { e.preventDefault(); izaberi(n); n.focus(); }
    });
  });

  /* 5. Donja traka se sklanja kad se skroluje nadole, da ne pokriva tekst */
  var zadnji = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY, dno = y + window.innerHeight >= document.body.scrollHeight - 80;
    doc.classList.toggle("traka-skriven", y > 240 && y > zadnji && !dno);
    zadnji = y;
  }, { passive: true });

  /* 6. Traka za radove: točkić miša pomera vodoravno */
  var traka = document.querySelector(".strip");
  if (traka) {
    traka.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { traka.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });
  }
})();

/* 7. Uvećana slika na klik */
(function () {
  "use strict";
  var lupa = document.getElementById("lupa");
  if (!lupa) return;
  var slika = document.getElementById("lupa-img"),
      webp = document.getElementById("lupa-webp"),
      opis = document.getElementById("lupa-t"),
      dugmad = Array.prototype.slice.call(document.querySelectorAll(".gl-btn")),
      gde = 0, vratiNa = null;

  function pokazi(i) {
    gde = (i + dugmad.length) % dugmad.length;
    var b = dugmad[gde];
    webp.srcset = b.dataset.pun + ".webp";
    slika.src = b.dataset.pun + ".jpg";
    slika.alt = b.dataset.opis || "";
    opis.textContent = b.dataset.opis + "  ·  " + (gde + 1) + " od " + dugmad.length;
  }
  function otvori(i) {
    vratiNa = dugmad[i];
    pokazi(i);
    lupa.hidden = false;
    document.body.classList.add("zakljucano");
    document.getElementById("lupa-x").focus();
  }
  function zatvori() {
    lupa.hidden = true;
    document.body.classList.remove("zakljucano");
    if (vratiNa) vratiNa.focus();
  }
  dugmad.forEach(function (b, i) { b.addEventListener("click", function () { otvori(i); }); });
  document.getElementById("lupa-x").addEventListener("click", zatvori);
  document.getElementById("lupa-p").addEventListener("click", function () { pokazi(gde - 1); });
  document.getElementById("lupa-s").addEventListener("click", function () { pokazi(gde + 1); });
  lupa.addEventListener("click", function (e) { if (e.target === lupa) zatvori(); });
  document.addEventListener("keydown", function (e) {
    if (lupa.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); zatvori(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); pokazi(gde + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); pokazi(gde - 1); }
    else if (e.key === "Tab") {           // zadrzi fokus u prozoru
      var f = lupa.querySelectorAll("button");
      var prvi = f[0], zadnji = f[f.length - 1];
      if (e.shiftKey && document.activeElement === prvi) { e.preventDefault(); zadnji.focus(); }
      else if (!e.shiftKey && document.activeElement === zadnji) { e.preventDefault(); prvi.focus(); }
    }
  });
})();
