/*
 * Progreso del taller. Hay un solo intento para cada parte, así que el
 * resultado se guarda en el dispositivo y se restaura al recargar la página.
 * Para reiniciar en un equipo de pruebas: abrir la página con ?reiniciar
 */
window.Score = (function () {
  var KEY = "taller-command:progreso";

  if (/[?&]reiniciar\b/.test(location.search)) {
    try { localStorage.removeItem(KEY); } catch (e) { /* sin acceso */ }
    history.replaceState(null, "", location.pathname + location.hash);
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
