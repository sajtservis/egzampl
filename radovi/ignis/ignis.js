/* Ignis hair — Sajt Servis */
(function () {
  "use strict";
  var doc = document.documentElement;
  var tiho = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* 5. Traka za radove: točkić miša pomera vodoravno */
  var traka = document.querySelector(".strip");
  if (traka) {
    traka.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { traka.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });
  }
})();
