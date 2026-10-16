/* Datos NAP centralizados — cambiar aquí actualiza todo el sitio */
window.ANGULAR = {
  dominio: "https://angular.cr",
  nombre: "Clínica Angular",
  telefono: "+50622538303",
  telefonoDisplay: "+(506) 2253-8303",
  whatsapp: "50683056444",
  whatsappDisplay: "+(506) 8305-6444",
  correo: "info@angular.cr",
  direccion:
    "Guadalupe, del Estadio Coyella Fonseca, 75 m oeste, San José, Costa Rica",
  horario:
    "Lunes a Viernes 9:00 am – 5:00 pm · Sábado 9:00 am – 1:00 pm · Domingo cerrado",
  whatsappUrl: function (mensaje) {
    var base = "https://wa.me/" + this.whatsapp;
    return mensaje ? base + "?text=" + encodeURIComponent(mensaje) : base;
  },
};
