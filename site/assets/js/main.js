/* ===================================================================
   CLÍNICA ANGULAR — Interacciones + parallax (GSAP / ScrollTrigger)
   Animaciones MUY sutiles, deshabilitadas si el usuario prefiere
   movimiento reducido (WCAG 2.2 — 2.3.3 Animación por interacción).
   =================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // ---------- Menú móvil ----------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || typeof gsap === "undefined") {
    // Sin GSAP disponible (offline) o el usuario pidió menos movimiento:
    // el sitio se ve y funciona igual, simplemente sin el efecto de scroll.
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---------- Hero: la foto se "asienta" suavemente al hacer scroll ----------
  var heroImg = document.querySelector(".hero-media img");
  if (heroImg) {
    gsap.fromTo(
      heroImg,
      { scale: 1.08, yPercent: -4 },
      {
        scale: 1,
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      }
    );
  }

  // ---------- Imágenes de sección: se expanden suavemente al entrar ----------
  document.querySelectorAll(".reveal-media img").forEach(function (img) {
    gsap.fromTo(
      img,
      { scale: 1.15 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: img.closest(".reveal-media"),
          start: "top 85%",
          end: "bottom 30%",
          scrub: 0.8,
        },
      }
    );
  });

  // ---------- Fade-up sutil para bloques de contenido ----------
  document.querySelectorAll("[data-animate]").forEach(function (el) {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      }
    );
  });

  // ---------- Contadores de la franja de estadísticas ----------
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var counter = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: function () {
        gsap.to(counter, {
          val: target,
          duration: 1.4,
          ease: "power1.out",
          onUpdate: function () {
            el.textContent = Math.round(counter.val);
          },
        });
      },
    });
  });
});
