/*
 * Progreso del taller. Hay un solo intento para cada parte, así que el
 * resultado se guarda en el dispositivo y se restaura al recargar la página.
 * El profesor puede reiniciar un equipo con ?reiniciar=<clave>. Aquí solo
 * está el hash SHA-256 de la clave, no la clave.
 */
window.Score = (function () {
  var KEY = "taller-command:progreso";
  var RESET_HASH = "a57b106ee545e613d9a134ef60c32a73aebe6e55355a04207fb69e32e54c069f";

  var reset = new URLSearchParams(location.search).get("reiniciar");
  if (reset !== null) {
    history.replaceState(null, "", location.pathname + location.hash);
    if (window.crypto && crypto.subtle) {
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(reset)).then(function (buf) {
        var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ("0" + b.toString(16)).slice(-2);
        }).join("");
        if (hex !== RESET_HASH) return;
        try { localStorage.removeItem(KEY); } catch (e) { /* sin acceso */ }
        location.reload();
      });
    }
  }

  var data = {};
  try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { data = {}; }

  return {
    // Parte 1: { placed: { slot: rol }, right, points }
    get diagram() { return data.diagram || null; },
    set diagram(v) { data.diagram = v; this.save(); },
    // Parte 2: { i, points, right, started, answered, last, finished, time }
    get quiz() { return data.quiz || null; },
    set quiz(v) { data.quiz = v; this.save(); },
    // Id del puntaje ya guardado en el ranking
    get savedId() { return data.savedId || null; },
    set savedId(v) { data.savedId = v; this.save(); },

    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* modo privado */ }
    }
  };
})();
