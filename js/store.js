/*
 * Almacenamiento del ranking.
 * Hoy guarda en localStorage (solo este dispositivo). La interfaz es asíncrona
 * para poder cambiarla por un servicio en la nube (Firebase, Supabase...)
 * sin tocar el resto del código.
 */
window.Store = (function () {
  var KEY = "taller-command:ranking";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }

  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* modo privado */ }
  }

  return {
    list: function () {
      return Promise.resolve(read().sort(function (a, b) { return b.total - a.total || a.time - b.time; }));
    },
    add: function (entry) {
      var list = read();
      entry.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      list.push(entry);
      write(list);
      return Promise.resolve(entry);
    },
    clear: function () {
      write([]);
      return Promise.resolve();
    }
  };
})();
