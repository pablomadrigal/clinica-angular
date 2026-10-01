/* ===================================================================
   Formulario de agenda multi-paso — Contáctenos
   Valida en el cliente y envía la solicitud por WhatsApp (el backend de
   /api/citas en booking-system/ todavía no existe).
   =================================================================== */
(function () {
  var form = document.getElementById("booking-form");
  if (!form) return;

  var panels = form.querySelectorAll(".booking-panel");
  var pills = form.querySelectorAll(".step-pill");

  function showPanel(step) {
    panels.forEach(function (p) {
      p.hidden = p.getAttribute("data-panel") !== String(step);
    });
    pills.forEach(function (pill) {
      pill.classList.toggle("active", pill.getAttribute("data-step") === String(step));
    });
    var target = form.querySelector('[data-panel="' + step + '"]');
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.querySelectorAll("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = btn.closest(".booking-panel");
      if (!validatePanel(panel)) return;
      showPanel(btn.getAttribute("data-next"));
    });
  });
  form.querySelectorAll("[data-prev]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showPanel(btn.getAttribute("data-prev"));
    });
  });

  function validatePanel(panel) {
    var ok = true;
    panel.querySelectorAll("[required]").forEach(function (field) {
      var wrapper = field.closest(".form-field");
      var valid = field.checkValidity();
      if (wrapper) wrapper.classList.toggle("has-error", !valid);
      if (!valid) ok = false;
    });
    return ok;
  }

  // Captura de fuente del paciente (¿de qué página vino?)
  var origenField = document.getElementById("origen");
  if (origenField) {
    var params = new URLSearchParams(window.location.search);
    origenField.value =
      params.get("servicio") || document.referrer || "directo";
    var servicioSelect = document.getElementById("servicio");
    if (servicioSelect && params.get("servicio")) {
      servicioSelect.value = params.get("servicio");
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var lastPanel = form.querySelector('[data-panel="5"]');
    if (!validatePanel(lastPanel)) return;

    var data = Object.fromEntries(new FormData(form).entries());
    data.paginaOrigen = window.location.href;
    data.fechaSolicitud = new Date().toISOString();

    // Sin backend todavía (ver booking-system/): la solicitud viaja por WhatsApp.
    var lineas = ["Hola, quiero agendar una cita."];
    [
      ["Nombre", data.nombre],
      ["Servicio", data.servicio],
      ["Profesional", data.profesional],
      ["Sede", data.sede],
      ["Fecha", data.fecha],
      ["Hora", data.hora],
      ["Celular", data.celular],
      ["Correo", data.email],
      ["Mensaje", data.mensaje],
      ["Origen", data.origen],
    ].forEach(function (par) {
      var valor = (par[1] || "").trim();
      if (valor) lineas.push(par[0] + ": " + valor);
    });
    var url = window.ANGULAR.whatsappUrl(lineas.join("\n"));
    var enviar = document.getElementById("enviar-whatsapp");
    if (enviar) enviar.href = url;
    window.open(url, "_blank", "noopener");

    var resumen = document.getElementById("resumen-cita");
    if (resumen) {
      resumen.textContent =
        data.nombre +
        " · " +
        (data.servicio || "servicio a confirmar") +
        " · " +
        (data.fecha || "fecha a confirmar") +
        " " +
        (data.hora || "");
    }
    showPanel("confirmacion");
  });
})();
